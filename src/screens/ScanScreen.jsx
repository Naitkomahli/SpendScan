import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { scanReceipt, create as createTransaction } from '../services/transactionService';

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState({ index: -1, name: '', amount: '' });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setImage(null);
        setOcrResult(null);
        setError(null);
        setShowRawText(false);
      };
    }, [])
  );

  async function requestPermission(type) {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Akses kamera diperlukan untuk memotret struk.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Akses galeri diperlukan untuk memilih gambar.');
        return false;
      }
    }
    return true;
  }

  async function pickImage(type) {
    setShowOptions(false);
    const hasPermission = await requestPermission(type);
    if (!hasPermission) return;

    try {
      const options = {
        mediaTypes: ['images'],
        quality: 0.8,
      };

      const result = type === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
        setOcrResult(null);
        setError(null);
        setShowRawText(false);
      }
    } catch (err) {
      Alert.alert('Gagal', 'Tidak dapat mengakses kamera/galeri.');
    }
  }

  async function handleScan() {
    if (!image) return;

    setLoading(true);
    setError(null);
    try {
      const result = await scanReceipt(image);
      setOcrResult(result);
      setItems(result.items || []);
      setShowRawText(false);
    } catch (err) {
      setError(err.message || 'Gagal memproses struk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function handleSaveTransaction() {
    if (!ocrResult) return;

    const parsed = ocrResult.parsed || {};
    const categoryMatch = CATEGORIES.find((c) =>
      parsed.category && c.label.toLowerCase().includes(parsed.category.toLowerCase())
    );

    const ocrData = {
      title: parsed.title || '',
      amount: parsed.amount ? String(parsed.amount) : '',
      transactionDate: parsed.transactionDate || new Date().toISOString().split('T')[0],
      category: categoryMatch?.label || 'Other',
      note: ocrResult.rawText || '',
      type: 'expense',
      receiptImageUrl: ocrResult.imageUrl || '',
    };

    navigation.navigate('HomeTab', {
      screen: 'AddTransaction',
      params: { ocrData },
    });
  }

  function handleReset() {
    setImage(null);
    setOcrResult(null);
    setError(null);
    setShowRawText(false);
    setItems([]);
  }

  function handleEditItem(index) {
    const item = items[index];
    setEditItem({ index, name: item.name, amount: String(item.amount) });
    setEditModal(true);
  }

  function handleSaveEdit() {
    const { index, name, amount } = editItem;
    if (!name.trim() || !amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Nama dan jumlah harus valid');
      return;
    }
    const updated = [...items];
    updated[index] = { name: name.trim(), amount: Number(amount) };
    setItems(updated);
    setEditModal(false);
  }

  function handleDeleteItem(index) {
    Alert.alert('Hapus Item', `Hapus "${items[index].name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          const updated = items.filter((_, i) => i !== index);
          setItems(updated);
        },
      },
    ]);
  }

  function handleAddItem() {
    const newItem = { name: '', amount: 0 };
    const updated = [...items, newItem];
    setItems(updated);
    setEditItem({ index: updated.length - 1, name: '', amount: '' });
    setEditModal(true);
  }

  async function handleSaveAll() {
    if (items.length === 0) {
      Alert.alert('Tidak ada item', 'Tambahkan minimal 1 item.');
      return;
    }

    setSaving(true);
    try {
      const transactionDate = ocrResult?.transactionDate || new Date().toISOString().split('T')[0];
      const receiptImageUrl = ocrResult?.imageUrl || image?.uri || null;

      for (const item of items) {
        await createTransaction({
          title: item.name,
          amount: item.amount,
          category: 'Food & Drink',
          transactionDate,
          note: receiptImageUrl ? `OCR: ${ocrResult?.rawText || ''}`.substring(0, 200) : '',
          source: 'ocr',
          type: 'expense',
        });
      }

      Alert.alert('Berhasil', `${items.length} transaksi berhasil disimpan.`, [
        { text: 'OK', onPress: () => handleReset() },
      ]);
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  const isResultReady = ocrResult && !loading;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {!image ? (
        // ── Empty State ──────────────────────────────────────────
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={48} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Pindai Struk Belanja</Text>
          <Text style={styles.emptySubtitle}>
            Ambil foto struk belanja kamu{'\n'}dan biarkan kami membaca datanya
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowOptions(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Ambil Gambar</Text>
          </TouchableOpacity>

          <Text style={styles.emptyFootnote}>
            Atau pilih dari galeri
          </Text>
        </View>
      ) : (
        // ── Has Image State ──────────────────────────────────────
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={styles.backChip}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
                <Text style={styles.backChipText}>Kembali</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Pindai Struk</Text>
              <View style={{ width: 80 }} />
            </View>
            <Text style={styles.headerSubtitle}>
              {isResultReady
                ? 'Hasil pemindaian struk'
                : loading
                  ? 'Memproses gambar...'
                  : 'Konfirmasi gambar lalu scan'}
            </Text>
          </View>

          {/* Image Preview */}
          <View style={styles.imageCard}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="contain" />
            {loading && (
              <View style={styles.imageOverlay}>
                <View style={styles.overlayGlass}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.overlayText}>Memproses OCR...</Text>
                  <Text style={styles.overlaySubtext}>Membaca teks dari gambar</Text>
                </View>
              </View>
            )}
          </View>

          {/* Error State */}
          {error && (
            <View style={styles.errorBox}>
              <View style={styles.errorIconWrap}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
              </View>
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>Gagal Memproses</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          )}

          {/* OCR Result — Items Review */}
          {isResultReady && (
            <View style={styles.section}>
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <View style={styles.resultCardIconWrap}>
                    <Ionicons name="document-text" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.resultCardTitle}>Item Terdeteksi</Text>
                  <View style={styles.resultCardBadge}>
                    <Text style={styles.resultCardBadgeText}>{items.length} item</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {items.length === 0 ? (
                  <View style={styles.noItemsBox}>
                    <Ionicons name="receipt-outline" size={32} color={colors.border} />
                    <Text style={styles.noItemsText}>Tidak ada item terdeteksi</Text>
                    <Text style={styles.noItemsHint}>Klik "Tambah Item" untuk menambahkan manual</Text>
                  </View>
                ) : (
                  items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemNumber}>
                        <Text style={styles.itemNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.itemEditBtn}
                        onPress={() => handleEditItem(index)}
                      >
                        <Ionicons name="create-outline" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.itemDeleteBtn}
                        onPress={() => handleDeleteItem(index)}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Add Item Button */}
              <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem} activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.addItemText}>Tambah Item</Text>
              </TouchableOpacity>

              {/* Raw OCR Text */}
              <TouchableOpacity
                style={styles.rawTextToggle}
                onPress={() => setShowRawText(!showRawText)}
                activeOpacity={0.7}
              >
                <View style={styles.rawTextToggleLeft}>
                  <Ionicons name="code-slash" size={16} color={colors.textSecondary} />
                  <Text style={styles.rawTextToggleLabel}>Lihat teks OCR mentah</Text>
                </View>
                <Ionicons
                  name={showRawText ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showRawText && (
                <View style={styles.rawTextBox}>
                  <Text style={styles.rawTextValue}>
                    {ocrResult.rawText || 'Tidak ada teks'}
                  </Text>
                </View>
              )}

              {/* Hint */}
              <View style={styles.hintBox}>
                <View style={styles.hintIconWrap}>
                  <Ionicons name="information-circle" size={18} color={colors.primary} />
                </View>
                <Text style={styles.hintText}>
                  Edit atau hapus item yang tidak diinginkan. Setiap item akan disimpan sebagai transaksi terpisah.
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {!isResultReady && !loading && (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleScan}
                  activeOpacity={0.85}
                >
                  <Ionicons name="scan" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Scan Struk</Text>
                </TouchableOpacity>
                <View style={styles.secondaryRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setShowOptions(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="image-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.secondaryButtonText}>Ganti Gambar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleReset}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.secondaryButtonText}>Batal</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {isResultReady && (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveAll}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  <View style={styles.saveButtonInner}>
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="save" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>
                          Simpan Semua ({items.length} item)
                        </Text>
                      </>
                    )}
                  </View>
                  <View style={styles.saveButtonArrow}>
                    <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resetLink}
                  onPress={handleReset}
                  disabled={saving}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={16} color={colors.textSecondary} />
                  <Text style={styles.resetLinkText}>Scan Ulang</Text>
                </TouchableOpacity>
              </>
            )}

            {error && !loading && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleScan}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── Edit Item Modal ──────────────────────────────────── */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.editModalCard}>
            <Text style={styles.modalTitle}>Edit Item</Text>

            <Text style={styles.editLabel}>Nama Item</Text>
            <TextInput
              style={styles.editInput}
              value={editItem.name}
              onChangeText={(text) => setEditItem({ ...editItem, name: text })}
              placeholder="Nama barang"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.editLabel}>Jumlah (Rp)</Text>
            <TextInput
              style={styles.editInput}
              value={editItem.amount}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '');
                setEditItem({ ...editItem, amount: numeric });
              }}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />

            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={styles.editModalCancelBtn}
                onPress={() => setEditModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.editModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveBtn}
                onPress={handleSaveEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.editModalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Option Modal: Camera / Gallery ───────────────────── */}
      <Modal visible={showOptions} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pilih Sumber Gambar</Text>
            <Text style={styles.modalSubtitle}>Bagaimana kamu ingin mengambil gambar struk?</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage('camera')}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="camera" size={24} color={colors.primary} />
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionLabel}>Kamera</Text>
                <Text style={styles.modalOptionDesc}>Ambil foto struk langsung</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage('gallery')}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="images" size={24} color={colors.primary} />
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionLabel}>Galeri</Text>
                <Text style={styles.modalOptionDesc}>Pilih dari album foto</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Empty State ────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    marginBottom: 32,
  },
  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  emptyFootnote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },

  // ── Scrollable Content ─────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── Header Section ─────────────────────────────────────────────
  headerSection: {
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── Image Card ─────────────────────────────────────────────────
  imageCard: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayGlass: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  overlaySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },

  // ── Error Box ──────────────────────────────────────────────────
  errorBox: {
    flexDirection: 'row',
    backgroundColor: colors.errorContainer,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  errorIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 2,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },

  // ── Section ────────────────────────────────────────────────────
  section: {
    gap: 12,
    marginBottom: 12,
  },

  // ── Result Card ────────────────────────────────────────────────
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  resultCardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  resultCardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primaryContainer,
  },
  resultCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 8,
  },

  // Result Fields
  resultField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  resultFieldLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  resultFieldValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  resultFieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notDetected: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  amountText: {
    color: colors.text,
    fontWeight: '700',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
  },
  categoryTagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Raw Text ───────────────────────────────────────────────────
  rawTextToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rawTextToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rawTextToggleLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rawTextBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rawTextValue: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // ── Hint ───────────────────────────────────────────────────────
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    padding: 14,
  },
  hintIconWrap: {
    marginTop: 1,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: colors.onPrimaryContainer,
    lineHeight: 18,
  },

  // ── Action Buttons ─────────────────────────────────────────────
  actionSection: {
    gap: 12,
    marginTop: 4,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    alignSelf: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  resetLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // ── Edit Modal ────────────────────────────────────────────────
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  editModalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
  },
  editModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  editModalSaveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  editModalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // ── Item Row ───────────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    gap: 8,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 2,
  },
  itemEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Add Item Button ────────────────────────────────────────────
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // ── No Items ───────────────────────────────────────────────────
  noItemsBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  noItemsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  noItemsHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalOptionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
