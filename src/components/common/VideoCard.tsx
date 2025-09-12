"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardMedia,
  Box,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Grid2,
  Popper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AppVideo } from "@/types";
import { formatNumber, genVideoUrlInfo, getRelativeTime } from "@/utils";
import Link from "next/link";
import { useNotifications, useSession } from "@toolpad/core";
import { bookmarkVideo, shareVideo } from "@/lib/actions/stream";

import ShareDialog from "./ShareDialog";

interface VideoCardProps {
  item: AppVideo;
}

const VideoCard: React.FC<VideoCardProps> = ({ item }) => {

  const session = useSession()

  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const [state, setState] = useState({
    openSharePopper: false,
    openPopper: false,
  });

  const { poster, previewUrl, videoId } = genVideoUrlInfo(
    item.videoId,
    item.thumbnail
  );

  // share popper

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const onMoreClick = (ev: React.MouseEvent<HTMLElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
    setAnchorEl(ev.currentTarget);
    setState((prev) => ({ ...prev, openPopper: !prev.openPopper }));
  };

  const canBeOpen = state.openPopper && Boolean(anchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;

  const notif = useNotifications();

  const onBookmark = async (
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      ev.preventDefault();
      try {
        setState((prev) => ({ ...prev, openPopper: !prev.openPopper }));
        if (!session || !session?.user?.id) {
          notif.show("Please sign to bookmark", {
            severity: "error",
            autoHideDuration: 3000,
          });
          return;
        }
        const result = await bookmarkVideo({
          user: session?.user?.id,
          video: item.id,
        });
        const isError = !result.data;
        return notif.show(result.message, {
          severity: isError ? "error" : "info",
          autoHideDuration: 3000,
        });
      } catch (error: any) {
        return notif.show(error?.message, {
          severity: "error",
          autoHideDuration: 3000,
        });
      }
    };

    const onShare = async () => {
        try {
          setState((prev) => ({ ...prev, openPopper: !prev.openPopper, openSharePopper: false }));
          if (!session || !session?.user?.id) return;
          await shareVideo(item.id);
        } catch (error: any) {
        }
      };

  return (
    <React.Fragment>
      <Card
        sx={{
          height: 320,
          borderRadius: 2,
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => router.push(`/watch/${videoId}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ width: "100%", height: 200 }}>
          <CardMedia
            component="img"
            image={isHovered ? previewUrl : poster} // Swap image on hover
            alt={item.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        <CardContent>
          <Grid2 container spacing={1} sx={{ justifyContent: "space-between" }}>
            <Grid2 size={{ lg: 2, md: 2, sm: 2, xs: 2 }}>
              <Box
                onClick={(ev) => {
                  ev.stopPropagation();
                }}
              >
                <Link href={`/@${item?.user?.username}`}>
                  <Avatar alt={item.user?.name} src={item?.user?.image} />
                </Link>
              </Box>
            </Grid2>
            <Grid2 size={{ lg: 8, md: 8, sm: 8, xs: 8 }}>
              <Box sx={{ width: "100%" }}>
                <Typography
                  title={item.title}
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2, // Limit to 3 lines
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    maxHeight: "4.4rem",
                    fontSize: "1rem",
                    lineHeight: "1.2rem",
                    fontWeight: 400,
                  }}
                  variant="subtitle1"
                >
                  {item.title}
                </Typography>
                <Stack direction={"column"}>
                  <Typography variant="subtitle1" color="textDisabled" sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 1, // Limit to 3 lines
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    
                  }}>
                    {item?.user?.name}
                  </Typography>
                  <Typography sx={{display: 'block', position: "relative", mt: -1}} variant="caption" color="textDisabled" >
                    @{item?.user?.username}
                  </Typography>
                </Stack>
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  <Typography variant="caption" color="textDisabled">
                    {formatNumber(item?.item.views)} Views
                  </Typography>
                  <Typography variant="caption" color="textDisabled">
                    ●
                  </Typography>
                  <Typography variant="caption" color="textDisabled">
                    {getRelativeTime(item.createdAt)}
                  </Typography>
                </Stack>
              </Box>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 2, xs: 2 }}>
              <IconButton
                onClick={(ev) => onMoreClick(ev)}
                aria-label="more icon"
              >
                <MoreVertIcon />
              </IconButton>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>
      {/* download popper */}
      <Popper id={id} open={state.openPopper} anchorEl={anchorEl}>
        <Box sx={{ p: 1, bgcolor: "background.paper" }}>
          <Typography>Choose Action</Typography>
          <Divider />
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton onClick={(ev) => onBookmark(ev)}
              >
                <ListItemText primary={"Save"} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton
                onClick={(ev) => setState((prev) => ({ ...prev, openPopper: false, openSharePopper: true }))}
              >
                <ListItemText primary={"Share"} />
              </ListItemButton>
            </ListItem>
            {item.user.id === session?.user?.id && (<React.Fragment>
              <Divider />
              <ListItem disablePadding>
              <ListItemButton
                LinkComponent={Link}
                href={`/analytics/${item.videoId}`}
                onClick={(ev) => setState((prev) => ({ ...prev, openPopper: false}))}
              >
                <ListItemText primary={"Analytics"} />
              </ListItemButton>
            </ListItem>
            </React.Fragment>)}
          </List>
        </Box>
      </Popper>
      {/* share dialog */}
      <ShareDialog
        open={state.openSharePopper}
        onClose={() =>
          setState((prev) => ({ ...prev, openSharePopper: false }))
        }
        item={item}
        onShare={onShare}
      />
    </React.Fragment>
  );
};

export default VideoCard;
