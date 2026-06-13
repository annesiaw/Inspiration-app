import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share,
  Animated, Platform, UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const COLLAPSED_HEIGHT = 168;

export default function InspirationCard({ inspiration }) {
  const [collapsed, setCollapsed] = useState(true);
  const maxHeightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!inspiration) return null;

  const toggle = () => {
    const toHeight = collapsed ? 800 : COLLAPSED_HEIGHT;
    const toFade = collapsed ? 0 : 1;
    Animated.parallel([
      Animated.timing(maxHeightAnim, {
        toValue: toHeight,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: toFade,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setCollapsed(!collapsed);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${inspiration.quote}"\n\n— ${inspiration.author}, ${inspiration.authorTitle}\n\nShared from Daily Inspiration App`
      });
    } catch {}
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#2A1200', '#1C0A00', '#0D0500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        <View style={styles.labelRow}>
          <Text style={styles.labelIcon}>✊🏾</Text>
          <Text style={styles.label}>TODAY'S INSPIRATION</Text>
        </View>

        <Animated.View style={[styles.collapsibleContent, { maxHeight: maxHeightAnim }]}>
          <Text style={styles.openQuote}>"</Text>
          <Text style={styles.quote}>{inspiration.quote}</Text>
          <Text style={styles.closeQuote}>"</Text>

          <View style={styles.authorDivider} />

          <Text style={styles.authorName}>— {inspiration.author}</Text>
          <Text style={styles.authorTitle}>{inspiration.authorTitle}</Text>
          {inspiration.authorYears ? (
            <Text style={styles.authorYears}>{inspiration.authorYears}</Text>
          ) : null}

          {inspiration.reflection ? (
            <View style={styles.reflectionContainer}>
              <Text style={styles.reflectionLabel}>REFLECTION</Text>
              <Text style={styles.reflectionText}>{inspiration.reflection}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareText}>Share This</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Gradient fade when collapsed */}
        {collapsed && (
          <Animated.View style={[styles.fadeOverlay, { opacity: fadeAnim }]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', '#1C0A00', '#0D0500']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: 40, height: 40, borderTopLeftRadius: 16,
    borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: colors.gold, opacity: 0.3,
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: 40, height: 40, borderBottomRightRadius: 16,
    borderLeftWidth: 1, borderTopWidth: 1,
    borderColor: colors.gold, opacity: 0.3,
  },
  labelRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
  },
  labelIcon: { fontSize: 14, marginRight: 6 },
  label: { fontSize: 10, letterSpacing: 3, color: colors.gold, fontWeight: '700' },
  collapsibleContent: {
    overflow: 'hidden',
  },
  openQuote: {
    fontSize: 72, color: colors.gold, opacity: 0.25,
    position: 'absolute', top: -4, left: 8,
    lineHeight: 60, fontFamily: 'serif',
  },
  quote: {
    fontSize: 18, lineHeight: 28, color: colors.textPrimary,
    fontStyle: 'italic', fontWeight: '500',
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8,
  },
  closeQuote: {
    fontSize: 72, color: colors.gold, opacity: 0.25,
    alignSelf: 'flex-end', lineHeight: 40, marginTop: -20, fontFamily: 'serif',
  },
  authorDivider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  authorName: { fontSize: 15, fontWeight: '700', color: colors.gold },
  authorTitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  authorYears: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  reflectionContainer: {
    marginTop: 16, padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 8, borderLeftWidth: 2, borderLeftColor: colors.gold,
  },
  reflectionLabel: { fontSize: 9, letterSpacing: 2, color: colors.gold, fontWeight: '700' },
  reflectionText: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 6 },
  shareButton: {
    marginTop: 16, alignSelf: 'flex-end',
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: colors.gold,
  },
  shareText: { fontSize: 11, color: colors.gold, letterSpacing: 1 },
  fadeOverlay: {
    position: 'absolute',
    bottom: 36,
    left: 0, right: 0,
    height: 64,
  },
  toggleButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleInner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 4, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  toggleText: { fontSize: 11, color: colors.textSecondary, letterSpacing: 1 },
  toggleChevron: { fontSize: 11, color: colors.gold },
});
