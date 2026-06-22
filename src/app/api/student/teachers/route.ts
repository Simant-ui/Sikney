import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { TeacherProfile } from "@/models/TeacherProfile";

export async function GET(request: Request) {
  const { response } = await requireRole("student");
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");

  await connectDB();

  const profileFilter = subject ? { subjects: subject } : {};
  const profiles = await TeacherProfile.find(profileFilter).select("userId subjects").lean();
  const subjectsByTeacher = new Map(profiles.map((p) => [String(p.userId), p.subjects]));

  const teacherIds = subject ? profiles.map((p) => p.userId) : undefined;
  const teacherFilter = teacherIds ? { role: "teacher" as const, _id: { $in: teacherIds } } : { role: "teacher" as const };
  const teachers = await User.find(teacherFilter).select("fullName email avatarUrl").lean();

  const courses = await Course.find({ teacherId: { $in: teachers.map((t) => t._id) }, isPublished: true })
    .select("title price teacherId")
    .lean();

  const coursesByTeacher = new Map<string, { _id: string; title: string; price: number }[]>();
  for (const c of courses) {
    const key = String(c.teacherId);
    const list = coursesByTeacher.get(key) ?? [];
    list.push({ _id: String(c._id), title: c.title, price: c.price });
    coursesByTeacher.set(key, list);
  }

  const result = teachers.map((t) => ({
    _id: String(t._id),
    fullName: t.fullName,
    avatarUrl: t.avatarUrl,
    subjects: subjectsByTeacher.get(String(t._id)) ?? [],
    courses: coursesByTeacher.get(String(t._id)) ?? [],
  }));

  return NextResponse.json(result);
}
