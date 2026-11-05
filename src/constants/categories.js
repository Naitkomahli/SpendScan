export const CATEGORIES = [
  { id: '1', label: 'Food & Drink', icon: '🍔', color: '#C8553D' },
  { id: '2', label: 'Transportation', icon: '🚗', color: '#2F6B4F' },
  { id: '3', label: 'Shopping', icon: '🛍️', color: '#D4A94F' },
  { id: '4', label: 'Bills', icon: '🧾', color: '#1A4633' },
  { id: '5', label: 'Health', icon: '💊', color: '#3FA66B' },
  { id: '6', label: 'Education', icon: '📚', color: '#4C8F6B' },
  { id: '7', label: 'Entertainment', icon: '🎮', color: '#8B5E1A' },
  { id: '8', label: 'Other', icon: '📦', color: '#5C6B5B' },
  { id: '9', label: 'Pemasukan', icon: '💰', color: '#3FA66B' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.label !== 'Pemasukan');
