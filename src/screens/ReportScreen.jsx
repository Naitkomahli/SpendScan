import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { getAll } from '../services/transactionService';
import { CATEGORIES } from '../constants/categories';

const SCREEN_WIDTH = Dimensions.get('window').width;

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function extractMonthOptions(transactions) {
  const months = new Set();
  transactions.forEach((t) => {
    if (t.transactionDate) {
      months.add(t.transactionDate.substring(0, 7));
    }
  });
  const sorted = [...months].sort();
  return sorted.map((value) => {
    const [y, m] = value.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return { value, label };
  });
}

export default function ReportScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const monthOptions = useMemo(() => extractMonthOptions(transactions), [transactions]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const defaultMonth = monthOptions.length > 0
    ? monthOptions[monthOptions.length - 1].value
    : currentMonth;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  async function fetchTransactions() {
    try {
      setLoading(true);
      const data = await getAll();
      setTransactions(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const monthData = useMemo(() => {
    const monthTxs = transactions.filter((t) =>
      t.transactionDate?.startsWith(selectedMonth)
    );

    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const [year, monthNum] = selectedMonth.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, monthNum);

    const dailyIncome = {};
    const dailyExpense = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const key = String(d);
      dailyIncome[key] = 0;
      dailyExpense[key] = 0;
    }

    monthTxs.forEach((t) => {
      const day = String(new Date(t.transactionDate).getDate());
      if (t.type === 'income') {
        dailyIncome[day] = (dailyIncome[day] || 0) + Number(t.amount);
      } else {
        dailyExpense[day] = (dailyExpense[day] || 0) + Number(t.amount);
      }
    });

    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const step = Math.max(1, Math.floor(daysInMonth / 7));
    for (let d = 1; d <= daysInMonth; d++) {
      const key = String(d);
      labels.push(d % step === 0 || d === 1 || d === daysInMonth ? String(d) : '');
      incomeData.push(dailyIncome[key] || 0);
      expenseData.push(dailyExpense[key] || 0);
    }

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

    const maxVal = Math.max(...incomeData, ...expenseData, 1);

    return {
      income,
      expense,
      balance: income - expense,
      categoryBreakdown,
      labels,
      incomeData,
      expenseData,
      maxVal,
    };
  }, [transactions, selectedMonth]);

  const currentMonthLabel = monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  const categoryColorMap = {
    'Food & Drink': '#EF4444',
    'Transportation': '#3B82F6',
    'Shopping': '#8B5CF6',
    'Bills': '#F59E0B',
    'Health': '#10B981',
    'Education': '#6366F1',
    'Entertainment': '#EC4899',
    'Other': '#6B7280',
  };

  return (
    <View style={styles.container}>
      {/* Header with Month Selector */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Keuangan</Text>
        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowMonthPicker(true)}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.monthText}>{currentMonthLabel}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Line Chart */}
        {!loading && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Tren Bulanan</Text>
            <LineChart
              data={{
                labels: monthData.labels,
                datasets: [
                  {
                    data: monthData.incomeData.length > 0 ? monthData.incomeData : [0],
                    color: () => colors.success,
                    strokeWidth: 2,
                  },
                  {
                    data: monthData.expenseData.length > 0 ? monthData.expenseData : [0],
                    color: () => colors.danger,
                    strokeWidth: 2,
                  },
                ],
                legend: ['Pemasukan', 'Pengeluaran'],
              }}
              width={SCREEN_WIDTH - 64}
              height={200}
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: () => colors.textSecondary,
                labelColor: () => colors.textSecondary,
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '4 4',
                  stroke: colors.border,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            <Text style={[styles.summaryAmount, { color: colors.success }]}>
              {formatCurrency(monthData.income)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEF2F2' }]}>
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            <Text style={[styles.summaryAmount, { color: colors.danger }]}>
              {formatCurrency(monthData.expense)}
            </Text>
          </View>
        </View>

        {/* Net Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Bersih</Text>
          <Text style={[styles.balanceValue, monthData.balance >= 0 ? { color: colors.success } : { color: colors.danger }]}>
            {monthData.balance >= 0 ? '+' : ''}{formatCurrency(monthData.balance)}
          </Text>
        </View>

        {/* Category Breakdown */}
        {monthData.categoryBreakdown.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Pengeluaran per Kategori</Text>
            {monthData.categoryBreakdown.map((cat) => {
              const pct = monthData.expense > 0
                ? Math.round((cat.total / monthData.expense) * 100)
                : 0;
              const catInfo = CATEGORIES.find((c) => c.label === cat.category);
              const barColor = categoryColorMap[cat.category] || colors.primary;
              return (
                <View key={cat.category} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <Text style={styles.categoryIcon}>{catInfo?.icon || '📦'}</Text>
                    <Text style={styles.categoryLabel}>{cat.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>{formatCurrency(cat.total)}</Text>
                    <Text style={styles.categoryPct}>{pct}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Bulan</Text>
            <FlatList
              data={monthOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isActive = item.value === selectedMonth;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isActive && styles.modalItemActive]}
                    onPress={() => {
                      setSelectedMonth(item.value);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, isActive && styles.modalItemTextActive]}>
                      {item.label}
                    </Text>
                    {isActive && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Header
  header: {
    backgroundColor: colors.surface,
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  monthText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  chart: { borderRadius: 12 },

  // Summary
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  summaryAmount: { fontSize: 18, fontWeight: '700' },

  // Balance
  balanceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  balanceValue: { fontSize: 22, fontWeight: '700' },

  // Section
  sectionBlock: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },

  // Category
  categoryRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  categoryRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryAmount: { fontSize: 14, fontWeight: '700', color: colors.text },
  categoryPct: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  barBg: {
    height: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    maxHeight: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemActive: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
