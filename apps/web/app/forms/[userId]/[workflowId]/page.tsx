"use server";
import FormClient from "../../../../components/FormClient";

export default async function PublicFormPage({
  params,
}: {
  params: { userId: string; workflowId: string };
}) {
  const { userId, workflowId } = await params;
  return <FormClient userId={userId} workflowId={workflowId} />;
}
