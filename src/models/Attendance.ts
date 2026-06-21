import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "late";

export interface IAttendance extends Document {
  courseId: Types.ObjectId;
  liveClassId?: Types.ObjectId;
  studentId: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy: Types.ObjectId;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    liveClassId: { type: Schema.Types.ObjectId, ref: "LiveClass" },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });

export const Attendance = (models.Attendance as Model<IAttendance>) || model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;
