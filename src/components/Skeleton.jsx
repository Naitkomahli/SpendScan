import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

/**
 * Skeleton — komponen loading placeholder dengan animasi shimmer.
 *
 * Props:
 * - width: number | string (default '100%')
 * - height: number (default 20)
 * - borderRadius: number (default 8)
 * - style: object (style tambahan)
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

/**
 * SkeletonCard — kartu skeleton untuk transaksi.
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.cardContent}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={80} height={14} borderRadius={6} />
    </View>
  );
}

/**
 * SkeletonSummaryCard — skeleton untuk kartu ringkasan Home.
 */
export function SkeletonSummaryCard() {
  return (
    <View style={styles.summaryCard}>
      <Skeleton width="50%" height={12} borderRadius={6} />
      <Skeleton width="70%" height={36} style={{ marginTop: 12 }} />
      <Skeleton width="40%" height={12} style={{ marginTop: 12 }} borderRadius={6} />
    </View>
  );
}

/**
 * SkeletonDetail — skeleton untuk halaman detail.
 */
export function SkeletonDetail() {
  return (
    <View style={styles.detailContainer}>
      {/* Hero */}
      <Skeleton width="100%" height={160} borderRadius={16} />
      {/* Info grid */}
      <View style={styles.detailGrid}>
        <Skeleton width="48%" height={80} borderRadius={12} />
        <Skeleton width="48%" height={80} borderRadius={12} />
      </View>
      {/* Note */}
      <Skeleton width="100%" height={100} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
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
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailContainer: {
    padding: 16,
    gap: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
