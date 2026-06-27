import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/formatCurrency';
import { getById, deleteById } from '../services/transactionService';
import CategoryBadge from '../components/CategoryBadge';
import { SkeletonDetail } from '../components/Skeleton';

export default function TransactionDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, []);

  async function fetchTransaction() {
    try {
      setLoading(true);
      const data = await getById(id);
      setTransaction(data);
    } catch (err) {
      Alert.alert('Error', 'Gagal memuat detail transaksi.', [
        { text: 'Kembali', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteById(id);
      setShowDeleteModal(false);
      Alert.alert('Berhasil', 'Transaksi berhasil dihapus.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus.');
    } finally {
      setDeleting(false);
    }
  }

  function formatDateDisplay(dateString) {
    if (!dateString) return '-';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dateOnly = dateString.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length !== 3) return dateString;
    return `${parseInt(parts[2])} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonDetail />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="file-tray-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.errorText}>Transaksi tidak ditemukan</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const foundCategory = CATEGORIES.find(
    (c) => c.label.toLowerCase() === transaction.category?.toLowerCase()
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>{foundCategory?.icon || '📦'}</Text>
            </View>
            <View>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{transaction.category}</Text>
              </View>
              <Text style={styles.heroTitle}>{transaction.title}</Text>
            </View>
          </View>
          <View style={styles.heroAmountSection}>
            <Text style={styles.heroAmountLabel}>Jumlah Total</Text>
            <View style={styles.heroAmountRow}>
              <Text style={[styles.heroAmountPrefix, transaction.type === 'income' && { color: colors.success }]}>
                {transaction.type === 'income' ? '+Rp' : '−Rp'}
              </Text>
              <Text style={[styles.heroAmountValue, transaction.type === 'income' && { color: colors.success }]}>
                {formatCurrency(transaction.amount).replace('Rp', '')}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{formatDateDisplay(transaction.transactionDate)}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Tipe</Text>
            <View style={styles.sourceRow}>
              <View style={[styles.typeDot, { backgroundColor: transaction.type === 'income' ? colors.success : colors.danger }]} />
              <Text style={styles.infoValue}>{transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        {transaction.note ? (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.noteLabel}>Catatan</Text>
            </View>
            <Text style={styles.noteText}>{transaction.note}</Text>
          </View>
        ) : null}

        {/* Receipt Image */}
        <View style={styles.receiptSection}>
          <Text style={styles.receiptTitle}>Foto Struk</Text>
          {transaction.receiptImageUrl ? (
            <Image source={{ uri: transaction.receiptImageUrl }} style={styles.receiptImage} resizeMode="contain" />
          ) : (
            <View style={styles.receiptPlaceholder}>
              <View style={styles.receiptIconCircle}>
                <Ionicons name="image-outline" size={28} color={colors.outline} />
              </View>
              <Text style={styles.receiptPlaceholderText}>Belum ada foto struk</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditTransaction', { id: transaction.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteButtonText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hapus Transaksi?</Text>
            <Text style={styles.modalDesc}>Tindakan ini tidak dapat dibatalkan. Data transaksi akan dihapus selamanya.</Text>
            <TouchableOpacity
              style={[styles.modalDeleteBtn, deleting && { opacity: 0.6 }]}
              onPress={confirmDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalDeleteBtnText}>Ya, Hapus</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowDeleteModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  centerContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },
  errorText: { marginTop: 12, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  backButton: { marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  backButtonText: { color: '#fff', fontWeight: '600' },

  // Hero
  heroCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, marginBottom: 16, overflow: 'hidden' },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  heroIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 22 },
  categoryPill: { backgroundColor: colors.secondaryContainer, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 4 },
  categoryPillText: { fontSize: 11, fontWeight: '600', color: colors.secondary },
  heroTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  heroAmountSection: {},
  heroAmountLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  heroAmountRow: { flexDirection: 'row', alignItems: 'baseline' },
  heroAmountPrefix: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginRight: 4 },
  heroAmountValue: { fontSize: 32, fontWeight: '700', color: colors.primary },

  // Info Grid
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginTop: 6, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sourceDot: { width: 8, height: 8, borderRadius: 4 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },

  // Note
  noteCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 16 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  noteLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  noteText: { fontSize: 14, color: colors.text, lineHeight: 20 },

  // Receipt
  receiptSection: { marginBottom: 16 },
  receiptTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  receiptImage: { width: '100%', height: 200, borderRadius: 12, backgroundColor: colors.surfaceContainer },
  receiptPlaceholder: { borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: 'dashed', borderRadius: 12, padding: 32, alignItems: 'center', backgroundColor: colors.surfaceContainerLow },
  receiptIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  receiptPlaceholderText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  receiptPlaceholderHint: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  // Actions
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, gap: 6 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.danger, borderRadius: 16, paddingVertical: 14, gap: 6 },
  deleteButtonText: { color: colors.danger, fontSize: 16, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  modalDeleteBtn: { backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  modalDeleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalCancelBtn: { backgroundColor: colors.surfaceContainer, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCancelBtnText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
