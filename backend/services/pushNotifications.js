const { Expo } = require('expo-server-sdk');

const expo = new Expo();
const registeredTokens = new Set();

function registerToken(token) {
  if (!Expo.isExpoPushToken(token)) {
    throw new Error(`Invalid Expo push token: ${token}`);
  }
  registeredTokens.add(token);
}

function removeToken(token) {
  registeredTokens.delete(token);
}

function getTokenCount() {
  return registeredTokens.size;
}

async function sendDailyNotification(content) {
  if (registeredTokens.size === 0) {
    console.log('No registered tokens — skipping push notification.');
    return;
  }

  const messages = [...registeredTokens].map(token => ({
    to: token,
    sound: 'default',
    title: `✊🏾 Daily Inspiration — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    body: `"${content.inspiration.quote.slice(0, 100)}${content.inspiration.quote.length > 100 ? '…' : ''}" — ${content.inspiration.author}`,
    data: { screen: 'Home' }
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error('Push notification chunk error:', err);
    }
  }

  // Remove tokens that are no longer valid
  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      const token = messages[index].to;
      console.log(`Removing invalid token: ${token}`);
      registeredTokens.delete(token);
    }
  });

  console.log(`Sent notifications to ${messages.length} device(s).`);
  return tickets;
}

module.exports = { registerToken, removeToken, getTokenCount, sendDailyNotification };
