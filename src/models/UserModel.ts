
import mongoose, { Schema, Document, Types } from "mongoose";
import VideoModel from "./VideoModel";
import SubscriptionModel from "./SubscriptionModel";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  username: string;
  bio: string;
  image?: string;
  banner?: string;
  createdAt: Date;
  updatedAt: Date;
  videos: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    banner: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: ""
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"]
    },
  },
  { timestamps: true }
);

// Method to get total user videos
UserSchema.methods.getTotalVideos = async function (id: string) {
  return await VideoModel.countDocuments({ user: id });
};
// Method to get total user subscribers
UserSchema.methods.getTotalSubscribers = async function (id: string) {
  return await SubscriptionModel.countDocuments({ toUser: id });
};

UserSchema.virtual("videos", {
  ref: "Video", // The model to use
  localField: "_id", // The field in the User model
  foreignField: "user", // The field in the Video model
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.hash;
  }
});

export default  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);
