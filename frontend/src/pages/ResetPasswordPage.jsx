import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setStatus('mismatch');
    try {
      await axios.post('http://localhost:4000/api/auth/reset', { token, password });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[380px]">
        <h2 className="text-2xl font-semibold text-emerald-900 mb-3">Đặt lại mật khẩu</h2>
        {status === 'success' ? (
          <p className="text-emerald-700">Mật khẩu đã được đặt lại thành công!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="border p-3 w-full rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className="border p-3 w-full rounded"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button className="bg-emerald-700 w-full text-white py-2 rounded font-medium hover:bg-emerald-800">
              Đặt lại mật khẩu
            </button>
          </form>
        )}
        {status === 'mismatch' && <p className="text-red-600 mt-2">Mật khẩu không khớp</p>}
        {status === 'error' && <p className="text-red-600 mt-2">Link không hợp lệ hoặc đã hết hạn</p>}
      </div>
    </div>
  );
}
