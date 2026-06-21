import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DashboardShell role="student" user={{ name: session?.user.name, email: session?.user.email, avatarUrl: session?.user.avatarUrl }}>
      {children}
    </DashboardShell>
  );
}
