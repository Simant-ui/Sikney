import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Quiz } from "@/models/Quiz";
import { Result } from "@/models/Result";
import { createQuizSchema } from "@/lib/validations";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();

  const courses = await Course.find({ teacherId: session!.user.id }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));
  const courseIds = courses.map((c) => c._id);

  const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 }).lean();
  const attemptCounts = await Result.aggregate([
    { $match: { quizId: { $in: quizzes.map((q) => q._id) } } },
    { $group: { _id: "$quizId", count: { $sum: 1 }, avgPercentage: { $avg: "$percentage" } } },
  ]);
  const attemptMap = new Map(attemptCounts.map((a) => [String(a._id), a]));

  const result = quizzes.map((q) => ({
    ...q,
    courseTitle: courseMap.get(String(q.courseId)) ?? "Unknown course",
    questionCount: q.questions.length,
    attemptCount: attemptMap.get(String(q._id))?.count ?? 0,
    avgPercentage: Math.round(attemptMap.get(String(q._id))?.avgPercentage ?? 0),
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const parsed = createQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: parsed.data.courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const totalMarks = parsed.data.questions.reduce((sum, q) => sum + q.marks, 0);

  const quiz = await Quiz.create({
    ...parsed.data,
    totalMarks,
    teacherId: session!.user.id,
  });

  return NextResponse.json(quiz, { status: 201 });
}
