import crypto from 'crypto';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { supabase } from '../config/db.js';
import { sendResetPasswordEmail } from '../services/mailService.js';

// ======================
// 1️⃣ Quên mật khẩu
// ======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });

    // Kiểm tra user
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1);

    if (userErr) throw userErr;

    // Nếu không có user -> trả về ok=true (ẩn thông tin)
    if (!users || users.length === 0) {
      return res.json({ ok: true });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = dayjs().add(2, 'hour').toISOString();

    // Xóa token cũ (nếu có)
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .neq('used', true);

    // Lưu token mới
    await supabase.from('password_resets').insert([
      { user_id: user.id, email: user.email, token, expires_at: expires, used: false },
    ]);

    const resetLink = `${process.env.FRONTEND_URL}/reset?token=${token}`;
    await sendResetPasswordEmail(user.email, resetLink);

    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ forgotPassword error:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// ======================
// 2️⃣ Đặt lại mật khẩu
// ======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: 'Thiếu token hoặc mật khẩu' });

    // Tìm token trong bảng password_resets
    const { data: rows, error: tokenErr } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .limit(1);

    if (tokenErr) throw tokenErr;
    if (!rows || rows.length === 0)
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã dùng' });

    const row = rows[0];
    if (dayjs().isAfter(dayjs(row.expires_at))) {
      return res.status(400).json({ error: 'Token đã hết hạn' });
    }

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu user
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', row.user_id);

    if (updateErr) throw updateErr;

    // Đánh dấu token đã dùng
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', row.id);

    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ resetPassword error:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
