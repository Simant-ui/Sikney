"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { NavItem } from "@/lib/nav-config";

interface TopbarProps {
  items: NavItem[];
  role: "student" | "teacher" | "admin";
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string;
  };
}

export function Topbar({ items, role, user }: TopbarProps) {
  const pathname = usePathname();
  const activeItem = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const title = activeItem?.label ?? "Dashboard";

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 glass px-4 md:pl-6 md:pr-6">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href={`/${role}/notifications`} aria-label="Notifications">
            <Bell className="size-4" />
          </Link>
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full">
              <Avatar className="size-9">
                <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${role}/settings`}>
                <UserIcon className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${role}/settings`}>
                <Settings className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
            >
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
