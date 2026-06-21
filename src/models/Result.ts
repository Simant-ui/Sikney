import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export interface IAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
}

export interface IResult extends Document {
  quizId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  startedAt: Date;
  submittedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionIndex: { type: Number, required: true },
    selectedOptionIndex: { type: Number, required: true },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    answers: [AnswerSchema],
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ResultSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export const Result = (models.Result as Model<IResult>) || model<IResult>("Result", ResultSchema);
export default Result;
