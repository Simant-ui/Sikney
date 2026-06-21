import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    phone: String,
    passwordHash: String,
    role: String,
    isEmailVerified: Boolean,
    status: String,
    notificationPrefs: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const studentProfileSchema = new mongoose.Schema(
  { userId: mongoose.Schema.Types.ObjectId, enrolledCourses: [mongoose.Schema.Types.ObjectId] },
  { timestamps: true }
);

const teacherProfileSchema = new mongoose.Schema(
  { userId: mongoose.Schema.Types.ObjectId, subjects: [String], approvalStatus: String },
  { timestamps: true }
);

async function upsertUser({ fullName, email, password, role, username, status }) {
  const User = mongoose.model("User", userSchema);
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      fullName,
      username,
      email,
      phone: "9800000000",
      passwordHash,
      role,
      isEmailVerified: true,
      status,
    },
    { upsert: true, new: true }
  );

  return user;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env.local");

  await mongoose.connect(uri);

  const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
  const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);

  const student = await upsertUser({
    fullName: "Test Student",
    email: process.env.TEST_STUDENT_EMAIL ?? "student@sikney.test",
    password: process.env.TEST_STUDENT_PASSWORD ?? "Student@123",
    role: "student",
    username: "teststudent",
    status: "active",
  });
  await StudentProfile.findOneAndUpdate(
    { userId: student._id },
    { userId: student._id },
    { upsert: true }
  );

  const teacher = await upsertUser({
    fullName: "Test Teacher",
    email: process.env.TEST_TEACHER_EMAIL ?? "teacher@sikney.test",
    password: process.env.TEST_TEACHER_PASSWORD ?? "Teacher@123",
    role: "teacher",
    username: "testteacher",
    status: "active",
  });
  await TeacherProfile.findOneAndUpdate(
    { userId: teacher._id },
    { userId: teacher._id, approvalStatus: "approved" },
    { upsert: true }
  );

  const admin = await upsertUser({
    fullName: "Test Admin",
    email: process.env.TEST_ADMIN_EMAIL ?? "admin@sikney.test",
    password: process.env.TEST_ADMIN_PASSWORD ?? "Admin@123",
    role: "admin",
    username: "testadmin",
    status: "active",
  });

  console.log("Seeded test accounts:");
  console.log("  Student:", student.email);
  console.log("  Teacher:", teacher.email);
  console.log("  Admin:  ", admin.email);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
