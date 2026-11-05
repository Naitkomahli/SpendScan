import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './api';

const STORAGE_KEY = 'spendscan_pockets';

export async function getPockets() {
  try {
    const data = await apiRequest('/pockets');
    if (data && typeof data === 'object') {
      try {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(data));
      } catch (_) {}
      return data;
    }
  } catch (err) {
    // Fallback ke cache offline jika gagal request
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
  }
  return null;
}

export async function savePockets(pockets) {
  let backendSuccess = false;
  try {
    await apiRequest('/pockets', {
      method: 'PUT',
      body: JSON.stringify(pockets),
    });
    backendSuccess = true;
  } catch (err) {
    console.warn('Gagal simpan ke backend, simpan lokal:', err.message);
  }

  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(pockets));
    return true;
  } catch (err) {
    return backendSuccess;
  }
}
