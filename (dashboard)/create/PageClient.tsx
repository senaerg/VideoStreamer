"use client";
import { CategoriesInput, LinearProgressWithLabel, TagsInput } from "@/components/common";
import { AppCategory } from "@/types";
import { base64ToFile, formatBytes, generateThumbnails, shortenName } from "@/utils";
import { UploadFileOutlined } from "@mui/icons-material";
import { Box, Button, CardMedia, FormControl, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useLocalStorageState, useNotifications } from "@toolpad/core";
import { Session } from "next-auth";
import React, { useRef, useState } from "react";
import {nanoid} from "nanoid"
import { bunnyFilenameUID, bunnyTusEndpoint, bunnyVideoLibraryId } from "@/config";
import { ZodError } from "zod";
import * as tus from "tus-js-client";
import { UpdateVideoSchema } from "@/schema";
import { createVideo, getPresignedSignature, uploadVideoThumbnail } from "@/lib/actions/bunny";
import { createVideoRecord, updateVideoRecord } from "@/lib/actions/stream";

const videoUploadKey = "v_p___id";

type LocalState = {
  videoFile: File | null;
  photoFile: File | null;
  loading?: boolean;
  tags: string[];
  title: string;
  description: string;
  thumbnail: string;
  videoId?: string;
  upload: {
    bytesUploaded: number;
    bytesTotal: number;
    percentage: number;
  };
  thumbnails: string[];
  selectedThumbnail?: string | null;
  categories: AppCategory[];
};

const initialState: LocalState = {
  videoFile: null,
  photoFile: null,
  tags: [],
  title: "",
  description: "",
  thumbnail: "thumbnail.jpg",
  upload: {
    bytesUploaded: 0,
    bytesTotal: 0,
    percentage: 0,
  },
  thumbnails: [],
  categories: [],
};


const getFilename = (file: File) => {
  const fileExtArr = file.name.split(".");
  const fileExt = fileExtArr[fileExtArr.length - 1];
  const filename = `thumbnail${bunnyFilenameUID}${nanoid(10)}.${fileExt}`;
  return filename;
};


