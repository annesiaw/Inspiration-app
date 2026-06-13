import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';

export async function fetchDailyContent() {
  const response = await fetch(`${API_URL}/api/content`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function registerPushToken(token) {
  const response = await fetch(`${API_URL}/api/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function removePushToken(token) {
  const encoded = encodeURIComponent(token);
  const response = await fetch(`${API_URL}/api/tokens/${encoded}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
