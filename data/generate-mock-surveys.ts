// generate-mock-responses.ts
import { surveyPure } from "./mock-survey-pure";

/**
 * 単一回答（surveyTarget）のディープコピーとID等の更新を行い、模擬回答を生成する。
 *
 * @param baseResponse - もともとの回答オブジェクト
 * @param index - 連番（ユニーク性のために使用）
 * @returns 新規生成された回答オブジェクト
 */
function generateNewResponse(baseResponse: any, index: number): any {
  const newResponse = JSON.parse(JSON.stringify(baseResponse));

  // ユニークな回答IDを作成（例：タイムスタンプ+連番）
  newResponse.id = `response-${Date.now()}-${index}`;

  // ユーザーIDも新規に生成する場合（ここでは例として "user-連番" を設定）
  newResponse.userId = `user-${index}`;

  // 作成日時・更新日時を現在日時に更新
  const now = new Date().toISOString();
  newResponse.createdAt = now;
  newResponse.updatedAt = now;

  // 内部の responseDetails もそれぞれユニークなIDに更新する
  newResponse.responseDetails = newResponse.responseDetails.map((detail: any, k: number) => {
    const newDetail = { ...detail };
    newDetail.id = `detail-${Date.now()}-${index}-${k}`;
    newDetail.createdAt = now;
    newDetail.updatedAt = now;
    return newDetail;
  });

  // さらに必要なら、ユーザー情報（user）も更新（例：新たなユーザー名やメールアドレス）
  if (newResponse.user) {
    newResponse.user.id = newResponse.userId;
    newResponse.user.loginId = `mockuser${index}`;
    newResponse.user.email = `mockuser${index}@example.com`;
  }

  return newResponse;
}

/**
 * 既存のサーベイデータ（surveyPure）の回答件数を増やす
 * もともとの回答のテンプレートを利用して新規回答を生成し、surveyTargets に追加する。
 *
 * @param survey - もともとのサーベイデータ（surveyPureなど）
 * @param additionalCount - 追加する回答数
 */
function addMockResponses(survey: any, additionalCount: number): void {
  // もともとの回答（surveyTargets）のうち、ひとつ目をテンプレートとして利用
  const baseResponse = survey.surveyTargets[0];
  for (let i = 0; i < additionalCount; i++) {
    const newResponse = generateNewResponse(baseResponse, i + 1000); // 既存と重ならないように、連番に1000を加算
    // ※必要に応じて、回答者属性や回答内容の値をランダムに変更する処理を追加できます

    survey.surveyTargets.push(newResponse);
  }
}

// モックデータのコピーを取得し、回答を増やす（例：追加で100件生成）
const surveyWithManyResponses = JSON.parse(JSON.stringify(surveyPure));
addMockResponses(surveyWithManyResponses, 100);

// 結果を出力（ファイルに保存する場合は fs.writeFileSync などでも可）
console.log(JSON.stringify(surveyWithManyResponses, null, 2));

export default addMockResponses;
