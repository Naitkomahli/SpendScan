const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');
const { parseReceiptImage } = require('../services/llmParser');

const MIME_EXT_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'jpg',
  'image/heif': 'jpg',
};

async function scanFromBase64(req, res, next) {
  try {
    const { image, imageType } = req.body;

    if (!image) {
      throw createError(400, 'Image data is required');
    }

    let mimeType = imageType || 'image/jpeg';
    // Normalisasi MIME type: alias "image", "image/jpg", "image/jpeg" -> "image/jpeg"
    const normalizeMime = (t) => {
      if (!t) return 'image/jpeg';
      const low = t.toLowerCase().trim();
      if (/^image$/i.test(low)) return 'image/jpeg';
      if (/^image\/jpeg/i.test(low)) return 'image/jpeg';
      if (/^image\/jpg/i.test(low)) return 'image/jpeg';
      if (/^image\/png/i.test(low)) return 'image/png';
      if (/^image\/webp/i.test(low)) return 'image/webp';
      if (/^image\/heic/i.test(low)) return 'image/jpeg';
      return low;
    };
    mimeType = normalizeMime(mimeType);

    // Validasi: harus mulai dengan image/
    if (!mimeType || !mimeType.startsWith('image')) {
      throw createError(400, 'Invalid image MIME type');
    }

    const buffer = Buffer.from(image, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      throw createError(400, 'Image size must be less than 5MB');
    }

    // Upload to Supabase Storage
    const fileExt = MIME_EXT_MAP[mimeType] || 'jpg';
    const fileName = `receipts/${req.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    let receiptImageUrl = null;
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
      receiptImageUrl = urlData.publicUrl;
    }

    // Parse receipt directly from image using Groq Vision
    const parsed = await parseReceiptImage(image, mimeType);

    res.json({
      success: true,
      message: 'Receipt scanned successfully',
      data: {
        receiptImageUrl,
        rawOcrText: parsed.rawResponse || '',
        parsed: {
          items: parsed.items || [],
          merchant: parsed.merchant || null,
          transactionDate: parsed.transactionDate || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { scanFromBase64 };
