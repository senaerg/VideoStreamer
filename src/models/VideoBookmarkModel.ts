
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBookmark extends Document {
  video:  Types.ObjectId;  
  user:  Types.ObjectId;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },

  },
  { timestamps: true }
);


export default  mongoose.models?.Bookmark || mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
