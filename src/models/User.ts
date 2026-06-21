import { Schema, models, model, type Document, type Model } from "mongoose";

export type UserRole = "student" | "teacher" | "admin";
export type UserStatus = "pending" | "active" | "blocked";

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: UserStatus;
  notificationPrefs: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], required: true },
    avatarUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: function (this: { role: UserRole }) {
        return this.role === "teacher" ? "pending" : "active";
      },
    },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
export default User;
