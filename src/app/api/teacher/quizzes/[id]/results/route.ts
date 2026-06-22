import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Quiz } from "@/models/Quiz";
import { Result } from "@/models/Result";
import { Enrollment } from "@/models/Enrollment";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;

  await connectDB();

  const quiz = await Quiz.findOne({ _id: id, teacherId: session!.user.id }).lean();
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const enrollments = await Enrollment.find({ courseId: quiz.courseId, status: "active" })
    .populate("studentId", "fullName email")
    .lean();

  const results = await Result.find({ quizId: id }).lean();
  const resultMap = new Map(results.map((r) => [String(r.studentId), r]));

  const students = enrollments.map((e) => {
    const student = e.studentId as unknown as { _id: string; fullName: string; email: string };
    const result = resultMap.get(String(student._id));
    return {
      studentId: String(student._id),
      fullName: student.fullName,
      email: student.email,
      attempted: Boolean(result),
      score: result?.score ?? null,
      percentage: result?.percentage ?? null,
      submittedAt: result?.submittedAt ?? null,
      answers: result
        ? quiz.questions.map((q, i) => {
            const answer = result.answers.find((a) => a.questionIndex === i);
            return {
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              selectedOptionIndex: answer?.selectedOptionIndex ?? null,
              isCorrect: answer ? answer.selectedOptionIndex === q.correctOptionIndex : false,
              marks: q.marks,
            };
          })
        : [],
    };
  });

  return NextResponse.json({
    quiz: { title: quiz.title, totalMarks: quiz.totalMarks, questionCount: quiz.questions.length },
    students,
  });
}
