import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';

const TYPE_CONFIG = {
  inspiration: { icon: '✊🏾', color: colors.gold, label: 'Inspiration' },
  figure:      { icon: '🌟', color: colors.red,  label: 'Figure' },
  fact:        { icon: '📚', color: colors.green, label: 'Lesson' },
};

function FavoriteItem({ item, onRemove }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.fact;
  const title = item.type === 'inspiration'
    ? `"${item.data.quote?.slice(0, 80)}${item.data.quote?.length > 80 ? '…' : ''}"`
    : item.type === 'figure'
      ? item.data.name
      : item.data.title;
  const subtitle = item.type === 'inspiration'
    ? `— ${item.data.author}`
    : item.type === 'figure'
      ? `${item.data.lifespan} · ${item.data.field}`
      : item.data.category;
  const savedDate = new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{cfg.icon}</Text>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: cfg.color }]} numberOfLines={3}>{title}</Text>
          <Text style={styles.itemSub} numberOfLines={1}>{subtitle}</Text>
          <Text style={styles.itemDate}>Saved {savedDate} · {item.date}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavorites();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? favorites
    : favorites.filter(f => f.type === filter);

  const handleRemove = (id) => {
    Alert.alert('Remove', 'Remove this from your favorites?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(id) }
    ]);
  };

  const filters = [
    { key: 'all', label: 'All', count: favorites.length },
    { key: 'inspiration', label: '✊🏾', count: favorites.filter(f => f.type === 'inspiration').length },
    { key: 'figure', label: '🌟', count: favorites.filter(f => f.type === 'figure').length },
    { key: 'fact', label: '📚', count: favorites.filter(f => f.type === 'fact').length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>FAVORITES</Text>
        <Text style={styles.headerSub}>{favorites.length} saved item{favorites.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label} {f.count > 0 ? `(${f.count})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any quote, figure, or lesson to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FavoriteItem item={item} onRemove={handleRemove} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  accentBar: { width: 40, height: 3, backgroundColor: colors.red, borderRadius: 2, marginBottom: 12 },
  headerTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 4, color: colors.textPrimary },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: {
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,175,55,0.12)' },
  filterLabel: { fontSize: 11, color: colors.textMuted },
  filterLabelActive: { color: colors.gold, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  itemCard: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  itemLeft: { flexDirection: 'row', flex: 1, gap: 10 },
  itemIcon: { fontSize: 22, marginTop: 2 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '600', lineHeight: 19, marginBottom: 3 },
  itemSub: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  itemDate: { fontSize: 10, color: colors.textMuted, fontStyle: 'italic' },
  removeBtn: { padding: 4, marginLeft: 8, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, color: colors.border, marginBottom: 16 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
