import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  grade?: string;
  bio?: string;
  enrolledCourses: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    grade: { type: String },
    bio: { type: String },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course", default: [] }],
  },
  { timestamps: true }
);

export const StudentProfile =
  (models.StudentProfile as Model<IStudentProfile>) ||
  model<IStudentProfile>("StudentProfile", StudentProfileSchema);
export default StudentProfile;
