import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import './Login.css';
import googleIcon from '../assets/google-icon.png'; // Importing Google icon
import logo from '../assets/CTT Logo.png'; // Importing the logo

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Save token and role to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      // Navigate based on user role
      if (response.data.role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (response.data.role === 'Evaluator') {
        navigate('/evaluator-dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Invalid login credentials');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="left-section">
        <img src={logo} alt="CurtinTalentTrack Logo" className="logo" />
        <p className="tagline">Empowering Your Journey to Success</p>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <div className="input-icon">
                <span className="icon">@</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="input-icon">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <p className="continue-with">Or Sign in with</p>
          <div className="social-login">
            <button className="social-btn google-btn">
              <img src={googleIcon} alt="Google" className="google-icon" />
              Sign in with Google
            </button>
          </div>
          <p className="create-account">
            Create an account? <span onClick={() => navigate('/signup')}>Sign Up here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
