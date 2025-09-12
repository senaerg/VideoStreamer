"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
  Visibility,
  VisibilityOff,
  AlternateEmail,
} from "@mui/icons-material";
import { useDialogs } from "@toolpad/core";
export default function AccountDialog({
  isOpen,
  toggleDialog,
}: {
  isOpen: boolean;
  toggleDialog: (open: boolean) => void;
}) {
  const open = useMemo(() => isOpen, [isOpen]);

  const [state, setState] = useState({
    isSignIn: true,
    loading: false,
    message: "",
    name: "",
    email: "",
    password: "",
  });

  const dialogs = useDialogs()

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const toggleAccount = (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setState((prev) => ({ ...prev, message: "", isSignIn: !prev.isSignIn }));
  };
  

  const handleSubmit = async (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    ev.preventDefault();
    try {
      setState((prev) => ({ ...prev, message: "", loading: true }));
      const res = await signIn(
        state.isSignIn ? "credentials-in" : "credentials-up",
        {
          ...(!state.isSignIn && { name: state.name }),
          email: state.email,
          password: state.password,
          redirect: false,
        }
      );
      if (res?.error) {
        setState((prev) => ({ ...prev, message: res.code as string }));
        return;
      }
      toggleDialog(false);
      window?.location?.reload();
    } catch (error: any) {
      setState((prev) => ({ ...prev, message: error?.message }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        fullWidth
        open={open}
        onClose={() => toggleDialog(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title" textAlign={"center"}>
          {state.isSignIn ? "Sign in to your account" : "Create new account"}
        </DialogTitle>
        <DialogContent>
          <Box action="#" method="POST" component={"form"}>
            {!state.isSignIn && (
              <FormControl fullWidth sx={{ my: 1 }}>
                <InputLabel htmlFor="outlined-adornment-name">
                  Full Name
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-name"
                  type={"name"}
                  name="name"
                  value={state.name}
                  onChange={(ev) =>
                    setState((prev) => ({ ...prev, name: ev.target.value }))
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label={"full name"} edge="end">
                        <AccountCircle />
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Full Name"
                />
              </FormControl>
            )}

            <FormControl fullWidth sx={{ my: 1 }}>
              <InputLabel htmlFor="outlined-adornment-email">
                Email Address
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-email"
                type={"email"}
                name="email"
                value={state.email}
                onChange={(ev) =>
                  setState((prev) => ({ ...prev, email: ev.target.value }))
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label={"email address"} edge="end">
                      <AlternateEmail />
                    </IconButton>
                  </InputAdornment>
                }
                label="Email Address"
              />
            </FormControl>
            <FormControl fullWidth sx={{ my: 1 }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={state.password}
                onChange={(ev) =>
                  setState((prev) => ({ ...prev, password: ev.target.value }))
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? "hide the password"
                          : "display the password"
                      }
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            <Typography color="error">{state.message}</Typography>
            <Box sx={{ display: "block", textAlign: "center", my: 1 }}>
              <Button
                onClick={(ev) => handleSubmit(ev)}
                variant="outlined"
                sx={{ borderRadius: 30 }}
                loading={state.loading}
                disabled={state.loading}
              >
                {state.isSignIn ? "Sign in" : "Create account"}
              </Button>
            </Box>
            <Stack direction={"row"} sx={{ alignItems: "center" }}>
              {state.isSignIn
                ? `Don't have an account?`
                : `Already have an account?`}
              <Button
                onClick={(ev) => toggleAccount(ev)}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {state.isSignIn ? "Register" : "Sign in"}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
