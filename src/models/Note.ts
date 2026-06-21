import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface INote extends Document {
  courseId: Types.ObjectId;
  title: string;
  fileUrl: string;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
  },
  { timestamps: true }
);

export const Note = (models.Note as Model<INote>) || model<INote>("Note", NoteSchema);
export default Note;
