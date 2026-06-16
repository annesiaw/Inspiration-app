const express = require('express');
const {
  createPost,
  getPost,
  listPosts,
  deletePost,
  updatePost,
  loadCredentials,
  saveCredentials,
} = require('../services/socialScheduler');

const router = express.Router();

const VALID_PLATFORMS = ['facebook', 'instagram', 'tiktok'];
const VALID_STATUSES = ['pending', 'posted', 'failed', 'partial'];

// GET /api/social/posts — list all (optionally filter by status)
router.get('/posts', (req, res) => {
  const { status } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status filter.' });
  }
  const posts = listPosts(status ? { status } : undefined);
  res.json({ success: true, posts: posts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)) });
});

// POST /api/social/posts — create a scheduled post
router.post('/posts', (req, res) => {
  const { text, imageUrl, videoUrl, platforms, scheduledAt, contentType } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, error: 'text is required.' });
  }
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ success: false, error: 'platforms must be a non-empty array.' });
  }
  const invalidPlatform = platforms.find(p => !VALID_PLATFORMS.includes(p));
  if (invalidPlatform) {
    return res.status(400).json({ success: false, error: `Unknown platform: ${invalidPlatform}` });
  }
  if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
    return res.status(400).json({ success: false, error: 'scheduledAt must be a valid ISO date string.' });
  }
  if (new Date(scheduledAt) <= new Date()) {
    return res.status(400).json({ success: false, error: 'scheduledAt must be in the future.' });
  }

  const post = createPost({ text: text.trim(), imageUrl, videoUrl, platforms, scheduledAt, contentType });
  res.status(201).json({ success: true, post });
});

// GET /api/social/posts/:id
router.get('/posts/:id', (req, res) => {
  const post = getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
  res.json({ success: true, post });
});

// PATCH /api/social/posts/:id — update text/scheduledAt/platforms while still pending
router.patch('/posts/:id', (req, res) => {
  const post = getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
  if (post.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'Only pending posts can be edited.' });
  }

  const allowed = ['text', 'imageUrl', 'videoUrl', 'platforms', 'scheduledAt'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.scheduledAt && (isNaN(Date.parse(updates.scheduledAt)) || new Date(updates.scheduledAt) <= new Date())) {
    return res.status(400).json({ success: false, error: 'scheduledAt must be a valid future date.' });
  }

  const updated = updatePost(req.params.id, updates);
  res.json({ success: true, post: updated });
});

// DELETE /api/social/posts/:id
router.delete('/posts/:id', (req, res) => {
  const post = getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
  deletePost(req.params.id);
  res.json({ success: true });
});

// GET /api/social/credentials — return credentials (tokens masked)
router.get('/credentials', (req, res) => {
  const creds = loadCredentials();
  const masked = {};
  for (const [platform, cfg] of Object.entries(creds)) {
    masked[platform] = {};
    for (const [key, val] of Object.entries(cfg)) {
      masked[platform][key] = val ? (val.slice(0, 4) + '••••' + val.slice(-4)) : '';
    }
  }
  // Return which platforms are configured (have all required fields)
  const configured = {
    facebook: !!(creds.facebook?.pageId && creds.facebook?.pageAccessToken),
    instagram: !!(creds.instagram?.igUserId && creds.instagram?.accessToken),
    tiktok: !!(creds.tiktok?.accessToken),
  };
  res.json({ success: true, configured, masked });
});

// PUT /api/social/credentials/:platform — save credentials for a platform
router.put('/credentials/:platform', (req, res) => {
  const { platform } = req.params;
  if (!VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({ success: false, error: `Unknown platform: ${platform}` });
  }

  const creds = loadCredentials();

  if (platform === 'facebook') {
    const { pageId, pageAccessToken } = req.body;
    if (!pageId || !pageAccessToken) {
      return res.status(400).json({ success: false, error: 'pageId and pageAccessToken are required.' });
    }
    creds.facebook = { pageId, pageAccessToken };
  } else if (platform === 'instagram') {
    const { igUserId, accessToken } = req.body;
    if (!igUserId || !accessToken) {
      return res.status(400).json({ success: false, error: 'igUserId and accessToken are required.' });
    }
    creds.instagram = { igUserId, accessToken };
  } else if (platform === 'tiktok') {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: 'accessToken is required.' });
    }
    creds.tiktok = { accessToken };
  }

  saveCredentials(creds);
  res.json({ success: true });
});

// DELETE /api/social/credentials/:platform — remove credentials
router.delete('/credentials/:platform', (req, res) => {
  const { platform } = req.params;
  if (!VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({ success: false, error: `Unknown platform: ${platform}` });
  }
  const creds = loadCredentials();
  delete creds[platform];
  saveCredentials(creds);
  res.json({ success: true });
});

module.exports = router;
