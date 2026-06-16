const https = require('https');

function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || parsed.message || `HTTP ${res.statusCode}`));
          }
        } catch {
          reject(new Error(`Non-JSON response: ${raw.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function postToFacebook({ pageId, pageAccessToken }, { text, imageUrl }) {
  const body = { message: text, access_token: pageAccessToken };
  if (imageUrl) body.link = imageUrl;
  const result = await httpPost(
    `https://graph.facebook.com/v19.0/${pageId}/feed`,
    body
  );
  return { success: true, postId: result.id };
}

async function postToInstagram({ igUserId, accessToken }, { text, imageUrl }) {
  if (!imageUrl) {
    throw new Error('Instagram requires an image URL for posts');
  }
  // Step 1: create media container
  const container = await httpPost(
    `https://graph.facebook.com/v19.0/${igUserId}/media`,
    { image_url: imageUrl, caption: text, access_token: accessToken }
  );
  // Step 2: publish
  const publish = await httpPost(
    `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
    { creation_id: container.id, access_token: accessToken }
  );
  return { success: true, postId: publish.id };
}

async function postToTikTok({ accessToken }, { text, videoUrl }) {
  if (!videoUrl) {
    throw new Error('TikTok requires a video URL for posts');
  }
  // TikTok Content Posting API — initialize upload
  const init = await httpPost(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    {
      post_info: {
        title: text.slice(0, 150),
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    },
    { Authorization: `Bearer ${accessToken}` }
  );
  return { success: true, publishId: init.data?.publish_id };
}

async function postToAll(credentials, postData) {
  const results = {};

  for (const platform of postData.platforms) {
    try {
      if (platform === 'facebook') {
        const creds = credentials.facebook;
        if (!creds?.pageId || !creds?.pageAccessToken) throw new Error('Facebook credentials not configured');
        results.facebook = await postToFacebook(creds, postData);
      } else if (platform === 'instagram') {
        const creds = credentials.instagram;
        if (!creds?.igUserId || !creds?.accessToken) throw new Error('Instagram credentials not configured');
        results.instagram = await postToInstagram(creds, postData);
      } else if (platform === 'tiktok') {
        const creds = credentials.tiktok;
        if (!creds?.accessToken) throw new Error('TikTok credentials not configured');
        results.tiktok = await postToTikTok(creds, postData);
      }
    } catch (err) {
      results[platform] = { success: false, error: err.message };
    }
  }

  return results;
}

module.exports = { postToAll };
