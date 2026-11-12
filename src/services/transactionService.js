import { apiRequest } from './api';
import { readAsStringAsync } from 'expo-file-system/legacy';

function fromSnakeCase(item) {
  return {
    id: item.id,
    userId: item.user_id,
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
    pocketId: item.pocket_id || null,
    transactionDate: item.transaction_date,
    note: item.note,
    receiptImageUrl: item.receipt_image_url,
    rawOcrText: item.raw_ocr_text,
    source: item.source,
    type: item.type || 'expense',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export async function getAll() {
  const data = await apiRequest('/transactions');
  return (data || []).map(fromSnakeCase);
}

export async function getById(id) {
  const data = await apiRequest(`/transactions/${id}`);
  return data ? fromSnakeCase(data) : null;
}

export async function create(data) {
  const result = await apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      title: data.title,
      amount: Number(data.amount),
      category: data.category,
      transactionDate: data.transactionDate,
      note: data.note || null,
      source: data.source || 'manual',
      type: data.type || 'expense',
      pocketId: data.pocketId || null,
    }),
  });
  return fromSnakeCase(result);
}

export async function update(id, data) {
  const result = await apiRequest(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: data.title,
      amount: Number(data.amount),
      category: data.category,
      transactionDate: data.transactionDate,
      note: data.note || null,
      type: data.type,
      pocketId: data.pocketId || null,
    }),
  });
  return fromSnakeCase(result);
}

export async function deleteById(id) {
  await apiRequest(`/transactions/${id}`, {
    method: 'DELETE',
  });
  return true;
}

export async function scanReceipt(image) {
  const base64 = await readAsStringAsync(image.uri, {
    encoding: 'base64',
  });

  // Resolve MIME type: gunakan asset.mimeType dulu, kalau undefined/blank baca dari uri, fallback jpeg
  let imageType = image.mimeType;
  if (!imageType) {
    // Coba ekstrak dari uri (misal .jpg, .png)
    const extMatch = image.uri.match(/\.([a-z0-9]+)(?:[\?\#])?$/i);
    imageType = extMatch ? `image/${extMatch[1]}` : null;
  }
  imageType = imageType || 'image/jpeg';

  const data = await apiRequest('/receipts/scan', {
    method: 'POST',
    body: JSON.stringify({
      image: base64,
      imageType,
    }),
  });

  return {
    imageUrl: data.receiptImageUrl || image.uri,
    rawText: data.rawOcrText || '',
    items: data.parsed?.items || [],
    merchant: data.parsed?.merchant || null,
    transactionDate: data.parsed?.transactionDate || '',
  };
}
