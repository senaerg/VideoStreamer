
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFavourite extends Document {
  video:  Types.ObjectId;  
  user:  Types.ObjectId;
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },

  },
  { timestamps: true }
);

export default  mongoose.models?.Favourite || mongoose.model<IFavourite>("Favourite", FavouriteSchema);
