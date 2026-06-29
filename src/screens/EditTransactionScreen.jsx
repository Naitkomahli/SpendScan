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
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { getById, update } from '../services/transactionService';

const INCOME_CATEGORY = 'Pemasukan';

export default function EditTransactionScreen({ route, navigation }) {
  const { id } = route.params;

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isIncome = type === 'income';
  const accentColor = isIncome ? colors.success : colors.primary;

  useEffect(() => {
    loadTransaction();
  }, []);

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

      setTitle(data.title || '');
      setAmount(String(data.amount || ''));
      setCategory(data.category || '');
      setTransactionDate(data.transactionDate || '');
      setNote(data.note || '');
      setType(data.type || 'expense');
    } catch (err) {
      Alert.alert('Error', 'Gagal memuat data transaksi.', [
        { text: 'Kembali', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleTypePress(selectedType) {
    setType(selectedType);
    if (selectedType === 'income') {
      setCategory(INCOME_CATEGORY);
    } else {
      setCategory('');
    }
    setErrors({});
  }

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

    if (!isIncome && !category) {
      newErrors.category = 'Pilih kategori';
    }

    if (!transactionDate) {
      newErrors.transactionDate = 'Tanggal wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

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
        type,
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && { backgroundColor: colors.success, borderColor: colors.success }]}
            onPress={() => handleTypePress('income')}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-up" size={16} color={type === 'income' ? '#fff' : colors.success} />
            <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
              Pemasukan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => handleTypePress('expense')}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-down" size={16} color={type === 'expense' ? '#fff' : colors.primary} />
            <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
              Pengeluaran
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- Judul --- */}
        <Text style={styles.label}>Judul</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder={isIncome ? 'Contoh: Gaji Bulanan' : 'Contoh: Makan Siang'}
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
        {isIncome ? (
          <View style={styles.incomeCategoryBox}>
            <Text style={styles.incomeCategoryIcon}>💰</Text>
            <Text style={styles.incomeCategoryLabel}>Pemasukan</Text>
          </View>
        ) : (
          <>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => {
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
          </>
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
          style={[styles.saveButton, { backgroundColor: accentColor }, saving && styles.saveButtonDisabled]}
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

  // Type Toggle
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
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
  incomeCategoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  incomeCategoryIcon: { fontSize: 20 },
  incomeCategoryLabel: { fontSize: 16, fontWeight: '600', color: colors.success },
  noteInput: {
    minHeight: 80,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
