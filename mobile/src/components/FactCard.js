import React from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, categoryColors } from '../constants/colors';

export default function FactCard({ fact }) {
  if (!fact) return null;

  const catStyle = categoryColors[fact.category] || { bg: '#1C1C1C', text: colors.gold };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📚 ${fact.title}\n\n${fact.content}\n\nShared from Daily Inspiration App`
      });
    } catch {}
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#001A0A', '#001205', '#000A03']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Text style={styles.labelIcon}>📚</Text>
            <Text style={styles.label}>TODAY'S LESSON</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>
              {fact.category?.toUpperCase()}
            </Text>
          </View>
        </View>

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
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#001A08',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.green,
    fontWeight: '700',
  },
  categoryBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  greenAccent: {
    height: 2,
    width: 40,
    backgroundColor: colors.green,
    borderRadius: 1,
    marginBottom: 14,
    opacity: 0.7,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 24,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  significanceBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 154, 68, 0.08)',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.green,
  },
  significanceLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: colors.green,
    fontWeight: '700',
    marginBottom: 6,
  },
  significanceText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  shareButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.green,
  },
  shareText: {
    fontSize: 11,
    color: colors.green,
    letterSpacing: 1,
  },
});
