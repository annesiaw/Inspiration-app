import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const fetchDailyContent = () => request('/api/content');
export const fetchArchiveList = () => request('/api/archive');
export const fetchArchiveDay = (date) => request(`/api/archive/${date}`);

export async function registerPushToken(token) {
  const res = await fetch(`${API_URL}/api/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function removePushToken(token) {
  const res = await fetch(`${API_URL}/api/tokens/${encodeURIComponent(token)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
