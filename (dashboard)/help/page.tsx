import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const page = () => {
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Help Center
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Find answers to frequently asked questions about our video streaming platform.
      </Typography>

      {/* Section: Watching Videos */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📺 Watching Videos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            - Click on a video thumbnail to start watching.<br />
            - Use the play/pause button or press spacebar to control playback.<br />
            - Adjust quality settings by clicking the settings ⚙️ icon.<br />
            - Enable captions using the CC button if available.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Section: Uploading Videos */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📤 Uploading Videos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            - Navigate to the **Upload** page and click the upload button.<br />
            - Select a video file and add title, description, and tags.<br />
            - Choose privacy settings (Public, Unlisted, Private).<br />
            - Click **Upload** and wait for processing to complete.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Section: Managing Subscriptions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">🔔 Managing Subscriptions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            - Subscribe to channels by clicking the **Subscribe** button.<br />
            - Enable notifications by clicking the 🔔 bell icon.<br />
            - Manage subscriptions in the **Subscriptions** tab.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Section: Troubleshooting */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">⚠️ Troubleshooting Issues</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            **If you’re experiencing issues, try the following:**<br />
            - Refresh the page or restart your browser.<br />
            - Clear your cache and cookies.<br />
            - Check your internet connection.<br />
            - Ensure your browser is up to date.<br />
            - Contact support if issues persist.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default page;
