import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

interface OptionData {
  questionOptionId: string;
  optionLabel?: string;
  optionValue?: string;
}

export async function POST(request: NextRequest) {
  try {
    // ■ 1. フォームデータのパース：surveyId と answers を取得
    const formData = await request.formData();
    const surveyId = formData.get("surveyId") as string;
    if (!surveyId) {
      return NextResponse.json(
        { message: "surveyId が送信されていません" },
        { status: 400 }
      );
    }
    const answersData = formData.get("answers");
    if (!answersData) {
      return NextResponse.json(
        { message: "answers が送信されていません" },
        { status: 400 }
      );
    }
    let answers: Record<
      string,
      {
        type: string;
        value: any;
        optionId: any;
      }
    >;
    try {
      answers = JSON.parse(answersData.toString());
    } catch (error) {
      return NextResponse.json(
        { message: "answers の JSON が不正です" },
        { status: 400 }
      );
    }
    
    // ■ 2. セッション確認と対象者の取得
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }
    const target = await prisma.surveyTarget.findFirst({
      where: { surveyId, userId: session.user?.id }
    });
    if (!target) {
      return NextResponse.json(
        { message: "対象者として設定されていません" },
        { status: 401 }
      );
    }
    const targetId = target.id;

    // ■ 3. 回答およびファイルアップロードに含まれる全質問IDのセットを作成
    const questionIdsSet = new Set<string>();
    // answers にある質問ID
    Object.keys(answers).forEach(qid => questionIdsSet.add(qid));
    // formData のキーで "file.<質問ID>" となっているものを追加
    Array.from(formData.entries()).forEach(([key]) => {
      if (key.startsWith("file.")) {
        const parts = key.split(".");
        if (parts.length >= 2) {
          questionIdsSet.add(parts[1]);
        }
      }
    });
    const questionIds = Array.from(questionIdsSet);
    
    // ■ 4. DB から各質問情報を取得（オプション情報も含む）
    const questionRecords = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { questionOptions: true },
    });
    const questionsMap = new Map<string, typeof questionRecords[0]>();
    for (const q of questionRecords) {
      questionsMap.set(q.id, q);
    }

    // ■ 5. 各質問毎に Response レコードを作成（responseは質問と対になります）
    const responseRecordsMap = new Map<string, any>(); // questionId → Response レコード
    for (const questionId of questionIds) {
      const qRecord = questionsMap.get(questionId);
      if (!qRecord) {
        console.warn(`質問レコードが見つかりませんでした (id: ${questionId})`);
        continue;
      }
      const responseRecord = await prisma.response.create({
        data: {
          targetId,
          questionId: qRecord.id,
          questionName: qRecord.name,
          description: "Survey submission",
        },
      });
      responseRecordsMap.set(questionId, responseRecord);
    }

    // ■ 6. answers オブジェクトの処理：各質問の回答内容に応じた ResponseDetail の作成
    for (const questionId in answers) {
      const ans = answers[questionId];
      const qRecord = questionsMap.get(questionId);
      if (!qRecord) {
        console.warn(`質問レコードが見つかりませんでした (id: ${questionId})`);
        continue;
      }
      const responseRecord = responseRecordsMap.get(questionId);
      if (!responseRecord) {
        console.warn(`Response レコードが作成されていません (questionId: ${questionId})`);
        continue;
      }
      const qType = qRecord.type;
      if (qType === "TEXT" || qType === "CALENDAR") {
        if (typeof ans.value === "string") {
          console.log(`テキスト回答 (questionId: ${questionId})`);
          await createResponseDetail(responseRecord.id, questionId, ans.value);
        }
      } else if (qType === "RADIO" || qType === "SELECT") {
        if (typeof ans.optionId === "string") {
          const option = qRecord.questionOptions.find(
            (opt) => opt.id === ans.optionId
          );
          if (option) {
            console.log(`オプションが見つかりました (optionId: ${option.id})`);
            await createResponseDetail(responseRecord.id, questionId, null, {
              questionOptionId: option.id,
              optionLabel: option.name,
              optionValue: option.value,
            });
          } else {
            console.warn(`オプションが見つかりませんでした (optionId: ${ans.optionId})`);
            await createResponseDetail(responseRecord.id, questionId, null);
          }
        }
      } else if (qType === "CHECKBOX") {
        if (Array.isArray(ans.optionId)) {
          for (const optId of ans.optionId) {
            const option = qRecord.questionOptions.find(
              (opt) => opt.id === optId
            );
            if (option) {
              await createResponseDetail(responseRecord.id, questionId, null, {
                questionOptionId: option.id,
                optionLabel: option.name,
                optionValue: option.value,
              });
            } else {
              await createResponseDetail(responseRecord.id, questionId, null);
            }
          }
        }
      } else {
        console.warn(`未対応の質問タイプです (questionId: ${questionId})`);
      }
      // FILE タイプは、ファイルアップロード処理で対応
    }

    // ■ 7. ファイルアップロードの処理（キー "file.<質問ID>" で送信されているもの）
    const fileUploadPromises = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("file."))
      .map(async ([key, fileEntry]) => {
        if (!(fileEntry instanceof File)) return;
        const parts = key.split(".");
        if (parts.length < 2) return;
        const questionId = parts[1];
        let responseRecord = responseRecordsMap.get(questionId);
        // 回答が answers に含まれていない場合は、ここで Response レコードを新たに作成
        if (!responseRecord) {
          const qRecord = questionsMap.get(questionId);
          if (!qRecord) {
            console.warn(`質問レコードが見つかりませんでした (id: ${questionId})`);
            return;
          }
          responseRecord = await prisma.response.create({
            data: {
              targetId,
              questionId: qRecord.id,
              questionName: qRecord.name,
              description: "Survey submission",
            },
          });
          responseRecordsMap.set(questionId, responseRecord);
        }
        await handleFileUpload(responseRecord.id, fileEntry);
      });
    await Promise.all(fileUploadPromises);

    // ■ 8. 対象者のステータス更新（COMPLETED）
    await prisma.surveyTarget.update({
      where: { id: targetId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json(
      { message: "Response submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing response:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * createResponseDetail
 *
 * ResponseDetail レコードを作成します。
 * ・テキスト回答の場合は textValue に値を入れ、questionOptionId は null とします。
 * ・オプション回答の場合は、optionData がある場合に questionOptionId, optionLabel, optionValue をセットします。
 *
 * @param responseId   Response レコードのID
 * @param questionId   質問ID（参考情報）
 * @param textValue    回答内容（テキストの場合）
 * @param optionData   オプション回答の場合のデータ（存在しなければ省略可）
 */
async function createResponseDetail(
  responseId: string,
  questionId: string,
  textValue: string | null,
  optionData?: OptionData
) {

  console.log(`createResponseDetail (responseId: ${responseId}, questionId: ${questionId}, textValue: ${textValue}, optionData: ${JSON.stringify(optionData)})`);
  await prisma.responseDetail.create({
    data: {
      responseId,
      questionOptionId: optionData ? optionData.questionOptionId : null,
      optionLabel: optionData ? optionData.optionLabel : null,
      optionValue: optionData ? optionData.optionValue : null,
      textValue,
    },
  });
}

/**
 * handleFileUpload
 *
 * ファイルアップロード処理を行います。
 * 1. アップロード先ディレクトリ（public/uploads）が存在しなければ作成
 * 2. 一意のファイル名（タイムスタンプ付き）で保存
 * 3. 保存先パスを textValue として ResponseDetail を作成
 *
 * @param responseId   Response レコードのID
 * @param file         アップロードされた File オブジェクト
 */
async function handleFileUpload(
  responseId: string,
  file: File
) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // ファイルアップロードの場合、ResponseDetail にファイルパスを保存（questionOptionId は null）
    await prisma.responseDetail.create({
      data: {
        responseId,
        questionOptionId: null,
        textValue: `/uploads/${fileName}`,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
