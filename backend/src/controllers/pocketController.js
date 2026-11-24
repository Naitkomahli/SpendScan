const { supabaseAdmin } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const DEFAULT_ICON = 'wallet';
const DEFAULT_COLOR = '#2F6B4F';

function toClient(row, balance = 0) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon || DEFAULT_ICON,
    color: row.color || DEFAULT_COLOR,
    balance,
    sortOrder: row.sort_order || 0,
  };
}

function rupiah(value) {
  return new Intl.NumberFormat('id-ID').format(Math.floor(value));
}

async function getEnabled(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('pockets_enabled')
    .eq('id', userId)
    .single();

  if (error) return false;
  return !!data?.pockets_enabled;
}

/**
 * Total Saldo = semua pemasukan - semua pengeluaran.
 * perPocket = jumlah bertanda (masuk +, keluar -) per pocket_id.
 */
async function loadFinancials(userId) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('pocket_id, type, amount')
    .eq('user_id', userId);

  if (error) throw createError(500, error.message);

  let total = 0;
  const perPocket = new Map();

  for (const row of data || []) {
    const amount = Number(row.amount) || 0;
    const signed = row.type === 'income' ? amount : -amount;
    total += signed;
    if (row.pocket_id) {
      perPocket.set(row.pocket_id, (perPocket.get(row.pocket_id) || 0) + signed);
    }
  }

  return { total, perPocket };
}

async function getAll(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pockets')
      .select('id, name, icon, color, base_balance, sort_order')
      .eq('user_id', req.user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw createError(500, error.message);

    const [{ perPocket }, enabled] = await Promise.all([
      loadFinancials(req.user.id),
      getEnabled(req.user.id),
    ]);

    const pockets = (data || []).map((row) =>
      toClient(row, Number(row.base_balance || 0) + (perPocket.get(row.id) || 0))
    );

    res.json({
      success: true,
      message: 'Pockets fetched successfully',
      data: {
        enabled,
        pockets,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, icon, color } = req.body || {};
    const rawBalance = req.body?.balance;

    if (!name || !String(name).trim()) {
      throw createError(400, 'Nama kantong wajib diisi');
    }

    const balance = rawBalance === undefined || rawBalance === '' ? 0 : Number(rawBalance);
    if (isNaN(balance) || balance < 0) {
      throw createError(400, 'Saldo kantong tidak valid');
    }

    // Validasi: total saldo semua kantong tidak boleh melebihi Total Saldo
    const { total, perPocket } = await loadFinancials(req.user.id);
    const { data: existing, error: listError } = await supabaseAdmin
      .from('pockets')
      .select('id, base_balance')
      .eq('user_id', req.user.id);

    if (listError) throw createError(500, listError.message);

    const used = (existing || []).reduce(
      (sum, row) => sum + Number(row.base_balance || 0) + (perPocket.get(row.id) || 0),
      0
    );
    // Jangan hukum data lama yang sudah kelebihan: cukup cegah menambah lebih jauh.
    const limit = Math.max(total, used);
    const remaining = limit - used;

    if (balance > remaining) {
      throw createError(
        400,
        `Saldo melebihi sisa yang bisa dibagi. Sisa: Rp ${rupiah(Math.max(remaining, 0))}`
      );
    }

    const { data: last } = await supabaseAdmin
      .from('pockets')
      .select('sort_order')
      .eq('user_id', req.user.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (last?.sort_order || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from('pockets')
      .insert([{
        user_id: req.user.id,
        name: String(name).trim(),
        icon: icon || DEFAULT_ICON,
        color: color || DEFAULT_COLOR,
        base_balance: balance,
        sort_order: nextOrder,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw createError(409, 'Nama kantong sudah dipakai');
      throw createError(500, error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Kantong berhasil dibuat',
      data: toClient(data, balance),
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, icon, color, sortOrder } = req.body || {};
    const rawBalance = req.body?.balance;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('pockets')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      throw createError(404, 'Kantong tidak ditemukan');
    }

    const updates = { updated_at: new Date().toISOString() };

    if (name !== undefined) {
      if (!String(name).trim()) throw createError(400, 'Nama kantong wajib diisi');
      updates.name = String(name).trim();
    }
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (sortOrder !== undefined) updates.sort_order = Number(sortOrder) || 0;

    const { total, perPocket } = await loadFinancials(req.user.id);
    const tagged = perPocket.get(id) || 0;

    if (rawBalance !== undefined && rawBalance !== '') {
      const balance = Number(rawBalance);
      if (isNaN(balance) || balance < 0) {
        throw createError(400, 'Saldo kantong tidak valid');
      }

      const { data: others, error: listError } = await supabaseAdmin
        .from('pockets')
        .select('id, base_balance')
        .eq('user_id', req.user.id)
        .neq('id', id);

      if (listError) throw createError(500, listError.message);

      const usedByOthers = (others || []).reduce(
        (sum, row) => sum + Number(row.base_balance || 0) + (perPocket.get(row.id) || 0),
        0
      );
      const currentSum =
        usedByOthers + Number(existing.base_balance || 0) + tagged;
      // Jangan hukum data lama yang sudah kelebihan: cukup cegah menambah lebih jauh.
      const remaining = Math.max(total, currentSum) - usedByOthers;

      if (balance > remaining) {
        throw createError(
          400,
          `Saldo melebihi sisa yang bisa dibagi. Maksimal: Rp ${rupiah(Math.max(remaining, 0))}`
        );
      }

      // Simpan sebagai saldo set, supaya saldo tampil = balance
      updates.base_balance = balance - tagged;
    }

    const { data, error } = await supabaseAdmin
      .from('pockets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw createError(409, 'Nama kantong sudah dipakai');
      throw createError(500, error.message);
    }

    const shown =
      updates.base_balance !== undefined
        ? Number(updates.base_balance) + tagged
        : Number(data.base_balance || 0) + tagged;

    res.json({
      success: true,
      message: 'Kantong berhasil diperbarui',
      data: toClient(data, shown),
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('pockets')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      throw createError(404, 'Kantong tidak ditemukan');
    }

    // Transaksi terkait jadi tanpa kantong (FK ON DELETE SET NULL).
    // Total Saldo tidak berubah karena tidak bergantung pada kantong.
    const { error } = await supabaseAdmin
      .from('pockets')
      .delete()
      .eq('id', id);

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Kantong berhasil dihapus',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const { id } = req.params;

    const { data: pocket, error: pocketError } = await supabaseAdmin
      .from('pockets')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (pocketError || !pocket) {
      throw createError(404, 'Kantong tidak ditemukan');
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('pocket_id', id)
      .order('transaction_date', { ascending: false });

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Pocket transactions fetched successfully',
      data: data || [],
    });
  } catch (err) {
    next(err);
  }
}

async function setEnabled(req, res, next) {
  try {
    const { enabled } = req.body || {};

    if (typeof enabled !== 'boolean') {
      throw createError(400, 'Field "enabled" harus berupa boolean');
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ pockets_enabled: enabled })
      .eq('id', req.user.id);

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Setelan Bagi Saldo disimpan',
      data: { enabled },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove, getTransactions, setEnabled };
