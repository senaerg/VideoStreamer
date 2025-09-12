"use client";
import { uploadUserFile } from "@/lib/actions/bunny";
import { imageFileToBase64, shortenName } from "@/utils";
import { UploadFileOutlined } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useNotifications } from "@toolpad/core";
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";

type LocalState = {
  photoFile?: File | null;
  bannerFile?: File | null;
  bannerUlr?: string | null;
  photoUrl?: string | null;
  processing?: boolean;
  loading?: boolean;
};

const initialState: LocalState = {
  loading: false,
  photoFile: null,
  bannerFile: null,
};
const StudioSettings = () => {
  const notif = useNotifications();
  const bannerRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const session = useSession();
  const user = session?.data?.user;
  const [state, setState] = useState<LocalState>({
    ...initialState,
    photoUrl: user?.image,
    bannerUlr: user?.banner,
  });

  const handleFileUpload = async (file: File, kind: "banner" | "image") => {
    try {
      const filename = `${kind}_${nanoid(10)}.jpg`;
      if (!user || !user?.id) return;
      console.log("studio session ", session);
      const url = await imageFileToBase64(file);
      setState((prev) => ({
        ...prev,
        bannerFile: kind === "banner" ? file : prev.bannerFile,
        bannerUlr: kind === "banner" ? url : prev.bannerUlr,
        photoFile: kind === "image" ? file : prev.photoFile,
        photoUrl: kind === "image" ? url : prev.photoUrl,
        processing: kind === "banner" ? true : prev.processing,
        loading: kind === "image" ? true : prev.loading,
      }));
      const result = await uploadUserFile({
        file,
        userId: user?.id,
        filename,
        kind,
      });
      const isError = !result.data;
      notif.show(result.message, {
        severity: isError ? "error" : "info",
        autoHideDuration: 3000,
      });
    } catch (error: any) {
      notif.show(error.message, { severity: "error", autoHideDuration: 3000 });
    } finally {
      setState((prev) => ({
        ...prev,
        processing: false,
        loading: false,
      }));
    }
  };
  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      <Typography variant="h6">Studio Settings</Typography>
      <Box>
        <Typography sx={{ textAlign: "center", py: 2 }}>
          Change Banner
        </Typography>
        <Box>
          <Box
            onClick={() => bannerRef?.current?.click()}
            sx={[
              (theme) => ({
                border: `1px dashed ${theme.vars.palette.grey[400]}`,
                height: 180,
                borderRadius: 5,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: state?.bannerUlr ? `url(${state.bannerUlr})` : null,
              }),
            ]}
          >
            <input
              onChange={(ev) => {
                if (ev.target.files && ev.target.files[0]) {
                  handleFileUpload(ev.target.files[0], "banner");
                }
              }}
              ref={bannerRef}
              type="file"
              name="banner"
              hidden
              accept="image/*"
            />
            <Box
              sx={[
                (theme) => ({
                  border: `1px dashed ${theme.vars.palette.grey[400]}`,
                  height: 60,
                  width: 60,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }),
              ]}
            >
              <IconButton disableFocusRipple disableTouchRipple>
                {state.processing ? (
                  <CircularProgress color="warning" />
                ) : (
                  <UploadFileOutlined />
                )}
              </IconButton>
            </Box>
            <Typography variant="caption">
              {state?.bannerFile
                ? shortenName(state?.bannerFile?.name, 15)
                : "Upload banner"}
            </Typography>
          </Box>
        </Box>
        <Divider variant="fullWidth" />
        {/* change photo */}
        <Typography sx={{ textAlign: "center", py: 2 }}>
          Change Photo
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            onClick={() => photoRef?.current?.click()}
            sx={[
              (theme) => ({
                border: `1px dashed ${theme.vars.palette.grey[400]}`,
                height: 200,
                width: 200,
                padding: "50px",
                borderRadius: 5,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: state?.photoUrl ? `url(${state.photoUrl})` : null,
                backgroundSize: "cover",
                backgroundPosition: "50% 0",
                backgroundRepeat: "no-repeat",
              }),
            ]}
          >
            <input
              onChange={(ev) => {
                if (ev.target.files && ev.target.files[0]) {
                  handleFileUpload(ev.target.files[0], "image");
                }
              }}
              ref={photoRef}
              type="file"
              name="image"
              hidden
              accept="image/*"
            />
            <IconButton size="small" disableFocusRipple disableTouchRipple>
              {state.loading ? (
                <CircularProgress color="warning" />
              ) : (
                <UploadFileOutlined />
              )}
            </IconButton>
            <Typography variant="caption">
              {state?.photoFile
                ? shortenName(state.photoFile.name, 7)
                : "Upload avatar"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default StudioSettings;
