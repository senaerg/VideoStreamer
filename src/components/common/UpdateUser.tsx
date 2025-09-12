"use client";

import React, { useState, FormEvent } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNotifications, useSession } from "@toolpad/core";
import { updateUserBio } from "@/lib/actions/users";
import { z, ZodError } from "zod";

interface UserBioProps {
  bio: string;
}

const UserUpdateSchema = z.object({
  bio: z
    .string()
    .min(1, "Bio is required")
    .max(250, "Bio must be less than 250 characters"),
  userId: z.string().min(10, "Please login to update"),
});

const UpdateUser: React.FC<UserBioProps> = ({ bio = "" }) => {
  const [state, setState] = useState({ bio, isLoading: false });
  const notif = useNotifications();
  const session = useSession();
  const userId = session?.user?.id;

  const handleBioChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    setState((prev) => ({ ...prev, bio: val.length > 250 ? prev.bio : val }));
  };

  const handleSubmit = async () => {
    const payload = await UserUpdateSchema.parseAsync({
      bio: state.bio,
      userId,
    });
    setState((prev) => ({...prev, isLoading: true }));
    try {
      const result = await updateUserBio(payload.userId, payload.bio);
      const isError = !result.data;
      notif.show(result.message, {
        severity: isError ? "error" : "success",
        autoHideDuration: 3000,
      });
    } catch (error: any) {
      let message = error.message;
      if (error instanceof ZodError) {
        const _error = error as ZodError;
        message = _error.issues.map((i) => i.message).toString();
      }
      notif.show(message, { severity: "error", autoHideDuration: 3000 });
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 1 }}>
      <Typography variant="h6" gutterBottom>
        User Bio
      </Typography>
      <Box component="form">
        <TextField
          fullWidth
          multiline
          rows={4}
          value={state.bio}
          onChange={(ev) => handleBioChange(ev)}
          variant="outlined"
          label="Bio"
          margin="normal"
          slotProps={{
            input: {
              onKeyDown: (ev) => {
                if (ev.key === "Enter") {
                  ev.preventDefault();
                  handleSubmit();
                }
              },
            },
          }}
          helperText={`${state.bio.length}/250`}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={state.isLoading}
            loading={state.isLoading}
            onClick={(ev) => {
              ev.preventDefault();
              handleSubmit();
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UpdateUser;
