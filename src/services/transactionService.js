import { apiRequest } from './api';
import { readAsStringAsync } from 'expo-file-system/legacy';

function fromSnakeCase(item) {
  return {
    id: item.id,
    userId: item.user_id,
    title: item.title,
    amount: Number(item.amount),
    category: item.category,
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

  const imageType = image.type || 'image/jpeg';

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
    transactionDate: data.parsed?.transactionDate || '',
  };
}
