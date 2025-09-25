import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Canvas from "../components/canvas/Canvas";

export default async function CreateCanvasPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return <Canvas session={session} />;
}
