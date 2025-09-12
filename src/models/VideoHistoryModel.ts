
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHistory extends Document {
  video:  Types.ObjectId;  
  user:  Types.ObjectId;
}

const HistorySchema = new Schema<IHistory>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },

  },
  { timestamps: true }
);



export default  mongoose.models?.History || mongoose.model<IHistory>("History", HistorySchema);
