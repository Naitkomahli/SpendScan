import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../services/authService';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      // Gagal load token — anggap tidak login
    } finally {
      setLoading(false);
    }
  }

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const { user: userData, token: newToken } = data;

    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    const { user: userData, token: newToken } = data;

    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
