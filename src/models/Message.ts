import { Schema, models, model, type Document, type Types, type Model } from "mongoose";

export type MessageType = "text" | "image" | "file";

export interface IMessage extends Document {
  conversationId: string;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content?: string;
  attachmentUrl?: string;
  type: MessageType;
  courseId?: Types.ObjectId;
  readAt?: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    attachmentUrl: { type: String },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export function buildConversationId(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("_");
}

export const Message = (models.Message as Model<IMessage>) || model<IMessage>("Message", MessageSchema);
export default Message;
