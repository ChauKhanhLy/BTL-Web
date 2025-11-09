import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:4000/api/auth/forgot', { email });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[380px]">
        <h2 className="text-2xl font-semibold text-emerald-900 mb-3">Quên mật khẩu</h2>
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Nhập email"
              className="border p-3 w-full rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="bg-emerald-700 w-full text-white py-2 rounded font-medium hover:bg-emerald-800">
              Gửi link đặt lại
            </button>
          </form>
        ) : (
          <p className="text-emerald-700">
            Nếu email tồn tại, bạn sẽ nhận được link đặt lại trong hộp thư.
          </p>
        )}
      </div>
    </div>
  );
}
