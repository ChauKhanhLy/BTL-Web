import React from 'react';
import './LoginForm.css'; // We'll create this updated CSS file next

const LoginForm = () => {
  return (
    // This container centers the form on the page
    <div className="auth-container">
      
      {/* This is the main box with the border and rounded edges */}
      <div className="auth-box">
        
        {/* We've removed the toggle buttons and the registration form */}
        
        <h2 className="auth-title">Login</h2> {/* Added a title */}

        {/* Login Form */}
        <form className="auth-form">
          <input type="text" placeholder="Username" className="auth-input" />
          <input type="password" placeholder="Password" className="auth-input" />
          <p className="forgot-password">forget your password ?</p>
          <button type="submit" className="auth-button">Login</button>
        </form>

      </div>
    </div>
  );
};

export default LoginForm;