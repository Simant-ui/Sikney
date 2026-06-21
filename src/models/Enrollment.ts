import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progressPercent: number;
  completedLessons: Types.ObjectId[];
  status: EnrollmentStatus;
  enrolledAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progressPercent: { type: Number, default: 0 },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = (models.Enrollment as Model<IEnrollment>) || model<IEnrollment>("Enrollment", EnrollmentSchema);
export default Enrollment;
