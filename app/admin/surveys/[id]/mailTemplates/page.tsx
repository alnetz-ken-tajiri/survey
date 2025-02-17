import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor"

export default function EmailPage({ params }: { params: { id: string } }) {
  const { id } = params

  return <EmailTemplateEditor surveyId={id} />
}

