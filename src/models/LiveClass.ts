import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type LiveClassPlatform = "zoom" | "google-meet";
export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface ILiveClass extends Document {
  courseId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  platform: LiveClassPlatform;
  joinUrl: string;
  meetingId?: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: LiveClassStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LiveClassSchema = new Schema<ILiveClass>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    platform: { type: String, enum: ["zoom", "google-meet"], required: true },
    joinUrl: { type: String, required: true },
    meetingId: { type: String },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    status: { type: String, enum: ["scheduled", "live", "ended", "cancelled"], default: "scheduled" },
  },
  { timestamps: true }
);

export const LiveClass = (models.LiveClass as Model<ILiveClass>) || model<ILiveClass>("LiveClass", LiveClassSchema);
export default LiveClass;
