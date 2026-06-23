const Tesseract = require('tesseract.js');
const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

async function scanReceipt(req, res, next) {
  try {
    if (!req.file) {
      throw createError(400, 'Receipt image file is required');
    }

    const filePath = req.file.path;

    const { data: ocrData } = await Tesseract.recognize(filePath, 'eng+ind', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });

    const rawText = ocrData.text;

    const parsed = parseReceiptText(rawText);

    res.json({
      success: true,
      message: 'Receipt scanned successfully',
      data: {
        rawOcrText: rawText,
        parsed,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function uploadAndScan(req, res, next) {
  try {
    if (!req.file) {
      throw createError(400, 'Receipt image file is required');
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `receipts/${req.user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw createError(500, uploadError.message);

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    const { data: ocrData } = await Tesseract.recognize(req.file.buffer, 'eng+ind');

    const rawText = ocrData.text;
    const parsed = parseReceiptText(rawText);

    res.json({
      success: true,
      message: 'Receipt uploaded and scanned successfully',
      data: {
        receiptImageUrl: imageUrl,
        rawOcrText: rawText,
        parsed,
      },
    });
  } catch (err) {
    next(err);
  }
}

function parseReceiptText(text) {
  const lines = text.split('\n').filter((l) => l.trim());

  const amountMatch = text.match(/[Tt]otal\s*:?\s*Rp?\s*([\d.,]+)/);
  const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);

  const title = lines[0] || null;
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/[.,]/g, '')) : null;
  const transactionDate = dateMatch ? dateMatch[1] : null;

  return { title, amount, transactionDate };
}

module.exports = { scanReceipt, uploadAndScan };
