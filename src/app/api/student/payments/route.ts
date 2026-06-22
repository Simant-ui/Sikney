import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Enrollment } from "@/models/Enrollment";
import { Course } from "@/models/Course";
import { Payment } from "@/models/Payment";

export async function GET() {
  const { session, response } = await requireRole("student");
  if (response) return response;

  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id, status: "active" }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds }, price: { $gt: 0 } }).lean();

  const payments = await Payment.find({ studentId: session!.user.id, courseId: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .lean();
  const paymentMap = new Map<string, (typeof payments)[number]>();
  for (const p of payments) {
    const key = String(p.courseId);
    if (!paymentMap.has(key)) paymentMap.set(key, p);
  }

  const result = courses.map((c) => {
    const payment = paymentMap.get(String(c._id));
    return {
      courseId: String(c._id),
      courseTitle: c.title,
      amount: c.price,
      status: payment?.status === "success" ? "paid" : "unpaid",
      invoiceUrl: payment?.invoiceUrl,
    };
  });

  return NextResponse.json(result);
}
