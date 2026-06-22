import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const { id } = await params;

  await connectDB();

  const course = await Course.findOne({ _id: id, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const enrollments = await Enrollment.find({ courseId: id, status: "active" })
    .populate("studentId", "fullName email")
    .lean();

  const students = enrollments.map((e) => {
    const student = e.studentId as unknown as { _id: string; fullName: string; email: string };
    return { _id: String(student._id), fullName: student.fullName, email: student.email };
  });

  return NextResponse.json(students);
}
