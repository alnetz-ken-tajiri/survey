import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { categories } from "plotly.js/lib/scatter";

// model QuestionGroup {
//     id          String    @id @default(cuid())
//     companyId   String?   @map("company_id")
//     name        String
//     description String?   @db.Text
//     fileUrl     String?   @db.Text
//     public      Boolean   @default(false)
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
//     deletedAt   DateTime? @map("deleted_at")

//     questionGroupQuestions QuestionGroupQuestions[]
//     surveys                Survey[]
//     company                Company?                 @relation(fields: [companyId], references: [id])

//     @@map("question_groups")
// }
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const questionGroups = await prisma.questionGroup.findMany({
    where: {
      surveys: {
        some: {
          id: id,
        },
      },
    },
    include: {
      questionGroupQuestions: {
        include: {
          question: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
  
  //重複削除して、カテゴリーのみを取得する
  const categories = questionGroups.flatMap((questionGroup) => {
    return questionGroup.questionGroupQuestions.map((questionGroupQuestion) => {
      return questionGroupQuestion.question.category;
    });
  });

  // 重複を削除
  const uniqueCategories = Array.from(
    new Map(categories.filter(category => category !== null).map(category => [category.id, category])).values()
  );

  return NextResponse.json(uniqueCategories);
}
