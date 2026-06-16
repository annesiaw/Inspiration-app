import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function mutate(path, method, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const fetchDailyContent = () => request('/api/content');
export const fetchArchiveList = () => request('/api/archive');
export const fetchArchiveDay = (date) => request(`/api/archive/${date}`);

export async function registerPushToken(token) {
  return mutate('/api/tokens', 'POST', { token });
}

export async function removePushToken(token) {
  return mutate(`/api/tokens/${encodeURIComponent(token)}`, 'DELETE');
}

// Social media scheduler
export const fetchScheduledPosts = (status) =>
  request(`/api/social/posts${status ? `?status=${status}` : ''}`);

export const createScheduledPost = (data) =>
  mutate('/api/social/posts', 'POST', data);

export const updateScheduledPost = (id, data) =>
  mutate(`/api/social/posts/${id}`, 'PATCH', data);

export const deleteScheduledPost = (id) =>
  mutate(`/api/social/posts/${id}`, 'DELETE');

export const fetchSocialCredentials = () =>
  request('/api/social/credentials');

export const saveSocialCredentials = (platform, data) =>
  mutate(`/api/social/credentials/${platform}`, 'PUT', data);

export const removeSocialCredentials = (platform) =>
  mutate(`/api/social/credentials/${platform}`, 'DELETE');
