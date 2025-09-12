"use server";

import VideoCommentModel from "@/models/VideoCommentModel";
import { connectToDatabase } from "../db";
import NotificationModel from "@/models/NotificationModel";
import { AppVideoComment, INotificationKind } from "@/types";
import { getFileUrl } from "@/utils";

export const insertVideoComment = async (
  payload: {
    user: string;
    video: string;
    content: string;
  },
  recipient: string
) => {
  try {
    await connectToDatabase();
    // If the favourite doesn't exist, create it
    const result = await VideoCommentModel.create(payload);
    // save notification
    if (payload.user !== recipient) {
      await NotificationModel.create({
        kind: INotificationKind.COMMENT,
        message: "Commented on your video",
        video: payload.video,
        sender: payload.user,
        recipient,
        comment: result?._id,
      });
    }
    // Populate the created comment
    const comment = await VideoCommentModel.findById(result._id)
      .populate("user", "name username image") // Populate user details
      .populate("video", "title videoId"); // Populate video details
    const item: AppVideoComment = comment.toJSON();
    const data = {
      ...item,
      user: {
        ...item.user,
        image: item.user?.image
          ? getFileUrl(item?.user?.id.toString(), item.user?.image)
          : undefined,
      },
    };
    return { data, message: "Comment posted" };
  } catch (error: any) {
    return { message: "Sorry, an error occurred trying to process request" };
  }
};

export const fetchVideoComments = async (
  videoId: string,
  args?: { limit?: number; page?: number }
) => {
  await connectToDatabase();
  const { limit = 21, page = 1 } = args || {};
  try {
    const result = await VideoCommentModel.find({ video: videoId })
      .populate("user", "name image username") // Populate user details (name and avatar)
      .populate("video", "title videoId")
      .sort({ createdAt: -1 }) // Sort comments by newest first
      .skip((page - 1) * limit) // Skip the specified number of comments
      .limit(limit); // Limit the number of comments returned

    if (result.length === 0) {
      return { message: "No comments found" };
    }
    const comments: AppVideoComment[] = result.map((item) => {
      const _item: AppVideoComment = item.toJSON();
      return {
        ..._item,
        user: {
          ..._item.user,
          image: item.user?.image
            ? getFileUrl(item?.user?.id.toString(), item.user?.image)
            : undefined,
        },
      };
    });
    return { data: comments, message: "Comments fetched successfully" };
  } catch (error: any) {
    return { message: "Sorry, an error occurred while fetching comments" };
  }
};
