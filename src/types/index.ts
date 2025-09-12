export enum INotificationKind {
    COMMENT = "COMMENT",
    REACTION = "REACTION",
    SUBSCRIPTION = "SUBSCRIPTION",
  }

  export interface AppVideoComment {
    video: {
      videoId: string;
      title: string;
      id: string;
    };
    user: {
      name: string;
      id: string;
      image?: string;
      username: string;
    };
    content: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  }

  export interface VideoAnalytics {
    viewsChart: Record<string, number>;
    watchTimeChart: Record<string, number>;
    countryViewCounts: {
      [key: string]: number;
    };
    countryWatchTime: {
      [key: string]: number;
      NG: number;
    };
    engagementScore: number;
  }

  export interface AppUser {
    id: string;
    name: string;
    email: string;
    image?: string;
    banner?: string;
    username: string;
    bio?: string;
    totalVideos: number;
    totalSubscribers: number;
  }


  export interface AppNotification {
    id: string;
    message: string;
    kind: INotificationKind;
    createdAt: Date | string;
    isSeen: boolean;
    isRead: boolean;
    video: {
      id: string;
      title: string;
      videoId: string;
      thumbnail: string;
    };
    comment?: {
      id: string;
      content: string;
    };
    sender: {
      id: string;
      name: string;
      image?: string;
    };
    recipient: {
      id: string;
      name: string;
      image?: string;
    };
  }
  

  export interface AppSettings {
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    preload: boolean;
  }

  export interface AppCategory {
    name: string;
    id: string;
  }

  export interface AppVideo {
    id: string;
    title: string;
    description: string;
    tags: string[];
    thumbnail: string;
    videoId: string;
    shares: number;
    totalLikes: number;
    totalComments: number;
    totalBookmarks: number;
    createdAt: Date | string;
    categories: { id: string; name: string }[];
    user: {
      id: string;
      name: string;
      username: string;
      image?: string;
      totalSubscribers: number;
    };
    item: BunnyVideoStream;
  }

  export interface AppVideoDetails extends AppVideo {
    isLiked: boolean;
    isSaved: boolean;
    isSubscribed: boolean;
    totalLikes: number;
    totalComments: number;
    totalBookmarks: number;
    resolutions: { name: string; url: string }[];
  }

  export interface BunnyVideoStream {
    videoLibraryId: number;
    guid: string;
    title: string;
    dateUploaded: string;
    views: number;
    isPublic: boolean;
    length: number;
    status: number;
    framerate: number;
    rotation: number;
    width: number;
    height: number;
    availableResolutions: string;
    outputCodecs: string;
    thumbnailCount: number;
    encodeProgress: number;
    storageSize: number;
    captions: Caption[];
    hasMP4Fallback: boolean;
    collectionId: string;
    thumbnailFileName: string;
    averageWatchTime: number;
    totalWatchTime: number;
    category: string;
    chapters: Chapter[];
    moments: Moment[];
    metaTags: MetaTag[];
    transcodingMessages: TranscodingMessage[];
  }


interface Caption {
  srclang: string;
  label: string;
}

interface Chapter {
  title: string;
  start: number;
  end: number;
}

interface Moment {
  label: string;
  timestamp: number;
}

interface MetaTag {
  property: string;
  value: string;
}

interface TranscodingMessage {
  timeStamp: string;
  level: number;
  issueCode: number;
  message: string;
  value: string;
}
