"use client";
import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AppVideoComment,
  AppVideoDetails,
} from "@/types";
import { formatNumber, getRelativeTime } from "@/utils";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import Accordion, {
  AccordionSlots,
  accordionClasses,
} from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails, {
  accordionDetailsClasses,
} from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Fade from "@mui/material/Fade";
import Link from "next/link";
import {
  AccountDialog,
  BunnyVideoPlayer,
  CommentDrawer,
  ShareDialog,
} from "@/components/common";
import { useNotifications, useSession } from "@toolpad/core";
import {
  bookmarkVideo,
  favouriteVideo,
  shareVideo,
  subscribeToUser,
} from "@/lib/actions/stream";
import BookmarkRemoveOutlinedIcon from "@mui/icons-material/BookmarkRemoveOutlined";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";

function AccordionDescription({
  tags,
  description,
}: {
  tags: string[];
  description: string;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpansion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  return (
    <Box mt={1}>
      <Accordion
        elevation={0}
        expanded={expanded}
        onChange={handleExpansion}
        slots={{ transition: Fade as AccordionSlots["transition"] }}
        slotProps={{ transition: { timeout: 400 } }}
        sx={[
          expanded
            ? {
                [`& .${accordionClasses.region}`]: {
                  height: "auto",
                },
                [`& .${accordionDetailsClasses.root}`]: {
                  display: "block",
                },
              }
            : {
                [`& .${accordionClasses.region}`]: {
                  height: 0,
                },
                [`& .${accordionDetailsClasses.root}`]: {
                  display: "none",
                },
              },
        ]}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Box component="div">
            <Stack direction={"row"} flexWrap={"wrap"} spacing={1}>
              {tags.map((tag) => (
                <Chip
                  size="small"
                  variant="outlined"
                  color="info"
                  key={tag}
                  label={`#${tag}`}
                  component={Link}
                  href={`/hashtags/${tag}`}
                  clickable
                />
              ))}
            </Stack>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{description}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}


const PageClient = ({
  video: videoInfo,
  comments,
}: {
  video: AppVideoDetails;
  comments: AppVideoComment[];
}) => {
  const [video, setVideo] = React.useState(videoInfo);

  const [state, setState] = React.useState({
    open: false,
    openCommentDrawer: false,
    openSharePopper: false,
    openDownload: false,
  });

  // share popper

  const [downloadAnchorEl, setDownloadAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const onShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
    setState((prev) => ({ ...prev, openSharePopper: !prev.openSharePopper }));
  };

  const canBeOpen = state.openDownload && Boolean(downloadAnchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;

  const notif = useNotifications();

  const session = useSession();


  const toggleDialog = (open: boolean) => {
    setState((prev) => ({ ...prev, open: open }));
  };

  const toggleDrawer = (open: boolean) => {
    setState((prev) => ({ ...prev, openCommentDrawer: open }));
  };

  const onSubscribeToUser = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    try {
      if (!session || !session?.user?.id) {
        notif.show("Please sign to subscribe", {
          severity: "error",
          autoHideDuration: 3000,
        });
        toggleDialog(true);
        return;
      }

      const result = await subscribeToUser({
        toUser: video?.user?.id,
        fromUser: session?.user?.id,
      });
      const isError = !result.data;
      if (!isError) {
        setVideo((prev) => {
          const isSubscribed = !prev.isSubscribed;
          return {
            ...prev,
            user: {
              ...prev.user,
              totalSubscribers: isSubscribed
                ? prev.user.totalSubscribers + 1
                : prev.user.totalSubscribers - 1,
            },
            isSubscribed,
          };
        });
      }
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

  const onFavourite = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    try {
      if (!session || !session?.user?.id) {
        notif.show("Please sign to save video", {
          severity: "error",
          autoHideDuration: 3000,
        });
        toggleDialog(true);
        return;
      }
      const result = await favouriteVideo(
        {
          user: session?.user?.id,
          video: video.id,
        },
        video?.user?.id
      );
      const isError = !result.data;
      if (!isError) {
        setVideo((prev) => {
          const isLiked = !prev.isLiked;
          return {
            ...prev,
            totalLikes: isLiked ? prev.totalLikes + 1 : prev.totalLikes - 1,
            isLiked,
          };
        });
      }
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

  const onBookmark = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    try {
      if (!session || !session?.user?.id) {
        notif.show("Please sign to bookmark", {
          severity: "error",
          autoHideDuration: 3000,
        });
        toggleDialog(true);
        return;
      }
      const result = await bookmarkVideo({
        user: session?.user?.id,
        video: video.id,
      });
      const isError = !result.data;
      if (!isError) {
        setVideo((prev) => ({ ...prev, isSaved: !prev.isSaved }));
      }
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
      if (!session || !session?.user?.id) {
        return;
      }
      const result = await shareVideo(video.id);
      if(!result.data){
        setVideo(prev => ({...prev, shares: prev.shares + 1}) )
      }
    } catch (error: any) {
    }
  };

  const updateVideoComment = () => {
    setVideo(prev => ({...prev, totalComments: prev.totalComments + 1}) )
  }

  const handleDownload = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
    setState((prev) => ({ ...prev, openDownload: !prev.openDownload }));
  };

  return (
    <React.Fragment>
      <BunnyVideoPlayer videoId={video.videoId} />
      <Typography
        sx={{
          py: 1,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 10, // Limit to 3 lines
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        variant="h6"
      >
        {video.title}
      </Typography>

      <Stack direction={"row"} spacing={1} justifyContent={"space-between"}>
        <Stack
          direction={"row"}
          spacing={1}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Box>
            <Avatar alt={video.user.name} src={video.user.image} />
          </Box>
          <Stack>
            <Typography variant="subtitle1">{video.user.name}</Typography>
            <Stack direction={"row"} spacing={2} alignItems={"center"}>
              <Typography variant="caption" color="textDisabled">
                {formatNumber(video?.user?.totalSubscribers)} Subscribers
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems={"center"} spacing={1}>
          <Typography variant="subtitle2" color="textDisabled">
            {formatNumber(video.item.views)} Views
          </Typography>
          <Typography variant="subtitle2" color="textDisabled">
            ●
          </Typography>
          <Typography variant="subtitle2" color="textDisabled">
            {getRelativeTime(video.createdAt)}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        mt={1}
        direction={{lg: "row", md: "row", sm: "column", xs: "column"}}
        spacing={1}
        justifyContent={"space-between"}
        sx={{ alignItems: { lg: "center", md: "center", sm: "normal", xs: "normal"}}}
      >
        <Stack direction={"row"} spacing={1} alignItems={"center"} justifyContent={"space-between"}>
        {video.user?.id !== session?.user?.id && (
          <Button
            size="small"
            variant="outlined"
            color={video.isSubscribed ? "info" : "inherit"}
            onClick={(ev) => onSubscribeToUser(ev)}
            sx={{ borderRadius: 10, height: { sm: 25, xs: 25}, fontSize: { sm: 10, xs: 10} }}
          >
            {video.isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        )}

        <Button
          startIcon={<ThumbUpAltOutlinedIcon />}
          onClick={(ev) => onFavourite(ev)}
          size="small"
          variant="outlined"
          color={video.isLiked ? "info" : "inherit"}
          sx={{ borderRadius: 10, height: { sm: 25, xs: 25}, fontSize: { sm: 10, xs: 10} }}
        >
          Like {video.totalLikes > 0 && formatNumber(video.totalLikes)}
        </Button>

        <Button
          startIcon={<ModeCommentOutlinedIcon />}
          onClick={(ev) =>
            setState((prev) => ({
              ...prev,
              openCommentDrawer: !prev.openCommentDrawer,
            }))
          }
          size="small"
          variant="outlined"
          color={"inherit"}
          sx={{ borderRadius: 10, height: { sm: 25, xs: 25}, fontSize: { sm: 10, xs: 10} }}
        >
          Comment {video.totalComments > 0 && formatNumber(video.totalComments)}
        </Button>
        </Stack>

        <Stack direction={"row"} spacing={1} alignItems={"center"} justifyContent={"space-between"}>
        <ButtonGroup
          size="small"
          variant="outlined"
          aria-label="Loading button group"
          color={video.isSaved ? "info" : "inherit"}
        >
          <Box>
            <Button
              startIcon={<IosShareOutlinedIcon />}
              aria-describedby={id}
              type="button"
              onClick={(ev) => onShareClick(ev)}
              size="small"
              sx={{ borderRadius: 10, height: { sm: 25, xs: 25}, fontSize: { sm: 10, xs: 10} }}

            >
              Share {video.shares > 0 && formatNumber(video.shares)}
            </Button>
          </Box>

          <Button
            startIcon={
              video.isSaved ? (
                <BookmarkRemoveOutlinedIcon />
              ) : (
                <BookmarkAddOutlinedIcon />
              )
            }
            size="small"
            onClick={(ev) => onBookmark(ev)}
            sx={{ borderRadius: 10, height: { sm: 25, xs: 25}, fontSize: { sm: 10, xs: 10} }}

          >
            Save {video.totalBookmarks > 0 && formatNumber(video.totalBookmarks)}
          </Button>
        </ButtonGroup>

        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<FileDownloadOutlinedIcon />}
          aria-describedby={id}
          type="button"
          onClick={(ev) => handleDownload(ev)}
          sx={{ borderRadius: 10, height: { sm: 25, xs: 25}, fontSize: { sm: 10, xs: 10} }}
        >
          Download
        </Button>
        </Stack>
      </Stack>
      {/* description */}
      <AccordionDescription tags={video.tags} description={video.description} />
      {/* account */}
      <AccountDialog isOpen={state.open} toggleDialog={toggleDialog} />
      {/* comment */}
      <CommentDrawer
        onSubscribeToUser={onSubscribeToUser}
        open={state.openCommentDrawer}
        toggleDrawer={toggleDrawer}
        item={video}
        toggleDialog={toggleDialog}
        comments={comments}
        updateVideoComment={updateVideoComment}
      />
      {/* share dialog */}
      <ShareDialog
        open={state.openSharePopper}
        onClose={() =>
          setState((prev) => ({ ...prev, openSharePopper: false }))
        }
        item={video}
        onShare={onShare}
      />
      {/* download popper */}
      <Popper id={id} open={state.openDownload} anchorEl={downloadAnchorEl}>
        <Box sx={{ p: 1, bgcolor: "background.paper" }}>
          <Typography>Choose Resolution</Typography>
          {video.resolutions.map((res) => (
            <List key={res.name} disablePadding>
              <ListItem disablePadding dense disableGutters>
                <ListItemButton
                  component="a"
                  download
                  href={res.url}
                  onClick={() => {
                  setState((prev) => ({ ...prev, openDownload: false }));
                  }}
                >
                  <ListItemText primary={res.name} />
                </ListItemButton>
              </ListItem>
            </List>
          ))}
        </Box>
      </Popper>
    </React.Fragment>
  );
};

export default PageClient;
