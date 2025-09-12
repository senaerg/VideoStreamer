"use client";
import {
  Box,
  Grid2,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import {
  EmailShareButton,
  FacebookShareButton,
  BlueskyShareButton,
  GabShareButton,
  HatenaShareButton,
  InstapaperShareButton,
  LineShareButton,
  LinkedinShareButton,
  LivejournalShareButton,
  MailruShareButton,
  OKShareButton,
  PinterestShareButton,
  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
  ThreadsShareButton,
  TumblrShareButton,
  TwitterShareButton,
  ViberShareButton,
  VKShareButton,
  WhatsappShareButton,
  WorkplaceShareButton,
  WeiboShareButton,
  FacebookMessengerShareButton,
} from "react-share";

import {
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  GabIcon,
  HatenaIcon,
  InstapaperIcon,
  LineIcon,
  LinkedinIcon,
  LivejournalIcon,
  MailruIcon,
  OKIcon,
  PinterestIcon,
  PocketIcon,
  RedditIcon,
  TelegramIcon,
  ThreadsIcon,
  TumblrIcon,
  ViberIcon,
  VKIcon,
  WeiboIcon,
  WhatsappIcon,
  WorkplaceIcon,
  XIcon,
  BlueskyIcon,
} from "react-share";
import Button from "@mui/material/Button";
import { styled, useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { appUrl, bunnyVideoLibraryId } from "@/config";
import { useDialogs, useNotifications } from "@toolpad/core";
import { AppVideoDetails } from "@/types";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const embedContent = (args: { libraryId: string; videoId: string }) => {
  return `<div style="position:relative;padding-top:56.25%;"><iframe src="https://iframe.mediadelivery.net/embed/${args.libraryId}/${args.videoId}?autoplay=true&loop=false&muted=true&preload=true&responsive=true" loading="lazy" style="border:0;position:absolute;top:0;height:100%;width:100%;" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" allowfullscreen="true"></iframe></div>`;
};

const ShareDialog = ({
  open,
  onClose,
  item,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    videoId: string;
  };
  onShare: () => void,
}) => {
  const notifs = useNotifications();
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const url = `${appUrl}/watch/${item.videoId}`

  const handleEmed = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    const content = embedContent({ libraryId: bunnyVideoLibraryId, videoId: item.videoId });
    await navigator?.clipboard.writeText(content);
    notifs.show("Code copied to clipboard", {
      severity: "info",
      autoHideDuration: 3000,
    });
    onShare()
    onClose();
  };

  const handleCopy = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    await navigator?.clipboard.writeText(url);
    notifs.show("Link copied to clipboard", {
      severity: "info",
      autoHideDuration: 3000,
    });
    onShare()
    onClose();
  };

  const handleShare = () => {
    onShare();
    onClose();
  };


  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={() => onClose()}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth={"md"}
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Share Video
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => onClose()}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Grid2 container spacing={2}>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <IconButton
                  onClick={(ev) => handleCopy(ev)}
                  size="medium"
                  title={item.title}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
                <Typography variant="caption">Copy</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <IconButton
                  onClick={(ev) => handleEmed(ev)}
                  size="medium"
                title={item.title}
                >
                  <CodeOutlinedIcon />
                </IconButton>
                <Typography variant="caption">Embed</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <WhatsappShareButton  onClick={() => handleShare()} title={item.title} url={url}>
                  <WhatsappIcon size={30} round />
                </WhatsappShareButton>
                <Typography variant="caption">Whatsapp</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <FacebookShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <FacebookIcon size={30} round />
                </FacebookShareButton>
                <Typography variant="caption">Facebook</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <LinkedinShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <LinkedinIcon size={30} round />
                </LinkedinShareButton>
                <Typography variant="caption">LinkedIn</Typography>
              </Stack>
            </Grid2>

            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <TwitterShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <XIcon size={30} round />
                </TwitterShareButton>
                <Typography variant="caption">X</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <TelegramShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <TelegramIcon size={30} round />
                </TelegramShareButton>
                <Typography variant="caption">Telegram</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <ThreadsShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <ThreadsIcon size={30} round />
                </ThreadsShareButton>
                <Typography variant="caption">Threads</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <EmailShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <EmailIcon size={30} round />
                </EmailShareButton>
                <Typography variant="caption">Email</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <RedditShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <RedditIcon size={30} round />
                </RedditShareButton>
                <Typography variant="caption">Reddit</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <PinterestShareButton media="" onClick={() => handleShare()} title={item.title} url={url}>
                  <PinterestIcon size={30} round />
                </PinterestShareButton>
                <Typography variant="caption">Pinterest</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <OKShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <OKIcon size={30} round />
                </OKShareButton>
                <Typography variant="caption">Ok</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <TumblrShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <TumblrIcon size={30} round />
                </TumblrShareButton>
                <Typography variant="caption">Tumblr</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <ViberShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <ViberIcon size={30} round />
                </ViberShareButton>
                <Typography variant="caption">Viber</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <LineShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <LineIcon size={30} round />
                </LineShareButton>
                <Typography variant="caption">Line</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <LivejournalShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <LivejournalIcon size={30} round />
                </LivejournalShareButton>
                <Typography variant="caption">Livejournal</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <FacebookMessengerShareButton appId="" onClick={() => handleShare()} title={item.title} url={url}>
                  <FacebookMessengerIcon size={30} round />
                </FacebookMessengerShareButton>
                <Typography variant="caption">Messenger</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <InstapaperShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <InstapaperIcon size={30} round />
                </InstapaperShareButton>
                <Typography variant="caption">Instapaper</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <PocketShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <PocketIcon size={30} round />
                </PocketShareButton>
                <Typography variant="caption">Pocket</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <MailruShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <MailruIcon size={30} round />
                </MailruShareButton>
                <Typography variant="caption">Mailru</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <VKShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <VKIcon size={30} round />
                </VKShareButton>
                <Typography variant="caption">VK</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <BlueskyShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <BlueskyIcon size={30} round />
                </BlueskyShareButton>
                <Typography variant="caption">Bluesky</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <GabShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <GabIcon size={30} round />
                </GabShareButton>
                <Typography variant="caption">Gab</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <HatenaShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <HatenaIcon size={30} round />
                </HatenaShareButton>
                <Typography variant="caption">Hatena</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <WorkplaceShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <WorkplaceIcon size={30} round />
                </WorkplaceShareButton>
                <Typography variant="caption">Workplace</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ lg: 2, md: 2, sm: 3, xs: 3 }}>
              <Stack alignItems={"center"}>
                <WeiboShareButton onClick={() => handleShare()} title={item.title} url={url}>
                  <WeiboIcon size={30} round />
                </WeiboShareButton>
                <Typography variant="caption">Weibo</Typography>
              </Stack>
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => onClose()}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
};

export default ShareDialog;
