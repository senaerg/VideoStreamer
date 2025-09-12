import { INotificationKind } from "@/types";
import mongoose, { Schema, Document, Types } from "mongoose";


export interface INotification extends Document {
  message: string;
  isSeen: boolean;
  isRead: boolean;
  kind: INotificationKind;
  video: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  comment?: Types.ObjectId; // Optional reference to a comment

}

const NotificationSchema = new Schema<INotification>(
  {
    isSeen: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    message: { type: String, required: true },
    kind: { type: String, enum: Object.values(INotificationKind)},
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }, // Reference to a comment


  },
  { timestamps: true }
);

// Transform `_id` to `id` and handle sender/recipient transformation
NotificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    // Convert `_id` to `id`
    ret.id = ret._id.toString();
    delete ret._id;

    // Transform `sender`
    if (ret.sender) {
      if (typeof ret.sender === "object" && "_id" in ret.sender) {
        // If sender is populated, convert `_id` to `id`
        ret.sender.id = ret.sender._id.toString();
        delete ret.sender._id;
      } else if (typeof ret.sender === "string") {
        // If sender is an ObjectId, convert it to `id`
        ret.sender = { id: ret.sender };
      }
    }

    // Transform `recipient`
    if (ret.recipient) {
      if (typeof ret.recipient === "object" && "_id" in ret.recipient) {
        // If recipient is populated, convert `_id` to `id`
        ret.recipient.id = ret.recipient._id.toString();
        delete ret.recipient._id;
      } else if (typeof ret.recipient === "string") {
        // If recipient is an ObjectId, convert it to `id`
        ret.recipient = { id: ret.recipient };
      }
    }

    // Transform `comment`
    if (ret.comment) {
      if (typeof ret.comment === "object" && "_id" in ret.comment) {
        // If comment is populated, convert `_id` to `id`
        ret.comment.id = ret.comment._id.toString();
        delete ret.comment._id;
      } else if (typeof ret.comment === "string") {
        // If comment is an ObjectId, convert it to `id`
        ret.comment = { id: ret.comment };
      }
    }
  },
});

export default mongoose.models?.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
