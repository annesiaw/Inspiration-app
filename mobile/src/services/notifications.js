import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function requestPermissionsAndRegister() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { granted: false, token: null };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-inspiration', {
      name: 'Daily Inspiration',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37'
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();

  try {
    await registerPushToken(token);
  } catch (err) {
    console.warn('Could not register token with backend:', err.message);
  }

  return { granted: true, token };
}

export function useNotificationListeners(onNotification, onResponse) {
  return {
    notificationListener: Notifications.addNotificationReceivedListener(onNotification),
    responseListener: Notifications.addNotificationResponseReceivedListener(onResponse)
  };
}
