import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { colors } from '../constants/colors';

/**
 * CategoryBadge — menampilkan icon kategori dalam bulatan.
 *
 * Props:
 * - category: string (nama kategori, misal "Food & Drink")
 * - size: 'sm' | 'md' (optional, default 'md')
 */
export default function CategoryBadge({ category, size = 'md' }) {
  // Cari icon dari daftar kategori
  const found = CATEGORIES.find(
    (c) => c.label.toLowerCase() === category?.toLowerCase()
  );

  const icon = found?.icon || '📦';
  const dimension = size === 'sm' ? 32 : 40;

  return (
    <View
      style={[
        styles.badge,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      <Text style={[styles.icon, { fontSize: dimension * 0.5 }]}>
        {icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
