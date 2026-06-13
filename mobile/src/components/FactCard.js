import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share,
  Animated, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, categoryColors } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';

const COLLAPSED_HEIGHT = 152;

export default function FactCard({ fact, date }) {
  const [collapsed, setCollapsed] = useState(true);
  const maxHeightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { isFavorited, toggleFavorite } = useFavorites();

  if (!fact) return null;

  const id = `${date}-fact`;
  const favorited = isFavorited(id);
  const catStyle = categoryColors[fact.category] || { bg: '#1C1C1C', text: colors.gold };

  const toggle = () => {
    Animated.parallel([
      Animated.timing(maxHeightAnim, {
        toValue: collapsed ? 800 : COLLAPSED_HEIGHT,
        duration: 320, useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: collapsed ? 0 : 1,
        duration: 200, useNativeDriver: true,
      }),
    ]).start();
    setCollapsed(!collapsed);
  };

  const handleFavorite = () => {
    toggleFavorite({ id, type: 'fact', date, data: fact });
  };

  const shareText = `📚 ${fact.title}\n\n${fact.content}\n\nShared from Daily Inspiration · Black Culture & History`;

  const handleShare = () => {
    Alert.alert('Share', null, [
      { text: 'Share as Text', onPress: () => Share.share({ message: shareText }) },
      {
        text: 'Copy to Clipboard',
        onPress: () => Clipboard.setStringAsync(`${fact.title}: ${fact.content}`)
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#001A0A', '#001205', '#000A03']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Text style={styles.labelIcon}>📚</Text>
            <Text style={styles.label}>TODAY'S LESSON</Text>
          </View>
          <View style={styles.topRight}>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.categoryText, { color: catStyle.text }]}>
                {fact.category?.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity onPress={handleFavorite} style={styles.heartBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={18} color={favorited ? colors.red : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[styles.collapsibleContent, { maxHeight: maxHeightAnim }]}>
          <View style={styles.greenAccent} />
          <Text style={styles.title}>{fact.title}</Text>
          <Text style={styles.content}>{fact.content}</Text>

          {fact.significance ? (
            <View style={styles.significanceBox}>
              <Text style={styles.significanceLabel}>WHY IT MATTERS</Text>
              <Text style={styles.significanceText}>{fact.significance}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={12} color={colors.green} style={{ marginRight: 4 }} />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.fadeOverlay, { opacity: fadeAnim }]} pointerEvents="none">
          <LinearGradient colors={['transparent', '#001205', '#000A03']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <TouchableOpacity style={styles.toggleButton} onPress={toggle}>
          <View style={styles.toggleInner}>
            <Text style={styles.toggleText}>{collapsed ? 'Read More' : 'Collapse'}</Text>
            <Text style={styles.toggleChevron}>{collapsed ? '▾' : '▴'}</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16, marginVertical: 8,
    borderRadius: 16,
    shadowColor: colors.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  card: {
    borderRadius: 16, padding: 24, paddingBottom: 12,
    borderWidth: 1, borderColor: '#001A08', overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  labelIcon: { fontSize: 14, marginRight: 6 },
  label: { fontSize: 10, letterSpacing: 3, color: colors.green, fontWeight: '700' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12 },
  categoryText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  heartBtn: { padding: 2 },
  collapsibleContent: { overflow: 'hidden' },
  greenAccent: { height: 2, width: 40, backgroundColor: colors.green, borderRadius: 1, marginBottom: 12, opacity: 0.7 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 10, lineHeight: 24 },
  content: { fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  significanceBox: {
    marginTop: 16, padding: 12,
    backgroundColor: 'rgba(0, 154, 68, 0.08)',
    borderRadius: 8, borderLeftWidth: 2, borderLeftColor: colors.green,
  },
  significanceLabel: { fontSize: 9, letterSpacing: 2, color: colors.green, fontWeight: '700', marginBottom: 6 },
  significanceText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary, fontStyle: 'italic' },
  shareButton: {
    marginTop: 16, alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.green,
  },
  shareText: { fontSize: 11, color: colors.green, letterSpacing: 1 },
  fadeOverlay: { position: 'absolute', bottom: 36, left: 0, right: 0, height: 56 },
  toggleButton: { marginTop: 10, alignItems: 'center', paddingVertical: 6 },
  toggleInner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 4, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#001A08',
    backgroundColor: 'rgba(0,154,68,0.05)',
  },
  toggleText: { fontSize: 11, color: colors.textSecondary, letterSpacing: 1 },
  toggleChevron: { fontSize: 11, color: colors.green },
});
