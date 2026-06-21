import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Quiz } from "@/models/Quiz";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();

  await connectDB();
  const quiz = await Quiz.findOne({ _id: id, teacherId: session!.user.id });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  if (typeof body.isPublished === "boolean") quiz.isPublished = body.isPublished;
  await quiz.save();

  return NextResponse.json(quiz);
}
