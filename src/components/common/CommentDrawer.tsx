"use client";
import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { insertVideoComment } from "@/lib/actions/comments";
import { AppVideoComment, AppVideoDetails } from "@/types";
import { useNotifications, useSession } from "@toolpad/core";
import { CommentSchema } from "@/schema";
import { ZodError } from "zod";
import DisplayComments from "./DisplayComments";
import { useSWRConfig } from "swr";

type LocalState = {
  open: boolean;
  content: string;
};
const initialState = {
  open: false,
  content: "",
};


export default function CommentDrawer({
  open,
  toggleDrawer,
  item,
  toggleDialog,
  onSubscribeToUser,
  comments,
  updateVideoComment
}: {
  open: boolean;
  toggleDrawer: (open: boolean) => void;
  item: AppVideoDetails;
  toggleDialog: (open: boolean) => void;
  onSubscribeToUser: (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  comments: AppVideoComment[];
  updateVideoComment: () => void


}) {

    const { mutate, cache } = useSWRConfig()
  const notifs = useNotifications();

  const session = useSession();
  const [state, setState] = React.useState<LocalState>(initialState);

  const isOpen = React.useMemo(() => open, [open]);

  const findLeastPageKey = (id: string) => {
    let leastPageKey = null;
    let leastPage = Infinity;
  
    for (const key of cache.keys()) {
      if ( key && key.includes(`type:"comments"`) && key.includes(`id:"${id}"`)
      ) {
        // Extract the page number from the key
        const match = key.match(/page:(\d+)/);
        const page = match ? parseInt(match[1], 10) : 0;
        // Update the highest page key if this key has a higher page number
        if (page < leastPage) {
            leastPage = page;
            leastPageKey = key;
        }
      }
    }
  
    return leastPageKey;
  };

  const handleSubmit = async () => {
    try {
      if (!session) return toggleDialog(true);
      const payload = await CommentSchema.parseAsync({
        user: session.user?.id,
        content: state.content,
        video: item.id,
      });
      const result = await insertVideoComment(payload, item?.user?.id);
      const isError = !result.data;
      const cacheKey = findLeastPageKey(item.id)
      if (!isError && cacheKey) {
        updateVideoComment()
        mutate(cacheKey, (data: any) => data ? [result.data,...data] : [result.data] , {
            optimisticData: (data: any) => data ? [result.data,...data]  : [result.data],
            populateCache: true,
            rollbackOnError: true,
            revalidate: false
        })
        setState((prev) => ({ ...prev, content: "" }));
      }
      notifs.show(result?.message, {
        severity: isError ? "error" : "success",
        autoHideDuration: 3000,
      });
    } catch (error: any) {
        console.log(error)
      if (error instanceof ZodError) {
        const _error = error as ZodError;
        const message = _error.issues.map((i) => i.message).toString();
        notifs.show(message, { severity: "error", autoHideDuration: 3000 });
      } else {
        notifs.show(error?.message, {
          severity: "error",
          autoHideDuration: 3000,
        });
      }
    }
  };

  const onChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setState((prev) => ({ ...prev, content: ev.target.value }));
  };

  const onKeyPress = (
    ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box>
      <Drawer
        sx={{
          width: 410,
          height: "100vh",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 410,
            height: "100vh",
          },
        }}
        variant={isOpen ? "persistent" : "temporary"}
        anchor="right"
        open={isOpen}
        onClose={() => toggleDrawer(false) }
      >
        <Box sx={{ position: "relative", mt: 8, pb: 15, px: 1 }}>
          <Box sx={{ position: "absolute", right: 10, mt: 1 }}>
            <IconButton onClick={() => toggleDrawer(false)}>
              <Close />
            </IconButton>
          </Box>
          <Paper
            sx={[
              (theme) => ({
                p: 2,
                pt: 5,
                mt: 1,
                background: theme.vars.palette.background.default,
              }),
            ]}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Stack direction={"row"} alignItems={"center"}>
                <Avatar alt={item.user.name} src={item.user.image} />
                <Stack direction={"column"}>
                  <Typography variant="h6">{item.user.name}</Typography>
                  <Typography color="textDisabled" sx={{position: 'relative', mt: -1}} variant="caption">@{item.user.username}</Typography>
                </Stack>
              </Stack>
              {item.user?.id !== session?.user?.id && (
                <Button
                  size="small"
                  variant="outlined"
                  color={item.isSubscribed ? "info" : "inherit"}
                  onClick={(ev) => onSubscribeToUser(ev)}
                  sx={{ height: 30 }}
                >
                  {item.isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </Stack>
            <Typography>{item.title}</Typography>
            <Stack>
              <Stack></Stack>
            </Stack>
          </Paper>

          {/* show comments */}
          <DisplayComments comments={comments} id={item.id} />

        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            pb: 2,
            pt: 2,
            width: 420, // Matches the Drawer width
            background: (theme) => theme.vars.palette.background.default,
          }}
        >
          <Box sx={{ px: 2 }}> {/* Added padding to prevent overflow */}
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{ position: "relative", width: "100%", overflow: "hidden"}}
            >
              <TextField
                slotProps={{
                  input: {
                    onKeyDown: (ev) => {
                      onKeyPress(ev);
                    },
                  },
                }}
                value={state.content}
                onChange={(ev) => onChange(ev)}
                placeholder="Type comment"
                multiline
                fullWidth
              />
              <IconButton
                onClick={(ev) => {
                  ev.preventDefault();
                  handleSubmit();
                }}
              >
                <SendOutlinedIcon />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Drawer>
      
    </Box>
  );
}
