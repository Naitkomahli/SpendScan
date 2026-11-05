import { apiRequest } from './api';

/**
 * Ambil daftar kantong + status fitur Bagi Saldo.
 * Tidak pernah melempar error: kalau offline/gagal, kembalikan default aman.
 */
export async function getPockets() {
  try {
    const data = await apiRequest('/pockets');
    if (data && typeof data === 'object') {
      return {
        enabled: !!data.enabled,
        pockets: Array.isArray(data.pockets) ? data.pockets : [],
      };
    }
  } catch (err) {
    // diamkan — default aman di bawah
  }
  return { enabled: false, pockets: [] };
}

export async function createPocket({ name, icon, color, allocated = 0 }) {
  return apiRequest('/pockets', {
    method: 'POST',
    body: JSON.stringify({ name, icon, color, allocated }),
  });
}

export async function updatePocket(id, patch) {
  return apiRequest(`/pockets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deletePocket(id) {
  await apiRequest(`/pockets/${id}`, { method: 'DELETE' });
  return true;
}

export async function setPocketsEnabled(enabled) {
  return apiRequest('/pockets/settings', {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}
