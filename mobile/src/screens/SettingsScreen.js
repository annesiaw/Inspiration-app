import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { colors } from '../constants/colors';
import { requestPermissionsAndRegister } from '../services/notifications';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    checkPermissions();
  }, []);

  async function checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    setNotificationsEnabled(status === 'granted');
  }

  async function handleNotificationToggle(value) {
    if (value) {
      const result = await requestPermissionsAndRegister();
      setNotificationsEnabled(result.granted);
      if (!result.granted) {
        Alert.alert(
          'Notifications Blocked',
          'Please enable notifications for this app in your device Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert('✅ Notifications On', 'You\'ll receive your daily inspiration each morning!');
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert(
        'Turn Off Notifications',
        'To stop notifications, go to your device Settings and disable them for this app.',
        [
          { text: 'OK' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Daily Inspiration</Text>
            <Text style={styles.rowSubtitle}>Receive your morning message every day</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: colors.border, true: colors.gold }}
            thumbColor={notificationsEnabled ? colors.goldBright : colors.textMuted}
          />
        </View>
        <Text style={styles.hint}>
          Notifications are sent at 8 AM daily, curated from Black history, culture, and achievement.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Daily Inspiration</Text>
          <Text style={styles.aboutSubtitle}>Black Culture · History · Achievement</Text>
          <Text style={styles.aboutBody}>
            This app celebrates the richness of Black history and the African diaspora. Each day, you receive an inspirational quote from a Black luminary and a curated lesson from the depths of Black history, art, music, science, and culture.{'\n\n'}
            Content is generated fresh daily using AI, drawing on the full breadth of Black achievement across centuries and continents.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONTENT AREAS</Text>
        <View style={styles.tagCloud}>
          {['History', 'Music', 'Art', 'Science', 'Literature', 'Sports', 'Culture', 'Fashion', 'Food', 'Politics'].map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  accentBar: {
    width: 40,
    height: 3,
    backgroundColor: colors.red,
    borderRadius: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.textPrimary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowContent: {
    flex: 1,
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: 2,
  },
  aboutSubtitle: {
    fontSize: 11,
    color: colors.green,
    letterSpacing: 1,
    marginBottom: 12,
  },
  aboutBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 32,
  },
});
