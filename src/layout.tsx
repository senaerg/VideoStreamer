import type { Metadata } from "next";
import "./globals.css";
import { constant, playerCookieKey } from "@/config";
import LinearProgress from "@mui/material/LinearProgress";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import React from "react";
import NextjsAppProvider from "@/providers/NextjsAppProvider";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import AppContextProvider from "@/contexts/AppContext";
import { cookies } from "next/headers";
import Script from "next/script";
import { Box, CardMedia } from "@mui/material";

export const metadata: Metadata = {
  title: constant.siteName,
  description: constant.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cookie = await cookies();
  // get player cookies
  const s_cookie = cookie.get(playerCookieKey);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <Script
          src="https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js"
          strategy="beforeInteractive"
        />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        {/* favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>

        <link rel="icon" sizes="192x192" href="/android-chrome-192x192.png"/>

        <link rel="icon" sizes="512x512" href="/android-chrome-512x1512.png"/>

        <link rel="icon" sizes="32x32" href="/favicon-32x32.png"/>

        <link rel="icon" sizes="16x16" href="/favicon-16x16.png"/>

        <link rel="manifest" href="/manifest.json"/>
        {/* theme */}
        <meta name="theme-color" content="#2A4364" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <SessionProvider session={session}>
        <AppRouterCacheProvider options={{ enableCssLayer: false }}>
          <React.Suspense fallback={
            <React.Fragment>
            <LinearProgress />
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CardMedia image="/large-logo.svg" component={"img"} />
            </Box>
          </React.Fragment>
          }>
            <NextjsAppProvider session={session}>
              <AppContextProvider settings={
                s_cookie ? JSON.parse(s_cookie.value) : undefined
              }>
              {children}
              </AppContextProvider>
              </NextjsAppProvider>
          </React.Suspense>
        </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
