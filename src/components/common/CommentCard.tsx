"use client";
import * as React from "react";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import { AppVideoComment } from "@/types";
import { getRelativeTime } from "@/utils";

const CommentCard = ({ item }: { item: AppVideoComment }) => {
  return (
    <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack direction={"row"}>
          <Avatar alt={item?.user?.name} src={item?.user?.image} />
          <Stack direction={"column"}>
            <Typography>{item.user.name}</Typography>
            <Typography
              color="textDisabled"
              sx={{ position: "relative", mt: -1 }}
              variant="caption"
            >
              @{item.user.username}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Typography variant="body2">{item.content}</Typography>
      <Typography color="textDisabled" variant="caption">
        {getRelativeTime(item.createdAt)}
      </Typography>
    </Paper>
  );
};

export default CommentCard;
