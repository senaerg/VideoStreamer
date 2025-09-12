"use client";
import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { FormControlLabel, FormGroup, Grid2, Paper, Switch, Typography } from "@mui/material";

const PlayerSettings = () => {
  const { settings, updateSettings } = useAppContext();  
  
  const handleToggle = (
    event: React.ChangeEvent<HTMLInputElement>,
    settingName: keyof typeof settings
  ) => {
    updateSettings({ [settingName]: event.target.checked });
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Player Settings</Typography>
      <FormGroup sx={{ mt: 4 }}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ lg: 3, md: 3, sm: 6, xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  name="autoplay"
                  checked={settings.autoplay}
                  onChange={(event) => handleToggle(event, "autoplay")}
                />
              }
              label="Autoplay"
            />
          </Grid2>
          <Grid2 size={{ lg: 3, md: 3, sm: 6, xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  name="loop"
                  checked={settings.loop}
                  onChange={(event) => handleToggle(event, "loop")}
                />
              }
              label="Loop"
            />
          </Grid2>
          <Grid2 size={{ lg: 3, md: 3, sm: 6, xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  name="muted"
                  checked={settings.muted}
                  onChange={(event) => handleToggle(event, "muted")}
                />
              }
              label="Muted"
            />
          </Grid2>
          <Grid2 size={{ lg: 3, md: 3, sm: 6, xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  name="preload"
                  checked={settings.preload}
                  onChange={(event) => handleToggle(event, "preload")}
                />
              }
              label="Preload"
            />
          </Grid2>
        </Grid2>
      </FormGroup>
    </Paper>
  );
  
};

export default PlayerSettings
