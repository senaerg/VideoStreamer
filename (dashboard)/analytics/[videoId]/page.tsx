import { auth } from '@/auth';
import { fetchVideo, fetchVideoStatistics } from '@/lib/actions/stream';
import { redirect } from 'next/navigation';
import React, { cache } from 'react'
import PageClient from './PageClient';

const fetchVideoCached = cache(async (videoId: string) => {
  const result = await fetchVideo(videoId);
  if(!result.data) return redirect("/")
  return result.data;
})

// Cache the data-fetching function
const fetchVideosStatsCached = cache(async(videoId: string) => {
  const result = await fetchVideoStatistics(videoId);
  if(!result.data) return redirect("/")
  return result.data;
});

const page = async({ params }: { params: Promise<{ videoId: string }>}) => {

  const session = await auth()

  const { videoId } = await params;

  if(!session || !videoId) return redirect("/")

  const video = await fetchVideoCached(videoId)
  
  if(video.user.id !== session.user.id) return redirect("/")

  // get video analytics

  const stats = await fetchVideosStatsCached(videoId)

  return (
    <PageClient data={stats} item={video} />
  )
}

export default page
