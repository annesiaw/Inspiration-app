import React, { useState, useEffect, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, RefreshControl,
  ActivityIndicator, Text, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import InspirationCard from '../components/InspirationCard';
import FigureCard from '../components/FigureCard';
import FactCard from '../components/FactCard';
import { fetchDailyContent } from '../services/api';
import { colors } from '../constants/colors';

export default function HomeScreen() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadContent = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchDailyContent();
      setContent(data);
    } catch {
      setError('Could not load today\'s content.\nCheck your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading today's inspiration...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>✊🏾</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadContent()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadContent(true)}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        <Header date={content?.date} />
        <InspirationCard inspiration={content?.inspiration} date={content?.date} />
        <FigureCard figure={content?.figure} date={content?.date} />
        <FactCard fact={content?.fact} date={content?.date} />
        <Text style={styles.footer}>Pull down to refresh · Tap ♡ to save</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 16, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  retryButton: { paddingVertical: 10, paddingHorizontal: 28, borderRadius: 24, borderWidth: 1, borderColor: colors.gold },
  retryText: { color: colors.gold, fontSize: 13, letterSpacing: 1 },
  footer: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 16, letterSpacing: 0.5 },
});
