'use client';

import { useRef, useEffect, useState } from 'react';

const AUTOPLAY_COUNT = 3; // number of leading cards that autoplay video directly

/**
 * OuterSlider
 * - Renders 20-30 video cards in a horizontally scrollable strip.
 * - The first AUTOPLAY_COUNT cards play a muted, looping <video> directly
 *   (like driptrip.in's "Socially Approved" row).
 * - Remaining cards show a lazily-loaded thumbnail and only switch to
 *   playing a video once scrolled into view (via IntersectionObserver),
 *   keeping the count of simultaneously-playing videos bounded.
 * - Clicking any card opens the InnerSlider modal at that index.
 */
export default function OuterSlider({ videos, onOpen }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [visibleIds, setVisibleIds] = useState(() => new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = entry.target.getAttribute('data-video-id');
            if (entry.isIntersecting) {
              next.add(id);
            }
          });
          return next;
        });
      },
      {
        root: containerRef.current,
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos]);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-3 px-4">Socially Approved</h2>
      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 snap-x-carousel"
      >
        {videos.map((video, index) => {
          const isVisible = visibleIds.has(video.id);
          const shouldAutoplay = index < AUTOPLAY_COUNT || isVisible;

          return (
            <button
              key={video.id}
              ref={(el) => (itemRefs.current[index] = el)}
              data-video-id={video.id}
              onClick={() => onOpen(index)}
              className="relative flex-shrink-0 w-32 h-48 sm:w-40 sm:h-60 rounded-xl overflow-hidden snap-item bg-neutral-800 group"
              aria-label={`Open video: ${video.title}`}
            >
              {shouldAutoplay ? (
                <CardVideo video={video} />
              ) : isVisible ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <p className="text-xs font-medium text-white line-clamp-2">
                  {video.title}
                </p>
              </div>
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-white"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * CardVideo
 * - Muted, looping, autoplaying <video> for outer-slider cards.
 * - Falls back to the thumbnail image if the video errors out.
 */
function CardVideo({ video }) {
  const videoRef = useRef(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || errored) return;
    v.muted = true;
    const p = v.play();
    if (p !== undefined) {
      p.catch(() => {
        /* autoplay can be blocked in some contexts; ignore */
      });
    }
  }, [errored]);

  if (errored) {
    return (
      <img
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={video.url}
      poster={video.thumbnail}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      className="w-full h-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}
