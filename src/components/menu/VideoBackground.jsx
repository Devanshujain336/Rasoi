import { useState, useEffect, useRef, useCallback } from "react";
import foodVideo1 from "@/assets/food-bg-video.mp4";
import foodVideo2 from "@/assets/food-bg-video-2.mp4";
import foodVideo3 from "@/assets/food-bg-video-3.mp4";
import foodVideo4 from "@/assets/food-bg-video-4.mp4";
import foodVideo5 from "@/assets/food-bg-video-5.mp4";

const VIDEOS = [foodVideo1, foodVideo2, foodVideo3, foodVideo4, foodVideo5];
const ROTATE_INTERVAL = 15000;

const VideoBackground = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  const rotateVideo = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % VIDEOS.length;
        setNextIndex((next + 1) % VIDEOS.length);
        return next;
      });
      setFading(false);
    }, 1000); // 1s fade duration
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(rotateVideo, ROTATE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [rotateVideo]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Active video */}
      <video
        key={`active-${activeIndex}`}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: fading ? 0 : 1 }}
        src={VIDEOS[activeIndex]}
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Next video (underneath, visible during fade) */}
      <video
        key={`next-${fading ? activeIndex + 1 : nextIndex}`}
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEOS[fading ? (activeIndex + 1) % VIDEOS.length : nextIndex]}
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
};

export default VideoBackground;
