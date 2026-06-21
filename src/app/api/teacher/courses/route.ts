import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { createCourseSchema } from "@/lib/validations";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  await connectDB();
  const courses = await Course.find({ teacherId: session!.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const { session, response } = await requireRole("teacher");
  if (response) return response;

  const body = await request.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const baseSlug = slugify(parsed.data.title) || "course";
  let slug = baseSlug;
  let suffix = 0;
  while (await Course.findOne({ slug })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const course = await Course.create({
    ...parsed.data,
    thumbnailUrl: parsed.data.thumbnailUrl || undefined,
    slug,
    teacherId: session!.user.id,
  });

  return NextResponse.json(course, { status: 201 });
}
