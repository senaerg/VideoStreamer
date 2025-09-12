"use client";
import { AppVideo, VideoAnalytics } from "@/types";
import React, { useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  Box,
  CardMedia,
  Grid2,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { formatNumber, genVideoUrlInfo } from "@/utils";
import Link from "next/link";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${timeInSeconds} seconds`;
  } else if (timeInSeconds < 3600) {
    const minutes = Math.floor(timeInSeconds / 60);
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(timeInSeconds / 3600);
    return `${hours} hours`;
  }
};

const valueFormatter = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    month: "2-digit",
    day: "2-digit",
  });

function ViewsChart({ data }: { data: VideoAnalytics["viewsChart"] }) {
  const viewData = Object.entries(data)
    .map(([date, views]) => ({
      x: new Date(date),
      y: views,
    }))
    .filter((view) => view.y > 0);

  return (
    <Paper sx={{ p: 2, my: 1 }}>
      <Typography sx={{ textAlign: "center" }}>Views Chart</Typography>
      <LineChart
        dataset={viewData}
        xAxis={[{ dataKey: "x", scaleType: "band", valueFormatter }]}
        series={[
          {
            dataKey: "y",
            showMark: ({ index }) => index % 2 === 0,
            area: true,
            baseline: "min",
            label: "Views",
            valueFormatter: (value) => `${formatNumber(value ?? 0)}`,
          },
        ]}
        height={300}
      />
    </Paper>
  );
}

function CountryViewCountChart({
  data,
}: {
  data: VideoAnalytics["countryViewCounts"];
}) {
  const mapData = Object.entries(data)
    .map(([key, val]) => ({
      x: key,
      y: val,
    }))
    .filter((t) => t.y > 0);

  const total = mapData.reduce((prev, curr) => prev + curr.y, 0);

  return (
    <Paper sx={{ p: 2, my: 1 }}>
      <Typography sx={{ textAlign: "center" }}>
        View Count By Country ({formatNumber(total)})
      </Typography>
      <BarChart
        dataset={mapData}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "x",
            label: "Country",
          },
        ]}
        yAxis={[{ label: "View Count" }]}
        series={[
          {
            dataKey: "y",
            label: "Count",
            valueFormatter: (value) => `${formatNumber(value ?? 0)}`,
          },
        ]}
        height={300}
        // width={mapData.length < 3 ? 300 : undefined}
        grid={{ vertical: false, horizontal: true }}
      />
    </Paper>
  );
}

function WatchTimeChart({ data }: { data: VideoAnalytics["watchTimeChart"] }) {
  const timeData = Object.entries(data)
    .map(([date, val]) => ({
      x: new Date(date),
      y: val,
    }))
    .filter((t) => t.y > 0);

  const totalWatchTime = timeData.reduce((prev, curr) => prev + curr.y, 0);

  return (
    <Paper sx={{ p: 2, my: 1 }}>
      <Typography sx={{ textAlign: "center" }}>
        Watch Time Chart({formatTime(totalWatchTime)})
      </Typography>
      <LineChart
        dataset={timeData}
        xAxis={[{ dataKey: "x", scaleType: "band", valueFormatter }]}
        series={[
          {
            dataKey: "y",
            showMark: ({ index }) => index % 2 === 0,
            area: true,
            baseline: "min",
            label: "Time",
            valueFormatter: (value) => `${formatTime(value ?? 0)}`,
          },
        ]}
        height={300}
      />
    </Paper>
  );
}

function CountryWatchTimeChart({
  data,
}: {
  data: VideoAnalytics["countryWatchTime"];
}) {
  const mapData = Object.entries(data)
    .map(([key, val]) => ({
      x: key,
      y: val,
    }))
    .filter((t) => t.y > 0);

  const total = mapData.reduce((prev, curr) => prev + curr.y, 0);

  return (
    <Paper sx={{ p: 2, my: 1 }}>
      <Typography sx={{ textAlign: "center" }}>
        Watch Time By Country ({formatNumber(total)})
      </Typography>
      <BarChart
        dataset={mapData}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "x",
            label: "Country",
          },
        ]}
        yAxis={[{ label: "View Count" }]}
        series={[
          {
            dataKey: "y",
            label: "Count",
            valueFormatter: (value) => `${formatNumber(value ?? 0)}`,
            // layout: "horizontal"
          },
        ]}
        height={300}
        // width={mapData.length < 3 ? 300 : undefined}
        grid={{ vertical: false, horizontal: true }}
      />
    </Paper>
  );
}

const PageClient = ({
  data,
  item,
}: {
  data: VideoAnalytics;
  item: AppVideo;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const { poster, previewUrl } = genVideoUrlInfo(item.videoId, item.thumbnail);
  return (
    <React.Fragment>
      <Typography sx={{ pb: 1, textAlign: "center", fontFamily: "sans-serif"  }} variant="h4">
        Video analytics
      </Typography>
      <Grid2 container spacing={2}>
        <Grid2 size={{ lg: 6 }}>
          <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              width: "100%",
              height: 250,
              margin: "0 auto",
              mb: 2,
            }}
          >
            <Link href={`/watch/${item.videoId}`}>
              <CardMedia
                component="img"
                image={isHovered ? previewUrl : poster} // Swap image on hover
                alt={item.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 2,
                  objectPosition: "50% 0",
                }}
              />
            </Link>
          </Box>
        </Grid2>
        <Grid2 size={{ lg: 6 }}>
          <Box>
            <Typography
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 10, // Limit to 3 lines
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                maxHeight: "4.4rem",
                fontSize: "1rem",
                lineHeight: "1.2rem",
                fontWeight: 600,
              }}
              variant="subtitle1"
            >
              {item.title}
            </Typography>

            <Typography
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 20, // Limit to 3 lines
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
              variant="subtitle2"
            >
              {item.description}
            </Typography>
            <Stack direction={"row"} spacing={0.5}>
              <Typography
                sx={{ fontStyle: "italic" }}
                variant="body2"
                color="textDisabled"
              >
                Engagement Score:
              </Typography>
              <Typography variant="body2" color="textDisabled">
                {formatNumber(data.engagementScore)}
              </Typography>
            </Stack>
            <Stack
              direction={"row"}
              spacing={1}
              justifyContent={"space-around"}
            >
              <Tooltip title="Views">
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="subtitle2" color="textDisabled">
                    {formatNumber(item?.item.views)}
                  </Typography>
                  <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                </Stack>
              </Tooltip>
              <Tooltip title="Likes">
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="subtitle2" color="textDisabled">
                    {formatNumber(item?.totalLikes)}
                  </Typography>
                  <FavoriteBorderOutlinedIcon sx={{ fontSize: 14 }} />
                </Stack>
              </Tooltip>

              <Tooltip title="Comments">
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="subtitle2" color="textDisabled">
                    {formatNumber(item?.totalComments)}
                  </Typography>
                  <CommentOutlinedIcon sx={{ fontSize: 14 }} />
                </Stack>
              </Tooltip>

              <Tooltip title="Bookmarks">
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="subtitle2" color="textDisabled">
                    {formatNumber(item?.totalBookmarks)}
                  </Typography>
                  <BookmarksOutlinedIcon sx={{ fontSize: 14 }} />
                </Stack>
              </Tooltip>

              <Tooltip title="Shares">
                <Stack direction={"row"} alignItems={"center"}>
                  <Typography variant="subtitle2" color="textDisabled">
                    {formatNumber(item?.shares)}
                  </Typography>
                  <ShareOutlinedIcon sx={{ fontSize: 14 }} />
                </Stack>
              </Tooltip>
            </Stack>
          </Box>
        </Grid2>
      </Grid2>
      <ViewsChart data={data.viewsChart} />
      <CountryViewCountChart data={data.countryViewCounts} />
      <WatchTimeChart data={data.watchTimeChart} />
      <CountryWatchTimeChart data={data.countryWatchTime} />
    </React.Fragment>
  );
};

export default PageClient;
