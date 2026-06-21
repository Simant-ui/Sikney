import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/models/User";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    username: string;
    avatarUrl?: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      username: string;
      avatarUrl?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/types" {
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    username: string;
    avatarUrl?: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      username: string;
      avatarUrl?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    username: string;
    avatarUrl?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    username: string;
    avatarUrl?: string;
  }
}
