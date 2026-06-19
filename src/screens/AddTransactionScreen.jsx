import React, { useState } from 'react';
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
import { create } from '../services/transactionService';

export default function AddTransactionScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!amount.trim()) newErrors.amount = 'Jumlah wajib diisi';
    else if (isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Jumlah harus angka positif';
    if (!category) newErrors.category = 'Pilih kategori';
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
        source: 'manual',
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

  const numericAmount = amount ? Number(amount) : 0;

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
        {/* Amount Field */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Jumlah (IDR)</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.amountCurrency}>Rp</Text>
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
          placeholder="Misal: Makan Siang"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        {/* Category Chips */}
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
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
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
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
          <TouchableOpacity style={styles.ocrButton} activeOpacity={0.7}>
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

  // Amount
  amountSection: { marginBottom: 20 },
  amountLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 2, borderBottomColor: colors.primaryContainer, paddingBottom: 8 },
  amountCurrency: { fontSize: 28, fontWeight: '700', color: colors.primary, marginRight: 6 },
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

  // Date
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },

  // Note
  noteInput: { minHeight: 80 },

  // Save
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  // OCR
  ocrSection: { alignItems: 'center', marginTop: 24 },
  ocrHint: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  ocrButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondaryContainer, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  ocrButtonText: { fontSize: 13, fontWeight: '600', color: colors.text, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
});
