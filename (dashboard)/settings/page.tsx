import React from 'react'
import { PlayerSettings, StudioSettings, UpdateUser } from '@/components/common'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { fetchPublicUser } from '@/lib/actions/users'

const page = async() => {
  const session = await auth()
  if(!session) return redirect("/")
  const result = await fetchPublicUser({_id: session.user.id})
  if(!result.data) return redirect("/")
  return (
    <React.Fragment>
      <UpdateUser bio={result?.data?.bio ?? ""} />
      <PlayerSettings />
      <StudioSettings />
    </React.Fragment>
  )
}

export default page
