import { auth } from '@/auth'
import { fetchFavouritedVideos } from '@/lib/actions/stream'
import { redirect } from 'next/navigation'
import React, { cache } from 'react'
import PageClient from './PageClient'

const getVideos = cache(async (userId: string) => {
  const result = await fetchFavouritedVideos(userId, { limit: 21, skip: 0 });
  return result.data || [];
});

const page = async() => {
    const session = await auth()
    if(!session) return redirect("/")
    const userId = String(session?.user?.id)
    const videos = await getVideos(userId)
  return (
    <PageClient videos={videos} userId={userId} />
  )
}

export default page
