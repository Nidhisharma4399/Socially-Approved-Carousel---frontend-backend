'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * VideoPlayer
 * - Lazily loads the video src only when it enters the viewport.
 * - Autoplays (muted) immediately when it becomes the active slide,
 *   like driptrip.in's "Socially Approved" carousel.
 * - Provides Play/Pause and Mute/Unmute controls.
 * - Shows a progress bar and a loading spinner while buffering.
 */
export default function VideoPlayer({
  video,
  isActive,
  onLikeToggle,
  onShareClick,
  liked,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [shouldLoad, setShouldLoad] = useState(isActive);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Lazy-load: load src when active OR when scrolled into view
  useEffect(() => {
    if (isActive) {
      setShouldLoad(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setShouldLoad(true);
        });
      },
      { threshold: 0.25, rootMargin: '150px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isActive]);

  // Autoplay when active, pause when not
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !shouldLoad) return;

    if (isActive) {
      v.muted = true; // required by browsers for autoplay
      setIsMuted(true);
      const tryPlay = () => {
        const p = v.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      };
      if (v.readyState >= 2) {
        tryPlay();
      } else {
        v.addEventListener('loadeddata', tryPlay, { once: true });
        return () => v.removeEventListener('loadeddata', tryPlay);
      }
    } else {
      v.pause();
      v.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, shouldLoad]);

  const handleTogglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center"
    >
      {shouldLoad ? (
        <video
          ref={videoRef}
          src={video.url}
          poster={video.thumbnail}
          muted={isMuted}
          loop
          playsInline
          autoPlay={isActive}
          preload="auto"
          className="w-full h-full object-cover"
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      ) : (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Loading spinner */}
      {shouldLoad && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Tap area to toggle play/pause */}
      <button
        className="absolute inset-0 z-10"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        {!isPlaying && shouldLoad && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/40 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-white"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </button>

      {/* Top gradient + title */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none">
        <p className="text-sm font-semibold text-white line-clamp-1">
          {video.title}
        </p>
        <p className="text-xs text-white/80 line-clamp-1">
          {video.description}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/70 to-transparent">
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mute/Unmute */}
            <button
              onClick={handleToggleMute}
              className="text-white p-1.5 bg-black/40 rounded-full"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3 9v6h4l5 5V4L7 9H3zM19 12l2-2-1-1-2 2-2-2-1 1 2 2-2 2 1 1 2-2 2 2 1-1-2-2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM14 4.45v1.55A6.5 6.5 0 0118.5 12 6.5 6.5 0 0114 18v1.55A8 8 0 0020.5 12 8 8 0 0014 4.45z" />
                </svg>
              )}
            </button>

            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className="text-white p-1.5 bg-black/40 rounded-full"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={() => onLikeToggle(video.id)}
              className="flex items-center gap-1 text-white p-1.5 bg-black/40 rounded-full px-2.5"
              aria-label="Like video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={liked ? '#ef4444' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span className="text-xs">{video.likes}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => onShareClick(video.id)}
              className="flex items-center gap-1 text-white p-1.5 bg-black/40 rounded-full px-2.5"
              aria-label="Share video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
              </svg>
              <span className="text-xs">{video.shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
