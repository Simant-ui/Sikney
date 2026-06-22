import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Message, buildConversationId } from "@/models/Message";
import { User } from "@/models/User";
import { sendMessageSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const myId = session.user.id;
  const messages = await Message.find({ $or: [{ senderId: myId }, { receiverId: myId }] })
    .sort({ createdAt: -1 })
    .lean();

  const byConversation = new Map<string, (typeof messages)[number][]>();
  for (const m of messages) {
    const list = byConversation.get(m.conversationId) ?? [];
    list.push(m);
    byConversation.set(m.conversationId, list);
  }

  const otherUserIds = new Set<string>();
  for (const [, msgs] of byConversation) {
    const last = msgs[0];
    otherUserIds.add(String(last.senderId) === myId ? String(last.receiverId) : String(last.senderId));
  }
  const otherUsers = await User.find({ _id: { $in: Array.from(otherUserIds) } })
    .select("fullName avatarUrl role")
    .lean();
  const userMap = new Map(otherUsers.map((u) => [String(u._id), u]));

  const result = Array.from(byConversation.entries()).map(([conversationId, msgs]) => {
    const last = msgs[0];
    const otherUserId = String(last.senderId) === myId ? String(last.receiverId) : String(last.senderId);
    const otherUser = userMap.get(otherUserId);
    const unreadCount = msgs.filter((m) => String(m.receiverId) === myId && !m.readAt).length;
    return {
      conversationId,
      otherUser: otherUser
        ? { _id: otherUserId, fullName: otherUser.fullName, avatarUrl: otherUser.avatarUrl, role: otherUser.role }
        : { _id: otherUserId, fullName: "Unknown user" },
      lastMessage: { content: last.content, createdAt: last.createdAt, senderId: String(last.senderId) },
      unreadCount,
      courseId: msgs.find((m) => m.courseId)?.courseId ? String(msgs.find((m) => m.courseId)!.courseId) : null,
    };
  });

  result.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const receiver = await User.findById(parsed.data.receiverId);
  if (!receiver) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const message = await Message.create({
    conversationId: buildConversationId(session.user.id, parsed.data.receiverId),
    senderId: session.user.id,
    receiverId: parsed.data.receiverId,
    content: parsed.data.content,
    courseId: parsed.data.courseId || undefined,
  });

  return NextResponse.json(message, { status: 201 });
}
