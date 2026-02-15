import { useState, useEffect, useRef, useCallback } from "react";
import foodVideo1 from "@/assets/food-bg-video.mp4";
import foodVideo2 from "@/assets/food-bg-video-2.mp4";
import foodVideo3 from "@/assets/food-bg-video-3.mp4";
import foodVideo4 from "@/assets/food-bg-video-4.mp4";
import foodVideo5 from "@/assets/food-bg-video-5.mp4";

const VIDEOS = [foodVideo1, foodVideo2, foodVideo3, foodVideo4, foodVideo5];
const ROTATE_INTERVAL = 15000;
const FADE_DURATION = 1000;

const VideoBackground = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [showNext, setShowNext] = useState(false);
  const nextVideoRef = useRef(null);
  const timerRef = useRef(null);

  const rotateVideo = useCallback(() => {
    // Preload and start playing next video before fading
    if (nextVideoRef.current) {
      nextVideoRef.current.currentTime = 0;
      nextVideoRef.current.play().catch(() => {});
    }
    setShowNext(true);

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setNextIndex((nextIndex + 1) % VIDEOS.length);
      setShowNext(false);
    }, FADE_DURATION);
  }, [nextIndex]);

  useEffect(() => {
    timerRef.current = setInterval(rotateVideo, ROTATE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [rotateVideo]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Bottom layer: next video (always rendering, revealed during fade) */}
      <video
        ref={nextVideoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEOS[nextIndex]}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Top layer: current video (fades out to reveal next) */}
      <video
        className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
        style={{
          opacity: showNext ? 0 : 1,
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
