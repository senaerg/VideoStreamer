import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  rating: number;
  comment: string;
  user: Types.ObjectId;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models?.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
