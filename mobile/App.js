import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { requestPermissionsAndRegister, useNotificationListeners } from './src/services/notifications';
import { colors } from './src/constants/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    requestPermissionsAndRegister().catch(console.warn);
  }, []);

  const { notificationListener, responseListener } = useNotificationListeners(
    notification => {
      // Notification received while app is in foreground
      console.log('Notification received:', notification.request.content.title);
    },
    response => {
      // User tapped a notification — navigate to Home
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    }
  );

  useEffect(() => {
    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            letterSpacing: 0.5,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Home: focused ? 'home' : 'home-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
