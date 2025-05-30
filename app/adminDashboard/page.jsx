import AdminPage from "@/components/AdminPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

  if (!session || session.user.role == "user") {
    redirect("/dashboard");
  }
    if (!session || session.user.role == "tutor") {
        redirect("/tutorDashboard");
    }

    return (
        <main>
            <AdminPage />
        </main>
    );
}
