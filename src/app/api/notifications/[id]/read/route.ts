import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const notification = await Notification.findOne({
    _id: id,
    $or: [{ userId: session.user.id }, { isGlobal: true }],
  });
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  notification.isRead = true;
  await notification.save();

  return NextResponse.json({ success: true });
}
