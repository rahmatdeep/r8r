import { authOptions } from "../../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Canvas from "../../components/canvas/Canvas";

interface EditCanvasPageProps {
  params: {
    id: string;
  };
}

export default async function EditCanvasPage({ params }: EditCanvasPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const { id: workflowId } = await params;

  return <Canvas workflowId={workflowId} session={session} />;
}
