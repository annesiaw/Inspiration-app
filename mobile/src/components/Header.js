import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function Header({ date }) {
  const today = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });

  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      <Text style={styles.appName}>DAILY INSPIRATION</Text>
      <Text style={styles.subtitle}>Black Culture · History · Achievement</Text>
      <Text style={styles.date}>{today}</Text>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  accentBar: {
    flexDirection: 'row',
    width: 60,
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginBottom: 16,
  },
  appName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.gold,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '80%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerSymbol: {
    color: colors.gold,
    marginHorizontal: 8,
    fontSize: 10,
  },
});
