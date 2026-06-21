import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Result } from "@/models/Result";
import { Quiz } from "@/models/Quiz";
import { Course } from "@/models/Course";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const results = await Result.find({ studentId: session!.user.id }).sort({ submittedAt: -1 }).lean();
  const quizzes = await Quiz.find({ _id: { $in: results.map((r) => r.quizId) } }).lean();
  const quizMap = new Map(quizzes.map((q) => [String(q._id), q.title]));
  const courses = await Course.find({ _id: { $in: results.map((r) => r.courseId) } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));

  const data = results.map((r) => ({
    _id: r._id,
    quizTitle: quizMap.get(String(r.quizId)) ?? "Unknown quiz",
    courseTitle: courseMap.get(String(r.courseId)) ?? "Unknown course",
    score: r.score,
    totalMarks: r.totalMarks,
    percentage: r.percentage,
    submittedAt: r.submittedAt,
  }));

  return NextResponse.json(data);
}
