import { TopCategoriesServer } from '@/components/common'
import { Homepage } from '@/components/pages'
import { getVideoStreams } from '@/lib/actions/stream'
import { AppVideo } from '@/types'
import React, { cache } from 'react'

const getVideos = cache( async() =>{
  const result= await getVideoStreams({limit: 21, skip: 0})
  return result.data || []
})


const page = async() => {
  const videos: AppVideo[] = await getVideos()
  return (
    <React.Fragment>
      <TopCategoriesServer />
       <Homepage videos={videos} />
    </React.Fragment>
  )
}

export default page
