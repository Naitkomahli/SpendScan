export const POCKETS = [
  {
    key: 'pokok',
    label: 'Kebutuhan Pokok',
    category: 'Pokok',
    icon: 'home',
    color: '#2F6B4F',
    container: '#E7F0EA',
    text: '#1A4633',
  },
  {
    key: 'foya',
    label: 'Foya-foya',
    category: 'Foya-foya',
    icon: 'sparkles',
    color: '#D4A94F',
    container: '#F5E9D3',
    text: '#8B5E1A',
  },
  {
    key: 'wajib',
    label: 'Tabungan Wajib',
    category: 'Tabungan Wajib',
    icon: 'lock-closed',
    color: '#1A4633',
    container: '#D8E3DF',
    text: '#1A4633',
  },
];

export const POCKET_CATEGORIES = POCKETS.map((p) => p.category);
