import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type PaymentGateway = "esewa" | "khalti" | "fonepay";
export type PaymentStatus = "pending" | "success" | "failed";

export interface IPayment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  transactionId: string;
  status: PaymentStatus;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    gateway: { type: String, enum: ["esewa", "khalti", "fonepay"], required: true },
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    invoiceUrl: { type: String },
  },
  { timestamps: true }
);

export const Payment = (models.Payment as Model<IPayment>) || model<IPayment>("Payment", PaymentSchema);
export default Payment;
