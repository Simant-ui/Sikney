import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Quiz } from "@/models/Quiz";
import { Enrollment } from "@/models/Enrollment";
import { Result } from "@/models/Result";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("student");
  if (response) return response;

  const { id } = await params;
  await connectDB();

  const quiz = await Quiz.findOne({ _id: id, isPublished: true }).lean();
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const enrollment = await Enrollment.findOne({ studentId: session!.user.id, courseId: quiz.courseId });
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const existingResult = await Result.findOne({ quizId: id, studentId: session!.user.id });
  if (existingResult) {
    return NextResponse.json({ error: "You have already attempted this quiz" }, { status: 409 });
  }

  return NextResponse.json({
    _id: quiz._id,
    title: quiz.title,
    durationMinutes: quiz.durationMinutes,
    questions: quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
    })),
  });
}
