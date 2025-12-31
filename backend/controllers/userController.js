import crypto from 'crypto';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { supabase } from '../config/db.js';
import { sendResetPasswordEmail } from '../services/mailService.js';

const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

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

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.unit = req.body.unit || user.unit;
      user.shift = req.body.shift || user.shift;
      
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        unit: updatedUser.unit,
        shift: updatedUser.shift,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optional: Delete old avatar if it exists and is not the default
    if (user.avatar && !user.avatar.includes('default-avatar.png')) {
        const oldPath = path.join(__dirname, '..', user.avatar.replace('http://localhost:5000/', ''));
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const avatarUrl = `/uploads/avatar/${req.file.filename}`;
    
    user.avatar = avatarUrl;
    await user.save();

    res.json({ 
        message: 'Avatar uploaded', 
        file: req.file.filename,
        avatarUrl: `http://localhost:5000${avatarUrl}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const data = await userService.fetchUsers(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // verify, suspend, unlock
    const result = await userService.changeUserStatus(id, action);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.inviteUser(id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
  getUsers,
  updateUserStatus,
  sendInvite
};