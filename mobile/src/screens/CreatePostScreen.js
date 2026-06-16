import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Modal, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../constants/colors';
import {
  fetchDailyContent,
  createScheduledPost,
  updateScheduledPost,
  fetchSocialCredentials,
} from '../services/api';

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', icon: 'logo-facebook' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: 'logo-instagram' },
  { id: 'tiktok',   label: 'TikTok',    color: '#69C9D0', icon: 'musical-notes' },
];

function PlatformToggle({ platform, selected, configured, onToggle }) {
  const active = selected && configured;
  return (
    <TouchableOpacity
      style={[
        styles.platformBtn,
        active && { borderColor: platform.color, backgroundColor: platform.color + '22' },
        !configured && styles.platformBtnDisabled,
      ]}
      onPress={() => {
        if (!configured) {
          Alert.alert(
            `${platform.label} not connected`,
            `Go to the key icon (top right) to add your ${platform.label} credentials first.`
          );
          return;
        }
        onToggle(platform.id);
      }}
      activeOpacity={0.7}
    >
      <Ionicons name={platform.icon} size={18} color={active ? platform.color : configured ? colors.textSecondary : colors.textMuted} />
      <Text style={[styles.platformBtnText, active && { color: platform.color }, !configured && { color: colors.textMuted }]}>
        {platform.label}
      </Text>
      {!configured && <Text style={styles.notConnectedDot}>○</Text>}
    </TouchableOpacity>
  );
}

