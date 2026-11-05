-- Migration v2: pockets jadi fully custom + fitur opsional (Bagi Saldo)
-- Jalankan di Supabase SQL Editor.

-- =========================================================
-- 1) Perluas tabel pockets: nama/icon/warna/urutan custom
-- =========================================================
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'wallet';
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#2F6B4F';
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Backfill nama dari key lama (pokok/foya/wajib)
UPDATE pockets
SET name = CASE key
  WHEN 'pokok' THEN 'Pokok'
  WHEN 'foya'  THEN 'Foya-foya'
  WHEN 'wajib' THEN 'Tabungan Wajib'
  ELSE COALESCE(key, 'Kantong')
END
WHERE name IS NULL;

-- Sekarang boleh NOT NULL
ALTER TABLE pockets ALTER COLUMN name SET NOT NULL;

-- Buang unique lama (user_id, key) -> izinkan banyak kantong per user
ALTER TABLE pockets DROP CONSTRAINT IF EXISTS pockets_user_id_key_key;
ALTER TABLE pockets ALTER COLUMN key DROP NOT NULL;

-- Unique nama kantong per user (aman kalau dijalankan ulang)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pockets_user_id_name_key') THEN
    ALTER TABLE pockets ADD CONSTRAINT pockets_user_id_name_key UNIQUE (user_id, name);
  END IF;
END $$;

-- =========================================================
-- 2) Flag fitur di tabel users
-- =========================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS pockets_enabled BOOLEAN NOT NULL DEFAULT false;

-- User yang sudah punya kantong -> otomatis aktif
UPDATE users u SET pockets_enabled = true
WHERE EXISTS (SELECT 1 FROM pockets p WHERE p.user_id = u.id);

-- =========================================================
-- 3) Sambungkan transaksi ke kantong
-- =========================================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS pocket_id UUID REFERENCES pockets(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_pocket_id ON transactions(pocket_id);

-- Backfill: transaksi lama yang kategorinya sama dengan nama kantong
UPDATE transactions t SET pocket_id = p.id
FROM pockets p
WHERE p.user_id = t.user_id
  AND t.pocket_id IS NULL
  AND p.name = t.category;
