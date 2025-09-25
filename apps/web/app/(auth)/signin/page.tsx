import { authOptions } from "../../api/auth/[...nextauth]/options";
import { AuthPage } from "../../components/AuthPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Signin() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }
  return <AuthPage isSignin={true} />;
}
