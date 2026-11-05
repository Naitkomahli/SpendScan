export const CATEGORIES = [
  { id: '1', label: 'Pokok',          icon: '🏠', color: '#2F6B4F' },
  { id: '2', label: 'Foya-foya',      icon: '🎉', color: '#D4A94F' },
  { id: '3', label: 'Tabungan Wajib', icon: '🔒', color: '#1A4633' },
  { id: '4', label: 'Pemasukan',      icon: '💰', color: '#3FA66B' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.label !== 'Pemasukan');
