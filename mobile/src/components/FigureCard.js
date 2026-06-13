import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share,
  Animated, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, fieldColors } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';

const COLLAPSED_HEIGHT = 152;

export default function FigureCard({ figure, date }) {
  const [collapsed, setCollapsed] = useState(true);
  const maxHeightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { isFavorited, toggleFavorite } = useFavorites();

  if (!figure) return null;

  const id = `${date}-figure`;
  const favorited = isFavorited(id);
  const fieldStyle = fieldColors[figure.field] || { bg: '#1A1A1A', text: colors.gold };

  const toggle = () => {
    const toHeight = collapsed ? 800 : COLLAPSED_HEIGHT;
    Animated.parallel([
      Animated.timing(maxHeightAnim, { toValue: toHeight, duration: 320, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: collapsed ? 0 : 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCollapsed(!collapsed);
  };

  const handleFavorite = () => {
    toggleFavorite({ id, type: 'figure', date, data: figure });
  };

  const handleShare = () => {
    Alert.alert('Share', null, [
      {
        text: 'Share as Text',
        onPress: () => Share.share({
          message: `🌟 ${figure.name} (${figure.lifespan})\n${figure.title}\n\n${figure.achievement}\n\nShared from Daily Inspiration · Black Culture & History`
        })
      },
      {
        text: 'Copy to Clipboard',
        onPress: () => Clipboard.setStringAsync(`${figure.name}: ${figure.achievement}`)
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#1A0000', '#0D0000', '#060000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Text style={styles.labelIcon}>🌟</Text>
            <Text style={styles.label}>FIGURE OF THE DAY</Text>
          </View>
          <TouchableOpacity onPress={handleFavorite} style={styles.heartBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={18} color={favorited ? colors.red : colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.collapsibleContent, { maxHeight: maxHeightAnim }]}>
          <View style={styles.redAccent} />

          <View style={styles.nameRow}>
            <Text style={styles.name}>{figure.name}</Text>
            {figure.field ? (
              <View style={[styles.fieldBadge, { backgroundColor: fieldStyle.bg }]}>
                <Text style={[styles.fieldText, { color: fieldStyle.text }]}>
                  {figure.field.toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.lifespan}>{figure.lifespan} · {figure.title}</Text>

          <View style={styles.achievementBox}>
            <Text style={styles.achievementLabel}>ACHIEVEMENT</Text>
            <Text style={styles.achievementText}>{figure.achievement}</Text>
          </View>

          {figure.funFact ? (
            <View style={styles.funFactBox}>
              <Text style={styles.funFactIcon}>💡</Text>
              <Text style={styles.funFactText}>{figure.funFact}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.fadeOverlay, { opacity: fadeAnim }]} pointerEvents="none">
          <LinearGradient colors={['transparent', '#0D0000', '#060000']} style={StyleSheet.absoluteFill} />
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
    shadowColor: colors.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 8,
  },
  card: {
    borderRadius: 16, padding: 24, paddingBottom: 12,
    borderWidth: 1, borderColor: '#2A0000', overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  labelIcon: { fontSize: 14, marginRight: 6 },
  label: { fontSize: 10, letterSpacing: 3, color: colors.red, fontWeight: '700' },
  heartBtn: { padding: 2 },
  collapsibleContent: { overflow: 'hidden' },
  redAccent: { height: 2, width: 40, backgroundColor: colors.red, borderRadius: 1, marginBottom: 14, opacity: 0.7 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  name: { flex: 1, fontSize: 20, fontWeight: '800', color: colors.textPrimary, lineHeight: 26 },
  fieldBadge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 10, marginTop: 3 },
  fieldText: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  lifespan: { fontSize: 12, color: colors.textMuted, marginBottom: 14, fontStyle: 'italic' },
  achievementBox: {
    padding: 12, backgroundColor: 'rgba(206,17,38,0.07)',
    borderRadius: 8, borderLeftWidth: 2, borderLeftColor: colors.red, marginBottom: 10,
  },
  achievementLabel: { fontSize: 9, letterSpacing: 2, color: colors.red, fontWeight: '700', marginBottom: 6 },
  achievementText: { fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  funFactBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8, marginBottom: 4,
  },
  funFactIcon: { fontSize: 14, marginTop: 1 },
  funFactText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.textMuted, fontStyle: 'italic' },
  shareButton: {
    marginTop: 12, alignSelf: 'flex-end',
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: colors.red,
  },
  shareText: { fontSize: 11, color: colors.red, letterSpacing: 1 },
  fadeOverlay: { position: 'absolute', bottom: 36, left: 0, right: 0, height: 64 },
  toggleButton: { marginTop: 10, alignItems: 'center', paddingVertical: 6 },
  toggleInner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 4, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#2A0000',
    backgroundColor: 'rgba(206,17,38,0.05)',
  },
  toggleText: { fontSize: 11, color: colors.textSecondary, letterSpacing: 1 },
  toggleChevron: { fontSize: 11, color: colors.red },
});
