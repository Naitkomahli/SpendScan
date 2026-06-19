import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="scan-outline" size={72} color={colors.border} />
      <Text style={styles.title}>Pindai Struk</Text>
      <Text style={styles.subtitle}>Fitur scan struk akan segera hadir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, marginTop: 16 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
