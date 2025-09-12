'use server'
import UserModel from "@/models/UserModel";
import { connectToDatabase } from "../db";
import { composeUser, getFileUrl } from "@/utils";
import { AppUser } from "@/types";

export const fetchPublicUser = async (filter: object) => {
  await connectToDatabase();
  try {
    const result = await UserModel.findOne(filter).select("-password");
    if (!result) {
      return { message: "User not found" };
    }
    const totalSubscribers: number = await result.getTotalSubscribers(result._id)
    const totalVideos: number = await result.getTotalVideos(result._id)
    const user = result.toJSON();
    const data: AppUser = {
      id: user.id, 
      name: user.name, 
      email: user.email,
      image: user?.image ? getFileUrl(user.id, user?.image) : user?.image,
      banner: user?.banner ? getFileUrl(user.id, user?.banner) : user?.banner,
      username: user?.username,
      bio: user?.bio,
      totalVideos, 
      totalSubscribers
  }
    return { data , message: "success" };
  } catch (error: any) {
    return { message: "Sorry, something went wrong"}
  }
};

export const updateUserBio = async (userId: string, bio: string) => {
  try {
  await connectToDatabase();

    const result = await UserModel.findByIdAndUpdate(userId, { bio})
    if (!result) {
      return { message: "Error updating user" };
    }
    return { data: {
        bio, userId
    }, message: "Bio updated successfully" };
  } catch (error: any) {
    console.log(error?.message)
    return { message: "Sorry, something went wrong"}
  }
};

export const getCurrentUser = async (filter: object) => {
  await connectToDatabase();
  const user = await UserModel.findOne(filter);
  if (!user) return null;
  return composeUser(user);
};
