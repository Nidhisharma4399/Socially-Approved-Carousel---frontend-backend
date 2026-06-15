'use client';

import { useState } from 'react';

/**
 * CommentSection (optional feature)
 * - Local-only comments (no backend persistence required by spec).
 * - Lets users add and view comments per video.
 */
export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) return;
    setComments((prev) => [...prev, { id: Date.now(), text: text.trim() }]);
    setText('');
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-white/70 underline"
      >
        {open ? 'Hide comments' : `Comments (${comments.length})`}
      </button>

      {open && (
        <div className="mt-2 bg-black/40 rounded-lg p-2 max-h-32 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-xs text-white/50">No comments yet.</p>
          )}
          {comments.map((c) => (
            <p key={c.id} className="text-xs text-white/90 py-0.5">
              {c.text}
            </p>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={`Comment on video ${videoId}...`}
              className="flex-1 text-xs bg-white/10 rounded px-2 py-1 text-white outline-none"
            />
            <button
              onClick={handleAdd}
              className="text-xs bg-white/20 rounded px-2 py-1 text-white"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
