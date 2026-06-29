import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { getAll } from '../services/transactionService';
import { useAuth } from '../contexts/AuthContext';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';
import { Skeleton, SkeletonSummaryCard, SkeletonCard } from '../components/Skeleton';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchTransactions();
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthData = useMemo(() => {
    const monthTxs = transactions.filter((t) =>
      t.transactionDate?.startsWith(currentMonth)
    );

    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find((c) => c.category === t.category);
        if (existing) {
          existing.total += Number(t.amount);
        } else {
          acc.push({ category: t.category, total: Number(t.amount) });
        }
        return acc;
      }, [])
      .sort((a, b) => b.total - a.total);

    return { income, expense, balance: income - expense, categoryBreakdown };
  }, [transactions, currentMonth]);

  const overallData = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  const latestTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [transactions]
  );

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
          <Skeleton width="100%" height={140} borderRadius={20} style={{ marginBottom: 16 }} />
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
            <Text style={styles.greeting}>Halo, {user?.name || 'Pengguna'}</Text>
            <Text style={styles.headerTitle}>Dashboard Keuangan</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Total Saldo */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <View style={styles.overallIcon}>
              <Ionicons name="wallet" size={20} color="#fff" />
            </View>
            <Text style={styles.overallLabel}>Total Saldo</Text>
          </View>
          <Text style={[styles.overallAmount, overallData.balance >= 0 ? styles.overallPositive : styles.overallNegative]}>
            {formatCurrency(overallData.balance)}
          </Text>
          <Text style={styles.overallSub}>Saldo seluruh akun</Text>
        </View>

        {/* Income & Expense Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            <Text style={styles.summaryAmountIncome}>{formatCurrency(monthData.income)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            <Text style={styles.summaryAmountExpense}>{formatCurrency(monthData.expense)}</Text>
          </View>
        </View>

        {/* Net Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Saldo Bersih Bulan Ini</Text>
            <Text style={[styles.balanceValue, monthData.balance >= 0 ? styles.balancePositive : styles.balanceNegative]}>
              {monthData.balance >= 0 ? '+' : ''}{formatCurrency(monthData.balance)}
            </Text>
          </View>
          <View style={styles.balanceSub}>
            <Ionicons
              name={monthData.balance >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={monthData.balance >= 0 ? colors.success : colors.danger}
            />
            <Text style={[styles.balanceSubText, monthData.balance >= 0 ? { color: colors.success } : { color: colors.danger }]}>
              {monthData.balance >= 0 ? 'Surplus' : 'Defisit'}
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        {monthData.categoryBreakdown.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pengeluaran per Kategori</Text>
          </View>
        )}
        {monthData.categoryBreakdown.slice(0, 5).map((cat) => {
          const pct = monthData.expense > 0
            ? Math.round((cat.total / monthData.expense) * 100)
            : 0;
          return (
            <View key={cat.category} style={styles.categoryRow}>
              <Text style={styles.categoryRowLabel}>{cat.category}</Text>
              <View style={styles.categoryBarBg}>
                <View style={[styles.categoryBarFill, { width: `${pct}%` }]} />
              </View>
              <View style={styles.categoryRowRight}>
                <Text style={styles.categoryRowAmount}>{formatCurrency(cat.total)}</Text>
                <Text style={styles.categoryRowPct}>{pct}%</Text>
              </View>
            </View>
          );
        })}

        {/* Action */}
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Report')} activeOpacity={0.7}>
          <View style={styles.actionIcon}>
            <Ionicons name="analytics" size={22} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Lihat Laporan Keuangan</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

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

  // Income & Expense Summary
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  incomeCard: { backgroundColor: '#F0FDF4' },
  expenseCard: { backgroundColor: '#FEF2F2' },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  summaryAmountIncome: { fontSize: 18, fontWeight: '700', color: colors.success },
  summaryAmountExpense: { fontSize: 18, fontWeight: '700', color: colors.danger },

  // Total Saldo
  overallCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  overallHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  overallIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  overallLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 },
  overallAmount: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 2 },
  overallPositive: { color: '#fff' },
  overallNegative: { color: 'rgba(255,200,200,0.95)' },
  overallSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },

  // Balance
  balanceCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  balanceValue: { fontSize: 22, fontWeight: '700' },
  balancePositive: { color: colors.success },
  balanceNegative: { color: colors.danger },
  balanceSub: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  balanceSubText: { fontSize: 12, fontWeight: '600' },

  // Category Breakdown
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  seeAll: { fontSize: 13, fontWeight: '600', color: colors.primary },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  categoryRowLabel: { fontSize: 12, fontWeight: '600', color: colors.text, width: 90 },
  categoryBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  categoryRowRight: { alignItems: 'flex-end', width: 80 },
  categoryRowAmount: { fontSize: 11, fontWeight: '600', color: colors.text },
  categoryRowPct: { fontSize: 10, color: colors.textSecondary },

  // Action
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 24, gap: 12 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
