const OpenAI = require('openai');
const { createError } = require('../middleware/errorHandler');

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
  // Tanpa ini SDK mencoba ulang 2x dengan backoff, jadi struk yang kena kuota
  // terasa menggantung belasan detik sebelum jatuh ke model berikutnya.
  maxRetries: 0,
  timeout: 9000,
});

const SYSTEM_PROMPT = `Kamu adalah parser struk belanja Indonesia.
Tugasmu membaca GAMBAR struk dan mengembalikan data terstruktur.

Aturan:
1. Baca teks dari gambar struk dengan teliti.
2. Cari nama toko/merchant.
3. Cari tanggal transaksi. Format: YYYY-MM-DD.
4. Cari SEMUA item belanjaan. Setiap item punya nama dan harga.
5. Harga adalah angka, contoh: 75000 (bukan 75.000 atau Rp75.000).
6. Abaikan baris TOTAL, TUNAI, KEMBALI, DISKON, PPN, SUBTOTAL.
7. Abaikan header (alamat, telp) dan footer (terima kasih).
8. Jika ada item sama, gabung jadi satu.

Kembalikan HANYA JSON tanpa markdown atau teks lain:
{
  "merchant": "nama toko atau null",
  "date": "YYYY-MM-DD atau null",
  "items": [
    { "name": "nama item", "amount": 15000 }
  ]
}`;

// Diukur di production: lite ~1,1-1,8 detik, gemini-3-flash-preview ~13,7 detik.
// Yang cepat dulu; kalau hasilnya bukan JSON valid, loop lanjut ke model berikutnya.
const FALLBACK_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
];

async function parseReceiptImage(base64Image, imageType) {
  const mimeType = imageType || 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const models = [...new Set([...FALLBACK_MODELS, process.env.LLM_MODEL_VISION].filter(Boolean))];
  let lastErr = null;

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SYSTEM_PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No response from LLM');

      let cleanJson = content.trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanJson);
      return {
        items: parsed.items || [],
        merchant: parsed.merchant || null,
        transactionDate: parsed.date || null,
        rawResponse: content,
      };
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      lastErr = err;
      continue;
    }
  }

  console.error('All vision models failed. Last error:', lastErr?.message);
  if (lastErr && (lastErr.message.includes('quota') || lastErr.message.includes('429'))) {
    throw createError(429, 'Kuota pembaca struk habis. Coba lagi nanti.');
  }
  throw createError(502, `Gagal membaca struk: ${lastErr?.message || 'Unknown error'}`);
}

module.exports = { parseReceiptImage };
