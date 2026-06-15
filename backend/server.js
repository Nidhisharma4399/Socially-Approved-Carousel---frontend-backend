const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const DATA_PATH = path.join(__dirname, 'data', 'videos.json');
const SHARES_PATH = path.join(__dirname, 'data', 'shares.json');

app.use(cors());
app.use(express.json());

// ----- Helpers -----
function readVideos() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeVideos(videos) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(videos, null, 2));
}

function readShares() {
  if (!fs.existsSync(SHARES_PATH)) return [];
  const raw = fs.readFileSync(SHARES_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeShares(shares) {
  fs.writeFileSync(SHARES_PATH, JSON.stringify(shares, null, 2));
}

// ----- Routes -----

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Socially Approved Carousel API is running' });
});

// GET /videos - returns all video metadata
app.get('/videos', (req, res) => {
  try {
    const videos = readVideos();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

// POST /like - body: { videoId, userId }
app.post('/like', (req, res) => {
  try {
    const { videoId, userId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const videos = readVideos();
    const video = videos.find((v) => v.id === videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!video.likedBy) video.likedBy = [];

    const identifier = userId || req.ip;
    const alreadyLiked = video.likedBy.includes(identifier);

    if (alreadyLiked) {
      // Unlike (toggle)
      video.likedBy = video.likedBy.filter((id) => id !== identifier);
      video.likes = Math.max(0, video.likes - 1);
    } else {
      video.likedBy.push(identifier);
      video.likes += 1;
    }

    writeVideos(videos);

    res.json({
      videoId: video.id,
      likes: video.likes,
      liked: !alreadyLiked,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// POST /share - body: { videoId, platform }
app.post('/share', (req, res) => {
  try {
    const { videoId, platform } = req.body;
    if (!videoId || !platform) {
      return res.status(400).json({ error: 'videoId and platform are required' });
    }

    const videos = readVideos();
    const video = videos.find((v) => v.id === videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.shares = (video.shares || 0) + 1;
    writeVideos(videos);

    const shares = readShares();
    shares.push({
      videoId,
      platform,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    });
    writeShares(shares);

    res.json({
      videoId: video.id,
      shares: video.shares,
      platform,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record share' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
