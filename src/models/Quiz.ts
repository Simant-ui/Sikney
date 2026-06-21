import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface IQuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export interface IQuiz extends Document {
  courseId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  durationMinutes: number;
  questions: IQuizQuestion[];
  totalMarks: number;
  isPublished: boolean;
  startAt?: Date;
  endAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    marks: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    questions: [QuizQuestionSchema],
    totalMarks: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, default: false },
    startAt: { type: Date },
    endAt: { type: Date },
  },
  { timestamps: true }
);

export const Quiz = (models.Quiz as Model<IQuiz>) || model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
