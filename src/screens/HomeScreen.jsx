import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { getAll } from '../services/transactionService';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';
import { Skeleton, SkeletonSummaryCard, SkeletonCard } from '../components/Skeleton';

export default function HomeScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  async function fetchTransactions() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAll();
      setTransactions(data);
    } catch (err) {
      setError('Gagal memuat data. Ketuk untuk mencoba lagi.');
    } finally {
      setLoading(false);
    }
  }

  const currentMonth = '2026-06';
  const monthTransactions = transactions.filter((t) =>
    t.transactionDate?.startsWith(currentMonth)
  );
  const monthlyTotal = monthTransactions.reduce(
    (sum, t) => sum + Number(t.amount), 0
  );
  const transactionCount = monthTransactions.length;

  const latestTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Skeleton width={120} height={14} borderRadius={6} />
              <Skeleton width={180} height={24} style={{ marginTop: 6 }} borderRadius={6} />
            </View>
            <Skeleton width={40} height={40} borderRadius={20} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonSummaryCard />
          <View style={styles.actionGrid}>
            <Skeleton width="48%" height={80} borderRadius={12} />
            <Skeleton width="48%" height={80} borderRadius={12} />
          </View>
          <Skeleton width={150} height={18} style={{ marginBottom: 12 }} borderRadius={6} />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTransactions}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Halo, Selamat Pagi</Text>
            <Text style={styles.headerTitle}>Dashboard Keuangan</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Total Pengeluaran Bulan Ini</Text>
            <View style={styles.transactionBadge}>
              <Text style={styles.badgeText}>{transactionCount} Transaksi</Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountPrefix}>Rp</Text>
            <Text style={styles.amountValue}>{formatCurrency(monthlyTotal).replace('Rp', '')}</Text>
          </View>
          <View style={styles.summaryFooter}>
            <Ionicons name="trending-down" size={16} color="#C7C3FF" />
            <Text style={styles.summaryFooterText}>8% lebih rendah dari bulan lalu</Text>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <Ionicons name="analytics" size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Laporan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <Ionicons name="wallet" size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Anggaran</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {latestTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Belum ada transaksi"
            message="Tap tombol di bawah untuk mencatat pengeluaran pertama kamu."
          />
        ) : (
          latestTransactions.map((item) => (
            <TransactionCard
              key={item.id}
              transaction={item}
              onPress={() =>
              navigation.navigate('TransactionDetail', { id: item.id })
            }
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },
  errorText: { marginTop: 12, fontSize: 14, color: colors.danger, textAlign: 'center' },
  retryButton: { marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Header
  header: { backgroundColor: colors.surface, paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: colors.textSecondary },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: 16, paddingBottom: 96 },

  // Summary
  summaryCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 24, marginBottom: 16, overflow: 'hidden' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: '#C7C3FF', fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  transactionBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  amountPrefix: { fontSize: 18, color: '#C7C3FF', fontWeight: '600', marginRight: 4 },
  amountValue: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  summaryFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryFooterText: { fontSize: 13, color: '#C7C3FF' },

  // Action Grid
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, alignItems: 'center' },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '500', color: colors.text },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  seeAll: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
