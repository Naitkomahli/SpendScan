import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';
import { colors } from '../constants/colors';

/**
 * CategoryBadge — menampilkan icon kategori atau kantong dalam bulatan.
 *
 * Props:
 * - category: string (nama kategori/kantong, misal "Pokok")
 * - size: 'sm' | 'md' (optional, default 'md')
 * - pockets: array kantong user (optional) — dipakai kalau nama bukan kategori default
 */
export default function CategoryBadge({ category, size = 'md', pockets }) {
  const dimension = size === 'sm' ? 32 : 40;

  const foundCategory = CATEGORIES.find(
    (c) => c.label.toLowerCase() === category?.toLowerCase()
  );

  const foundPocket = !foundCategory && Array.isArray(pockets)
    ? pockets.find((p) => p.name?.toLowerCase() === category?.toLowerCase())
    : null;

  // Kantong custom pakai icon Ionicons + warnanya sendiri
  if (foundPocket) {
    const pocketColor = foundPocket.color || colors.primary;
    return (
      <View
        style={[
          styles.badge,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: `${pocketColor}22`,
          },
        ]}
      >
        <Ionicons
          name={foundPocket.icon || 'wallet'}
          size={dimension * 0.5}
          color={pocketColor}
        />
      </View>
    );
  }

  // Kategori default pakai emoji
  const icon = foundCategory?.icon || '📦';

  return (
    <View
      style={[
        styles.badge,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: foundCategory?.color ? foundCategory.color : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.icon,
          { fontSize: dimension * 0.5, color: foundCategory?.color ? '#fff' : colors.textSecondary },
        ]}
      >
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