const PageClient = ({
  session,
  categories,
}: {
  session: Session;
  categories: AppCategory[];
}) => {
  const [state, setState] = useState(initialState);
  const videoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [videoId, setVideoId] = useLocalStorageState(videoUploadKey);

  const notif = useNotifications()

  const onTagsChange = (tags: string[]) => {
    setState((prev) => ({ ...prev, tags }));
  };

  const onDeleteTag = (tag: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => tag !== item),
    }));
  };

  const onCatChange = (items: AppCategory[]) => {
    setState((prev) => ({ ...prev, categories: items }));
  };

  const getVideoId = async (title: string) => {
    console.log("local storage video id: ", videoId);
    if (videoId) return videoId;
    const result = await createVideo(title);
    if (!result.data) throw new Error(result.message);
    setVideoId(result?.data.guid);
    return result.data.guid;
  };

  const handleThumbnailUpload = async (
    file: File,
    selectedThumbnail?: string | null
  ) => {
    try {
      const filename = getFilename(file);
      if (!state.videoId) return;
      setState((prev) => ({
        ...prev,
        photoFile: !selectedThumbnail ? file : prev.photoFile,
      }));
      const prevThumbnail = state?.thumbnail.includes("_")
        ? state.thumbnail
        : null;
      const result = await uploadVideoThumbnail(
        file,
        state.videoId,
        filename,
        prevThumbnail
      );
      const isError = !result.data;
      notif.show(result.message, {
        severity: isError ? "error" : "info",
        autoHideDuration: 3000,
      });

      if (!result.data) return;
      setState((prev) => {
        const fileUrl = result?.data.url;
        return {
          ...prev,
          thumbnail: result?.data.filename,
          selectedThumbnail: !selectedThumbnail ? fileUrl : selectedThumbnail,
          thumbnails: !selectedThumbnail
            ? [
                fileUrl,
                ...prev.thumbnails.filter((item) => !item.startsWith("https")),
              ]
            : prev.thumbnails,
        };
      });
    } catch (error: any) {
      notif.show(error.message, { severity: "error", autoHideDuration: 3000 });
    }
  };

  const changeVideoThumbnail = async (data: string) => {
    if (data === state.selectedThumbnail) return;
    const filename = `thumbnail_vt_${nanoid(10)}.jpg`;
    setState((prev) => ({ ...prev, selectedThumbnail: data }));
    if (data?.startsWith("data:image") && state.selectedThumbnail !== data) {
      const file = base64ToFile(data, filename);
      handleThumbnailUpload(file, data);
    }
    if (
      data?.startsWith("https://") &&
      !state.selectedThumbnail?.startsWith("https://") &&
      state.photoFile
    ) {
      handleThumbnailUpload(state.photoFile, data);
    }
  };

  const getVideoThumbnails = async (file: File) => {
    const thumbnails = await generateThumbnails(file);
    setState((prev) => ({ ...prev, thumbnails }));
  };

  const handleFileUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Get the selected file from the input element
      const files = ev.target.files;
      if (!files || !files[0]) return;
      const file = files[0];
      setState((prev) => ({ ...prev, videoFile: files[0] }));
      getVideoThumbnails(file);
      // expiry time
      const expiresIn = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // Expiry in seconds
      // video id
      const title = state?.title.trim().length > 0 ? state.title : file.name;
      const videoId = await getVideoId(title);
      // const signature
      const signature = await getPresignedSignature(videoId, expiresIn);
      // Create a new tus upload
      const upload = new tus.Upload(file, {
        endpoint: bunnyTusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: signature, // SHA256 signature (library_id + api_key + expiration_time + video_id)
          AuthorizationExpire: expiresIn.toString(), // Expiration time as in the signature,
          VideoId: videoId, // The guid of a previously created video object through the Create Video API call
          LibraryId: bunnyVideoLibraryId,
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
          title,
          thumbnailTime: "2",
        },
        onError: function (error) {
          return notif.show(error?.message, {
            severity: "error",
            autoHideDuration: 3000,
            key: "dedupe-notification",
          });
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          setState((prev) => ({
            ...prev,
            upload: { ...prev.upload, bytesUploaded, bytesTotal, percentage },
          }));
        },
        onSuccess: async function (res) {
          setState((prev) => ({ ...prev, videoId }));
          setVideoId(null);
          const result = await createVideoRecord({
            videoId,
            title: state.title,
            description: state.description,
            thumbnail: state.thumbnail,
            userId: String(session?.user?.id),
          });
          notif.show(result.message, {
            severity: result?.data ? "success" : "error",
            autoHideDuration: 3000,
            key: "dedupe-notification",
          });
        },
      });

      // Check if there are any previous uploads to continue.
      upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        console.log("TuspreviousUploads ", previousUploads);
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        // Start the upload
        upload.start();
      });
    } catch (error) {
      console.log("Error uploading", error);
    }
  };

  const handlePublish = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    try {
      if (!state.videoFile || !state.videoId) {
        return notif.show(
          !state.videoId ? "No video uploaded" : "No file selected",
          {
            severity: "error",
            autoHideDuration: 3000,
            key: "dedupe-notification",
          }
        );
      }
      const payload = {
        title: state.title,
        description: state.description,
        thumbnail: state.thumbnail,
        tags: state.tags,
        categories: state.categories.map((c) => c.id),
      };
      const data = await UpdateVideoSchema.parseAsync(payload);
      setState((prev) => ({ ...prev, loading: true }));
      const result = await updateVideoRecord({
        ...data,
        videoId: state.videoId,
      });
      if (result.data) {
        setState(initialState);
      }
      notif.show(result.message, {
        severity: result?.data ? "success" : "error",
        autoHideDuration: 3000,
        key: "dedupe-notification",
      });
    } catch (error: any) {
      let msg = error?.message;
      if (error instanceof ZodError) {
        const errors: ZodError = error;
        msg = errors.issues.map((err) => err.message).toString();
      }
      notif.show(msg, {
        severity: "error",
        autoHideDuration: 3000,
        key: "dedupe-notification",
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <React.Fragment>
      <Box>
        {/* upload box */}
        <Box
          onClick={() => videoRef.current?.click()}
          sx={[
            (theme) => ({
              height: 180,
              border: `1px dashed ${theme.vars.palette.grey[400]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: 2,
              flexDirection: "column",
            }),
          ]}
        >
          <input
            ref={videoRef}
            hidden
            type="file"
            accept="video/*"
            onChange={(ev) => handleFileUpload(ev)}
          />
          <Box
            sx={[
              (theme) => ({
                height: 60,
                width: 60,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                border: `1px dashed ${theme.vars.palette.grey[400]}`,
              }),
            ]}
          >
            <IconButton
              size="small"
              disableFocusRipple
              disableRipple
              disableTouchRipple
            >
              <UploadFileOutlined />
            </IconButton>
          </Box>
          <Box>
            {state.videoFile ? (
                <Box>
                  <Typography>{shortenName(state?.videoFile?.name, 15)}</Typography>
                  <Typography>
                    {formatBytes(state.upload.bytesUploaded)} /{" "}
                    {formatBytes(state.upload.bytesTotal)}
                  </Typography>
                </Box>
            ) : (
              <Typography variant="caption">Upload Video</Typography>
            )}
          </Box>
        </Box>
        {/* progress bar */}
        <Box>
          {state?.videoFile && (
            <LinearProgressWithLabel
              sx={{ height: 15, borderRadius: 5, my: 1 }}
              color="success"
              value={Math.round(state.upload.percentage)}
            />
          )}
        </Box>
        {state?.videoFile && (
          <Box my={1}>
            <Typography variant="h6" py={0.5}>
              Thumbnail
            </Typography>
            <Stack
              spacing={2}
              direction={"row"}
              sx={{ overflowX: "auto", py: 2 }}
            >
              <Box
                onClick={() => photoRef?.current?.click()}
                sx={[
                  (theme) => ({
                    border: `1px dashed ${theme.vars.palette.grey[400]}`,
                    height: 100,
                    width: 100,
                    padding: "50px",
                    borderRadius: 5,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }),
                ]}
              >
                <input
                  onChange={(ev) => {
                    const files = ev.target.files;
                    if (!files || !files[0]) return;
                    handleThumbnailUpload(files[0]);
                  }}
                  ref={photoRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  hidden
                />
                <IconButton size="small" disableFocusRipple disableTouchRipple>
                  <UploadFileOutlined />
                </IconButton>
                <Typography>
                  {state?.photoFile && shortenName(state.photoFile.name, 7)}
                </Typography>
              </Box>
              {state.thumbnails.map((item, index) => (
                <CardMedia
                  onClick={() => changeVideoThumbnail(item)}
                  key={index}
                  sx={{
                    borderRadius: 5,
                    width: 100,
                    height: 100,
                    cursor: "pointer",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                    border: (theme) =>
                      item === state.selectedThumbnail
                        ? `1px solid ${theme.vars.palette.warning.light}`
                        : "",
                  }}
                  image={item}
                  component={"img"}
                />
              ))}
            </Stack>
            <Typography color="textDisabled" py={0.5}>
              Select or upload your own thumbnail that will appear when the
              player is loaded before playback is started or leave it to pick
              default
            </Typography>
          </Box>
        )}
        <FormControl fullWidth sx={{ my: 1 }}>
          <TextField
            required
            disabled={state.loading}
            id="outlined-required"
            label="Title"
            placeholder="Enter video title"
            value={state.title}
            onChange={(ev) =>
              setState((prev) => ({ ...prev, title: ev.target.value }))
            }
          />
        </FormControl>

        <FormControl fullWidth sx={{ my: 1 }}>
          <TextField
            required
            multiline
            disabled={state.loading}
            id="outlined-required"
            label="Description"
            minRows={5}
            placeholder="Enter video description"
            value={state.description}
            onChange={(ev) =>
              setState((prev) => ({ ...prev, description: ev.target.value }))
            }
          />
        </FormControl>
        <FormControl fullWidth sx={{ my: 1 }}>
          <TagsInput
            tags={state.tags}
            onDeleteTag={onDeleteTag}
            onTagsChange={onTagsChange}
          />
        </FormControl>
        <FormControl fullWidth sx={{ mt: 3 }}>
          <CategoriesInput
            categories={categories}
            onChange={onCatChange}
            selectedItems={state.categories}
          />
        </FormControl>

        <Box sx={{ display: "block", textAlign: "center" }}>
          <Button
            variant="outlined"
            sx={{
              borderRadius: 5,
              minWidth: 200,
              my: 4,
            }}
            loading={state.loading}
            disabled={state.loading}
            onClick={(ev) => handlePublish(ev)}
          >
            Publish
          </Button>
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default PageClient;
