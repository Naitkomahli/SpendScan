import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';

export default function PocketCard({ pocket, allocated = 0, spent = 0 }) {
  const remaining = allocated - spent;
  const isNegative = remaining < 0;
  const pct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: pocket.container }]}>
          <Ionicons name={pocket.icon} size={18} color={pocket.color} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.label}>{pocket.label}</Text>
          <Text style={styles.sub}>Jatah: {formatCurrency(allocated)}</Text>
        </View>
        <View style={styles.amountWrap}>
          <Text
            style={[
              styles.remaining,
              isNegative ? styles.remainingNegative : styles.remainingPositive,
            ]}
          >
            {formatCurrency(remaining)}
          </Text>
          <Text style={styles.spentLabel}>Terpakai: {formatCurrency(spent)}</Text>
        </View>
      </View>

      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${pct}%`,
              backgroundColor: isNegative ? colors.danger : pocket.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleWrap: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  remaining: {
    fontSize: 15,
    fontWeight: '700',
  },
  remainingPositive: {
    color: colors.text,
  },
  remainingNegative: {
    color: colors.expenseText,
  },
  spentLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  barBg: {
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
