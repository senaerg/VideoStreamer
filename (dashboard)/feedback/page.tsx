"use client";
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Rating,
  Box,
} from "@mui/material";
import { sendFeedback } from "@/lib/actions/feedback";
import { useDialogs, useSession } from "@toolpad/core";

type LocalState = {
  rating: number | null;
  comment: string;
  loading?: boolean;
};
const PageClient = () => {
  const [state, setState] = useState<LocalState>({
    comment: "",
    rating: null,
    loading: false,
  });

  const session = useSession();

  const dialogs = useDialogs();

  const handleSubmit = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    try {
      if (!session) return dialogs.alert("Please sign in to continue");
      if (!state.rating || !state.comment.trim()) {
        return dialogs.alert("Please provide a rating and a comment");
      }
      setState((prev) => ({ ...prev, loading: true }));
      const result = await sendFeedback({
        user: String(session?.user?.id),
        rating: state.rating,
        comment: state.comment,
      });
      if (result?.data) {
        setState((prev) => ({ ...prev, comment: "", rating: null }));
      }
      return dialogs.alert(result.message);
    } catch (error: any) {
      return dialogs.alert(error?.message);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h5" gutterBottom>
        💬 Give Us Your Feedback
      </Typography>

      <>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Your feedback helps us improve our platform.
        </Typography>

        {/* Star Rating */}
        <Box sx={{ my: 2 }}>
          <Typography variant="body1">Rate your experience:</Typography>
          <Rating
            name="feedback-rating"
            value={state.rating}
            onChange={(_, newValue) =>
              setState((prev) => ({ ...prev, rating: newValue }))
            }
          />
        </Box>

        {/* Comment Field */}
        <TextField
          label="Your Feedback"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={state.comment}
          onChange={(ev) =>
            setState((prev) => ({ ...prev, comment: ev.target.value }))
          }
          sx={{ my: 2 }}
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          loading={state.loading}
          disabled={state.loading}
          onClick={(ev) => handleSubmit(ev)}
        >
          Submit Feedback
        </Button>
      </>
    </Container>
  );
};

export default PageClient;
