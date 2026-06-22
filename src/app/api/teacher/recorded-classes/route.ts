import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Video } from "@/models/Video";
import { createVideoSchema } from "@/lib/validations";

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();

  const courses = await Course.find({ teacherId: session!.user.id }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c.title]));
  const courseIds = courses.map((c) => c._id);

  const videos = await Video.find({ courseId: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .lean();

  const result = videos.map((v) => ({
    ...v,
    courseTitle: courseMap.get(String(v.courseId)) ?? "Unknown course",
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const parsed = createVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findOne({ _id: parsed.data.courseId, teacherId: session!.user.id });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const video = await Video.create(parsed.data);

  return NextResponse.json(video, { status: 201 });
}
