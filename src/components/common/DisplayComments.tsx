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
import { AppVideo, AppVideoComment } from "@/types";
import useSWRInfinite from "swr/infinite";
import CommentCard from "./CommentCard";
import { fetchVideoComments } from "@/lib/actions/comments";


const PAGE_SIZE = 10;

type IFethArgs = {
  limit: number;
  page: number;
  id: string;
};

const fetcher = async (args: IFethArgs): Promise<AppVideoComment[]> => {
  const response = await fetchVideoComments(args.id,args);
  if (!response.data) {
    throw new Error(response.message);
  }
  return response.data;
};

const DisplayComments = ({
  comments,
  id,
}: {
  comments: AppVideoComment[];
  id: string;
}) => {
  const getKey = (pageIndex: number, previousPageData?: AppVideo[]) => {
    if (pageIndex !== 0 && previousPageData && !previousPageData.length)
      return null; // Stop when no more data
    return { type: `comments`, limit: PAGE_SIZE, page: pageIndex + 1, id }
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite(getKey, fetcher, {
      keepPreviousData: true,
      fallbackData: [comments],
    });

  const flatData = data ? data?.flat() : [];

  const isReachingEnd =
    (data && data[data.length - 1]?.length === 0) || !!error;

  return (
    <React.Fragment>
      {isLoading && flatData.length === 0 && (
        <Box
          sx={{
            mt: 40,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!isLoading && flatData.length === 0 && (
        <Box sx={{mt: 40}}>
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
        {flatData.map((item) => (
          <Grid2 key={item.id} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <CommentCard item={item} />
          </Grid2>
        ))}
      </Grid2>
      {(flatData.length > 0 && flatData.length >= PAGE_SIZE) && (
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

export default DisplayComments;
