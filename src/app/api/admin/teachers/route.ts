import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { User } from "@/models/User";

export async function GET() {
  const { response } = await requireRole("admin");
  if (response) return response;

  await connectDB();

  const teachers = await User.find({ role: "teacher" })
    .select("fullName email phone status createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(teachers);
}
