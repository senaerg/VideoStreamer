'use client'
import { AppVideo } from '@/types'
import { Box } from '@mui/material'
import React from 'react'
import { DisplayVideos } from '../common'
import { useAppContext } from '@/contexts/AppContext'

const Homepage = ({videos}:{videos: AppVideo[] }) => {
    const { cat} = useAppContext()
  return (
    <React.Fragment>
        <DisplayVideos videos={videos} cat={cat} />
    </React.Fragment>
  )
}

export default Homepage
