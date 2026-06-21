import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type TeacherApprovalStatus = "pending" | "approved" | "rejected";

export interface ITeacherProfile extends Document {
  userId: Types.ObjectId;
  bio?: string;
  subjects: string[];
  qualifications?: string;
  approvalStatus: TeacherApprovalStatus;
  totalEarnings: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherProfileSchema = new Schema<ITeacherProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String },
    subjects: [{ type: String }],
    qualifications: { type: String },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TeacherProfile =
  (models.TeacherProfile as Model<ITeacherProfile>) ||
  model<ITeacherProfile>("TeacherProfile", TeacherProfileSchema);
export default TeacherProfile;
