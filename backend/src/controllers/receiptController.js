const Tesseract = require('tesseract.js');
const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');
const { parseReceiptText } = require('../services/llmParser');

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

    const mimeType = imageType || 'image/jpeg';
    if (!mimeType || !mimeType.startsWith('image')) {
      throw createError(400, 'Only image files are allowed');
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

    // Run OCR
    const { data: ocrData } = await Tesseract.recognize(buffer, 'eng+ind', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });

    const rawText = ocrData.text;
    const parsed = await parseReceiptText(rawText);

    res.json({
      success: true,
      message: 'Receipt scanned successfully',
      data: {
        receiptImageUrl,
        rawOcrText: rawText,
        parsed,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { scanFromBase64 };
