import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  teacherId: Types.ObjectId;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  isPublished: boolean;
  studentsEnrolledCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    studentsEnrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Course = (models.Course as Model<ICourse>) || model<ICourse>("Course", CourseSchema);
export default Course;
