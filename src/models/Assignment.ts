import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface IAssignment extends Document {
  courseId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  instructions: string;
  attachmentUrl?: string;
  dueDate: Date;
  maxMarks: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    attachmentUrl: { type: String },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Assignment = (models.Assignment as Model<IAssignment>) || model<IAssignment>("Assignment", AssignmentSchema);
export default Assignment;
