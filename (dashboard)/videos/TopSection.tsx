"use client";
import { AppUser } from "@/types";
import { Avatar, Box, CardMedia, Stack, Typography } from "@mui/material";
import React from "react";

const TopSection = ({ user }: { user: AppUser }) => {
  return (
    <Box>
      {!user?.banner ? (
        <Box
          sx={[
            (theme) => ({
              height: { lg: 200, md: 200, sm: 150, xs: 150 },
              background: theme.vars.palette.background.paper,
            }),
          ]}
        ></Box>
      ) : (
        <CardMedia
          sx={{
            maxHeight: 200,
            height: { lg: "100%", md: "100%", sm: 150, xs: 150 },
          }}
          image={String(user.banner)}
          component={"img"}
        />
      )}
      <Box sx={{ position: "relative", mt: -7 }}>
        <Avatar
          sx={{ width: 120, height: 120 }}
          src={user.image}
          alt={user.name}
        />
      </Box>
      <Box sx={{ mt: 1 }}>
        <Typography variant="h6">{user.name}</Typography>
        <Typography color="textDisabled" variant="caption">
          @{user.username}
        </Typography>
        <Stack
          direction={{lg: "row", md: "row", sm: "column", xs: "column"}}
          spacing={0.5}
        >
          <Typography variant="body2">{user.email}</Typography>
          <Typography variant="body2" color="textDisabled" sx={{
              display: { lg: "block", md: "block", sm: "none", xs: "none" },
          }}>
            {" ● "}
          </Typography>
          <Stack spacing={0.5} direction={"row"}>
          <Typography variant="body2" color="textDisabled" >
            {user.totalSubscribers} Subscribers
          </Typography>
          <Typography variant="body2" color="textDisabled">
            {" ● "}
          </Typography>
          <Typography
            variant="body2"
            color="textDisabled"
          >
            {user.totalVideos} Videos
          </Typography>
          </Stack>
        </Stack>

        <Typography sx={{ py: 1 }}>
          {user.bio}
        </Typography>
      </Box>
    </Box>
  );
};

export default TopSection;
