'use server'

import VideoModel, { VideoStatus } from "@/models/VideoModel";
import { connectToDatabase } from "../db";
import mongoose from "mongoose";
import { formatVideoData } from "@/utils";
import { BunnyVideoStream, INotificationKind, VideoAnalytics } from "@/types";
import { bunnyStreamKey, bunnyStreamUrl, bunnyVideoLibraryId } from "@/config";
import VideoBookmarkModel from "@/models/VideoBookmarkModel";
import SubscriptionModel from "@/models/SubscriptionModel";
import VideoFavouriteModel from "@/models/VideoFavouriteModel";
import VideoHistoryModel from "@/models/VideoHistoryModel";
import NotificationModel from "@/models/NotificationModel";

export const createVideoRecord = async (payload: {
    videoId: string;
    userId: string;
    title: string;
    description: string;
    thumbnail: string;
    [key: string]: any;
  }) => {
    try {
        await connectToDatabase();

      const video = await VideoModel.create({
        videoId: payload.videoId,
        user: payload.userId,
        title: payload.title,
        description: payload.description,
        thumbnail: payload.thumbnail,
      });
      return { data: video.toJSON(), message: "Video created successfully" };
    } catch (error: any) {
      return { message: "Sorry an error occurred trying to create video" };
    }
  };


  export const updateVideoRecord = async (payload: {
    videoId: string;
    user?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    status?: VideoStatus;
    [key: string]: any;
  }) => {
    try {
    await connectToDatabase();
      await VideoModel.updateOne({ videoId: payload.videoId }, payload);
      return { data: payload, message: "Video updated successfully" };
    } catch (error: any) {
      return { message: "Sorry error occurred trying to update video" };
    }
  };

  export const getVideoStreams = async (args: {
    limit: number;
    skip: number;
    filter?: object;
    cat?: string | null;
  }) => {
    try {
    await connectToDatabase();
      const _filter = args.filter ? args.filter : {};
      const res = await VideoModel.find(args?.cat
          ? { ..._filter, categories: new mongoose.Types.ObjectId(args?.cat) }
          : _filter
      )
        .skip(args.skip)
        .limit(args.limit)
        .populate("user", "name image username");
      const videos = formatVideoData(res);
      if (videos.length === 0) {
        return { message: "No videos found" };
      }
      const videoList = await Promise.all(
        videos.map(async (v) => {
          const item = (await getBunnyVideo(v.videoId)) as BunnyVideoStream;
          return { ...v, item };
        })
      ).then((results) => results.filter((v) => v.item !== null));
      return { data: videoList, message: "success" };
    } catch (error: any) {
      return { message: "Sorry, something went wrong" };
    }
  };

  async function getBunnyVideo(videoId: string) {
    const res = await fetch(
      `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/videos/${videoId}/`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          AccessKey: bunnyStreamKey,
        },
      }
    );
    if (!res.ok) {
      return null;
    }
    const result = (await res.json()) as BunnyVideoStream;
    return result;
  }
  

  export const bookmarkVideo = async (payload: {
    user: string;
    video: string;
  }) => {
    try {
    await connectToDatabase();
      const existingBookmark = await VideoBookmarkModel.findOne({
        video: payload.video,
        user: payload.user,
      });
  
      if (existingBookmark) {
        // If the bookmark exists, delete it
        await VideoBookmarkModel.deleteOne({
          video: payload.video,
          user: payload.user,
        });
        return { data: payload, message: "Bookmark removed successfully" };
      } else {
        // If the bookmark doesn't exist, create it
        await VideoBookmarkModel.create(payload);
        return { data: payload, message: "Bookmark added successfully" };
      }
    } catch (error: any) {
      return { message: "Sorry, an error occurred trying to manage bookmark" };
    }
  };
  
  export const shareVideo = async (videoId: string) => {
    try {
      await connectToDatabase();
      const video = await VideoModel.findById(videoId);
      if (!video) {
        return { message: "Video not found" };
      }
      video.shares = (video.shares || 0) + 1;
      await video.save();
      return { data: { videoId }, message: "Success" };
    } catch (error: any) {
      return {
        message: "Sorry, an error occurred trying to update video shares",
      };
    }
  };


