import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Payment } from "@/models/Payment";

export async function GET() {
  const { response } = await requireRole("admin");
  if (response) return response;

  await connectDB();

  const [totalUsers, totalStudents, totalTeachers, activeCourses, payments] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Course.countDocuments({ isPublished: true }),
    Payment.find({ status: "success" }).lean(),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalTeachers,
    activeCourses,
    totalRevenue,
  });
}
