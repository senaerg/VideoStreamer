'use client'
import React from 'react'
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { Typography } from '@mui/material';
import { PageContainer } from '@toolpad/core';


const SidebarFooter = ({mini}: SidebarFooterProps) => {
    return <Typography variant='caption' sx={{ overflow: "hidden", textWrap: "nowrap"}}>
        {mini ? '© StreamMe' : `© StreamMe ${new Date().getFullYear()}`}
    </Typography>
}

const CustomLayout = (props: { children: React.ReactNode, CustomToolbar: React.ReactNode }) => {
  return (
    <DashboardLayout
        sidebarExpandedWidth={240}
        slots={{
            sidebarFooter: SidebarFooter,
            toolbarAccount: () => null,
            toolbarActions: () => props.CustomToolbar,
        }}
    >
        <PageContainer
        title=''
        breadcrumbs={[]}
        >
            {props.children}
        </PageContainer>
    </DashboardLayout>
  )
}


export default CustomLayout
