const { supabaseAdmin } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const POCKET_KEYS = ['pokok', 'foya', 'wajib'];

async function getAll(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pockets')
      .select('key, allocated')
      .eq('user_id', req.user.id);

    if (error) throw createError(500, error.message);

    const result = {};
    for (const key of POCKET_KEYS) {
      result[key] = { allocated: 0 };
    }
    for (const row of data || []) {
      result[row.key] = { allocated: Number(row.allocated) };
    }

    res.json({
      success: true,
      message: 'Pockets fetched successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const body = req.body || {};
    const rows = [];

    for (const key of POCKET_KEYS) {
      const entry = body[key];
      if (!entry) continue;

      const allocated = Number(entry.allocated);
      if (isNaN(allocated) || allocated < 0) {
        throw createError(400, `Invalid allocated value for pocket "${key}"`);
      }

      rows.push({
        user_id: req.user.id,
        key,
        allocated,
        updated_at: new Date().toISOString(),
      });
    }

    if (rows.length === 0) {
      throw createError(400, 'At least one pocket allocation is required');
    }

    const { data, error } = await supabaseAdmin
      .from('pockets')
      .upsert(rows, { onConflict: 'user_id,key' })
      .select();

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Pockets saved successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, upsert };
