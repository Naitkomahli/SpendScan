import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};

    if (mode === 'register' && !name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err) {
      Alert.alert(
        mode === 'login' ? 'Gagal Masuk' : 'Gagal Daftar',
        err.message || 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setShowPassword(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="receipt" size={32} color={colors.primary} />
          </View>
          <Text style={styles.appName}>SpendScan</Text>
          <Text style={styles.tagline}>
            {mode === 'login'
              ? 'Masuk untuk melacak pengeluaranmu'
              : 'Buat akun baru untuk mulai'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Field (Register only) */}
          {mode === 'register' && (
            <>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Nama lengkap"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </>
          )}

          {/* Email Field */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="contoh@email.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.passwordWrapper, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimal 6 karakter"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Masuk' : 'Daftar'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Mode */}
          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? 'Belum punya akun? Daftar'
                : 'Sudah punya akun? Masuk'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Form
  form: {
    width: '100%',
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

  // Password
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingRight: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 4,
  },

  // Submit
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Toggle
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
