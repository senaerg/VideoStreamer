'use client'
import { AppVideo } from '@/types';
import React from 'react'
import DisplayVideos from './DisplayVideos';

const PageClient = ({ videos }: {
    videos: AppVideo[];
}) => {
  return (
    <React.Fragment>
            <DisplayVideos videos={videos}  />
    </React.Fragment>
  )
}

export default PageClient
