import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('login');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    aadharNumber: ''
  });

  const handleSlide = (form) => {
    setActiveForm(form);
    setError(''); // Clear any existing errors
  };

  const handleSignupLinkClick = (e) => {
    e.preventDefault();
    setActiveForm('signup');
    setError('');
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Signup successful - switch to login form
      setActiveForm('login');
      alert('Registration successful! Please login.');
      
      // Clear signup form
      setSignupData({
        email: '',
        password: '',
        aadharNumber: ''
      });
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="wrapper">
      <div className="title-text" style={{ marginLeft: activeForm === 'signup' ? '-100%' : '0%' }}>
        <div className="title login">Login Form</div>
        <div className="title signup">Signup Form</div>
      </div>

      {error && <div className="error-message">{error}</div>}

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
              <input 
                type="email" 
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Email Address" 
                required 
              />
            </div>
            <div className="field">
              <input 
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Password" 
                required 
              />
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
          <form onSubmit={handleSignupSubmit}>
            <div className="field">
              <input 
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="Email Address" 
                required 
              />
            </div>
            <div className="field">
              <input 
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Password" 
                required 
              />
            </div>
            <div className="field">
              <input 
                type="text"
                name="aadharNumber"
                value={signupData.aadharNumber}
                onChange={handleSignupChange}
                placeholder="Aadhar Number *" 
                pattern="[0-9]{12}" 
                title="Please enter a valid 12-digit Aadhar number"
                maxLength="12"
                required 
              />
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
