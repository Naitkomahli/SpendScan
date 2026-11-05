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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import {
  POCKET_ICONS,
  POCKET_COLORS,
  DEFAULT_POCKET_ICON,
  DEFAULT_POCKET_COLOR,
} from '../constants/pockets';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getPockets,
  createPocket,
  updatePocket,
  deletePocket,
} from '../services/pocketService';

const EMPTY_FORM = {
  name: '',
  icon: DEFAULT_POCKET_ICON,
  color: DEFAULT_POCKET_COLOR,
  allocated: '',
};

export default function ManagePocketsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pockets, setPockets] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null); // pocket | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    try {
      setLoading(true);
      const data = await getPockets();
      setPockets(data.pockets);
    } catch (err) {
      Alert.alert('Gagal', 'Tidak bisa memuat daftar kantong.');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalVisible(true);
  }

  function openEdit(pocket) {
    setEditing(pocket);
    setForm({
      name: pocket.name,
      icon: pocket.icon || DEFAULT_POCKET_ICON,
      color: pocket.color || DEFAULT_POCKET_COLOR,
      allocated: String(pocket.allocated || 0),
    });
    setError('');
    setModalVisible(true);
  }

  async function handleSave() {
    const name = form.name.trim();
    if (!name) {
      setError('Nama kantong wajib diisi');
      return;
    }

    const allocated = Number(form.allocated) || 0;
    if (allocated < 0) {
      setError('Alokasi tidak boleh negatif');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updatePocket(editing.id, {
          name,
          icon: form.icon,
          color: form.color,
          allocated,
        });
      } else {
        await createPocket({
          name,
          icon: form.icon,
          color: form.color,
          allocated,
        });
      }
      setModalVisible(false);
      await load();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kantong');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(pocket) {
    Alert.alert(
      'Hapus Kantong',
      `Hapus "${pocket.name}"? Transaksi yang pernah masuk kantong ini akan jadi "Tanpa Kantong".`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePocket(pocket.id);
              await load();
            } catch (err) {
              Alert.alert('Gagal', 'Tidak bisa menghapus kantong.');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Buat kantong sesuka kamu. Setiap kantong bisa diberi nama, icon, dan warna sendiri.
        </Text>

        {pockets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="albums-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Belum ada kantong</Text>
            <Text style={styles.emptyText}>
              Tambahkan kantong pertamamu untuk mulai membagi saldo.
            </Text>
          </View>
        ) : (
          pockets.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: `${p.color}22` }]}>
                <Ionicons name={p.icon || DEFAULT_POCKET_ICON} size={20} color={p.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardAlloc}>Jatah: {formatCurrency(p.allocated)}</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(p)}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => confirmDelete(p)}>
                <Ionicons name="trash-outline" size={18} color={colors.expense} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Tambah Kantong</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal form */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing ? 'Ubah Kantong' : 'Kantong Baru'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                style={styles.input}
                placeholder="Misal: Kebutuhan Pokok"
                placeholderTextColor={colors.textSecondary}
                value={form.name}
                onChangeText={(t) => {
                  setForm((f) => ({ ...f, name: t }));
                  if (error) setError('');
                }}
              />

              <Text style={styles.label}>Jatah Saldo (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={form.allocated}
                onChangeText={(t) =>
                  setForm((f) => ({ ...f, allocated: t.replace(/[^0-9]/g, '') }))
                }
                keyboardType="numeric"
              />

              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconGrid}>
                {POCKET_ICONS.map((ic) => {
                  const active = form.icon === ic;
                  return (
                    <TouchableOpacity
                      key={ic}
                      style={[
                        styles.iconOption,
                        active && { backgroundColor: `${form.color}22`, borderColor: form.color },
                      ]}
                      onPress={() => setForm((f) => ({ ...f, icon: ic }))}
                    >
                      <Ionicons
                        name={ic}
                        size={20}
                        color={active ? form.color : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Warna</Text>
              <View style={styles.colorRow}>
                {POCKET_COLORS.map((c) => {
                  const active = form.color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorOption,
                        { backgroundColor: c },
                        active && styles.colorOptionActive,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, color: c }))}
                    >
                      {active && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },

  intro: { fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 19 },

  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 6 },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardAlloc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: { borderColor: colors.text },
  errorText: { fontSize: 12, color: colors.expense, marginTop: 10 },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
