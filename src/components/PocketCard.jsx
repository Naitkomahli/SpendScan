import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * PocketCard — kartu kantong: nama + saldo saja.
 *
 * Props:
 * - pocket: { label, icon, color, container }
 * - balance: number (saldo kantong)
 * - onPress: function (optional) — buka daftar transaksi kantong
 */
export default function PocketCard({ pocket, balance = 0, onPress }) {
  const isNegative = balance < 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: pocket.container }]}>
        <Ionicons name={pocket.icon} size={18} color={pocket.color} />
      </View>

      <Text style={styles.label} numberOfLines={1}>
        {pocket.label}
      </Text>

      <Text style={[styles.amount, isNegative && styles.amountNegative]}>
        {formatCurrency(balance)}
      </Text>

      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  amountNegative: {
    color: colors.expenseText,
  },
});