export const searchVideos = async (query: string, page = 1, limit = 10) => {
  try {
    // const searchRegex = new RegExp(query, "i"); // Case-insensitive regex for tags

    const result = await VideoModel.find(
      { $text: { $search: query } }, // Full-text search on title & description
      { score: { $meta: "textScore" } }
    )
      .populate("user", "name image")
      .sort({ score: { $meta: "textScore" } }) // Sort by relevance
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await VideoModel.countDocuments({
      $text: { $search: query },
    });

    const videos = formatVideoData(result);

    if (total === 0) {
      return { message: "No result for the search query" };
    }
    return { data: { videos, total }, message: "success" };
  } catch (error: any) {
    return { message: "Error performing search" };
  }
};

export const fetchSubscribedVideos = async (
  fromUserId: string,
  args: { limit: number; skip: number }
) => {
  try {
  await connectToDatabase();

    const subscribedVideos = await SubscriptionModel.aggregate([
      {
        $match: { fromUser: new mongoose.Types.ObjectId(fromUserId) }, // Match subscriptions for the given fromUser
      },
      {
        $lookup: {
          from: "videos", // The name of the Video collection
          localField: "toUser", // Field in SubscriptionSchema
          foreignField: "user", // Field in VideoSchema
          as: "videos", // Alias for the joined videos
        },
      },
      {
        $unwind: "$videos", // Flatten the videos array
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "videos.user", // Field in VideoSchema
          foreignField: "_id", // Field in UserSchema
          as: "userDetails", // Alias for the joined user details
        },
      },
      {
        $unwind: "$userDetails", // Flatten the userDetails array
      },
      {
        $addFields: {
          "videos.user": {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            image: "$userDetails.image",
            username: "$userDetails.username",
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$videos" }, // Replace the root with the video document
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $skip: args.skip, // Skip the specified number of documents
      },
      {
        $limit: args.limit, // Limit the number of documents returned
      },
    ]);

    const videos = formatVideoData(subscribedVideos);

    if (videos.length === 0) {
      return { message: "No videos found" };
    }
    const videoList = await Promise.all(
      videos.map(async (v) => {
        const item = (await getBunnyVideo(v.videoId)) as BunnyVideoStream;
        return { ...v, item };
      })
    ).then((results) => results.filter((v) => v.item !== null));
    return { data: videoList, message: "success" };
  } catch (error: any) {
    return { message: "Sorry, something went wrong" };
  }
};

export const fetchBookmarkedVideos = async (
  userId: string,
  args: { limit: number; skip: number }
) => {
  try {
  await connectToDatabase();

    const bookmarkedVideos = await VideoBookmarkModel.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(userId) }, // Match bookmarks for the given user
      },
      {
        $lookup: {
          from: "videos", // The name of the Video collection
          localField: "video", // Field in BookmarkSchema
          foreignField: "_id", // Field in VideoSchema
          as: "videoDetails", // Alias for the joined video details
        },
      },
      {
        $unwind: "$videoDetails", // Flatten the videoDetails array
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "videoDetails.user", // Field in VideoSchema
          foreignField: "_id", // Field in UserSchema
          as: "userDetails", // Alias for the joined user details
        },
      },
      {
        $unwind: "$userDetails", // Flatten the userDetails array
      },
      {
        $addFields: {
          "videoDetails.user": {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            image: "$userDetails.image",
            username: "$userDetails.username",
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$videoDetails" }, // Replace the root with the video document
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $skip: args.skip, // Skip the specified number of documents
      },
      {
        $limit: args.limit, // Limit the number of documents returned
      },
    ]);

    const videos = formatVideoData(bookmarkedVideos);

    if (videos.length === 0) {
      return { message: "No bookmarked videos found" };
    }
    const videoList = await Promise.all(
      videos.map(async (v) => {
        const item = (await getBunnyVideo(v.videoId)) as BunnyVideoStream;
        return { ...v, item };
      })
    ).then((results) => results.filter((v) => v.item !== null));
    return { data: videoList, message: "success" };
  } catch (error: any) {
    return { message: "Sorry, something went wrong" };
  }
};

