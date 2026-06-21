import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/models/User";

export async function requireRole(role: UserRole) {
  const session = await auth();

  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (session.user.role !== role) {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session, response: null };
}
