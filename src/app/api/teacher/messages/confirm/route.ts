import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { Message, buildConversationId } from "@/models/Message";
import { Notification } from "@/models/Notification";

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const { studentId, courseId } = body as { studentId?: string; courseId?: string };
  if (!studentId || !courseId) {
    return NextResponse.json({ error: "studentId and courseId are required" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await Enrollment.findOne({ studentId, courseId });
  if (!existing) {
    await Enrollment.create({ studentId, courseId, status: "active" });
  }

  await Message.create({
    conversationId: buildConversationId(session!.user.id, studentId),
    senderId: session!.user.id,
    receiverId: studentId,
    content: `You've been enrolled in "${course.title}". Welcome aboard!`,
  });

  await Notification.create({
    userId: studentId,
    title: "Enrollment confirmed",
    body: `You're now enrolled in "${course.title}"`,
    link: "/student/courses",
    type: "system",
  });

  return NextResponse.json({ success: true });
}
