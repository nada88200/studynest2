import TutorPage from "@/components/TutorPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export default async function TutorDashboard() {
    const session = await getServerSession(authOptions);

  if (!session || session.user.role == "user") {
    redirect("/dashboard");
  }
    if (!session || session.user.role == "admin") {
        redirect("/adminDashboard");
    }


    return (
        <main>
            <TutorPage />
        </main>
    );
}
