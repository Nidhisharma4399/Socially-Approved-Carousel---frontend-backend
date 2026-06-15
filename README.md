# Socially Approved Carousel

A full-stack implementation of the "Socially Approved" video carousel feature
(similar to the section on saadaa.in / driptrip.in), built for the interview
assessment task.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Node.js + Express
- **Data:** Dummy JSON file (`backend/data/videos.json`)

## Project Structure

```
socially-approved-carousel/
├── backend/
│   ├── data/
│   │   └── videos.json       # dummy video metadata
│   ├── server.js              # Express API (/videos, /like, /share)
│   ├── package.json
│   └── .gitignore
└── frontend/
    ├── app/
    │   ├── layout.js
    │   ├── page.js            # main page wiring everything together
    │   └── globals.css
    ├── components/
    │   ├── OuterSlider.js      # outer thumbnail carousel (20-30 videos)
    │   ├── InnerSlider.js      # modal carousel (3 visible, swipeable)
    │   ├── VideoPlayer.js      # play/pause, mute, progress bar, spinner
    │   ├── CommentSection.js   # optional comment UI
    │   └── ShareMenu.js        # copy link / social share
    ├── lib/
    │   └── api.js              # fetch wrappers for backend API
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    └── .env.local.example
```

## Features Implemented

### Frontend
- Outer slider renders up to 30 video thumbnails, lazily loading images via
  IntersectionObserver as they scroll into view.
- Clicking a thumbnail opens the Inner Slider modal at that video.
- Inner Slider: horizontally scrollable, snap-based carousel with swipe
  support (3 visible on desktop, 1 focused on mobile), prev/next arrows.
- Only a small "active window" of videos (~9) mount a real `<video>` element
  at any time; others show a thumbnail placeholder — keeps DOM/perf in check.
- Each video: Play/Pause, Mute/Unmute, progress bar (click to seek), loading
  spinner while buffering.
- Videos auto-pause when scrolled out of view and auto-play when active.
- Like button with optimistic UI update + persisted via backend.
- Share button opens a menu (copy link / WhatsApp / X / Facebook), recorded
  via backend.
- Optional comment section per video (client-side only).

### Backend (Express)
- `GET /videos` — returns all video metadata (title, description, url,
  thumbnail, likes, shares).
- `POST /like` — body `{ videoId, userId }`. Toggles like, persists to
  `videos.json`.
- `POST /share` — body `{ videoId, platform }`. Increments share count,
  logs to `data/shares.json`.

## Running Locally

### 1. Backend

```bash
cd backend
npm install
npm start          # runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                         # runs on http://localhost:3000
```

Open http://localhost:3000 in your browser.

## Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo (or a subfolder of your repo).
2. On [Render](https://render.com), create a new **Web Service**:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variable `PORT` is auto-set by Render; no extra config
     needed.
3. Once deployed, note the URL, e.g. `https://your-app.onrender.com`.

### Frontend → Vercel

1. Push the `frontend/` folder to GitHub (or same repo, different root dir).
2. On [Vercel](https://vercel.com), import the repo:
   - Root directory: `frontend`
   - Framework preset: Next.js (auto-detected)
3. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-app.onrender.com` (your Render
     backend URL from above)
4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### Submission

- Deployed API link: your Render backend URL (e.g.
  `https://your-app.onrender.com/videos` should return JSON).
- Deployed frontend / demo link: your Vercel URL.
- Code repository: your GitHub repo link.

## Pushing to GitHub

From the project root:

```bash
cd socially-approved-carousel
git init
git add .
git commit -m "Socially Approved Carousel - frontend + backend"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

If you prefer separate repos for frontend/backend, run `git init` inside each
folder instead and push them separately, then update `NEXT_PUBLIC_API_URL`
accordingly.

## Notes / Assumptions

- Video files use publicly available sample MP4s (MDN CC0 videos) as
  placeholders since real video assets weren't provided — swap the `url`
  fields in `backend/data/videos.json` with real video URLs as needed.
- Likes are tracked per-user via a generated client-side ID stored in
  `localStorage` (sent as `userId` to `/like`), simulating per-user like
  state without requiring authentication.
- Comments are client-side only (per the "optional" spec); can be wired to
  a backend endpoint similarly to `/like` and `/share` if required.
