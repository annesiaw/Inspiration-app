import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { fetchScheduledPosts, deleteScheduledPost } from '../services/api';

const PLATFORM_META = {
  facebook:  { label: 'Facebook',  color: '#1877F2', icon: 'logo-facebook' },
  instagram: { label: 'Instagram', color: '#E1306C', icon: 'logo-instagram' },
  tiktok:    { label: 'TikTok',    color: '#69C9D0', icon: 'musical-notes' },
};

const STATUS_META = {
  pending:  { label: 'Scheduled', color: colors.gold,  icon: 'time-outline' },
  posted:   { label: 'Posted',    color: colors.green, icon: 'checkmark-circle-outline' },
  partial:  { label: 'Partial',   color: '#FF8C42',    icon: 'warning-outline' },
  failed:   { label: 'Failed',    color: colors.red,   icon: 'close-circle-outline' },
};

const TABS = ['All', 'Pending', 'Posted', 'Failed'];
const TAB_STATUS = { All: undefined, Pending: 'pending', Posted: 'posted', Failed: 'failed' };

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = d - now;
  if (diff > 0 && diff < 86400000) {
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h === 0) return `in ${m}m`;
    if (m === 0) return `in ${h}h`;
    return `in ${h}h ${m}m`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function PostCard({ post, onDelete, onNavigate }) {
  const status = STATUS_META[post.status] || STATUS_META.pending;

  const handleDelete = () => {
    if (post.status !== 'pending') return;
    Alert.alert('Cancel Post?', 'This will remove the scheduled post.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel Post', style: 'destructive', onPress: () => onDelete(post.id) },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onNavigate(post)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { borderColor: status.color }]}>
          <Ionicons name={status.icon} size={11} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.scheduleTime}>{formatDate(post.scheduledAt)}</Text>
      </View>

      <Text style={styles.postText} numberOfLines={3}>{post.text}</Text>

      {(post.imageUrl || post.videoUrl) && (
        <View style={styles.mediaRow}>
          <Ionicons name={post.videoUrl ? 'videocam-outline' : 'image-outline'} size={13} color={colors.textMuted} />
          <Text style={styles.mediaLabel}>{post.videoUrl ? 'Video attached' : 'Image attached'}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.platformRow}>
          {post.platforms.map(p => {
            const meta = PLATFORM_META[p];
            if (!meta) return null;
            return (
              <View key={p} style={[styles.platformBadge, { borderColor: meta.color }]}>
                <Ionicons name={meta.icon} size={11} color={meta.color} />
                <Text style={[styles.platformText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            );
          })}
        </View>
        {post.status === 'pending' && (
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SchedulerScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchScheduledPosts();
      setPosts(data.posts || []);
    } catch {
      // keep stale data on refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = async (id) => {
    try {
      await deleteScheduledPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const statusFilter = TAB_STATUS[activeTab];
  const visible = statusFilter ? posts.filter(p => p.status === statusFilter) : posts;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>SOCIAL SCHEDULER</Text>
        <TouchableOpacity
          style={styles.accountsBtn}
          onPress={() => navigation.navigate('SocialAccounts')}
        >
          <Ionicons name="key-outline" size={18} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No {activeTab !== 'All' ? activeTab.toLowerCase() + ' ' : ''}posts yet</Text>
          <Text style={styles.emptyHint}>Tap + to schedule a post</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onDelete={handleDelete}
              onNavigate={(post) => navigation.navigate('CreatePost', { post })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12, position: 'relative' },
  accentBar: { width: 40, height: 3, backgroundColor: colors.green, borderRadius: 2, marginBottom: 12 },
  headerTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 4, color: colors.textPrimary },
  accountsBtn: { position: 'absolute', right: 20, top: 28 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.gold },
  tabText: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: colors.textMuted },
  tabTextActive: { color: colors.gold },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  scheduleTime: { fontSize: 11, color: colors.textMuted },
  postText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  mediaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  mediaLabel: { fontSize: 11, color: colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  platformRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  platformBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6 },
  platformText: { fontSize: 10, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: colors.textMuted },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
