import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  SectionList,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';
import { getAll } from '../services/transactionService';
import { Skeleton, SkeletonCard } from '../components/Skeleton';
import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';

function formatDateLabel(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateString === todayStr) return 'Hari Ini';
  if (dateString === yesterdayStr) return 'Kemarin';

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function TransactionListScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  const monthOptions = useMemo(() => {
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
  }, [transactions]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const defaultMonth = monthOptions.length > 0
    ? monthOptions[monthOptions.length - 1].value
    : currentMonth;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  async function fetchTransactions() {
    try {
      setError(null);
      const data = await getAll();
      setTransactions(data);
    } catch (err) {
      setError('Gagal memuat data. Tarik layar untuk mencoba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchTransactions();
  }

  const monthSummary = useMemo(() => {
    const monthTxs = transactions.filter((t) =>
      t.transactionDate?.startsWith(selectedMonth)
    );

    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense };
  }, [transactions, selectedMonth]);

  const filtered = useMemo(() => {
    let filtered = transactions;

    filtered = filtered.filter((t) =>
      t.transactionDate?.startsWith(selectedMonth)
    );

    if (activeFilter !== 'Semua') {
      filtered = filtered.filter((t) => t.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [transactions, activeFilter, searchQuery, selectedMonth]);

  const sections = useMemo(() => {
    const groups = {};
    filtered.forEach((t) => {
      const label = formatDateLabel(t.transactionDate);
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });

    const order = ['Hari Ini', 'Kemarin'];
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      const aIdx = order.indexOf(a);
      const bIdx = order.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return new Date(b) - new Date(a);
    });

    return sorted.map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const currentMonthLabel = monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  // Loading
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <Skeleton width={120} height={22} borderRadius={6} />
          </View>
          <Skeleton width={22} height={22} borderRadius={11} />
        </View>
        <View style={styles.searchWrapper}>
          <Skeleton width="100%" height={44} borderRadius={12} />
        </View>
        <View style={styles.filterRow}>
          <Skeleton width={70} height={34} borderRadius={20} />
          <Skeleton width={80} height={34} borderRadius={20} />
          <Skeleton width={70} height={34} borderRadius={20} />
        </View>
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchTransactions}>Ketuk untuk mencoba lagi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoSmall}>
            <Ionicons name="receipt" size={18} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>SpendScan</Text>
        </View>
        <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowMonthPicker(true)}>
          <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Month Summary */}
      <View style={styles.monthSummary}>
        <View style={styles.monthSummaryLeft}>
          <Ionicons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.monthSummaryText}>{currentMonthLabel}</Text>
        </View>
        <View style={styles.monthSummaryRight}>
          <Text style={styles.monthSummaryIncome}>+{formatCurrency(monthSummary.income)}</Text>
          <Text style={styles.monthSummaryExpense}>−{formatCurrency(monthSummary.expense)}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.outline} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari transaksi..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['Semua', ...CATEGORIES.map((c) => c.label)].map((label) => {
            const isActive = activeFilter === label;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(label)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {sections.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="Belum ada transaksi"
          message="Tambahkan transaksi baru dari halaman Home."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.transactionCard}
              onPress={() => navigation.navigate('TransactionDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <CategoryBadge category={item.category} size="md" />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.cardAmount, item.type === 'income' && styles.cardAmountIncome]}>
                  {item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}
                </Text>
                <View style={[styles.typeBadge, item.type === 'income' ? styles.typeBadgeIncome : styles.typeBadgeExpense]}>
                  <Text style={[styles.typeBadgeText, item.type === 'income' ? styles.typeBadgeTextIncome : styles.typeBadgeTextExpense]}>
                    {item.type === 'income' ? 'INCOME' : 'EXPENSE'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

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
  centerContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },
  errorText: { marginTop: 12, fontSize: 14, color: colors.danger, textAlign: 'center' },
  retryText: { marginTop: 12, fontSize: 14, color: colors.primary, fontWeight: '600' },

  // Header
  header: { backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },
  calendarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Month Summary
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthSummaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthSummaryText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  monthSummaryRight: { flexDirection: 'row', gap: 12 },
  monthSummaryIncome: { fontSize: 12, fontWeight: '700', color: colors.success },
  monthSummaryExpense: { fontSize: 12, fontWeight: '700', color: colors.danger },

  // Search
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  // Filter
  filterWrapper: { marginBottom: 12 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16 },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.3 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#fff' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 12 },

  // Card
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  cardCategory: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 14, fontWeight: '700', color: colors.danger },
  cardAmountIncome: { color: colors.success },
  typeBadge: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeExpense: { backgroundColor: colors.errorContainer },
  typeBadgeIncome: { backgroundColor: colors.primaryContainer },
  typeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  typeBadgeTextExpense: { color: colors.error },
  typeBadgeTextIncome: { color: colors.primary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 320, maxHeight: 320 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemActive: { backgroundColor: colors.primaryContainer, borderRadius: 8 },
  modalItemText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  modalItemTextActive: { color: colors.primary, fontWeight: '700' },
});
