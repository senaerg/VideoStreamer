import React, { cache } from "react";

import { Box, Grid2 } from "@mui/material";
import VideoSection from "./VideoSection";
import SuggestedVideos from "./SuggestedVideos";
import { Metadata, ResolvingMetadata } from "next";
import { fetchVideo } from "@/lib/actions/stream";
import { appUrl, constant } from "@/config";
import { genVideoUrlInfo } from "@/utils";

const getVideo = cache(async (id: string) => {
  const result = await fetchVideo(id);
  if(!result.data) return null
  return result.data;
})
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }>},
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // read route params
  const {id} = await params;
  // fetch data
  const video = await getVideo(id);
  if (!video) return {};
  // get info
  const vInfo = genVideoUrlInfo(
    video.videoId,
    video.thumbnail
    );
  return {
    title: video.title,
    description: video.description,
    keywords: video.tags,
    authors: [{ name: video.user?.name as string }],
    creator: video.user?.name,
    publisher: video.user?.name,
    // alternates: {
    //   canonical: post?.canonicalUrl,
    // },
    category: video?.categories.map(c => c.name).join(''),
    openGraph: {
      type: "video.other",
      siteName: constant.siteName,
      title: video.title,
      description: video.description,
      url: `${appUrl}/watch/${video.videoId}`,
      images: vInfo.poster
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description,
      siteId: video.id,
      creator: `@${video?.user?.username}`,
      creatorId: video?.user.id as string,
      site: `@${constant.siteName}`,
      images: [vInfo.poster, vInfo.previewUrl],
    },
  };
  } catch (error) {
    return {}
  }
}

const page = async ({ params }: { params: Promise<{ id: string }>}) => {
  const { id } = await params;
  return (
    <Box>
      <Grid2 container spacing={2}>
        <Grid2 size={{lg: 8, md: 8, sm: 12, xs: 12}}>
          <VideoSection id={id} />
        </Grid2>
        <Grid2 size={{lg: 4, md: 4, sm: 12, xs: 12}}>
          <SuggestedVideos id={id} />
        </Grid2>
      </Grid2>
    </Box>
  )
};

export default page;
