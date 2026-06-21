import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type LessonType = "video" | "note" | "live";

export interface ILesson extends Document {
  courseId: Types.ObjectId;
  title: string;
  order: number;
  type: LessonType;
  videoId?: Types.ObjectId;
  noteId?: Types.ObjectId;
  liveClassId?: Types.ObjectId;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    type: { type: String, enum: ["video", "note", "live"], required: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video" },
    noteId: { type: Schema.Types.ObjectId, ref: "Note" },
    liveClassId: { type: Schema.Types.ObjectId, ref: "LiveClass" },
    durationMinutes: { type: Number },
  },
  { timestamps: true }
);

export const Lesson = (models.Lesson as Model<ILesson>) || model<ILesson>("Lesson", LessonSchema);
export default Lesson;
