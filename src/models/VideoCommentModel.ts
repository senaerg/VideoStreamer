import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  video: Types.ObjectId; // Reference to the video
  user: Types.ObjectId; // Reference to the user who made the comment
  content: string; // The text of the comment
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Add an index for efficient querying by video and user
CommentSchema.index({ video: 1, user: 1 });

// Transform `_id` to `id` in JSON responses
CommentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    // Transform `sender`
    if (ret.user) {
      if (typeof ret.user === "object" && ret.user._id) {
        // If user is populated, convert `_id` to `id`
        ret.user.id = ret.user._id.toString();
        delete ret.user._id;
      } else if (typeof ret.user === "string") {
        // If user is an ObjectId, convert it to `id`
        ret.user = { id: ret.user };
      }
    }
    if (ret.video) {
      if (typeof ret.video === "object" && ret.video._id) {
        // If video is populated, convert `_id` to `id`
        ret.video.id = ret.video._id.toString();
        delete ret.video._id;
      } else if (typeof ret.video === "string") {
        // If video is an ObjectId, convert it to `id`
        ret.video = { id: ret.video };
      }
    }
  },
});

export default mongoose.models?.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
