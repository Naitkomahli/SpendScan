/**
 * Service layer untuk operasi data transaksi.
 *
 * Fase Mock: Menggunakan data lokal (mockTransactions).
 * Fase API: Cukup ganti implementasi method di bawah
 *            dengan panggilan fetch ke backend.
 *            Screen TIDAK perlu diubah.
 */
import mockTransactions from '../data/mockTransactions';

/**
 * Simulasi delay async untuk efek realistis.
 * Nanti dihapus saat pakai API beneran.
 */
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ambil semua transaksi.
 * @returns {Promise<Array>} Daftar transaksi
 */
export async function getAll() {
  await delay();

  // Sortir: transaksi terbaru di atas
  const sorted = [...mockTransactions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return sorted;
}

/**
 * Ambil satu transaksi berdasarkan ID.
 * @param {string} id
 * @returns {Promise<Object|null>} Transaksi atau null jika tidak ditemukan
 */
export async function getById(id) {
  await delay();

  const transaction = mockTransactions.find((t) => t.id === id);
  return transaction || null;
}

/**
 * Buat transaksi baru.
 * @param {Object} data - Data transaksi (title, amount, category, transactionDate, note, dll)
 * @returns {Promise<Object>} Transaksi yang baru dibuat
 */
export async function create(data) {
  await delay();

  const now = new Date().toISOString();
  const newTransaction = {
    id: String(Date.now()), // ID sementara, nanti dari backend
    userId: 'user-001',
    title: data.title,
    amount: Number(data.amount),
    category: data.category,
    transactionDate: data.transactionDate,
    note: data.note || null,
    receiptImageUrl: data.receiptImageUrl || null,
    rawOcrText: data.rawOcrText || null,
    source: data.source || 'manual',
    createdAt: now,
    updatedAt: now,
  };

  mockTransactions.push(newTransaction);
  return newTransaction;
}

/**
 * Update transaksi yang sudah ada.
 * @param {string} id
 * @param {Object} data - Data yang ingin diupdate
 * @returns {Promise<Object|null>} Transaksi yang sudah diupdate, atau null jika tidak ditemukan
 */
export async function update(id, data) {
  await delay();

  const index = mockTransactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated = {
    ...mockTransactions[index],
    ...data,
    id: mockTransactions[index].id, // ID tidak berubah
    updatedAt: new Date().toISOString(),
  };

  mockTransactions[index] = updated;
  return updated;
}

/**
 * Hapus transaksi berdasarkan ID.
 * @param {string} id
 * @returns {Promise<boolean>} true jika berhasil dihapus, false jika tidak ditemukan
 */
export async function deleteById(id) {
  await delay();

  const index = mockTransactions.findIndex((t) => t.id === id);
  if (index === -1) return false;

  mockTransactions.splice(index, 1);
  return true;
}

/**
 * Simulasi scan struk (masih placeholder untuk integrasi OCR nanti).
 * @param {Object} image - Informasi gambar dari image picker
 * @returns {Promise<Object>} Hasil OCR palsu untuk pengembangan UI
 */
export async function scanReceipt(image) {
  await delay(1000);

  // Hasil OCR simulasi — nanti diganti dengan panggilan API beneran
  return {
    imageUrl: image.uri || null,
    rawText: 'Indomaret\nTotal: Rp30.500\nTunai: Rp50.000\nKembali: Rp19.500',
    parsed: {
      title: 'Indomaret',
      amount: 30500,
      transactionDate: new Date().toISOString().split('T')[0],
      category: 'Shopping',
    },
  };
}
