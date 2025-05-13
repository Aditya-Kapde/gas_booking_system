import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('login');
  const navigate = useNavigate();

  const handleSlide = (form) => {
    setActiveForm(form);
  };

  const handleSignupLinkClick = (e) => {
    e.preventDefault();
    setActiveForm('signup');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // You can validate the form data here before redirecting
    navigate('/home');
  };

  return (
    <div className="wrapper">
      <div className="title-text" style={{ marginLeft: activeForm === 'signup' ? '-100%' : '0%' }}>
        <div className="title login">Login Form</div>
        <div className="title signup">Signup Form</div>
      </div>

      <div className="form-container">
        <div className="slide-controls">
          <input type="radio" name="slide" id="login" checked={activeForm === 'login'} readOnly />
          <input type="radio" name="slide" id="signup" checked={activeForm === 'signup'} readOnly />
          <label htmlFor="login" className="slide login" onClick={() => handleSlide('login')}>
            Login
          </label>
          <label htmlFor="signup" className="slide signup" onClick={() => handleSlide('signup')}>
            Signup
          </label>
          <div className="slider-tab" style={{ left: activeForm === 'signup' ? '50%' : '0%' }}></div>
        </div>

        <div className="form-inner" style={{ marginLeft: activeForm === 'signup' ? '-100%' : '0%' }}>
          {/* Login Form */}
          <form className="login" onSubmit={handleLoginSubmit}>
            <div className="field">
              <input type="text" placeholder="Email Address" required />
            </div>
            <div className="field">
              <input type="password" placeholder="Password" required />
            </div>
            <div className="pass-link"><a href="#">Forgot password?</a></div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Login" />
            </div>
            <div className="signup-link">
              Not a member? <a href="#" onClick={handleSignupLinkClick}>Signup now</a>
            </div>
          </form>

          {/* Signup Form */}
          <form className="signup">
            <div className="field">
              <input type="text" placeholder="Email Address" required />
            </div>
            <div className="field">
              <input type="password" placeholder="Password" required />
            </div>
            <div className="field">
              <input type="password" placeholder="Confirm password" required />
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input type="submit" value="Signup" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
