import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { getPockets, getPocketTransactions } from '../services/pocketService';
import TransactionCard from '../components/TransactionCard';
import EmptyState from '../components/EmptyState';

/**
 * PocketDetailScreen — daftar transaksi milik satu kantong.
 * Dibuka dari kartu kantong di Home.
 */
export default function PocketDetailScreen({ route, navigation }) {
  const { id, name } = route.params || {};

  const [transactions, setTransactions] = useState([]);
  const [pockets, setPockets] = useState([]);
  const [pocket, setPocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id])
  );

  async function load() {
    try {
      setError(null);
      const [list, pocketData] = await Promise.all([
        getPocketTransactions(id),
        getPockets(),
      ]);
      setTransactions(list);
      setPockets(pocketData.pockets);
      setPocket(pocketData.pockets.find((p) => p.id === id) || null);
    } catch (err) {
      setError('Gagal memuat transaksi kantong. Ketuk untuk mencoba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={44} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const balance = pocket?.balance || 0;
  const color = pocket?.color || colors.primary;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.summaryCard, { borderColor: `${color}55` }]}>
          <View style={[styles.summaryIcon, { backgroundColor: `${color}22` }]}>
            <Ionicons name={pocket?.icon || 'wallet'} size={22} color={color} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Saldo kantong</Text>
            <Text style={[styles.summaryAmount, balance < 0 && styles.summaryAmountNegative]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi</Text>
          <Text style={styles.sectionCount}>{transactions.length} transaksi</Text>
        </View>

        {transactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Belum ada transaksi"
            message={`Belum ada transaksi yang ditandai ke ${pocket?.name || name || 'kantong ini'}.`}
          />
        ) : (
          transactions.map((item) => (
            <TransactionCard
              key={item.id}
              transaction={item}
              pockets={pockets}
              onPress={() => navigation.navigate('TransactionDetail', { id: item.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  content: { padding: 16, paddingBottom: 32 },

  errorText: { marginTop: 12, fontSize: 14, color: colors.danger, textAlign: 'center' },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  summaryAmount: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  summaryAmountNegative: { color: colors.danger },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  sectionCount: { fontSize: 12, color: colors.textSecondary },
});
