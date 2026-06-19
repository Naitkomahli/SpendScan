/**
 * Format angka ke dalam format mata uang Rupiah (IDR).
 * Contoh: 25000 -> "Rp25.000"
 *
 * @param {number} amount - Jumlah uang
 * @returns {string} - String format Rupiah
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) {
    return 'Rp0';
  }

  return `Rp${Number(amount)
    .toLocaleString('id-ID')
    .replace(/,/g, '.')}`;
}
