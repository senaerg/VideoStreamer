import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { cache } from "react";
import PageClient from "./PageClient";
import fetchStreamVideoList from "@/lib/actions/bunny";

const getVideos = cache(async () => {
  const result = await fetchStreamVideoList({});
  return result.data || [];
});

const page = async () => {
  const session = await auth();
  if (!session) return redirect("/");
  const videos = await getVideos();
  return <PageClient videos={videos} />;
};

export default page;
