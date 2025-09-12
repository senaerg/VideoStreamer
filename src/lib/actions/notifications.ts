'use server';

import NotificationModel from "@/models/NotificationModel";
import { AppNotification } from "@/types";
import { getFileUrl } from "@/utils";
import mongoose from "mongoose";

export const getUserNotifications = async ({
    userId,
    limit = 10,
    skip = 0,
  }: {
    userId: string;
    limit?: number;
    skip?: number;
  }) => {
    try {
      const result = await NotificationModel.find({
        recipient: userId,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("recipient", "name")
        .populate("sender", "name image")
        .populate("video", "title videoId thumbnail")
        .populate("comment", "content");
      const data = result.map((item) =>
        item.toJSON()
      ) as unknown as AppNotification[];
      return {
        data: data.map((d) => ({
          ...d,
          sender: {
            ...d.sender,
            image: d.sender?.image
              ? getFileUrl(d.sender.id, d.sender?.image)
              : d.sender?.image,
          },
          recipient: {
            ...d.recipient,
            image: d.recipient?.image
              ? getFileUrl(d.recipient.id, d.recipient?.image)
              : d.recipient?.image,
          },
        })),
        message: "success",
      };
    } catch (error) {
      return { message: "Error getting notifications" };
    }
  };
  
  export const getUserNotificationStats = async (userId: string) => {
    try {
      // Count notifications where isSeen is false
      const totalUnseenCount = await NotificationModel.countDocuments({
        recipient: userId,
        isSeen: false,
      });
  
      // Count notifications where isRead is false
      const totalUnreadCount = await NotificationModel.countDocuments({
        recipient: userId,
        isRead: false,
      });
  
      return { data: { totalUnseenCount, totalUnreadCount }, message: "success" };
    } catch (error) {
      return { message: "Error getting notification stats" };
    }
  };
  
  export const updateUserNotification = async (
    args: { userId: string; notifId?: string },
    update: { isSeen?: boolean; isRead?: boolean }
  ) => {
    try {
      if (!args.notifId) {
        await NotificationModel.updateMany(
          { recipient: new mongoose.Types.ObjectId(args.userId) },
          update
        );
        return { data: args, message: "success" };
      }
      await NotificationModel.updateOne(
        {
          recipient: new mongoose.Types.ObjectId(args.userId),
          _id: new mongoose.Types.ObjectId(args.notifId),
        },
        update
      );
      return { data: args, message: "success" };
    } catch (error: any) {
      return { message: "Error updating notifications" };
    }
  };
