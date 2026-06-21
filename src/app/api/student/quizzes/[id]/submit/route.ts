import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Quiz } from "@/models/Quiz";
import { Enrollment } from "@/models/Enrollment";
import { Result } from "@/models/Result";

interface AnswerInput {
  questionIndex: number;
  selectedOptionIndex: number;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("student");
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const answers: AnswerInput[] = Array.isArray(body.answers) ? body.answers : [];
  const startedAt = body.startedAt ? new Date(body.startedAt) : new Date();

  await connectDB();

  const quiz = await Quiz.findOne({ _id: id, isPublished: true });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const enrollment = await Enrollment.findOne({ studentId: session!.user.id, courseId: quiz.courseId });
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const existing = await Result.findOne({ quizId: id, studentId: session!.user.id });
  if (existing) {
    return NextResponse.json({ error: "You have already attempted this quiz" }, { status: 409 });
  }

  let score = 0;
  for (const answer of answers) {
    const question = quiz.questions[answer.questionIndex];
    if (question && question.correctOptionIndex === answer.selectedOptionIndex) {
      score += question.marks;
    }
  }

  const percentage = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0;

  const result = await Result.create({
    quizId: id,
    studentId: session!.user.id,
    courseId: quiz.courseId,
    answers,
    score,
    totalMarks: quiz.totalMarks,
    percentage,
    startedAt,
    submittedAt: new Date(),
  });

  return NextResponse.json(result, { status: 201 });
}
