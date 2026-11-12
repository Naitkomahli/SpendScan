// Parser struk lokal: teks mentah OCR -> { merchant, transactionDate, items }.
// Tidak pakai jaringan atau LLM, jadi bisa jalan offline dan gratis.

const SKIP_WORDS = [
  'total', 'subtotal', 'sub total', 'grand total', 'tunai', 'cash', 'kembali',
  'kembalian', 'change', 'diskon', 'discount', 'potongan', 'ppn', 'tax',
  'pajak', 'dpp', 'service', 'svc', 'service charge', 'pembulatan', 'rounding',
  'bayar', 'pembayaran', 'debit', 'kredit', 'credit', 'qris', 'edc', 'saldo',
  'sisa', 'jumlah', 'qty', 'harga', 'kasir', 'customer', 'member', 'invoice',
  'nota', 'struk', 'no', 'terima kasih', 'thank you',
  // Identitas toko: alamat dan kontak. Tanpa ini, baris alamat menempel ke nama item pertama.
  'jl', 'jalan', 'raya', 'rt', 'rw', 'kel', 'kec', 'kota', 'kab', 'kabupaten',
  'telp', 'telepon', 'hp', 'wa', 'email', 'instagram', 'ig', 'website', 'www',
  'npwp', 'nib', 'kasir',
];

const TAIL_PRICE = /(?:rp\.?\s*)?\d[\d.,]*\s*(?:,-)?$/i;

// Harga item di struk rupiah jauh di bawah ini. Angka lebih besar biasanya
// nomor invoice / nomor transaksi, bukan harga.
const MAX_AMOUNT = 10000000;

// Nama item jarang lebih panjang dari ini. Kalau baris yang belum punya harga
// sudah sepanjang ini, itu hampir pasti header/alamat, bukan nama item.
const MAX_PENDING_NAME = 60;

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSkippable(name) {
  const n = normalizeText(name);
  if (!n) return true;
  if (!/[a-z]/.test(n)) return true;
  return SKIP_WORDS.some((w) => n === w || n.startsWith(w + ' '));
}

// "22.000" / "22,000" / "22.000,00" / "22.000,-" -> 22000
function toAmount(raw) {
  let s = String(raw || '').replace(/[^\d.,]/g, '');
  if (!s) return null;

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  if (hasDot && hasComma) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
    return Math.round(parseFloat(s));
  }

  if (hasComma) {
    const parts = s.split(',');
    if (parts[1] && parts[1].length === 3) return parseInt(parts.join(''), 10);
    return Math.round(parseFloat(s.replace(',', '.')));
  }

  if (hasDot) {
    const parts = s.split('.');
    if (parts[1] && parts[1].length === 3) return parseInt(parts.join(''), 10);
    return Math.round(parseFloat(s));
  }

  return parseInt(s, 10);
}

function splitLine(text) {
  const trimmed = String(text || '').trim();
  const match = trimmed.match(/^(.*?)\s+((?:rp\.?\s*)?\d[\d.,]*\s*(?:,-)?)$/i);
  if (!match) return { name: trimmed, amount: null };

  const amount = toAmount(match[2]);
  const name = match[1].replace(/\s{2,}/g, ' ').trim();

  // Harga di struk rupiah hampir selalu >= 100. Angka kecil biasanya qty atau nomor baris.
  if (amount == null || amount < 100 || amount > MAX_AMOUNT) return { name: trimmed, amount: null };
  if (!name) return { name: trimmed, amount: null };

  return { name, amount };
}

// Buang kolom qty / harga satuan yang ikut terbaca di nama item.
function cleanupName(name) {
  let n = String(name || '').trim();
  if (!n) return '';
  n = n.replace(/(?:\s+\d[\d.,]*)+$/g, '').trim();
  n = n.replace(/^\d+\s*[xX]\s*/g, '').trim();
  if (/^\d+$/.test(n)) return '';
  n = n.replace(/\s*[xX]\s*\d+\s*$/gi, '').trim();
  return n.replace(/\s{2,}/g, ' ').trim();
}

function parseDate(text) {
  const match = String(text || '').match(/\b(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})\b/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);

  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 2000 || year > 2100) return null;

  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

function findMerchant(entries) {
  const head = entries.slice(0, 5);
  const candidate = head.find((e) => {
    const n = normalizeText(e.text);
    if (n.length < 3 || n.length > 40) return false;
    if (isSkippable(e.text)) return false;
    if (TAIL_PRICE.test(e.text)) return false;
    return /[a-z]{3,}/.test(n);
  });
  return candidate ? candidate.text.trim() : null;
}

/**
 * @param {Array<string | { text: string, frame?: { left: number, right: number } }>} lines
 * @returns {{ merchant: string|null, transactionDate: string|null, items: Array<{name: string, amount: number}>, rawText: string }}
 */
export function parseReceipt(lines) {
  const entries = (lines || [])
    .map((line) => (typeof line === 'string'
      ? { text: line }
      : { text: line?.text || '', frame: line?.frame }))
    .map((e) => ({ ...e, text: String(e.text).trim() }))
    .filter((e) => e.text.length > 0);

  const rawText = entries.map((e) => e.text).join('\n');

  const merchant = findMerchant(entries);
  const transactionDate = entries.map((e) => parseDate(e.text)).find(Boolean) || null;

  // ponytail: kolom harga diabaikan dulu. Kalau akurasi item < 70%, pakai frame.right
  // untuk mengelompokkan harga di kolom kanan sebelum jatuh ke heuristik "angka di akhir baris".
  const items = [];
  let pendingName = '';

  for (const entry of entries) {
    const { name, amount } = splitLine(entry.text);

    if (amount == null) {
      const n = normalizeText(name);
      if (!n || isSkippable(name) || parseDate(name)) {
        pendingName = '';
        continue;
      }
      pendingName = pendingName ? `${pendingName} ${name}` : name;
      if (pendingName.length > MAX_PENDING_NAME) pendingName = name;
      continue;
    }

    const cleaned = cleanupName(name);
    const fullName = cleaned
      ? (pendingName ? `${pendingName} ${cleaned}` : cleaned)
      : pendingName;
    pendingName = '';

    if (!fullName || isSkippable(fullName)) continue;

    items.push({ name: fullName, amount });
  }

  return { merchant, transactionDate, items, rawText };
}

export default parseReceipt;
