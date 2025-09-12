import { bunnyFilenameUID, bunnyPullZoneUrl, bunnyStorageUrl } from "@/config";
import { AppVideo } from "@/types";
import { Session } from "next-auth";

export const getFileUrl = (id: string, filename: string) => {
    return `${bunnyStorageUrl}/${id}/${filename}`;
  };

export const shortenName = (name: string, limit: number = 7) => {
  if (name.length > limit) {
    return `${name.slice(0, limit)}...${name?.split(".").pop()}`;
  }
  return name;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

export const generateThumbnails = async (
  file: File,
  frameCount: number = 5
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const thumbnails: string[] = [];

    if (!context) {
      reject("Canvas context is not available");
      return;
    }

    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
      const duration = video.duration;
      const interval = duration / frameCount;

      let currentFrame = 0;

      const captureFrame = () => {
        if (currentFrame >= frameCount) {
          URL.revokeObjectURL(video.src); // Clean up the object URL
          resolve(thumbnails);
          return;
        }

        video.currentTime = currentFrame * interval;
      };

      video.addEventListener("seeked", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a base64 image
        const thumbnail = canvas.toDataURL("image/jpeg");
        thumbnails.push(thumbnail);

        currentFrame++;
        captureFrame();
      });

      captureFrame();
    });

    video.addEventListener("error", (error) => {
      reject(`Error loading video: ${error.message}`);
    });
  });
};

export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export const imageFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image to base64"));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};


export const formatVideoData = (data: any[]) => {
  return data.map((item) => ({
    id: item._id.toString(),
    title: item.title,
    description: item.description,
    tags: item.tags,
    thumbnail: item.thumbnail,
    videoId: item.videoId,
    createdAt: item.createdAt,
    categories: !item?.categories ? [] : item?.categories?.map((c: any) => ({id: c._id.toString(), name: c.name})),
    totalLikes: item?.totalLikes  ?? 0,
    totalComments: item?.totalComments ?? 0,
    shares: item?.shares ?? 0,
    totalBookmarks: item?.totalBookmarks ?? 0,
    user: {
      id: item?.user?._id.toString(),
      name: item.user?.name,
      image: item.user?.image ? getFileUrl(item?.user?._id.toString(),item.user?.image) : undefined,
      username: item.user?.username,
      totalSubscribers: item.user?.totalSubscribers ?? 0,
    },
  })) as AppVideo[];
};




export const genVideoUrlInfo = (videoId: string, thumbnail: string) => {
  return {
    poster: `${thumbnail?.includes(bunnyFilenameUID) ? bunnyStorageUrl : bunnyPullZoneUrl}/${videoId}/${thumbnail}`,
    previewUrl: `${bunnyPullZoneUrl}/${videoId}/preview.webp`,
    hlsUrl: `${bunnyPullZoneUrl}/${videoId}/playlist.m3u8`,
    videoId,
    thumbnail,
  };
};

export const getRelativeTime = (date: Date | string) => {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const diff = (new Date(date).getTime() - now.getTime()) / 1000; // Convert to seconds

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    const value = Math.round(diff / seconds);
    if (Math.abs(value) >= 1) return rtf.format(value, unit);
  }

  return "Just now";
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

export function shortenText(text?: string, limit = 50): string {
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
}

export const composeUser = (user: any) => {
  const id = user._id.toString();
  const image = user?.image
    ? getFileUrl(id, user?.image)
    : user?.image;
  const banner = user?.banner
    ? getFileUrl(id, user?.banner)
    : user?.banner
  const _user: Session["user"] = {
    id,
    email: user.email,
    name: user.name,
    username: user.username,
    banner,
    image,
  };
  return _user;
};


export const sortResolutionsDesc = (availableResolutions: string): string[] => {
  return availableResolutions
    .split(",") // Split the string into an array
    .sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order based on the numeric value
};