export default function CreatePostScreen({ navigation, route }) {
  const editingPost = route.params?.post;
  const isEditing = !!editingPost && editingPost.status === 'pending';

  const [text, setText] = useState(editingPost?.text || '');
  const [imageUrl, setImageUrl] = useState(editingPost?.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(editingPost?.videoUrl || '');
  const [platforms, setPlatforms] = useState(editingPost?.platforms || []);
  const [scheduledAt, setScheduledAt] = useState(
    editingPost ? new Date(editingPost.scheduledAt) : (() => {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 30);
      return d;
    })()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [configured, setConfigured] = useState({ facebook: false, instagram: false, tiktok: false });
  const [showMediaFields, setShowMediaFields] = useState(!!(editingPost?.imageUrl || editingPost?.videoUrl));

  useEffect(() => {
    fetchSocialCredentials()
      .then(data => setConfigured(data.configured || {}))
      .catch(() => {});
  }, []);

  const togglePlatform = useCallback((id) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const loadAIContent = async () => {
    setLoadingAI(true);
    try {
      const data = await fetchDailyContent();
      const inspiration = data.inspiration;
      if (!inspiration) throw new Error('No content available');
      const composed = `"${inspiration.quote}"\n— ${inspiration.author}\n\n${inspiration.reflection || ''}\n\n#BlackHistory #Inspiration #DailyInspiration`.trim();
      setText(composed);
    } catch (err) {
      Alert.alert('Could not load AI content', err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Missing content', 'Please write something to post.');
      return;
    }
    if (platforms.length === 0) {
      Alert.alert('No platforms selected', 'Choose at least one platform to post to.');
      return;
    }
    if (scheduledAt <= new Date()) {
      Alert.alert('Invalid time', 'Scheduled time must be in the future.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        text: text.trim(),
        imageUrl: imageUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        platforms,
        scheduledAt: scheduledAt.toISOString(),
      };

      if (isEditing) {
        await updateScheduledPost(editingPost.id, payload);
      } else {
        await createScheduledPost(payload);
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Failed to save', err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDisplay = (date) =>
    date.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'EDIT POST' : 'NEW POST'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.5 }]}
          >
            {saving
              ? <ActivityIndicator size="small" color={colors.background} />
              : <Text style={styles.saveBtnText}>{isEditing ? 'Update' : 'Schedule'}</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* AI Content Button */}
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={loadAIContent}
            disabled={loadingAI}
            activeOpacity={0.8}
          >
            {loadingAI
              ? <ActivityIndicator size="small" color={colors.gold} />
              : <Ionicons name="sparkles" size={16} color={colors.gold} />
            }
            <Text style={styles.aiBtnText}>
              {loadingAI ? 'Loading inspiration…' : 'Use today\'s AI inspiration'}
            </Text>
          </TouchableOpacity>

          {/* Post Text */}
          <View style={styles.section}>
            <Text style={styles.label}>POST CONTENT</Text>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="What do you want to share?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2200}
            />
            <Text style={styles.charCount}>{text.length} / 2200</Text>
          </View>

          {/* Media fields toggle */}
          <TouchableOpacity
            style={styles.mediaToggle}
            onPress={() => setShowMediaFields(v => !v)}
          >
            <Ionicons
              name={showMediaFields ? 'chevron-up' : 'image-outline'}
              size={16}
              color={colors.textMuted}
            />
            <Text style={styles.mediaToggleText}>
              {showMediaFields ? 'Hide media fields' : 'Add image / video URL'}
            </Text>
          </TouchableOpacity>

          {showMediaFields && (
            <View style={styles.section}>
              <Text style={styles.label}>IMAGE URL</Text>
              <TextInput
                style={styles.urlInput}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.label, { marginTop: 14 }]}>VIDEO URL</Text>
              <TextInput
                style={styles.urlInput}
                value={videoUrl}
                onChangeText={setVideoUrl}
                placeholder="https://example.com/video.mp4"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.mediaHint}>
                Instagram requires an image. TikTok requires a video.
              </Text>
            </View>
          )}

          {/* Platforms */}
          <View style={styles.section}>
            <Text style={styles.label}>POST TO</Text>
            <View style={styles.platformRow}>
              {PLATFORMS.map(p => (
                <PlatformToggle
                  key={p.id}
                  platform={p}
                  selected={platforms.includes(p.id)}
                  configured={!!configured[p.id]}
                  onToggle={togglePlatform}
                />
              ))}
            </View>
            <Text style={styles.platformHint}>
              Tap the key icon in the scheduler to connect accounts
            </Text>
          </View>

          {/* Schedule time */}
          <View style={styles.section}>
            <Text style={styles.label}>SCHEDULED FOR</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.gold} />
                <Text style={styles.dateBtnText}>
                  {scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={16} color={colors.gold} />
                <Text style={styles.dateBtnText}>
                  {scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.scheduleSummary}>{formatDisplay(scheduledAt)}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date picker */}
      {showDatePicker && (
        <Modal transparent animationType="slide">
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choose date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={scheduledAt}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_, d) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (d) {
                    const updated = new Date(scheduledAt);
                    updated.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                    setScheduledAt(updated);
                  }
                }}
                themeVariant="dark"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Time picker */}
      {showTimePicker && (
        <Modal transparent animationType="slide">
          <View style={styles.pickerModal}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choose time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={scheduledAt}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, d) => {
                  if (Platform.OS === 'android') setShowTimePicker(false);
                  if (d) {
                    const updated = new Date(scheduledAt);
                    updated.setHours(d.getHours(), d.getMinutes(), 0, 0);
                    setScheduledAt(updated);
                  }
                }}
                themeVariant="dark"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 3, color: colors.textPrimary },
  saveBtn: {
    backgroundColor: colors.gold, borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 18, minWidth: 80, alignItems: 'center',
  },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 13 },
  scroll: { padding: 20, paddingBottom: 60 },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20,
    backgroundColor: colors.gold + '12',
  },
  aiBtnText: { color: colors.gold, fontWeight: '600', fontSize: 14 },
  section: { marginBottom: 20 },
  label: { fontSize: 10, letterSpacing: 3, color: colors.textMuted, fontWeight: '700', marginBottom: 8 },
  textInput: {
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary,
    fontSize: 15, lineHeight: 22, minHeight: 140,
  },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  mediaToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 16, paddingVertical: 4,
  },
  mediaToggleText: { fontSize: 13, color: colors.textMuted },
  urlInput: {
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, padding: 12, color: colors.textPrimary,
    fontSize: 13,
  },
  mediaHint: { fontSize: 11, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  platformRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  platformBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 24,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  platformBtnDisabled: { opacity: 0.5 },
  platformBtnText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  notConnectedDot: { fontSize: 9, color: colors.textMuted },
  platformHint: { fontSize: 11, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  dateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, padding: 12,
  },
  dateBtnText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  scheduleSummary: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  pickerModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  pickerContainer: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerTitle: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  pickerDone: { fontSize: 15, color: colors.gold, fontWeight: '700' },
});
