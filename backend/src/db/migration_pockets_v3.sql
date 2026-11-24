-- Migration v3: kantong jadi wadah saldo (bukan jatah)
-- Jalankan di Supabase SQL Editor.

-- =========================================================
-- 1) Saldo set kantong
-- =========================================================
-- base_balance = saldo yang diisi user saat "set saldo".
-- Saldo tampil = base_balance + pemasukan bertag - pengeluaran bertag.
ALTER TABLE pockets ADD COLUMN IF NOT EXISTS base_balance NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Backfill: jatah lama dianggap saldo awal kantong
UPDATE pockets
SET base_balance = COALESCE(allocated, 0)
WHERE base_balance = 0 AND COALESCE(allocated, 0) <> 0;

-- =========================================================
-- 2) allocated dipensiunkan
-- =========================================================
-- Kolom dibiarkan dulu sampai kode lama benar-benar tidak dipakai.
-- Setelah yakin, jalankan:
-- ALTER TABLE pockets DROP COLUMN IF EXISTS allocated;

COMMENT ON COLUMN pockets.base_balance IS 'Saldo set manual; saldo tampil = base_balance + transaksi bertag';
COMMENT ON COLUMN pockets.allocated IS 'DEPRECATED: diganti base_balance (migration_pockets_v3)';
