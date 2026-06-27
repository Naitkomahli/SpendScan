const { supabaseAdmin } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

async function getAll(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('transaction_date', { ascending: false });

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Transactions fetched successfully',
      data: data || [],
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      throw createError(404, 'Transaction not found');
    }

    res.json({
      success: true,
      message: 'Transaction fetched successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, amount, category, transactionDate, note, receiptImageUrl, rawOcrText, source, type } = req.body;

    if (!title || !amount || !category || !transactionDate) {
      throw createError(400, 'Title, amount, category, and transactionDate are required');
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([{
        user_id: req.user.id,
        title,
        amount,
        category,
        transaction_date: transactionDate,
        note: note || null,
        receipt_image_url: receiptImageUrl || null,
        raw_ocr_text: rawOcrText || null,
        source: source || 'manual',
        type: type || 'expense',
      }])
      .select()
      .single();

    if (error) throw createError(500, error.message);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, amount, category, transactionDate, note, receiptImageUrl, rawOcrText, type } = req.body;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      throw createError(404, 'Transaction not found');
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    if (transactionDate !== undefined) updates.transaction_date = transactionDate;
    if (note !== undefined) updates.note = note;
    if (receiptImageUrl !== undefined) updates.receipt_image_url = receiptImageUrl;
    if (rawOcrText !== undefined) updates.raw_ocr_text = rawOcrText;
    if (type !== undefined) updates.type = type;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      throw createError(404, 'Transaction not found');
    }

    const { error } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw createError(500, error.message);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
