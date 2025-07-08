// src/pages/DashboardSelection.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardSelection.css';

const DashboardSelection = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (email && password) {
      // Simulate login process and redirect based on role
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'evaluator') {
        navigate('/evaluator-dashboard');
      }
    } else {
      setError('Please enter both email and password.');
    }
  };

  return (
    <div className="dashboard-selection">
      <h1 className="selection-title">Welcome to the Dashboard</h1>
      <div className="selection-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        {error && <p className="error-message">{error}</p>}
        <div className="role-buttons">
          <button className="role-btn admin-btn" onClick={() => handleLogin('admin')}>
            Login as Admin
          </button>
          <button className="role-btn evaluator-btn" onClick={() => handleLogin('evaluator')}>
            Login as Evaluator
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelection;
