import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface IVideo extends Document {
  courseId: Types.ObjectId;
  title: string;
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  studentIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    durationSeconds: { type: Number },
    studentIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Video = (models.Video as Model<IVideo>) || model<IVideo>("Video", VideoSchema);
export default Video;
