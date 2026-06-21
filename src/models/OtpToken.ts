import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type OtpPurpose = "verify-email" | "reset-password";

export interface IOtpToken extends Document {
  userId: Types.ObjectId;
  email: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  consumedAt?: Date;
  attempts: number;
  createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["verify-email", "reset-password"], required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpToken = (models.OtpToken as Model<IOtpToken>) || model<IOtpToken>("OtpToken", OtpTokenSchema);
export default OtpToken;
