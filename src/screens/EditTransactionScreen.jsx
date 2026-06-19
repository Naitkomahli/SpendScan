import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';
import { getById, update } from '../services/transactionService';

export default function EditTransactionScreen({ route, navigation }) {
  const { id } = route.params;

  // --- State form ---
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [note, setNote] = useState('');

  // --- State UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTransaction();
  }, []);

  /**
   * Ambil data transaksi berdasarkan ID, lalu isi form.
   */
  async function loadTransaction() {
    try {
      setLoading(true);
      const data = await getById(id);

      if (!data) {
        Alert.alert('Error', 'Transaksi tidak ditemukan.', [
          { text: 'Kembali', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // Isi form dengan data yang ada
      setTitle(data.title || '');
      setAmount(String(data.amount || ''));
      setCategory(data.category || '');
      setTransactionDate(data.transactionDate || '');
      setNote(data.note || '');
    } catch (err) {
      Alert.alert('Error', 'Gagal memuat data transaksi.', [
        { text: 'Kembali', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Validasi form sebelum update.
   */
  function validate() {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Judul wajib diisi';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Jumlah wajib diisi';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Jumlah harus angka positif';
    }

    if (!category) {
      newErrors.category = 'Pilih kategori';
    }

    if (!transactionDate) {
      newErrors.transactionDate = 'Tanggal wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Simpan perubahan transaksi.
   */
  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      await update(id, {
        title: title.trim(),
        amount: Number(amount),
        category,
        transactionDate,
        note: note.trim() || null,
      });

      Alert.alert('Berhasil', 'Transaksi berhasil diperbarui.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  // --- Loading State ---
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data transaksi...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- Judul --- */}
        <Text style={styles.label}>Judul</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="Contoh: Makan Siang"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        {/* --- Jumlah --- */}
        <Text style={styles.label}>Jumlah (Rp)</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          placeholder="Contoh: 25000"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={(text) => {
            const numeric = text.replace(/[^0-9]/g, '');
            setAmount(numeric);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
          }}
          keyboardType="numeric"
        />
        {errors.amount && (
          <Text style={styles.errorText}>{errors.amount}</Text>
        )}

        {/* --- Kategori --- */}
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.label;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  isSelected && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  setCategory(cat.label);
                  if (errors.category)
                    setErrors((prev) => ({ ...prev, category: null }));
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}

        {/* --- Tanggal --- */}
        <Text style={styles.label}>Tanggal</Text>
        <TextInput
          style={[styles.input, errors.transactionDate && styles.inputError]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={transactionDate}
          onChangeText={(text) => {
            setTransactionDate(text);
            if (errors.transactionDate)
              setErrors((prev) => ({ ...prev, transactionDate: null }));
          }}
        />
        {errors.transactionDate && (
          <Text style={styles.errorText}>{errors.transactionDate}</Text>
        )}

        {/* --- Catatan --- */}
        <Text style={styles.label}>Catatan (opsional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Contoh: Nasi ayam + es teh"
          placeholderTextColor={colors.textSecondary}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* --- Tombol Simpan --- */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* --- Tombol Batal --- */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 80,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
