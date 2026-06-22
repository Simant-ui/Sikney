import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole("admin");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const status = body?.status as string;
  if (!["active", "blocked", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();

  const teacher = await User.findOne({ _id: id, role: "teacher" });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  teacher.status = status as typeof teacher.status;
  await teacher.save();

  if (status === "active") {
    await Notification.create({
      userId: teacher._id,
      title: "Account approved",
      body: "Your teacher account has been approved. You can now log in.",
      type: "system",
    });
  }

  return NextResponse.json({ success: true });
}
