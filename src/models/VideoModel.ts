
import mongoose, { Schema, Document, Types } from "mongoose";
import SubscriptionModel from "./SubscriptionModel";
import VideoFavouriteModel from "./VideoFavouriteModel";
import VideoBookmarkModel from "./VideoBookmarkModel";
import VideoCommentModel from "./VideoCommentModel";

export enum VideoStatus {
  DRAFT = "DRAFT",
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
}

export interface IVideo extends Document {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  isReady: boolean;
  status: VideoStatus;
  user: Types.ObjectId;
  shares: number;
  categories: Types.ObjectId[]; // Array of category IDs
  
  // Methods
  getTotalLikes(): Promise<number>;
  getTotalSubscribers(): Promise<number>;
  getTotalComments(): Promise<number>;
  getTotalBookmarks(): Promise<number>;
  isLiked(userId: string): Promise<boolean>;
  isSaved(userId: string): Promise<boolean>;

}

const VideoSchema = new Schema<IVideo>(
  {
    videoId: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    tags: { type: [String], default: [] },
    isReady: { type: Boolean, default: false },
    shares: { type: Number, default: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // Reference to categories
    status: {
      type: String,
      enum: Object.values(VideoStatus),
      default: VideoStatus.DRAFT,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);


// Method for total likes
VideoSchema.methods.getTotalLikes = async function () {
  return await VideoFavouriteModel.countDocuments({ video: this._id });
};

// Method for total subscribers
VideoSchema.methods.getTotalSubscribers = async function () {
  return await SubscriptionModel.countDocuments({ toUser: this.user });
};

// Method for total comments
VideoSchema.methods.getTotalComments = async function () {
  return await VideoCommentModel.countDocuments({ video: this._id });
};

// Method for total bookmarks
VideoSchema.methods.getTotalBookmarks = async function () {
  return await VideoBookmarkModel.countDocuments({ video: this._id });
};

// Method for isLiked (requires passing the current user ID)
VideoSchema.methods.isLiked = async function (userId: string) {
  if (!userId) return false;
  return !!(await VideoFavouriteModel.exists({ user: userId, video: this._id }));
};

// Method for isSaved (requires passing the current user ID)
VideoSchema.methods.isSaved = async function (userId: string) {
  if (!userId) return false;
  return !!(await VideoBookmarkModel.exists({ user: userId, video: this._id }));
};

// Create a full-text search index
VideoSchema.index({ title: "text", description: "text" });

VideoSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.hash;
        // Convert ObjectId fields to strings
        if (ret.user && typeof ret.user === 'object') {
          ret.user = ret.user.toString();
        }
    }
});


export default  mongoose.models?.Video || mongoose.model<IVideo>("Video", VideoSchema);
