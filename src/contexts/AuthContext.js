import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../services/authService';
import { setPocketsEnabled as apiSetPocketsEnabled, getPockets } from '../services/pocketService';
import { setUnauthorizedHandler } from '../services/api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pocketsEnabled, setPocketsEnabledState] = useState(false);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setPocketsEnabledState(!!parsedUser.pockets_enabled);

        // Sinkronkan status fitur dari server (user lama mungkin belum punya flag ini)
        const pocketData = await getPockets();
        setPocketsEnabledState(pocketData.enabled);
      }
    } catch (err) {
      // Gagal load token — anggap tidak login
    } finally {
      setLoading(false);
    }
  }

  function persistUser(userData) {
    setUser(userData);
    setPocketsEnabledState(!!userData.pockets_enabled);
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)).catch(() => {});
  }

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    const { user: userData, token: newToken } = data;

    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    persistUser(userData);
    setToken(newToken);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    const { user: userData, token: newToken } = data;

    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    persistUser(userData);
    setToken(newToken);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    setToken(null);
    setUser(null);
    setPocketsEnabledState(false);
  }, []);

  const updatePocketsEnabled = useCallback(async (enabled) => {
    await apiSetPocketsEnabled(enabled);
    setPocketsEnabledState(enabled);
    setUser((prev) => {
      const next = { ...(prev || {}), pockets_enabled: enabled };
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return enabled;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    loadStoredAuth();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        pocketsEnabled,
        updatePocketsEnabled,
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
