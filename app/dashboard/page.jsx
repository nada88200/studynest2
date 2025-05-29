import HomePage from "@/components/HomePage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";

export const fetchCache = "force-no-store";


export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect("/"); 
    }// Redirect to login if no session
    // } else if (session.user.role === "tutor") {
    //   redirect("/tutorDashboard");
    // } else if (session.user.role === "admin") {
    //   redirect("/adminDashboard");
    // }

    return <HomePage />;
}