export const fetchFavouritedVideos = async (
  userId: string,
  args: { limit: number; skip: number }
) => {
  try {
  await connectToDatabase();

    const bookmarkedVideos = await VideoFavouriteModel.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(userId) }, // Match bookmarks for the given user
      },
      {
        $lookup: {
          from: "videos", // The name of the Video collection
          localField: "video", // Field in BookmarkSchema
          foreignField: "_id", // Field in VideoSchema
          as: "videoDetails", // Alias for the joined video details
        },
      },
      {
        $unwind: "$videoDetails", // Flatten the videoDetails array
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "videoDetails.user", // Field in VideoSchema
          foreignField: "_id", // Field in UserSchema
          as: "userDetails", // Alias for the joined user details
        },
      },
      {
        $unwind: "$userDetails", // Flatten the userDetails array
      },
      {
        $addFields: {
          "videoDetails.user": {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            image: "$userDetails.image",
            username: "$userDetails.username",
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$videoDetails" }, // Replace the root with the video document
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $skip: args.skip, // Skip the specified number of documents
      },
      {
        $limit: args.limit, // Limit the number of documents returned
      },
    ]);

    const videos = formatVideoData(bookmarkedVideos);

    if (videos.length === 0) {
      return { message: "No bookmarked videos found" };
    }
    const videoList = await Promise.all(
      videos.map(async (v) => {
        const item = (await getBunnyVideo(v.videoId)) as BunnyVideoStream;
        return { ...v, item };
      })
    ).then((results) => results.filter((v) => v.item !== null));
    return { data: videoList, message: "success" };
  } catch (error: any) {
    return { message: "Sorry, something went wrong" };
  }
};

export const fetchVideosViewHistory = async (
  userId: string,
  args: { limit: number; skip: number }
) => {
  try {
  await connectToDatabase();
    const result = await VideoHistoryModel.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(userId) }, // Match bookmarks for the given user
      },
      {
        $lookup: {
          from: "videos", // The name of the Video collection
          localField: "video", // Field in BookmarkSchema
          foreignField: "_id", // Field in VideoSchema
          as: "videoDetails", // Alias for the joined video details
        },
      },
      {
        $unwind: "$videoDetails", // Flatten the videoDetails array
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "videoDetails.user", // Field in VideoSchema
          foreignField: "_id", // Field in UserSchema
          as: "userDetails", // Alias for the joined user details
        },
      },
      {
        $unwind: "$userDetails", // Flatten the userDetails array
      },
      {
        $addFields: {
          "videoDetails.user": {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            image: "$userDetails.image",
            username: "$userDetails.username",
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$videoDetails" }, // Replace the root with the video document
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $skip: args.skip, // Skip the specified number of documents
      },
      {
        $limit: args.limit, // Limit the number of documents returned
      },
    ]);

    const videos = formatVideoData(result);

    if (videos.length === 0) {
      return { message: "No bookmarked videos found" };
    }
    const videoList = await Promise.all(
      videos.map(async (v) => {
        const item = (await getBunnyVideo(v.videoId)) as BunnyVideoStream;
        return { ...v, item };
      })
    ).then((results) => results.filter((v) => v.item !== null));
    return { data: videoList, message: "success" };
  } catch (error: any) {
    console.log(error)
    return { message: "Sorry, something went wrong" };
  }
};

export const fetchUserVideos = async (
  userId: string,
  args: { limit: number; skip: number }
) => {
  await connectToDatabase();
  try {
    const res = await VideoModel.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .skip(args.skip)
      .limit(args.limit)
      .populate("user", "name image username");
    const videos = formatVideoData(res);
    if (videos.length === 0) {
      return { message: "No videos found" };
    }
    const videoList = await Promise.all(
      videos.map(async (v) => {
        const item = (await getBunnyVideo(v.videoId)) as BunnyVideoStream;
        return { ...v, item };
      })
    ).then((results) => results.filter((v) => v.item !== null));
    return { data: videoList, message: "success" };
  } catch (error: any) {
    return { message: "Sorry, something went wrong" };
  }
};


