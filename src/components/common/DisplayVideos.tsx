"use client";
import {
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Grid2,
  Typography,
} from "@mui/material";
import React from "react";
import { VideoCard } from "../common";
import { AppVideo } from "@/types";
import useSWRInfinite from "swr/infinite";
import { getVideoStreams } from "@/lib/actions/stream";


const PAGE_SIZE = 21;

type IFethArgs = {
  limit: number;
  skip: number;
  cat: string | null;
};

const fetcher = async (args: IFethArgs): Promise<AppVideo[]> => {
  const response = await getVideoStreams(args);
  if (!response.data) {
    throw new Error(response.message);
  }
  return response.data;
};

const DisplayVideos = ({
  videos,
  cat,
}: {
  videos: AppVideo[];
  cat: string | null;
}) => {
  const getKey = (pageIndex: number, previousPageData?: AppVideo[]) => {
    if (pageIndex !== 0 && previousPageData && !previousPageData.length)
      return null; // Stop when no more data
    return !cat
      ? { type: "all-videos", limit: PAGE_SIZE, skip: pageIndex * PAGE_SIZE }
      : { type: "all-videos", limit: PAGE_SIZE, skip: pageIndex * PAGE_SIZE, cat };
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite(getKey, fetcher, {
      keepPreviousData: false,
      fallbackData: !cat ? [videos] : [],
    });


  const videoData = data ? data?.flat() : [];

  const isReachingEnd =
    (data && data[data.length - 1]?.length === 0) || !!error;

  return (
    <React.Fragment>
      {isLoading && videoData.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!isLoading && videoData.length === 0 && (
        <Box sx={{}}>
          <Typography
            variant="h5"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <CardMedia image="/no-data.svg" component={"img"} />
          </Typography>
        </Box>
      )}
      <Grid2 container spacing={2} mt={2}>
        {videoData.map((item) => (
          <Grid2 key={item.id} size={{ lg: 4, md: 4, sm: 12, xs: 12 }}>
            <VideoCard item={item} />
          </Grid2>
        ))}
      </Grid2>
      {(videoData.length > 0 && !(videoData.length < PAGE_SIZE)) && (
        <Box sx={{ display: "block", textAlign: "center", my: 2 }}>
          <Button
            loading={isLoading}
            disabled={isReachingEnd || isLoading}
            onClick={() => setSize(size + 1)}
            variant="outlined"
          >
            Load More
          </Button>
        </Box>
      )}
    </React.Fragment>
  );
};

export default DisplayVideos;
