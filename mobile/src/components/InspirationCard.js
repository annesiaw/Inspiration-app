import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

export default function InspirationCard({ inspiration }) {
  const [expanded, setExpanded] = useState(false);

  if (!inspiration) return null;

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
        {/* Decorative corner */}
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        <View style={styles.labelRow}>
          <Text style={styles.labelIcon}>✊🏾</Text>
          <Text style={styles.label}>TODAY'S INSPIRATION</Text>
        </View>

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
          <TouchableOpacity
            style={styles.reflectionContainer}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.8}
          >
            <View style={styles.reflectionHeader}>
              <Text style={styles.reflectionLabel}>REFLECTION</Text>
              <Text style={styles.reflectionToggle}>{expanded ? '▲' : '▼'}</Text>
            </View>
            {expanded && (
              <Text style={styles.reflectionText}>{inspiration.reflection}</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share This</Text>
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
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopLeftRadius: 16,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold,
    opacity: 0.3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomRightRadius: 16,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.gold,
    opacity: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.gold,
    fontWeight: '700',
  },
  openQuote: {
    fontSize: 72,
    color: colors.gold,
    opacity: 0.25,
    position: 'absolute',
    top: 36,
    left: 16,
    lineHeight: 60,
    fontFamily: 'serif',
  },
  quote: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textPrimary,
    fontStyle: 'italic',
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeQuote: {
    fontSize: 72,
    color: colors.gold,
    opacity: 0.25,
    alignSelf: 'flex-end',
    lineHeight: 40,
    marginTop: -20,
    fontFamily: 'serif',
  },
  authorDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gold,
  },
  authorTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  authorYears: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  reflectionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: colors.gold,
    fontWeight: '700',
  },
  reflectionToggle: {
    fontSize: 9,
    color: colors.textMuted,
  },
  reflectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 8,
  },
  shareButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  shareText: {
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1,
  },
});
