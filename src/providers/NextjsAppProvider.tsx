'use client'
import { NextAppProvider } from '@toolpad/core/nextjs';
import React, { useState } from 'react'
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { type Navigation } from '@toolpad/core/AppProvider';
import { BookmarksOutlined, FavoriteBorderOutlined, FeedbackOutlined, HelpOutlineOutlined, HistoryOutlined, LocalFireDepartmentOutlined, SettingsOutlined, SmartDisplayOutlined, SubscriptionsOutlined } from '@mui/icons-material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { AccountDialog, CustomThemeSwitcher } from '@/components/common';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { CardMedia } from '@mui/material';
import { constant } from '@/config';


const customTheme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: {
      light: {
        palette: {
          background: {
            default: '#F9F9FE',
            paper: '#EEEEF9',
          },
        },
      },
      dark: {
        palette: {
          background: {
            default: '#2A4364',
            paper: '#112E4D',
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 600,
        lg: 1200,
        xl: 1536,
      },
    },
  });

  const NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Stream Options",
    },
    {
      title: "Dashboard",
      icon: <DashboardIcon />,      
    },
    {
      segment: "subscriptions",
      title: "Subscriptions",
      icon: <SubscriptionsOutlined />,
    },
    {
      segment: "bookmarks",
      title: "Bookmarks",
      icon: <BookmarksOutlined />,
    },
    {
      segment: "favourites",
      title: "Favourites",
      icon: <FavoriteBorderOutlined />,
    },
    {
      segment: "history",
      title: "History",
      icon: <HistoryOutlined />,
    },
    {
      segment: "trending",
      title: "Trending",
      icon: <LocalFireDepartmentOutlined />,
    },
    {
      segment: "videos",
      title: "My Videos",
      icon: <SmartDisplayOutlined />,
    },

    {
      segment: "create",
      title: "Create",
      icon: <AddOutlinedIcon />,
    },

    {
      kind: "header",
      title:"StreamMe Options",
    },
    {
      segment: "help",
      title: "Help",
      icon: <HelpOutlineOutlined />,
    },
    {
      segment: "feedback",
      title: "Feedback",
      icon: <FeedbackOutlined />,
    },
    {
      segment: "settings",
      title: "Settings",
      icon: <SettingsOutlined />,
    },
    {
      kind: "divider",
    },
    {
      segment: "#",
      title: "",
      icon: <CustomThemeSwitcher />,
    },
  ];

const NextjsAppProvider = (props: { children: React.ReactNode, session: Session | null }) => {
    
    const [open, setOpen] = useState(false)

    const toggleDialog = (isOpen: boolean) => {
        setOpen(isOpen);
    }
      
  return (
   <NextAppProvider
    navigation={NAVIGATION}
    theme={customTheme}
    authentication={{
        signIn: () => toggleDialog(true),
        signOut
    }}
    session={props.session}
    branding={{
      homeUrl: "/",
      logo: <CardMedia sx={{height: 25, mt: 1}} component="img" src="/logo.svg" alt={constant.siteName} />,
      title: constant.siteName
    }}
    key={"47282993e88"}
   >
    {props.children}
    <AccountDialog isOpen={open} toggleDialog={toggleDialog} />
   </NextAppProvider>
  )
}

export default NextjsAppProvider
