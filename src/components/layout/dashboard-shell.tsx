"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { navByRole, type NavItem } from "@/lib/nav-config";

interface DashboardShellProps {
  role: "student" | "teacher" | "admin";
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string;
  };
  children: ReactNode;
}

export function DashboardShell({ role, user, children }: DashboardShellProps) {
  const items: NavItem[] = navByRole[role];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar items={items} roleLabel={role} />
      <div className="md:pl-64">
        <Topbar items={items} role={role} user={user} />
        <main className="px-4 py-6 pb-24 md:px-6 md:pb-10">{children}</main>
      </div>
      <BottomNav items={items} />
    </div>
  );
}
