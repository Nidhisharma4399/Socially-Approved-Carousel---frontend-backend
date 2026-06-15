'use client';

import { useState } from 'react';

/**
 * ShareMenu
 * - Small popover offering "copy link" and a couple of social share options.
 * - Calls back to record the share via the backend (/share).
 */
export default function ShareMenu({ video, onClose, onShared }) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?video=${video.id}`
      : `/?video=${video.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShared(video.id, 'copy_link');
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handlePlatformShare = (platform) => {
    onShared(video.id, platform);
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-neutral-900 rounded-xl p-4 w-72 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-3">Share this video</h3>

        <button
          onClick={handleCopyLink}
          className="w-full text-left text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 mb-2"
        >
          {copied ? 'Link copied!' : 'Copy link'}
        </button>

        <button
          onClick={() => handlePlatformShare('whatsapp')}
          className="w-full text-left text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 mb-2"
        >
          Share to WhatsApp
        </button>

        <button
          onClick={() => handlePlatformShare('twitter')}
          className="w-full text-left text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 mb-2"
        >
          Share to X (Twitter)
        </button>

        <button
          onClick={() => handlePlatformShare('facebook')}
          className="w-full text-left text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 mb-2"
        >
          Share to Facebook
        </button>

        <button
          onClick={onClose}
          className="w-full text-center text-sm text-white/60 mt-1 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
