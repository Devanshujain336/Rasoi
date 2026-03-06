/**
 * VideoBackground.jsx
 *
 * Performance-optimized: only loads ONE video at a time.
 * The next video is only set as src (and preloaded) AFTER the current
 * one has been playing for a while — not all 5 upfront.
 */

import { useState, useEffect, useRef } from "react";
import foodVideo1 from "@/assets/food-bg-video.mp4";
import foodVideo2 from "@/assets/food-bg-video-2.mp4";
import foodVideo3 from "@/assets/food-bg-video-3.mp4";
import foodVideo4 from "@/assets/food-bg-video-4.mp4";
import foodVideo5 from "@/assets/food-bg-video-5.mp4";

const VIDEOS = [foodVideo1, foodVideo2, foodVideo3, foodVideo4, foodVideo5];
const ROTATE_INTERVAL = 8000; // Increased from 4s → 8s to reduce swap frequency
const FADE_DURATION = 600;

const VideoBackground = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null); // null = don't preload yet
  const [fading, setFading] = useState(false);
  const nextVideoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const upcoming = (currentIndex + 1) % VIDEOS.length;
      // Set nextIndex NOW so the next video src is assigned and preloads
      setNextIndex(upcoming);

      // Small delay to let browser buffer a tiny bit before fading
      setTimeout(() => {
        if (nextVideoRef.current) {
          nextVideoRef.current.currentTime = 0;
          nextVideoRef.current.play().catch(() => { });
        }
        setFading(true);

        setTimeout(() => {
          setCurrentIndex(upcoming);
          setNextIndex(null); // clear next — stop rendering the hidden video
          setFading(false);
        }, FADE_DURATION);
      }, 300);
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Next video — only rendered during transition, then unmounted */}
      {nextIndex !== null && (
        <video
          ref={nextVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={VIDEOS[nextIndex]}
          muted
          loop
          playsInline
          preload="metadata" // only load metadata+first frame, not full video
        />
      )}

      {/* Current video — fades out during transition */}
      <video
        key={currentIndex}
        className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
        style={{
          opacity: fading ? 0 : 1,
          transitionDuration: `${FADE_DURATION}ms`,
        }}
        src={VIDEOS[currentIndex]}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
};

export default VideoBackground;
