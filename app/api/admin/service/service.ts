import prisma from "@/lib/prisma";
import { Organization, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions as options } from "@/lib/auth";




// Employee 型を定義
export type Employee = Prisma.EmployeeGetPayload<{
  include: {
  };
}>;

/**
 * 再帰的に部下を取得する関数
 * @param employeeId
 * @returns Employee 型の従業員データ
 */
// export async function getSubordinates(
//   employeeId: string
// ): Promise<Employee | null> {
//   const employeeWithSubordinates = await prisma.employee.findUnique({
//     where: { id: employeeId },

//     include: {
//       subordinates: true,
//     },
//   });

//   if (!employeeWithSubordinates) return null;

//   // 各部下について再帰的に部下を取得する
//   const subordinates = await Promise.all(
//     employeeWithSubordinates.subordinates.map(async (subordinate) => {
//       const lowerSubordinates = await getSubordinates(subordinate.id);
//       // 取得した部下のデータを `subordinate` に追加する
//       return {
//         ...subordinate,
//         subordinates: lowerSubordinates?.subordinates || [],
//       };
//     })
//   );

//   return { ...employeeWithSubordinates, subordinates };
// }

/**
 * 再帰的に部下を平坦化する関数
 * @param employee
 * @param employeeId
 * @returns Employee 型の配列
 */
// export function flattenSubordinates(
//   employee: Employee,
//   employeeId: string
// ): Employee[] {
//   const result: Employee[] = [];


//   // 自分自身を除外
//   if (employee.id !== employeeId) {
//     result.push({ ...employee, subordinates: [] });
//   }

//   // 部下が存在するかどうかを確認して再帰的に処理
//   if (employee.subordinates && employee.subordinates.length > 0) {
//     employee.subordinates.forEach((subordinate) => {
//       if (isEmployee(subordinate)) {
//         // 型ガード
//         result.push(...flattenSubordinates(subordinate, employeeId));
//       } else {
//         console.error("Invalid subordinate data:", subordinate);
//         throw new Error("Invalid subordinate data");
//       }
//     });
//   }

//   return result;
// }

// Employee 型かどうかを確認するための型ガード
export function isEmployee(obj: any): obj is Employee {
  return obj && typeof obj.id === "string" && typeof obj.name === "string";
}


//S3====================================

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * S3にオブジェクトをPUTする関数
 * @param fileName
 * @param file
 * @returns
 */
export async function putS3Object(fileName: string, file: Buffer) {
  try {
    if (!file) {
      return false;
    }

    const uploadParams = {
      Bucket: process.env.AMPLIPATH_S3_BUCKET_NAME!,
      Key: fileName, // Using the same Key ensures the file is updated (overwritten)
      Body: file,
      ContentType: "image/png",
    };

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    if (result.$metadata.httpStatusCode === 200) {
      return true;
    } else {
      console.error(
        "Upload failed with status:",
        result.$metadata.httpStatusCode
      );
      return false;
    }
  } catch (error) {
    console.error("Upload error:", error);
    return false; // Avoid returning NextResponse in utility function
  }
}

export async function getProfileImageID(employeeId: number) {
  const profileImage = await prisma.file.findFirst({
    where: {
      employeeId: employeeId.toString(),
      type: "PROFILE",
    },
  });
  return profileImage?.id;
}

export async function getProfileImageUrl(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AMPLIPATH_S3_BUCKET_NAME!,
    Key: fileName,
  });

  // Presigned URLを生成（有効期限は１日）
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60 * 24,
  });
  return signedUrl;
}

/**
 * 新しい組織を作成し、閉包テーブルを更新する関数
 * @param data 組織のデータ
 * @returns 作成された組織オブジェクト
 */
export async function createOrganization(data: {
  name: string;
  leaderId?: string | null;
  parentId?: string | null;
  companyId: string;
  deleted?: boolean;
}): Promise<Organization> {

  const session = await getServerSession(options);
  const userId = session?.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      employee: true,
    },
  });
  const companyId = user?.employee?.companyId;
  if (!companyId) {
    throw new Error("Company ID is required");
  }


  return await prisma.$transaction(async (tx) => {
    // 組織の作成
    const organization = await tx.organization.create({
      data: {
        name: data.name,
        leaderId: data.leaderId ?? null,
        companyId: companyId,
      },
    });


    const orgId = organization.id;

    // 自己参照の関係を閉包テーブルに追加
    await tx.organizationRelationship.create({
      data: {
        ancestorId: orgId,
        descendantId: orgId,
        companyId: companyId,
        depth: 0,
      },
    });

    // 親組織が指定されている場合、親からの関係を閉包テーブルに追加
    if (data.parentId) {
      //親組織が子孫となっているレコードを取得することで、親組織のすべての祖先（親の親など）を特定しています。
      const parentRelationships = await tx.organizationRelationship.findMany({
        where: { descendantId: data.parentId, companyId: companyId },
      });

      // 新しい組織への関係を作成
      const newRelationships = parentRelationships.map((rel) => ({
        ancestorId: rel.ancestorId, // 親組織の祖先ID
        descendantId: orgId, // 新しい組織のID
        depth: rel.depth + 1, // 深さを1増やす
        companyId: companyId,
      }));

      // 関係をバルク挿入
      await tx.organizationRelationship.createMany({
        data: newRelationships,
      });
    }

    return organization;
  });
}

