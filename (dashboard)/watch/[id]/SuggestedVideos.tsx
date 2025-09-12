import { VideoCard } from "@/components/common";
import { AppVideo } from "@/types";
import { getVideoStreams } from "@/lib/actions/stream";
import React from "react";
import { Grid2 } from "@mui/material";

export default async function SuggestedVideos({ id }: { id: string }) {
  let videos: AppVideo[] = [];
  try {
    const response = await getVideoStreams({
      limit: 3,
      skip: 1,
      filter: { videoId: { $ne: id } },
    });
    if (response.data) {
      videos = response?.data;
    }
  } catch (error) {}

  return (
    <React.Fragment>
      <Grid2 container spacing={1}>
        {videos.map((video) => (
          <Grid2 key={video.id} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <VideoCard item={video} />{" "}
          </Grid2>
        ))}
      </Grid2>
    </React.Fragment>
  );
}
