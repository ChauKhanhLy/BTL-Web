import React, { useState } from "react";
import "./css/LoginForm.css";

const LoginForm = () => {
  const [isForgot, setIsForgot] = useState(false); // false = login, true = forgot
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Sai tài khoản hoặc mật khẩu");
      return;
    }

    // 🔥 LƯU USER
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("token", data.token);

    // 🔥 CHUYỂN SANG APP
    window.location.href = "http://localhost:5173";

  } catch {
    setMessage("Lỗi kết nối máy chủ");
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
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("Liên kết đặt lại mật khẩu đã được gửi tới email của bạn!");
      } else {
        setMessage("Có lỗi xảy ra, vui lòng thử lại");
      }
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
              document.getElementById("react-login-container").style.display = "none";
              document.body.appendChild(root);  // trả React root lại body

            }}
            className="close-btn"
          >
            ×
          </button>

        <h2 className="auth-title">
          {isForgot ? "Forgot Password" : "Login"}
        </h2>

        {!isForgot ? (
          // ==== Form đăng nhập ====
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p
              className="forgot-password"
              onClick={() => {
                setIsForgot(true);
                setMessage("");
              }}
            >
              Forget your password?
            </p>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Processing..." : "Login"}
            </button>
            {message && <p className="auth-message">{message}</p>}
          </form>
        ) : (
          // ==== Form quên mật khẩu ====
          <form className="auth-form" onSubmit={handleForgot}>
            <p className="text-sm text-gray-500 mb-2">
              Nhập email để nhận liên kết khôi phục:
            </p>
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p
              className="back-login"
              onClick={() => {
                setIsForgot(false);
                setMessage("");
              }}
            >
              ← Back to Login
            </p>
            {message && <p className="auth-message">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
