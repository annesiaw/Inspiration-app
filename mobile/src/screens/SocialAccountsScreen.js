import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { fetchSocialCredentials, saveSocialCredentials, removeSocialCredentials } from '../services/api';

const PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: 'logo-facebook',
    fields: [
      { key: 'pageId', label: 'Page ID', placeholder: '1234567890', secure: false },
      { key: 'pageAccessToken', label: 'Page Access Token', placeholder: 'EAABsB...', secure: true },
    ],
    helpText: 'Get a Page Access Token from Meta for Developers → Graph API Explorer. Your app needs pages_manage_posts permission.',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: 'logo-instagram',
    fields: [
      { key: 'igUserId', label: 'Instagram User ID', placeholder: '17841400...', secure: false },
      { key: 'accessToken', label: 'Access Token', placeholder: 'EAABsB...', secure: true },
    ],
    helpText: 'Requires a Business or Creator Instagram account linked to a Facebook Page. Use the same token as Facebook (with instagram_content_publish permission).',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    color: '#69C9D0',
    icon: 'musical-notes',
    fields: [
      { key: 'accessToken', label: 'Access Token', placeholder: 'act.example...', secure: true },
    ],
    helpText: 'Obtain a user access token from the TikTok for Developers portal with the video.publish scope. Video posts only.',
  },
];

function PlatformSection({ platform, configured, onSaved, onRemoved }) {
  const [expanded, setExpanded] = useState(false);
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleSave = async () => {
    const missing = platform.fields.find(f => !fields[f.key]?.trim());
    if (missing) {
      Alert.alert('Missing field', `${missing.label} is required.`);
      return;
    }
    setSaving(true);
    try {
      await saveSocialCredentials(platform.id, fields);
      onSaved(platform.id);
      setExpanded(false);
      setFields({});
      Alert.alert('Saved', `${platform.label} account connected.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      `Disconnect ${platform.label}?`,
      'Your saved credentials will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await removeSocialCredentials(platform.id);
              onRemoved(platform.id);
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.platformCard}>
      <TouchableOpacity
        style={styles.platformHeader}
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.platformLeft}>
          <View style={[styles.platformIcon, { backgroundColor: platform.color + '22' }]}>
            <Ionicons name={platform.icon} size={20} color={platform.color} />
          </View>
          <View>
            <Text style={styles.platformLabel}>{platform.label}</Text>
            <Text style={[styles.platformStatus, { color: configured ? colors.green : colors.textMuted }]}>
              {configured ? '● Connected' : '○ Not connected'}
            </Text>
          </View>
        </View>
        <View style={styles.platformRight}>
          {configured && (
            <TouchableOpacity
              onPress={handleRemove}
              disabled={removing}
              style={styles.removeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {removing
                ? <ActivityIndicator size="small" color={colors.red} />
                : <Ionicons name="unlink-outline" size={18} color={colors.red} />
              }
            </TouchableOpacity>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.platformForm}>
          <Text style={styles.helpText}>{platform.helpText}</Text>
          {platform.fields.map(f => (
            <View key={f.key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{f.label.toUpperCase()}</Text>
              <TextInput
                style={styles.fieldInput}
                value={fields[f.key] || ''}
                onChangeText={v => setFields(prev => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={f.secure}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={colors.background} />
              : <Text style={styles.saveBtnText}>{configured ? 'Update Credentials' : 'Connect Account'}</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function SocialAccountsScreen({ navigation }) {
  const [configured, setConfigured] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialCredentials()
      .then(data => setConfigured(data.configured || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (platform) => setConfigured(prev => ({ ...prev, [platform]: true }));
  const handleRemoved = (platform) => setConfigured(prev => ({ ...prev, [platform]: false }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOCIAL ACCOUNTS</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.intro}>
            Connect your social media accounts to schedule and publish posts directly from the app. Credentials are stored on your backend server only.
          </Text>
          {PLATFORMS.map(p => (
            <PlatformSection
              key={p.id}
              platform={p}
              configured={!!configured[p.id]}
              onSaved={handleSaved}
              onRemoved={handleRemoved}
            />
          ))}
        </ScrollView>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 60 },
  intro: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 24 },
  platformCard: {
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, marginBottom: 14, overflow: 'hidden',
  },
  platformHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  platformLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  platformIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  platformLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  platformStatus: { fontSize: 11, marginTop: 2 },
  platformRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  removeBtn: { padding: 4 },
  platformForm: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  helpText: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 16, fontStyle: 'italic' },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 9, letterSpacing: 2.5, color: colors.textMuted, fontWeight: '700', marginBottom: 6 },
  fieldInput: {
    backgroundColor: colors.surfaceLight, borderRadius: 8, borderWidth: 1,
    borderColor: colors.border, padding: 12, color: colors.textPrimary, fontSize: 13,
  },
  saveBtn: {
    backgroundColor: colors.gold, borderRadius: 24,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 14 },
});
