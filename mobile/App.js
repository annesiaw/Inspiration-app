import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { requestPermissionsAndRegister, useNotificationListeners } from './src/services/notifications';
import { colors } from './src/constants/colors';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home:      ['home', 'home-outline'],
  Favorites: ['heart', 'heart-outline'],
  Archive:   ['time', 'time-outline'],
  Settings:  ['settings', 'settings-outline'],
};

export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    requestPermissionsAndRegister().catch(console.warn);
  }, []);

  const { notificationListener, responseListener } = useNotificationListeners(
    notification => console.log('Notification received:', notification.request.content.title),
    response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) navigationRef.current.navigate(screen);
    }
  );

  useEffect(() => {
    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  return (
    <FavoritesProvider>
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
            tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.5, fontWeight: '600' },
            tabBarIcon: ({ focused, color, size }) => {
              const [active, inactive] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
              return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
            }
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Favorites" component={FavoritesScreen} />
          <Tab.Screen name="Archive" component={ArchiveScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}
