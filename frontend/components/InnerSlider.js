'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import CommentSection from './CommentSection';

/**
 * InnerSlider
 * - Modal carousel showing the full video set.
 * - Displays a window of videos (3 visible on desktop, 1 focused on mobile),
 *   horizontally scrollable with swipe support and snap.
 * - Keeps only a limited window of <VideoPlayer> instances mounted to respect
 *   the "~10 active videos" performance budget; far-off slides render a
 *   thumbnail placeholder only.
 * - Closes on backdrop click, close button, or Escape key.
 */
const ACTIVE_WINDOW = 4; // videos rendered with a real <video> element on each side of current

export default function InnerSlider({
  videos,
  initialIndex,
  onClose,
  likedIds,
  onLikeToggle,
  onShareClick,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollContainerRef = useRef(null);
  const slideRefs = useRef([]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Scroll to initial index on mount
  useEffect(() => {
    const el = slideRefs.current[initialIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which slide is "active" (centered) via IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number(entry.target.getAttribute('data-index'));
            setCurrentIndex(idx);
          }
        });
      },
      {
        root: container,
        threshold: [0.6],
      }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos.length]);

  const scrollToIndex = useCallback((idx) => {
    const el = slideRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) scrollToIndex(currentIndex + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white bg-white/10 rounded-full p-2"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>

      {/* Prev / Next arrows (desktop) */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="hidden sm:flex absolute left-4 z-50 text-white bg-white/10 rounded-full p-2 disabled:opacity-30"
        aria-label="Previous video"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        disabled={currentIndex === videos.length - 1}
        className="hidden sm:flex absolute right-4 z-50 text-white bg-white/10 rounded-full p-2 disabled:opacity-30"
        aria-label="Next video"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
        </svg>
      </button>

      {/* Scrollable slide track */}
      <div
        ref={scrollContainerRef}
        className="relative z-40 w-full h-full sm:h-[85vh] sm:max-w-5xl flex items-center overflow-x-auto no-scrollbar snap-x-carousel"
        style={{ scrollPaddingLeft: '5%', scrollPaddingRight: '5%' }}
      >
        <div className="flex gap-4 px-[5%] sm:px-[20%] w-full">
          {videos.map((video, idx) => {
            const withinActiveWindow = Math.abs(idx - currentIndex) <= ACTIVE_WINDOW;
            return (
              <div
                key={video.id}
                ref={(el) => (slideRefs.current[idx] = el)}
                data-index={idx}
                className="snap-item flex-shrink-0 w-[85vw] sm:w-[60vw] h-[70vh] sm:h-full flex flex-col"
              >
                <div className="flex-1 min-h-0">
                  {withinActiveWindow ? (
                    <VideoPlayer
                      video={video}
                      isActive={idx === currentIndex}
                      liked={likedIds.has(video.id)}
                      onLikeToggle={onLikeToggle}
                      onShareClick={onShareClick}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 rounded-xl flex items-center justify-center">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-xl opacity-60"
                      />
                    </div>
                  )}
                </div>
                <CommentSection videoId={video.id} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/70 text-xs">
        {currentIndex + 1} / {videos.length}
      </div>
    </div>
  );
}
