import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const notifications = await Notification.find({
    $or: [{ userId: session.user.id }, { isGlobal: true }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(notifications);
}
