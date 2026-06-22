import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { LiveClass } from "@/models/LiveClass";
import { createLiveClassSchema } from "@/lib/validations";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();

  const courses = await Course.find({ teacherId: session!.user.id }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));
  const courseIds = courses.map((c) => c._id);

  const liveClasses = await LiveClass.find({ courseId: { $in: courseIds } })
    .sort({ scheduledAt: -1 })
    .lean();

  const result = liveClasses.map((l) => ({
    ...l,
    courseTitle: courseMap.get(String(l.courseId)) ?? "Unknown course",
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const parsed = createLiveClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: parsed.data.courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const liveClass = await LiveClass.create({
    ...parsed.data,
    scheduledAt: new Date(parsed.data.scheduledAt),
    teacherId: session!.user.id,
  });

  return NextResponse.json(liveClass, { status: 201 });
}
