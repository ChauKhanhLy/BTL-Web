import crypto from 'crypto';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabaseClient.js';
import { sendResetPasswordEmail } from '../services/mailService.js';

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .limit(1);

  if (!users || users.length === 0)
    return res.json({ ok: true }); // không tiết lộ email không tồn tại

  const user = users[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expires = dayjs().add(2, 'hour').toISOString();

  await supabase.from('password_resets').insert([
    { user_id: user.id, email: user.email, token, expires_at: expires },
  ]);

  const resetLink = `${process.env.FRONTEND_URL}/reset?token=${token}`;
  await sendResetPasswordEmail(user.email, resetLink);

  return res.json({ ok: true });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: 'Thiếu thông tin' });

  const { data: rows } = await supabase
    .from('password_resets')
    .select('*')
    .eq('token', token)
    .limit(1);

  if (!rows || rows.length === 0)
    return res.status(400).json({ error: 'Token không hợp lệ' });

  const row = rows[0];
  if (dayjs().isAfter(dayjs(row.expires_at)))
    return res.status(400).json({ error: 'Token đã hết hạn' });

  const hashed = await bcrypt.hash(password, 10);
  await supabase.from('users').update({ password: hashed }).eq('id', row.user_id);
  await supabase.from('password_resets').update({ used: true }).eq('id', row.id);

  return res.json({ ok: true });
};
