import { auth } from "@/auth";
import { fetchUserVideos } from "@/lib/actions/stream";
import { redirect } from "next/navigation";
import React, { cache } from "react";
import PageClient from "./PageClient";
import TopSection from "./TopSection";
import { fetchPublicUser } from "@/lib/actions/users";

const getPublicUser = cache(async (userId: string) => {
  const result = await fetchPublicUser({ _id: userId });
  if(!result.data) return redirect("/")
  return result.data;
})

// Cache the data-fetching function
const fetchUserVideosCached = cache(async(userId: string) => {
  const result = await fetchUserVideos(userId, { limit: 15, skip: 0 });
  return result.data || [];
});

const page = async () => {
  const session = await auth();
  if (!session) return redirect("/");
  const userId = String(session?.user?.id);
  const [user, videos ] = await Promise.all([getPublicUser(userId), fetchUserVideosCached(userId) ])
  return (
    <React.Fragment>
      <TopSection user={user} />
      <PageClient videos={videos} userId={userId} />
    </React.Fragment>
  );
};

export default page;
