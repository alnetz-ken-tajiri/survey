import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * S3にファイルをアップロードする関数
 * @param file アップロードするファイル
 * @param companyId 会社ID (ディレクトリ名として使用)
 * @param fileType ファイルタイプ (例: 'avatar', 'document', 'image' など)
 * @returns アップロードされたファイルのURL
 */
export async function uploadFileToS3(file: File, companyId: string, fileType: string): Promise<string> {
  // 環境変数のチェック
  if (!process.env.AWS_S3_BUCKET) throw new Error("AWS_S3_BUCKET is not defined in environment variables")
  if (!process.env.AWS_REGION) throw new Error("AWS_REGION is not defined in environment variables")
  if (!process.env.AWS_ACCESS_KEY_ID) throw new Error("AWS_ACCESS_KEY_ID is not defined in environment variables")
  if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error("AWS_SECRET_ACCESS_KEY is not defined in environment variables")

  if (!companyId) throw new Error("Company ID is required")
  if (!fileType) throw new Error("File type is required")
  if (!file) throw new Error("File is required")

  // ファイルデータをBufferに変換
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // ファイルタイプと会社ごとのディレクトリを作成し、ファイル名を指定
  const fileName = `uploads/${fileType}/${companyId}/${Date.now()}-${file.name}`

  try {
    // S3にアップロード
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }),
    )

    // S3のURLを生成 (encodeURIComponentで安全にURLを作成)
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(fileName)}`
  } catch (error) {
    console.error("S3アップロード中にエラーが発生しました:", error)
    throw new Error("Failed to upload file to S3")
  }
}
