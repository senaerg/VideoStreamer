import { auth } from "@/auth";
import { fetchUserVideos } from "@/lib/actions/stream";
import { redirect } from "next/navigation";
import React, { cache } from "react";
import PageClient from "./PageClient";
import TopSection from "./TopSection";
import { fetchPublicUser } from "@/lib/actions/users";

const getPublicUser = cache(async (username: string) => {
  const result = await fetchPublicUser({ username });
  if (!result.data) return redirect("/");
  return result.data;
});

// Cache the data-fetching function
const fetchUserVideosCached = cache(async (userId: string) => {
  const result = await fetchUserVideos(userId, { limit: 15, skip: 0 });
  return result.data || [];
});

const page = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params;
  const _username = username.split("%40")[1];
  if (!_username) return redirect("/");

  const user = await getPublicUser(_username);

  const videos = await fetchUserVideosCached(user.id);

  return (
    <React.Fragment>
      <TopSection user={user} />
      <PageClient videos={videos} userId={user.id} />
    </React.Fragment>
  );
};

export default page;
