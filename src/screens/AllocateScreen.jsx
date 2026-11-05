import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { POCKETS } from '../constants/pockets';
import { formatCurrency } from '../utils/formatCurrency';
import { getPockets, savePockets } from '../services/pocketService';
import { getAll } from '../services/transactionService';

export default function AllocateScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [balance, setBalance] = useState(0);
  const [allocations, setAllocations] = useState({ pokok: '', foya: '', wajib: '' });
  const [errors, setErrors] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      setLoading(true);
      const saved = await getPockets();
      const txs = await getAll();

      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const computedBalance = income - expense;

      const initial = {};
      POCKETS.forEach((p) => {
        initial[p.key] = (saved && saved[p.key] && saved[p.key].allocated) || 0;
      });

      setAllocations({ pokok: String(initial.pokok), foya: String(initial.foya), wajib: String(initial.wajib) });
      setBalance(computedBalance);
    } catch (err) {
      Alert.alert('Gagal', 'Gagal memuat data pengaturan.');
    } finally {
      setLoading(false);
    }
  }

  const totalAllocated = Object.values(allocations).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  const remainingUnallocated = balance - totalAllocated;

  function validate() {
    const newErrors = {};
    let total = 0;

    POCKETS.forEach((p) => {
      const v = Number(allocations[p.key]) || 0;
      if (!allocations[p.key].trim()) {
        newErrors[p.key] = `${p.label} wajib diisi`;
      } else if (isNaN(v) || v < 0) {
        newErrors[p.key] = 'Masukkan angka valid';
      } else {
        total += v;
      }
    });

    if (total > balance) {
      newErrors.total = `Total alokasi melebihi saldo kamu. Sisa belum dibagi: ${formatCurrency(remainingUnallocated)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {};
      POCKETS.forEach((p) => {
        payload[p.key] = { allocated: Number(allocations[p.key]) || 0 };
      });
      await savePockets(payload);
      Alert.alert('Berhasil', 'Saldo berhasil dibagi ke kantong tabungan.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Gagal', 'Gagal menyimpan alokasi. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data...</Text>
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
        <View style={styles.header}>
          <Ionicons name="wallet" size={32} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Bagi Saldo ke Kantong</Text>
          <Text style={styles.subtitle}>
            Tentukan berapa dari saldo kamu yang dialokasikan ke setiap kantong.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saldo Total Kamu</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(balance)}</Text>
          <Text style={styles.summarySub}>
            Sisa belum dibagi: {formatCurrency(remainingUnallocated)}
          </Text>
        </View>

        {POCKETS.map((p) => {
          const isNegative = Number(allocations[p.key] || 0) < 0;
          return (
            <View key={p.key} style={styles.inputSection}>
              <Text style={styles.label}>{p.label}</Text>
              <View style={[styles.inputRow, { borderBottomColor: errors[p.key] ? colors.danger : colors.border }]}>
                <Text style={styles.currency}>Rp</Text>
                <TextInput
                  style={[styles.input, errors[p.key] && { borderBottomColor: colors.danger }]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={allocations[p.key]}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    setAllocations((prev) => ({ ...prev, [p.key]: numeric }));
                    if (errors[p.key]) setErrors((prev) => ({ ...prev, [p.key]: null }));
                  }}
                  keyboardType="numeric"
                />
              </View>
              {errors[p.key] && <Text style={styles.errorText}>{errors[p.key]}</Text>}
            </View>
          );
        })}

        {errors.total && <Text style={styles.errorText}>{errors.total}</Text>}

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Simpan Alokasi</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Sisa yang belum dialokasikan tetap muncul sebagai <Text style={styles.hintTextBold}>Total Saldo</Text> di layar utama.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: 16, paddingBottom: 32 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },

  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 24 },

  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  summaryAmount: { fontSize: 28, fontWeight: '800', color: colors.primary },
  summarySub: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },

  inputSection: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 2, paddingBottom: 8 },
  currency: { fontSize: 20, fontWeight: '700', color: colors.textSecondary, marginRight: 6 },
  input: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text, borderWidth: 0, padding: 0 },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },

  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14, marginTop: 12 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  hint: { marginTop: 24, alignItems: 'center', paddingHorizontal: 16 },
  hintText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, textAlign: 'center' },
  hintTextBold: { fontWeight: '600', color: colors.primary },
});
