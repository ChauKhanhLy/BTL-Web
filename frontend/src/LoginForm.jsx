import React from 'react';
import './css/LoginForm.css';

const LoginForm = () => {
  return (
    <div className="auth-container">
      <div className="sidebar-box"></div>

      <div className="auth-box">

        <h2 className="auth-title">Login</h2>

        <form className="auth-form">
          <input type="text" placeholder="Username" className="auth-input" />
          <input type="password" placeholder="Password" className="auth-input" />
          <p className="forgot-password">Forget your password ?</p>
          <button type="submit" className="auth-button">Login</button>
        </form>

      </div>
    </div>
  );
};

export default LoginForm;