import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import CategoryBadge from './CategoryBadge';

/**
 * TransactionCard — kartu untuk menampilkan satu transaksi.
 *
 * Props:
 * - transaction: object (data transaksi)
 * - onPress: function (dipanggil saat kartu ditekan)
 */
export default function TransactionCard({ transaction, onPress }) {
  if (!transaction) return null;

  const { title, amount, category, transactionDate, type } = transaction;
  const isIncome = type === 'income';

  const formattedDate = formatDate(transactionDate);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <CategoryBadge category={category} size="sm" />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.date}>{category}</Text>
      </View>

      <Text style={[styles.amount, isIncome && styles.amountIncome]}>
        {isIncome ? '+' : '−'}{formatCurrency(amount)}
      </Text>
    </TouchableOpacity>
  );
}

function formatDate(dateString) {
  if (!dateString) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  amountIncome: {
    color: colors.success,
  },
});
