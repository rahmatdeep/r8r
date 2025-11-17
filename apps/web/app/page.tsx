import { authOptions } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Dashboard from "../components/Dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return <Dashboard session={session} />;
}
