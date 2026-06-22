import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { Course } from "@/models/Course";
import { Video } from "@/models/Video";
import { Enrollment } from "@/models/Enrollment";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { createVideoSchema } from "@/lib/validations";
import { sendNewRecordingEmail } from "@/lib/email";

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

  let recipientIds = parsed.data.studentIds ?? [];
  if (recipientIds.length === 0) {
    const enrollments = await Enrollment.find({ courseId: course._id, status: "active" }).lean();
    recipientIds = enrollments.map((e) => String(e.studentId));
  }

  if (recipientIds.length > 0) {
    await Notification.insertMany(
      recipientIds.map((studentId) => ({
        userId: studentId,
        title: "New recorded class shared",
        body: `"${video.title}" was added to ${course.title}`,
        link: "/student/recorded-classes",
        type: "class",
      }))
    );

    const teacher = await User.findById(session!.user.id).select("fullName").lean();
    const students = await User.find({ _id: { $in: recipientIds } }).select("email").lean();
    await Promise.all(
      students.map((s) =>
        sendNewRecordingEmail({
          to: s.email,
          teacherName: teacher?.fullName ?? "Your teacher",
          courseTitle: course.title,
          videoTitle: video.title,
        }).catch(() => {})
      )
    );
  }

  return NextResponse.json(video, { status: 201 });
}
