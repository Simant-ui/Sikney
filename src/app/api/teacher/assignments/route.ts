import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Assignment } from "@/models/Assignment";
import { Submission } from "@/models/Submission";
import { Enrollment } from "@/models/Enrollment";
import { Notification } from "@/models/Notification";
import { createAssignmentSchema } from "@/lib/validations";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();

  const courses = await Course.find({ teacherId: session!.user.id }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));
  const courseIds = courses.map((c) => c._id);

  const assignments = await Assignment.find({ courseId: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .lean();

  const submissionCounts = await Submission.aggregate([
    { $match: { assignmentId: { $in: assignments.map((a) => a._id) } } },
    { $group: { _id: "$assignmentId", count: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } } } },
  ]);
  const countMap = new Map(submissionCounts.map((s) => [String(s._id), s]));

  const result = assignments.map((a) => ({
    ...a,
    courseTitle: courseMap.get(String(a.courseId)) ?? "Unknown course",
    submissionCount: countMap.get(String(a._id))?.count ?? 0,
    pendingCount: countMap.get(String(a._id))?.pending ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const parsed = createAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: parsed.data.courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const assignment = await Assignment.create({
    ...parsed.data,
    dueDate: new Date(parsed.data.dueDate),
    teacherId: session!.user.id,
  });

  if (assignment.isPublished) {
    const enrollments = await Enrollment.find({ courseId: course._id, status: "active" }).lean();
    await Notification.insertMany(
      enrollments.map((e) => ({
        userId: e.studentId,
        title: "New assignment posted",
        body: `"${assignment.title}" was assigned in ${course.title}`,
        link: "/student/assignments",
        type: "assignment",
      }))
    );
  }

  return NextResponse.json(assignment, { status: 201 });
}
