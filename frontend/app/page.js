'use client';

import { useEffect, useState, useCallback } from 'react';
import OuterSlider from '@/components/OuterSlider';
import InnerSlider from '@/components/InnerSlider';
import ShareMenu from '@/components/ShareMenu';
import { fetchVideos, likeVideo, shareVideo } from '@/lib/api';

const USER_ID_KEY = 'sac_user_id';

function getOrCreateUserId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const [likedIds, setLikedIds] = useState(() => new Set());
  const [shareTarget, setShareTarget] = useState(null); // video to show ShareMenu for

  const userId = typeof window !== 'undefined' ? getOrCreateUserId() : null;

  // Load videos from backend
  useEffect(() => {
    let mounted = true;
    fetchVideos()
      .then((data) => {
        if (mounted) {
          setVideos(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpen = (index) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  const handleClose = () => setModalOpen(false);

  const handleLikeToggle = useCallback(
    async (videoId) => {
      // Optimistic UI update
      setVideos((prev) =>
        prev.map((v) => {
          if (v.id !== videoId) return v;
          const alreadyLiked = likedIds.has(videoId);
          return { ...v, likes: alreadyLiked ? v.likes - 1 : v.likes + 1 };
        })
      );
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(videoId)) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        return next;
      });

      try {
        const result = await likeVideo(videoId, userId);
        // Sync with authoritative server value
        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, likes: result.likes } : v))
        );
      } catch (err) {
        console.error('Like failed', err);
      }
    },
    [likedIds, userId]
  );

  const handleShareClick = (videoId) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) setShareTarget(video);
  };

  const handleShared = useCallback(async (videoId, platform) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, shares: v.shares + 1 } : v))
    );
    try {
      const result = await shareVideo(videoId, platform);
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, shares: result.shares } : v))
      );
    } catch (err) {
      console.error('Share failed', err);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-400 text-sm text-center">
          Failed to load videos: {error}
          <br />
          Make sure the backend is running and NEXT_PUBLIC_API_URL is set correctly.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-6">
      <OuterSlider videos={videos} onOpen={handleOpen} />

      {modalOpen && (
        <InnerSlider
          videos={videos}
          initialIndex={modalIndex}
          onClose={handleClose}
          likedIds={likedIds}
          onLikeToggle={handleLikeToggle}
          onShareClick={handleShareClick}
        />
      )}

      {shareTarget && (
        <ShareMenu
          video={shareTarget}
          onClose={() => setShareTarget(null)}
          onShared={handleShared}
        />
      )}
    </main>
  );
}
