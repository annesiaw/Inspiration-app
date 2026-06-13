import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  Linking, Alert, Platform, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { colors } from '../constants/colors';
import {
  requestPermissionsAndRegister,
  getNotifTime,
  saveNotifTime,
  scheduleLocalDailyNotification,
  cancelLocalNotifications
} from '../services/notifications';

export default function SettingsScreen() {
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime, setNotifTime] = useState(new Date(2026, 0, 1, 8, 0));
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotifEnabled(status === 'granted');
    });
    getNotifTime().then(({ hour, minute }) => {
      const d = new Date();
      d.setHours(hour, minute, 0, 0);
      setNotifTime(d);
    });
  }, []);

  const handleNotifToggle = async (value) => {
    if (value) {
      const result = await requestPermissionsAndRegister();
      setNotifEnabled(result.granted);
      if (!result.granted) {
        Alert.alert(
          'Notifications Blocked',
          'Enable notifications for this app in your device Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert('Notifications On', 'You\'ll receive your daily inspiration at the time you set below.');
      }
    } else {
      await cancelLocalNotifications();
      setNotifEnabled(false);
    }
  };

  const handleTimeChange = async (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!selected) return;
    setNotifTime(selected);
    const hour = selected.getHours();
    const minute = selected.getMinutes();
    await saveNotifTime(hour, minute);
    if (notifEnabled) {
      await scheduleLocalDailyNotification(hour, minute);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>

      {/* Notifications section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.card}>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Daily Inspiration</Text>
              <Text style={styles.rowSub}>Push a daily message to this device</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleNotifToggle}
              trackColor={{ false: colors.border, true: colors.gold }}
              thumbColor={notifEnabled ? colors.goldBright : colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
            disabled={!notifEnabled}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, !notifEnabled && { opacity: 0.4 }]}>Notification Time</Text>
              <Text style={[styles.rowSub, !notifEnabled && { opacity: 0.4 }]}>Tap to change your daily reminder time</Text>
            </View>
            <Text style={[styles.timeValue, !notifEnabled && { opacity: 0.4 }]}>{formatTime(notifTime)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Notifications are scheduled locally on your device and sent at the time you choose above.
        </Text>
      </View>

      {/* iOS inline picker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choose time</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={notifTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant="dark"
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android inline picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={notifTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* About section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.aboutPadding}>
            <Text style={styles.aboutTitle}>Daily Inspiration</Text>
            <Text style={styles.aboutSubtitle}>Black Culture · History · Achievement</Text>
            <Text style={styles.aboutBody}>
              A daily celebration of the richness of Black history and the African diaspora. Each day brings a fresh inspirational quote, a spotlight on a notable figure, and a cultural lesson — all AI-generated to cover the full breadth of Black achievement across centuries and continents.
            </Text>
          </View>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  accentBar: { width: 40, height: 3, backgroundColor: colors.red, borderRadius: 2, marginBottom: 12 },
  headerTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 4, color: colors.textPrimary },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 10, letterSpacing: 3, color: colors.textMuted, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowContent: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  timeValue: { fontSize: 15, color: colors.gold, fontWeight: '700' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 16, fontStyle: 'italic' },
  pickerModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  pickerContainer: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerTitle: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  pickerDone: { fontSize: 15, color: colors.gold, fontWeight: '700' },
  picker: { height: 200 },
  aboutPadding: { padding: 14 },
  aboutTitle: { fontSize: 16, fontWeight: '700', color: colors.gold, marginBottom: 2 },
  aboutSubtitle: { fontSize: 11, color: colors.green, letterSpacing: 1, marginBottom: 10 },
  aboutBody: { fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5 },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 32 },
});
