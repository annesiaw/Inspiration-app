const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { postToAll } = require('./socialPoster');

const DATA_DIR = path.join(__dirname, '../data');
const POSTS_FILE = path.join(DATA_DIR, 'scheduled_posts.json');
const CREDS_FILE = path.join(DATA_DIR, 'social_credentials.json');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadPosts() {
  ensureDataDir();
  if (!fs.existsSync(POSTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function savePosts(posts) {
  ensureDataDir();
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

function loadCredentials() {
  ensureDataDir();
  if (!fs.existsSync(CREDS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCredentials(creds) {
  ensureDataDir();
  fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createPost({ text, imageUrl, videoUrl, platforms, scheduledAt, contentType = 'custom' }) {
  const posts = loadPosts();
  const post = {
    id: generateId(),
    text,
    imageUrl: imageUrl || null,
    videoUrl: videoUrl || null,
    platforms,
    scheduledAt,
    status: 'pending',
    results: {},
    contentType,
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  savePosts(posts);
  return post;
}

function getPost(id) {
  return loadPosts().find(p => p.id === id) || null;
}

function listPosts({ status } = {}) {
  const posts = loadPosts();
  if (status) return posts.filter(p => p.status === status);
  return posts;
}

function deletePost(id) {
  const posts = loadPosts().filter(p => p.id !== id);
  savePosts(posts);
}

function updatePost(id, updates) {
  const posts = loadPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...updates };
  savePosts(posts);
  return posts[idx];
}

async function runDuePosts() {
  const now = new Date();
  const posts = loadPosts();
  const credentials = loadCredentials();
  const due = posts.filter(p => p.status === 'pending' && new Date(p.scheduledAt) <= now);

  for (const post of due) {
    console.log(`[SocialScheduler] Posting "${post.id}" to: ${post.platforms.join(', ')}`);
    try {
      const results = await postToAll(credentials, post);
      const anyFailed = Object.values(results).some(r => !r.success);
      updatePost(post.id, {
        status: anyFailed ? 'partial' : 'posted',
        results,
        postedAt: now.toISOString(),
      });
    } catch (err) {
      updatePost(post.id, {
        status: 'failed',
        results: { error: err.message },
        postedAt: now.toISOString(),
      });
    }
  }
}

function startSocialScheduler() {
  // Check every minute for due posts
  cron.schedule('* * * * *', () => {
    runDuePosts().catch(err => console.error('[SocialScheduler] Error:', err));
  });
  console.log('Social media scheduler started — checking every minute for due posts');
}

module.exports = {
  startSocialScheduler,
  createPost,
  getPost,
  listPosts,
  deletePost,
  updatePost,
  loadCredentials,
  saveCredentials,
};
