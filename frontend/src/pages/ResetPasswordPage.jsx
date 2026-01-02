import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <p className="text-center mt-10">
        Thiếu email. Vui lòng quay lại trang quên mật khẩu.
      </p>
    );
  }

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.error || "OTP không hợp lệ");
      }
    } catch (err) {
      setMessage("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          Đặt lại mật khẩu
        </h2>

        <p className="text-sm mb-3 text-center text-gray-500">
          Email: {email}
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          placeholder="Nhập mã OTP"
          className="w-full p-2 mb-3 border rounded-lg"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Mật khẩu mới"
          className="w-full p-2 mb-3 border rounded-lg"
        />

        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Nhập lại mật khẩu"
          className="w-full p-2 border rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg"
        >
          {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
