import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DashboardShell role="admin" user={{ name: session?.user.name, email: session?.user.email, avatarUrl: session?.user.avatarUrl }}>
      {children}
    </DashboardShell>
  );
}
