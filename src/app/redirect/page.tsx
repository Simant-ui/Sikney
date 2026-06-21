import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const destinations: Record<string, string> = {
    student: "/student/dashboard",
    teacher: "/teacher/dashboard",
    admin: "/admin/dashboard",
  };

  redirect(destinations[session.user.role] ?? "/login");
}
