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
import { create } from '../services/transactionService';

const INCOME_CATEGORY = 'Pemasukan';

export default function AddTransactionScreen({ route, navigation }) {
  const ocrData = route?.params?.ocrData;

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [source, setSource] = useState('manual');

  const isIncome = type === 'income';
  const accentColor = isIncome ? colors.success : colors.primary;

  useEffect(() => {
    if (ocrData) {
      setType(ocrData.type || 'expense');
      setTitle(ocrData.title || '');
      setAmount(ocrData.amount || '');
      setNote(ocrData.note || '');
      setSource('ocr');

      if (ocrData.transactionDate) {
        setTransactionDate(ocrData.transactionDate);
      }

      if (ocrData.category) {
        setCategory(ocrData.category);
      }
    }
  }, []);

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
    if (!title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!amount.trim()) newErrors.amount = 'Jumlah wajib diisi';
    else if (isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Jumlah harus angka positif';
    if (!isIncome && !category) newErrors.category = 'Pilih kategori';
    if (!transactionDate) newErrors.transactionDate = 'Tanggal wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await create({
        title: title.trim(),
        amount: Number(amount),
        category,
        transactionDate,
        note: note.trim() || null,
        source: source,
        type,
      });
      Alert.alert('Berhasil', 'Transaksi berhasil ditambahkan.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
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

        {/* Amount Field */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Jumlah (IDR)</Text>
          <View style={[styles.amountInputRow, { borderBottomColor: accentColor }]}>
            <Text style={[styles.amountCurrency, { color: accentColor }]}>
              {isIncome ? '+Rp' : '−Rp'}
            </Text>
            <TextInput
              style={[styles.amountInput, errors.amount && { borderBottomColor: colors.danger }]}
              placeholder="0"
              placeholderTextColor={colors.border}
              value={amount}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '');
                setAmount(numeric);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
              }}
              keyboardType="numeric"
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Title */}
        <Text style={styles.label}>Judul Transaksi</Text>
        <TextInput
          style={[styles.input, errors.title && { borderColor: colors.danger }]}
          placeholder={isIncome ? 'Misal: Gaji Bulanan' : 'Misal: Makan Siang'}
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        {/* Category */}
        {isIncome ? (
          <>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.incomeCategoryBox}>
              <Text style={styles.incomeCategoryIcon}>💰</Text>
              <Text style={styles.incomeCategoryLabel}>Pemasukan</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => {
                      setCategory(cat.label);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </>
        )}

        {/* Date */}
        <Text style={styles.label}>Tanggal</Text>
        <View style={styles.dateInputWrapper}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { paddingLeft: 0, borderWidth: 0 }, errors.transactionDate && { color: colors.danger }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={transactionDate}
            onChangeText={setTransactionDate}
          />
        </View>
        {errors.transactionDate && <Text style={styles.errorText}>{errors.transactionDate}</Text>}

        {/* Note */}
        <Text style={styles.label}>Catatan (Opsional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Tambahkan deskripsi singkat..."
          placeholderTextColor={colors.textSecondary}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: accentColor }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
            </>
          )}
        </TouchableOpacity>

        {/* OCR Option */}
        <View style={styles.ocrSection}>
          <Text style={styles.ocrHint}>Atau punya struk fisik?</Text>
          <TouchableOpacity style={styles.ocrButton} onPress={() => navigation.navigate('ScanTab')} activeOpacity={0.7}>
            <Ionicons name="document-scanner-outline" size={20} color={colors.text} />
            <Text style={styles.ocrButtonText}>Pindai Struk dengan OCR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: 16, paddingBottom: 32 },

  // Type Toggle
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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

  // Amount
  amountSection: { marginBottom: 20 },
  amountLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 2, paddingBottom: 8 },
  amountCurrency: { fontSize: 28, fontWeight: '700', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '700', color: colors.text, borderWidth: 0, padding: 0 },

  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },

  // Category
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  categoryChipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  categoryIcon: { fontSize: 16, marginRight: 4 },
  categoryLabel: { fontSize: 13, color: colors.text, fontWeight: '500' },
  categoryLabelSelected: { color: colors.primary, fontWeight: '600' },

  // Income Category
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

  // Date
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },

  // Note
  noteInput: { minHeight: 80 },

  // Save
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14, marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  // OCR
  ocrSection: { alignItems: 'center', marginTop: 24 },
  ocrHint: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  ocrButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondaryContainer, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  ocrButtonText: { fontSize: 13, fontWeight: '600', color: colors.text, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
});