export const fetchVideo = async (videoId: string) => {
  try {
    await connectToDatabase();
    const result = await VideoModel.findOne({ videoId })
      .populate("user", "name image username")
      .populate("categories", "name");
  
    if(!result) return { message: "Video not found"}
    // Fetch virtual fields
    const totalLikes: number = await result.getTotalLikes();
    const totalComments: number = await result.getTotalComments();
    const totalBookmarks: number = await result.getTotalBookmarks();
    // const totalSubscribers = await item.getTotalSubscribers();
    // const isLiked = session ? await item.isLiked(session?.user?.id) : false;
    // const isSaved = session ? await item.isSaved(session?.user?.id) : false;
    // const isSubscribed = !!(await SubscriptionModel.exists({ fromUser: session?.user?.id, toUser: item?.user?._id }))
    const obj = {...result._doc, totalLikes, totalComments, totalBookmarks};        
    const videos = formatVideoData([obj]);
    if (videos.length === 0) {
      return { message: "No video found" };
    } // get bunny video
    const item = (await getBunnyVideo(videoId)) as BunnyVideoStream;
    return { data: { ...videos[0], item }, message: "success" };
  } catch (error: any) {
    console.log(error?.message);
    return { message: "Sorry, something went wrong" };
  }
};

export const fetchVideoStatistics = async (videoId: string) => {
  try {
    await connectToDatabase();
    const options = {
      method: "GET",
      headers: { accept: "application/json", AccessKey: bunnyStreamKey },
    };

    const res = await fetch(
      `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/statistics?hourly=false&videoGuid=${videoId}`,
      options
    );

    if (!res.ok) {
      return { message: "Error fetching video statistics" };
    }
    const stats:VideoAnalytics = await res.json();
    return { data: stats, message: "success" };
  } catch (error: any) {
    return { message: "Sorry, something went wrong" };
  }
};


export async function addVideoToHistory(userId: string, videoId: string) {
  try {
    await connectToDatabase();
    // Remove duplicate history for the same video
    await VideoHistoryModel.deleteMany({ user: userId, video: videoId });

    // Insert new history record
    await VideoHistoryModel.create({ user: userId, video: videoId });

    // Trim history to keep only last 30 records
    const historyCount = await VideoHistoryModel.countDocuments({
      user: userId,
    });

    if (historyCount > 30) {
      const oldestRecords = await VideoHistoryModel.find({ user: userId })
        .sort({ createdAt: 1 }) // Oldest first
        .limit(historyCount - 30); // Get extra records

      const oldestIds = oldestRecords.map((record) => record._id);
      await VideoHistoryModel.deleteMany({ _id: { $in: oldestIds } }); // Delete extra records
    }
    return { data: { userId, videoId }, message: "success" };
  } catch (error: any) {
    return { message: "Error updating view history" };
  }
}


export const favouriteVideo = async (
  payload: {
    user: string;
    video: string;
  },
  recipient: string
) => {
  try {
  await connectToDatabase();

    const existingFavourite = await VideoFavouriteModel.findOne({
      video: payload.video,
      user: payload.user,
    });

    if (existingFavourite) {
      // If the favourite exists, delete it
      await VideoFavouriteModel.deleteOne({
        video: payload.video,
        user: payload.user,
      });
      return { data: payload, message: "Favourite removed successfully" };
    } else {
      // If the favourite doesn't exist, create it
      await VideoFavouriteModel.create(payload);
      // save notification
      if (payload.user !== recipient) {
        const isExists = await NotificationModel.exists({
          sender: payload.user,
          video: payload.video,
        });
        if (!isExists) {
          await NotificationModel.create({
            kind: INotificationKind.REACTION,
            message: "Liked your video",
            video: payload.video,
            sender: payload.user,
            recipient,
          });
        }
      }
      return { data: payload, message: "Favourite added successfully" };
    }
  } catch (error: any) {
    return { message: "Sorry, an error occurred trying to manage favourite" };
  }
};


export const subscribeToUser = async (payload: {
  toUser: string;
  fromUser: string;
}) => {
  try {
  await connectToDatabase();
    const existingSubscription = await SubscriptionModel.findOne({
      toUser: payload.toUser,
      fromUser: payload.fromUser,
    });

    if (existingSubscription) {
      // If the subscription exists, delete it
      await SubscriptionModel.deleteOne({
        toUser: payload.toUser,
        fromUser: payload.fromUser,
      });
      return { data: payload, message: "Unsubscribed successfully" };
    } else {
      // If the subscription doesn't exist, create it
      await SubscriptionModel.create(payload);
      return { data: payload, message: "Subscribed successfully" };
    }
  } catch (error: any) {
    return {
      message: "Sorry, an error occurred trying to manage subscription",
    };
  }
};
