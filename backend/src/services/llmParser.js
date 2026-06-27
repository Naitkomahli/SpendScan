const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
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

async function parseReceiptImage(base64Image, imageType) {
  try {
    const mimeType = imageType || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL_VISION || 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from LLM');

    // Bersihkan markdown JSON jika ada
    let cleanJson = content.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }

    const parsed = JSON.parse(cleanJson);
    return {
      items: parsed.items || [],
      merchant: parsed.merchant || null,
      transactionDate: parsed.date || null,
      rawResponse: content,
    };
  } catch (err) {
    console.error('LLM Vision parse error:', err.message);
    if (err.message.includes('quota') || err.message.includes('429')) {
      console.error('Groq quota exhausted. Try again later.');
    }
    return { items: [], merchant: null, transactionDate: null, rawResponse: null };
  }
}

module.exports = { parseReceiptImage };
