import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// フォームで送信されるデータの型定義
interface Question {
  id: string;
  answer: any; // テキストの場合、またはオプションID（文字列）、ファイルの場合はオブジェクトなど
}

interface QuestionGroup {
  id: string; // 回答対象の質問グループID（Response.questionId に入れるなど）
  questions: Question[];
}

interface OptionData {
  questionOptionId: string;
  optionLabel?: string;
  optionValue?: string;
}

export async function POST(request: NextRequest) {
  try {
    // ■ 1. フォームデータのパースと questionGroup の検証
    const formData = await request.formData();
    const questionGroupData = formData.get("questionGroup");
    if (!questionGroupData) {
      return NextResponse.json(
        { message: "questionGroup が送信されていません" },
        { status: 400 }
      );
    }
    let questionGroup: QuestionGroup;
    try {
      questionGroup = JSON.parse(questionGroupData.toString());
    } catch (error) {
      return NextResponse.json(
        { message: "questionGroup の JSON が不正です" },
        { status: 400 }
      );
    }

    // ■ 2. セッションの確認と対象者（surveyTarget）の取得
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "認証されていません" },
        { status: 401 }
      );
    }
    const target = await prisma.surveyTarget.findFirst({
      where: { userId: session.user?.id },
    });
    if (!target) {
      return NextResponse.json(
        { message: "対象者として設定されていません" },
        { status: 401 }
      );
    }
    const targetId = target.id;

    // ■ 3. メインの回答レコード（Response）の作成  
    // ※ここでは Response.questionId に questionGroup.id をセットしています（要件に合わせて調整してください）
    const responseRecord = await prisma.response.create({
      data: {
        targetId,
        questionId: questionGroup.id,
        questionName: "Survey Response", // 必要に応じて実際のタイトルに変更
        description: "Survey submission",
      },
    });

    // ■ 4. DB から対象の質問情報（型やオプション情報）を取得  
    const questionIds = questionGroup.questions.map((q) => q.id);
    const questionRecords = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { questionOptions: true },
    });
    const questionsMap = new Map<string, typeof questionRecords[0]>();
    for (const q of questionRecords) {
      questionsMap.set(q.id, q);
    }

    // ■ 5. ファイル以外の回答（テキスト・オプション）の処理
    for (const question of questionGroup.questions) {
      const qRecord = questionsMap.get(question.id);
      if (!qRecord) {
        console.warn(`質問レコードが見つかりませんでした (id: ${question.id})`);
        continue;
      }
      const qType = qRecord.type;
      if (qType === "TEXT" || qType === "CALENDAR") {
        // テキスト回答の場合：answer をそのまま textValue に保存
        if (Array.isArray(question.answer)) {
          for (const ans of question.answer) {
            if (typeof ans === "string") {
              await createResponseDetail(responseRecord.id, question.id, ans);
            }
          }
        } else if (typeof question.answer === "string") {
          await createResponseDetail(responseRecord.id, question.id, question.answer);
        }
      } else if (qType === "RADIO" || qType === "SELECT" || qType === "CHECKBOX") {
        // オプション回答の場合：answer に option ID が送られてくると想定
        if (Array.isArray(question.answer)) {
          for (const ans of question.answer) {
            if (typeof ans === "string") {
              const option = qRecord.questionOptions.find((opt) => opt.id === ans);
              if (option) {
                await createResponseDetail(responseRecord.id, question.id, null, {
                  questionOptionId: option.id,
                  optionLabel: option.name,
                  optionValue: option.value,
                });
              } else {
                // 該当オプションが存在しない場合は null で登録
                await createResponseDetail(responseRecord.id, question.id, null);
              }
            }
          }
        } else if (typeof question.answer === "string") {
          const option = qRecord.questionOptions.find((opt) => opt.id === question.answer);
          if (option) {
            await createResponseDetail(responseRecord.id, question.id, null, {
              questionOptionId: option.id,
              optionLabel: option.name,
              optionValue: option.value,
            });
          } else {
            await createResponseDetail(responseRecord.id, question.id, null);
          }
        }
      }
      // FILE タイプの場合は、ファイルアップロード処理で対応するのでここでは何もしません
    }

    // ■ 6. ファイルアップロードの処理  
    // フォームデータ内のキー "files.<質問ID>" となっている項目を処理します。  
    // ※ファイル回答では、ResponseDetail には questionOptionId は設定せず、textValue にアップロード先のパスを保存します。
    const fileUploadPromises = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("files."))
      .map(async ([key, fileEntry]) => {
        if (!(fileEntry instanceof File)) return;
        // key の形式は "files.<questionId>" とする（questionId は参考情報）
        const parts = key.split(".");
        if (parts.length < 2) return;
        // 質問ID は使わなくてもよいですが、ファイル回答なので ResponseDetail.questionOptionId は null にする
        await handleFileUpload(responseRecord.id, fileEntry);
      });
    await Promise.all(fileUploadPromises);

    return NextResponse.json(
      { message: "Response submitted successfully", responseId: responseRecord.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing response:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * createResponseDetail
 *
 * テキストやオプション回答の場合の ResponseDetail レコードを作成します。
 * ・テキスト回答の場合は textValue に値を入れ、questionOptionId は null とします。
 * ・オプション回答の場合は、optionData がある場合に questionOptionId, optionLabel, optionValue をセットします。
 *
 * @param responseId   Response レコードのID
 * @param questionId   （参考）質問ID
 * @param textValue    回答内容（テキストの場合）
 * @param optionData   オプション回答の場合のデータ（存在しなければ省略可）
 */
async function createResponseDetail(
  responseId: string,
  questionId: string,
  textValue: string | null,
  optionData?: OptionData
) {
  await prisma.responseDetail.create({
    data: {
      responseId,
      // オプション回答の場合は optionData.questionOptionId をセット、
      // テキスト回答の場合は null として登録（外部キー制約を満たすため）
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
 *    ※ファイル回答の場合は、questionOptionId は null で登録します。
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

    // ファイル回答の場合、ResponseDetail には questionOptionId を null とし、
    // textValue にアップロード先のパスを保存します。
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
