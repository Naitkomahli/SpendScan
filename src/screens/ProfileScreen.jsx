import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, pocketsEnabled, updatePocketsEnabled } = useAuth();
  const [savingSetting, setSavingSetting] = useState(false);

  function handleLogout() {
    Alert.alert(
      'Keluar',
      'Apakah kamu yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Keluar', style: 'destructive', onPress: logout },
      ]
    );
  }

  async function handleTogglePockets(value) {
    if (savingSetting) return;
    setSavingSetting(true);
    try {
      await updatePocketsEnabled(value);
      if (value) {
        Alert.alert(
          'Bagi Saldo Aktif',
          'Buat kantongmu dulu supaya bisa dipakai saat mencatat pengeluaran.',
          [
            { text: 'Nanti', style: 'cancel' },
            { text: 'Buat Kantong', onPress: () => navigation.navigate('ManagePockets') },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Gagal', 'Tidak bisa mengubah setelan. Coba lagi.');
    } finally {
      setSavingSetting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'Pengguna'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* Akun */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuLabel}>Nama</Text>
            <Text style={styles.menuValue}>{user?.name || '-'}</Text>
          </View>
          <View style={styles.menuItem}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuLabel}>Email</Text>
            <Text style={styles.menuValue}>{user?.email || '-'}</Text>
          </View>
          <View style={[styles.menuItem, styles.menuItemLast]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuLabel}>UID</Text>
            <Text style={[styles.menuValue, styles.menuValueMono]} numberOfLines={1}>
              {user?.id ? user.id.slice(0, 8) + '...' : '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Pengaturan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Bagi Saldo</Text>
              <Text style={styles.settingDesc}>
                Pisahkan pengeluaran ke kantongmu sendiri.
              </Text>
            </View>
            <Switch
              value={pocketsEnabled}
              onValueChange={handleTogglePockets}
              disabled={savingSetting}
              trackColor={{ false: colors.border, true: colors.primaryHover }}
              thumbColor={pocketsEnabled ? colors.primary : '#fff'}
            />
          </View>

          {pocketsEnabled && (
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => navigation.navigate('ManagePockets')}
              activeOpacity={0.7}
            >
              <Ionicons name="albums-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingTitle}>Kelola Kantong</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SpendScan v1.2.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    width: 50,
  },
  menuValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  menuValueMono: {
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
});
