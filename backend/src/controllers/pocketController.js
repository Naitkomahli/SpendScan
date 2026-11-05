const { supabaseAdmin } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const DEFAULT_ICON = 'wallet';
const DEFAULT_COLOR = '#2F6B4F';

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon || DEFAULT_ICON,
    color: row.color || DEFAULT_COLOR,
    allocated: Number(row.allocated) || 0,
    sortOrder: row.sort_order || 0,
  };
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

async function getAll(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pockets')
      .select('id, name, icon, color, allocated, sort_order')
      .eq('user_id', req.user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw createError(500, error.message);

    const enabled = await getEnabled(req.user.id);

    res.json({
      success: true,
      message: 'Pockets fetched successfully',
      data: {
        enabled,
        pockets: (data || []).map(toClient),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, icon, color, allocated } = req.body || {};

    if (!name || !String(name).trim()) {
      throw createError(400, 'Nama kantong wajib diisi');
    }

    const amount = Number(allocated) || 0;
    if (isNaN(amount) || amount < 0) {
      throw createError(400, 'Alokasi tidak boleh negatif');
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
        allocated: amount,
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
      data: toClient(data),
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, icon, color, allocated, sortOrder } = req.body || {};

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
    if (allocated !== undefined) {
      const amount = Number(allocated);
      if (isNaN(amount) || amount < 0) throw createError(400, 'Alokasi tidak valid');
      updates.allocated = amount;
    }
    if (sortOrder !== undefined) updates.sort_order = Number(sortOrder) || 0;

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

    res.json({
      success: true,
      message: 'Kantong berhasil diperbarui',
      data: toClient(data),
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

    // Transaksi terkait otomatis jadi "Tanpa Kantong" (FK ON DELETE SET NULL)
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

module.exports = { getAll, create, update, remove, setEnabled };
