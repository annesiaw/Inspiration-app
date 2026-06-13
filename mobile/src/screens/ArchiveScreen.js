import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { fetchArchiveList, fetchArchiveDay } from '../services/api';

function ArchiveRow({ item, expanded, onPress }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const maxHeight = expanded ? 400 : 0;

  useEffect(() => {
    if (expanded && !content) {
      setLoading(true);
      fetchArchiveDay(item.date)
        .then(data => setContent(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [expanded, item.date]);

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowHeader} onPress={onPress} activeOpacity={0.7}>
        <View>
          <Text style={styles.rowDate}>{item.dateFormatted}</Text>
          <Text style={styles.rowHint}>Tap to {expanded ? 'close' : 'read'}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.rowContent}>
          {loading ? (
            <ActivityIndicator color={colors.gold} style={{ marginVertical: 16 }} />
          ) : content ? (
            <>
              {content.inspiration && (
                <View style={styles.contentBlock}>
                  <Text style={styles.blockLabel}>✊🏾 INSPIRATION</Text>
                  <Text style={styles.quoteText}>"{content.inspiration.quote}"</Text>
                  <Text style={styles.authorText}>— {content.inspiration.author}</Text>
                </View>
              )}
              {content.figure && (
                <View style={[styles.contentBlock, styles.figureBlock]}>
                  <Text style={[styles.blockLabel, { color: colors.red }]}>🌟 FIGURE</Text>
                  <Text style={styles.figureName}>{content.figure.name}</Text>
                  <Text style={styles.figureDetail}>{content.figure.lifespan} · {content.figure.field}</Text>
                </View>
              )}
              {content.fact && (
                <View style={[styles.contentBlock, styles.factBlock]}>
                  <Text style={[styles.blockLabel, { color: colors.green }]}>📚 LESSON</Text>
                  <Text style={styles.factTitle}>{content.fact.title}</Text>
                  <Text style={styles.factCat}>{content.fact.category}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.errorText}>Could not load content for this day.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function ArchiveScreen() {
  const [dateList, setDateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArchiveList()
      .then(data => setDateList(data.dates || []))
      .catch(() => setError('Could not load archive.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePress = useCallback((date) => {
    setExpandedDate(prev => prev === date ? null : date);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loadingText}>Loading archive...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>ARCHIVE</Text>
        <Text style={styles.headerSub}>Past {dateList.length} day{dateList.length !== 1 ? 's' : ''}</Text>
      </View>

      {dateList.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No past content yet</Text>
          <Text style={styles.emptySub}>Past days will appear here after the daily job runs.</Text>
        </View>
      ) : (
        <FlatList
          data={dateList}
          keyExtractor={item => item.date}
          renderItem={({ item }) => (
            <ArchiveRow
              item={item}
              expanded={expandedDate === item.date}
              onPress={() => handlePress(item.date)}
            />
          )}
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
  accentBar: { width: 40, height: 3, backgroundColor: colors.gold, borderRadius: 2, marginBottom: 12 },
  headerTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 4, color: colors.textPrimary },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 16, color: colors.textSecondary, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    backgroundColor: colors.surface, borderRadius: 12,
    marginBottom: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  rowHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14,
  },
  rowDate: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  rowHint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowContent: { borderTopWidth: 1, borderTopColor: colors.border, padding: 14 },
  contentBlock: {
    marginBottom: 12, padding: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  figureBlock: { backgroundColor: 'rgba(206,17,38,0.05)' },
  factBlock: { backgroundColor: 'rgba(0,154,68,0.05)' },
  blockLabel: { fontSize: 9, letterSpacing: 2, color: colors.gold, fontWeight: '700', marginBottom: 6 },
  quoteText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 19, marginBottom: 4 },
  authorText: { fontSize: 11, color: colors.gold },
  figureName: { fontSize: 14, color: colors.textPrimary, fontWeight: '700', marginBottom: 2 },
  figureDetail: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  factTitle: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
  factCat: { fontSize: 10, color: colors.textMuted, letterSpacing: 1 },
  errorText: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
