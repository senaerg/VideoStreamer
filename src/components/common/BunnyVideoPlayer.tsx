"use client";
import { bunnyVideoLibraryId } from "@/config";
import { useAppContext } from "@/contexts/AppContext";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";



const getCurrentTime = (player: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      player.getCurrentTime((value: number) => {
        resolve(value); // Resolve the promise with the paused state
      });
    } catch (error) {
      reject(error); // Reject the promise if an error occurs
    }
  });
};

const getDuration = (player: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      player.getDuration((value: number) => {
        resolve(value); // Resolve the promise with the paused state
      });
    } catch (error) {
      reject(error); // Reject the promise if an error occurs
    }
  });
};

const updateUrlWithTime = (time: number) => {
  const url = new URL(window.location.href);
  url.searchParams.set("t", Math.floor(time).toString());
  window.history.replaceState(null, "", url.toString());
};

const BunnyVideoPlayer = ({ videoId }: { videoId: string }) => {
  const {
    settings: { autoplay, loop, muted, preload },
  } = useAppContext();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const searchParams = useSearchParams();
  const timeParam = searchParams.get("t");
  const lastWatchedTime = React.useRef(parseInt(timeParam ?? "0")).current;

  useEffect(() => {
    const initiliazePlayerState = async () => {
      // @ts-ignore
      const iframeElement = document.querySelector("iframe");
      if (iframeElement) {
        let lastSavedTime = 0;
        const storeKey = `w_${videoId.slice(-10)}`;
        // reset state
        const resetState = () => {
          lastSavedTime = 0;
          localStorage.removeItem(storeKey);
          const url = new URL(window.location.href);
          url.searchParams.delete("t");
          window.history.replaceState(null, "", url.toString());
        };
        // @ts-ignore
        const player = new playerjs.Player(iframeElement);
        player.on("ready", async () => {
          // Retrieve the last watch time from localStorage
          const storeVal = localStorage.getItem(storeKey);
          const storeTime = storeVal ? parseFloat(storeVal) : 0;
          const savedWatchTime =
            lastWatchedTime === 0 ? storeTime : lastWatchedTime;
          if (savedWatchTime) {
            if (player.supports("method", "setCurrentTime")) {
              lastSavedTime = savedWatchTime;
              setTimeout(() => {
                player.setCurrentTime(savedWatchTime);
              }, 500);
            }
          }

          if (player.supports("method", "getDuration")) {
            console.log("player supports method getDuration");
            player.getDuration((duration: number) =>
              console.log("video duration", duration)
            );
          }

          if (player.supports("event", "progress")) {
            // save watch time
            player.on("progress", (data: { percent: number }) => {
              console.log("progress", data);
            });
          }

          // Track watch time every 5 seconds
          if (player.supports("event", "timeupdate")) {
            // To avoid saving too frequently
            player.on(
              "timeupdate",
              (data: { seconds: number; duration: number }) => {
                console.log("timeupdate ", data);
                const currentTime = data.seconds;
                // check if loop is true
                if (currentTime === 0 && loop) {
                  resetState();
                }
                if (currentTime - lastSavedTime >= 5) {
                  updateUrlWithTime(currentTime);
                  localStorage.setItem(storeKey, currentTime.toString());
                  lastSavedTime = currentTime;
                }
              }
            );
          }
          // save watch time when the video is paused
          if (player.supports("event", "pause")) {
            player.on("pause", async () => {
              const currentTime = await getCurrentTime(player);
              const duration = await getDuration(player);
              if (currentTime < duration) {
                updateUrlWithTime(currentTime);
                localStorage.setItem(storeKey, currentTime.toString());
                lastSavedTime = currentTime;
              }
            });
          }
          // Clear watch time when the video ends
          if (player.supports("event", "ended")) {
            player.on("ended", () => {
              resetState();
            });
          }
        });
      } else {
        console.error("Iframe element not found");
      }
    };
    initiliazePlayerState();
  }, [videoId]);

  return (
    <React.Fragment>
      <div
        ref={iframeRef}
        style={{ position: "relative", paddingTop: "56.25%"}}
      >
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${bunnyVideoLibraryId}/${videoId}?autoplay=${autoplay}&loop=${loop}&muted=${muted}&preload=${preload}&responsive=true&uid=${videoId}`}
          loading="lazy"
          style={{
            border: 0,
            position: "absolute",
            top: 0,
            height: "100%",
            width: "100%",
          }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </React.Fragment>
  );
};

export default BunnyVideoPlayer;
