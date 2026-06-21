import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type SubmissionStatus = "pending" | "graded";

export interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  fileUrl: string;
  status: SubmissionStatus;
  marksObtained?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "graded"], default: "pending" },
    marksObtained: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { timestamps: false }
);

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = (models.Submission as Model<ISubmission>) || model<ISubmission>("Submission", SubmissionSchema);
export default Submission;
