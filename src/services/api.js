import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.19:3000/api';
const TOKEN_KEY = 'authToken';

export async function apiRequest(endpoint, options = {}) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!json.success) {
    const message = json.message || 'Terjadi kesalahan';
    throw new Error(message);
  }

  return json.data;
}
