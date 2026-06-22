import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";

export async function GET(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const myId = session.user.id;

  await connectDB();

  const messages = await Message.find({
    conversationId,
    $or: [{ senderId: myId }, { receiverId: myId }],
  })
    .sort({ createdAt: 1 })
    .lean();

  await Message.updateMany(
    { conversationId, receiverId: myId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );

  return NextResponse.json(messages);
}
