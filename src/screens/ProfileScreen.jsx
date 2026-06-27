import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'Pengguna'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* Menu List */}
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
        <View style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>UID</Text>
          <Text style={[styles.menuValue, styles.menuValueMono]} numberOfLines={1}>
            {user?.id ? user.id.slice(0, 8) + '...' : '-'}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SpendScan v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  menuSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 24,
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
