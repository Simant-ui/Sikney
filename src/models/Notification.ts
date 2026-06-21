import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type NotificationType = "info" | "assignment" | "quiz" | "payment" | "class" | "system";

export interface INotification extends Document {
  userId?: Types.ObjectId;
  isGlobal: boolean;
  title: string;
  body: string;
  link?: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    isGlobal: { type: Boolean, default: false },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String },
    type: { type: String, enum: ["info", "assignment", "quiz", "payment", "class", "system"], default: "info" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = (models.Notification as Model<INotification>) || model<INotification>("Notification", NotificationSchema);
export default Notification;
