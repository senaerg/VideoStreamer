'use client'
import { AppVideo } from '@/types';
import React from 'react'
import DisplayVideos from './DisplayVideos';

const PageClient = ({ videos, userId }: {
    videos: AppVideo[];
    userId: string
}) => {
  return (
    <React.Fragment>
            <DisplayVideos videos={videos} userId={userId}  />
    </React.Fragment>
  )
}

export default PageClient