/**
 * 組織を更新し、必要に応じて閉包テーブルを更新する関数
 * @param orgId 更新する組織のID
 * @param data 更新するデータ
 * @returns 更新された組織オブジェクト
 */
export async function updateOrganization(
  orgId: string,
  data: {
    name?: string | null;
    leaderId?: string | null;
    parentId?: string | null;
    deleted?: boolean;

  }
): Promise<Organization> {

  const session = await getServerSession(options);
  const userId = session?.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      employee: true,
    },
  });

  const companyId = user?.employee?.companyId;

  return await prisma.$transaction(async (tx) => {
    // 組織の更新
    const organization = await tx.organization.update({
      where: { id: orgId },
      data: {
        name: data.name ?? undefined,
        leaderId: data.leaderId !== undefined ? data.leaderId : undefined,
        deletedAt: data.deleted ? new Date() : null,
      },
    });



    // 現在の親組織を取得
    const currentParentRelationship = await tx.organizationRelationship.findFirst({
      where: {
        descendantId: orgId,
        depth: 1,
        companyId: companyId,
      },

      select: {
        ancestorId: true,
      },
    });

    const currentParentId = currentParentRelationship?.ancestorId || null;

    // 親組織が変更された場合のみリレーションシップを更新
    if (data.parentId !== undefined && data.parentId !== currentParentId) {
      // **循環参照のチェック**
      if (data.parentId !== null) {
        const isDescendant = await tx.organizationRelationship.findFirst({
          where: {
            ancestorId: orgId,
            descendantId: data.parentId,
            companyId: companyId,
          },
        });

        if (isDescendant) {
          throw new Error('Cannot move organization under one of its descendants.');
        }
      }

      // 自身とその子孫のIDを取得
      const descendantIds = await tx.organizationRelationship
        .findMany({
          where: { ancestorId: orgId, companyId: companyId },
          select: { descendantId: true },
        })
        .then((rels) => rels.map((rel) => rel.descendantId));

      // 古いリレーションシップを削除
      await tx.organizationRelationship.deleteMany({
        where: {
          ancestorId: { notIn: descendantIds },
          descendantId: { in: descendantIds },
        },
      });

      // 新しい親組織からの祖先関係を取得
      let newParentRelationships: { ancestorId: string; depth: number }[] = [];

      if (data.parentId !== null) {
        // 新しい親組織からの祖先関係を取得
        const parentRelationships = await tx.organizationRelationship.findMany({
          where: { descendantId: data.parentId, companyId: companyId },
          select: {
            ancestorId: true,
            depth: true,
          },
        });

        // 新しい親組織との直接の関係を追加
        parentRelationships.push({
          ancestorId: data.parentId,
          depth: 0,
        });

        newParentRelationships = parentRelationships;
      } else {
        // 親組織がない場合（ルート組織）
        // 新しい祖先関係は存在しない
        newParentRelationships = [];
      }

      // 自身とその子孫組織を取得
      const descendantRelationships = await tx.organizationRelationship.findMany({
        where: { ancestorId: orgId, companyId: companyId },
        select: {
          descendantId: true,
          depth: true,
        },
      });

      // 新しいリレーションシップを作成
      const newRelationships: Prisma.OrganizationRelationshipCreateManyInput[] = [];

      // 新しい祖先とのリレーションシップを作成
      for (const parentRel of newParentRelationships) {
        for (const descRel of descendantRelationships) {
          newRelationships.push({
            ancestorId: parentRel.ancestorId,
            descendantId: descRel.descendantId,
            depth: parentRel.depth + descRel.depth + 1,
            deletedAt: data.deleted ? new Date() : null,
            companyId: companyId,


          });
        }
      }

      // 新しいリレーションシップを挿入
      if (newRelationships.length > 0) {
        await tx.organizationRelationship.createMany({
          data: newRelationships,
          skipDuplicates: true,
        });
      }
    }

    // disabledフィールドが含まれている場合、関連するリレーションも更新
    if (data.deleted !== undefined) {
      await tx.organizationRelationship.updateMany({
        where: {
          OR: [{ ancestorId: orgId }, { descendantId: orgId }],
        },
        data: {
          deletedAt: data.deleted ? new Date() : null,

        },

      });
    }


    return organization;
  });
}



export async function fetchOrganizations() {
  const session = await getServerSession(options);
  const userId = session?.user.id;
  console.log(session);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      employee: true,
    },
  });

  const companyId = user?.employee?.companyId;


  const organizations = await prisma.organization.findMany({
    where: { companyId: companyId },
    include: {
      leader: true, // 首長の情報を含める場合
    },
  });

  const relationships = await prisma.organizationRelationship.findMany({
    where: { companyId: companyId },
  });

  return { organizations, relationships };
}
