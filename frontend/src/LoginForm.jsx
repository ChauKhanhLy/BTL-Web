import React, { useState } from "react";
import "./css/LoginForm.css";

const LoginForm = ({ setUser, setCurrentPage }) => {
  const [page, setPage] = useState("login"); // login, change-password, forgot
  const [isForgot, setIsForgot] = useState(false); // false = login, true = forgot
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isReset, setIsReset] = useState(false); // 👈 MỚI

  // Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ten_dang_nhap: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Sai tài khoản hoặc mật khẩu");
        return;
      }

      // Nếu phải đổi mật khẩu lần đầu
      if (data.mustChangePassword) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", data.user.id);
        setUsername(data.user.ten_dang_nhap);
        setMustChangePassword(true);
        return; // chưa set user, chưa vào home
      }

      // 🔥 LƯU USER
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("token", data.token);
      setUser(data.user);

      // Chuyển trang theo role
      if (data.user.role === "admin") {
        setCurrentPage("menumanagement");
      } else {
        setCurrentPage("menu");
      }
    } catch (err) {
      setMessage("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };
  // Hàm đổi mật khẩu lần đầu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔐 QUAN TRỌNG
          },
          body: JSON.stringify({
            newPassword: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Không thể đổi mật khẩu");
        return;
      }

      alert("Đổi mật khẩu thành công!");

      // ✅ VÀO MENU LUÔN
      setMustChangePassword(false);
      setUser(JSON.parse(localStorage.getItem("user")));
      setCurrentPage("menu");
    } catch {
      setMessage("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý quên mật khẩu
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Không gửi được OTP");
        return;
      }

      // ✅ GỬI EMAIL THÀNH CÔNG
      setIsForgot(false);   // tắt form email
      setIsReset(true);    // 👈 BẬT FORM NHẬP OTP
      setMessage("");      // xoá message cũ

    } catch {
      setMessage("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
            newPassword: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "OTP không hợp lệ");
        return;
      }

      alert("Đặt lại mật khẩu thành công");
      setPage("login"); // ✅ quay lại login
    } catch {
      setMessage("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button
          onClick={() => {
            const root = document.getElementById("react-login-root");
            document.getElementById("react-login-container").style.display =
              "none";
            document.body.appendChild(root);
          }}
          className="close-btn"
        >
          ×
        </button>

        <h2 className="auth-title">
          {mustChangePassword
            ? "Đổi mật khẩu"
            : isForgot
              ? "Quên mật khẩu"
              : "Đăng nhập"}
        </h2>

        {/* ======= ĐỔI MẬT KHẨU LẦN ĐẦU ======= */}
        {mustChangePassword ? (
          /* ===== ĐỔI MẬT KHẨU LẦN ĐẦU ===== */
          <form className="auth-form" onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              minLength={6}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="auth-button">Xác nhận</button>

            {message && <p className="auth-message">{message}</p>}
          </form>

        ) : isReset ? (

          /* ===== RESET PASSWORD (OTP) ===== */
          <form className="auth-form" onSubmit={handleResetPassword}>
            <p className="text-sm mb-2">Email: {email}</p>

            <input
              placeholder="Nhập OTP"
              className="auth-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="auth-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <button className="auth-button" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            <p
              className="back-login"
              onClick={() => {
                setIsReset(false);
                setIsForgot(false);
              }}
            >
              ← Back to Login
            </p>

            {message && <p className="auth-message">{message}</p>}
          </form>

        ) : isForgot ? (

          /* ===== QUÊN MẬT KHẨU ===== */
          <form className="auth-form" onSubmit={handleForgot}>
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="back-login" onClick={() => setIsForgot(false)}>
              ← Back to Login
            </p>

            {message && <p className="auth-message">{message}</p>}
          </form>

        ) : (

          /* ===== ĐĂNG NHẬP ===== */
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // 👁️‍🗨️ mắt mở
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="22"
                    viewBox="0 0 24 24"
                    width="22"
                    fill="currentColor"
                  >
                    <path d="M12 5c-7.633 0-12 7-12 7s4.367 7 12 7 12-7 12-7-4.367-7-12-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                  </svg>
                ) : (
                  // 🙈 mắt gạch
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="22"
                    viewBox="0 0 24 24"
                    width="22"
                    fill="currentColor"
                  >
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                )}
              </span>
            </div>

            <p
              className="forgot-password"
              onClick={() => {
                setIsForgot(true);
                setMessage("");
              }}
            >
              Forget your password?
            </p>

            <button className="auth-button" disabled={loading}>
              {loading ? "Processing..." : "Login"}
            </button>

            {message && <p className="auth-message">{message}</p>}
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginForm;