import { useState, useEffect, useRef } from "react";
import foodVideo from "@/assets/food-bg-video.mp4";

const VideoBackground = () => {
  const videoRef = useRef(null);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={foodVideo}
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Warm gradient overlay at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
};

export default VideoBackground;
