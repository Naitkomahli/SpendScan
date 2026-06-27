const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

const SYSTEM_PROMPT = `Kamu adalah parser struk belanja Indonesia. 
Tugasmu membaca teks hasil OCR struk dan mengembalikan data terstruktur dalam format JSON.

Aturan:
1. Cari nama toko/merchant dari baris pertama atau kedua.
2. Cari tanggal transaksi. Format: YYYY-MM-DD.
3. Cari SEMUA item belanjaan. Setiap item punya nama dan harga.
4. Harga adalah angka di akhir baris. Contoh: "Beras 5KG 75000" → name: "Beras 5KG", amount: 75000.
5. Abaikan baris TOTAL, TUNAI, KEMBALI, DISKON, PPN, SUBTOTAL.
6. Abaikan baris header (alamat, telp, jam, dll).
7. Abaikan baris footer (terima kasih, selamat, dll).
8. Jika ada item yang sama, gabung jadi satu.
9. Jika ragu dengan harga, tebak dari konteks.

Kembalikan JSON dengan format:
{
  "merchant": "nama toko atau null",
  "date": "YYYY-MM-DD atau null",
  "items": [
    { "name": "nama item", "amount": 15000 }
  ]
}`;

async function parseReceiptText(rawText) {
  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Berikut teks hasil scan struk. Balas HANYA JSON tanpa markdown atau teks lain:\n\n${rawText}` },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from LLM');

    // Bersihkan markdown JSON jika ada (```json ... ```)
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }

    const parsed = JSON.parse(cleanJson);
    return {
      items: parsed.items || [],
      merchant: parsed.merchant || null,
      transactionDate: parsed.date || null,
    };
  } catch (err) {
    console.error('LLM parse error:', err.message);
    if (err.message.includes('quota') || err.message.includes('429')) {
      console.error('Gemini quota exhausted. Try a different model or wait.');
    }
    return { items: [], merchant: null, transactionDate: null };
  }
}

module.exports = { parseReceiptText };
