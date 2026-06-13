import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

const NOTIF_TIME_KEY = '@notif_time';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getNotifTime() {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_TIME_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { hour: 8, minute: 0 };
}

export async function saveNotifTime(hour, minute) {
  await AsyncStorage.setItem(NOTIF_TIME_KEY, JSON.stringify({ hour, minute }));
}

export async function scheduleLocalDailyNotification(hour, minute) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✊🏾 Daily Inspiration',
      body: 'Your daily dose of Black culture, history, and wisdom is ready.',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelLocalNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function requestPermissionsAndRegister() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return { granted: false, token: null };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-inspiration', {
      name: 'Daily Inspiration',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();

  try {
    await registerPushToken(token);
  } catch (err) {
    console.warn('Could not register token with backend:', err.message);
  }

  // Schedule local notification at saved preference
  const { hour, minute } = await getNotifTime();
  try {
    await scheduleLocalDailyNotification(hour, minute);
  } catch (err) {
    console.warn('Could not schedule local notification:', err.message);
  }

  return { granted: true, token };
}

export function useNotificationListeners(onNotification, onResponse) {
  return {
    notificationListener: Notifications.addNotificationReceivedListener(onNotification),
    responseListener: Notifications.addNotificationResponseReceivedListener(onResponse),
  };
}
