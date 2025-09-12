import React from "react";
import PageClient from "./PageClient";
import { connectToDatabase } from "@/lib/db";
import VideoModel from "@/models/VideoModel";
import { AppVideoComment, AppVideoDetails } from "@/types";
import { getBunnyVideo } from "@/lib/actions/bunny";
import { fetchVideoComments } from "@/lib/actions/comments";
import { Typography } from "@mui/material";
import { auth } from "@/auth";
import SubscriptionModel from "@/models/SubscriptionModel";
import { addVideoToHistory } from "@/lib/actions/stream";
import { getFileUrl, sortResolutionsDesc } from "@/utils";
import { bunnyPullZoneUrl, bunnyStreamSecurityKey } from "@/config";
import crypto from "crypto";

const generateToken = (path: string) => {
  // Set the time of expiry to one hour from now
  const expires = Math.round(Date.now() / 1000) + 3600 * 24;
  // create hashable bae
  const hashableBase = bunnyStreamSecurityKey + path + expires;
  // Generate and encode the token
  const md5String = crypto
    .createHash("md5")
    .update(hashableBase)
    .digest("binary");
  const str = Buffer.from(md5String, "binary").toString("base64");
  const token = str.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
  return { token, expires };
};
// Generate the URL
const getBunnyCDNDownloadUrl = (args: {
  path: string;
  token: string;
  expires: number;
  filename: string;
  limit?: number;
}) => {
  const limit = args.limit ?? 1024;
  return `${bunnyPullZoneUrl}/${args.path}/${args.filename}?token=${args.token}&expires=${args.expires}&limit=${limit}`;
};

const VideoSection = async ({ id }: { id: string }) => {
  const session = await auth();
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch the video from the database
    const item = await VideoModel.findOne({ videoId: id })
      .populate("user", "name username image banner")
      .populate("categories", "name");

    if (!item) {
      // Handle case where video is not found
      return <Typography>Video not found</Typography>;
    }

    const result = await getBunnyVideo(id);

    if (!result.data) return <Typography>{result.message}</Typography>;
    // console.log(result.data)
    // include original files download
    const sortedResolutions = [
      { name: "Original", filename: "original" },
      ...sortResolutionsDesc(result.data.availableResolutions).map((key) => ({
        name: key,
        filename: `play_${key}.mp4`,
      })),
    ];
    const { token, expires } = generateToken(item.videoId);
    const resolutions = sortedResolutions.map((k) => ({
      name: k.name,
      url: getBunnyCDNDownloadUrl({
        path: item.videoId,
        expires,
        token,
        filename: k.filename,
      }),
    }));
    // Fetch virtual fields
    const totalLikes: number = await item.getTotalLikes();
    const totalSubscribers = await item.getTotalSubscribers();
    const totalComments = await item.getTotalComments();
    const totalBookmarks = await item.getTotalBookmarks();
    const isLiked = session ? await item.isLiked(session?.user?.id) : false;
    const isSaved = session ? await item.isSaved(session?.user?.id) : false;
    const isSubscribed = !!(await SubscriptionModel.exists({
      fromUser: session?.user?.id,
      toUser: item?.user?._id,
    }));

    // Map the database result to the AppVideo type
    const video: AppVideoDetails = {
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      tags: item.tags,
      thumbnail: item.thumbnail,
      videoId: item.videoId,
      createdAt: item.createdAt,
      shares: item.shares,
      isLiked,
      isSaved,
      isSubscribed,
      totalLikes,
      totalComments,
      totalBookmarks,
      resolutions,
      categories: item.categories.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
      })),
      user: {
        id: item?.user?._id.toString(),
        name: item.user?.name,
        username: item.user?.username,
        image: getFileUrl(item?.user?._id.toString(), item.user?.image),
        totalSubscribers,
      },
      item: result.data,
    };

    if (session) {
      addVideoToHistory(String(session?.user?.id), video.id);
    }

    // get comments
    let comments: AppVideoComment[] = [];
    const res = await fetchVideoComments(video.id);
    if (res.data) {
      comments = res.data;
    }
    // console.log()
    // Render the VideoPlayer component with the video data
    return <PageClient video={video} comments={comments} />;
  } catch (error: any) {
    // Handle errors gracefully
    return (
      <Typography>Something went wrong. Please try again later.</Typography>
    );
  }
};

export default VideoSection;
