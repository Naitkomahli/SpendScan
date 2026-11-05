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
import { formatCurrency } from '../utils/formatCurrency';
import { getPockets, updatePocket } from '../services/pocketService';
import { getAll } from '../services/transactionService';

export default function AllocateScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [balance, setBalance] = useState(0);
  const [pockets, setPockets] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [errors, setErrors] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      setLoading(true);
      const [pocketData, txs] = await Promise.all([getPockets(), getAll()]);

      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const initial = {};
      pocketData.pockets.forEach((p) => {
        initial[p.id] = String(p.allocated || 0);
      });

      setPockets(pocketData.pockets);
      setAllocations(initial);
      setBalance(income - expense);
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
  const overAllocated = totalAllocated > balance;

  function validate() {
    const newErrors = {};
    pockets.forEach((p) => {
      const raw = (allocations[p.id] ?? '').trim();
      if (!raw) {
        newErrors[p.id] = `${p.name} wajib diisi`;
      } else if (isNaN(Number(raw)) || Number(raw) < 0) {
        newErrors[p.id] = 'Masukkan angka valid';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await Promise.all(
        pockets.map((p) =>
          updatePocket(p.id, { allocated: Number(allocations[p.id]) || 0 })
        )
      );
      Alert.alert('Berhasil', 'Saldo berhasil dibagi ke kantong.', [
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

  if (pockets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="albums-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Belum ada kantong</Text>
        <Text style={styles.emptyText}>
          Buat kantong dulu sebelum membagi saldo.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('ManagePockets')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Buat Kantong</Text>
        </TouchableOpacity>
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

        {pockets.map((p) => {
          const color = p.color || colors.primary;
          return (
            <View key={p.id} style={styles.inputSection}>
              <View style={styles.labelRow}>
                <View style={[styles.pocketDot, { backgroundColor: `${color}22` }]}>
                  <Ionicons name={p.icon || 'wallet'} size={14} color={color} />
                </View>
                <Text style={styles.label}>{p.name}</Text>
              </View>
              <View style={[styles.inputRow, { borderBottomColor: errors[p.id] ? colors.danger : colors.border }]}>
                <Text style={styles.currency}>Rp</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={allocations[p.id] ?? ''}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    setAllocations((prev) => ({ ...prev, [p.id]: numeric }));
                    if (errors[p.id]) setErrors((prev) => ({ ...prev, [p.id]: null }));
                  }}
                  keyboardType="numeric"
                />
              </View>
              {errors[p.id] && <Text style={styles.errorText}>{errors[p.id]}</Text>}
            </View>
          );
        })}

        {overAllocated && (
          <Text style={styles.warningText}>
            Total alokasi melebihi saldo kamu. Kamu masih bisa menyimpan, tapi saldo
            akan minus.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
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
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, paddingHorizontal: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textSecondary },
  emptyTitle: { marginTop: 12, fontSize: 17, fontWeight: '700', color: colors.text },
  emptyText: { marginTop: 6, fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  emptyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

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
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  pocketDot: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 2, paddingBottom: 8 },
  currency: { fontSize: 20, fontWeight: '700', color: colors.textSecondary, marginRight: 6 },
  input: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text, borderWidth: 0, padding: 0 },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 4 },
  warningText: { fontSize: 12, color: colors.highlight, marginBottom: 8 },

  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14, marginTop: 12, backgroundColor: colors.primary },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  hint: { marginTop: 24, alignItems: 'center', paddingHorizontal: 16 },
  hintText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, textAlign: 'center' },
  hintTextBold: { fontWeight: '600', color: colors.primary },
});
