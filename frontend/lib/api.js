// Centralized API config.
// Set NEXT_PUBLIC_API_URL in your environment (e.g. Vercel project settings)
// to point at your deployed backend (Render URL).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchVideos() {
  const res = await fetch(`${API_BASE_URL}/videos`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

export async function likeVideo(videoId, userId) {
  const res = await fetch(`${API_BASE_URL}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, userId }),
  });
  if (!res.ok) throw new Error('Failed to like video');
  return res.json();
}

export async function shareVideo(videoId, platform) {
  const res = await fetch(`${API_BASE_URL}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, platform }),
  });
  if (!res.ok) throw new Error('Failed to record share');
  return res.json();
}
