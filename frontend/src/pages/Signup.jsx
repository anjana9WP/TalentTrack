// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import googleIcon from "../assets/google-icon.png"; // Importing Google icon
import axios from "axios"; // Import Axios for API requests

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Send signup data to the backend
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        mobileNumber, // Include mobile number in request
        role: "User", // Default role for regular users
      });

      // On success, display a message and navigate to login
      setSuccessMessage(response.data.message);
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Handle errors from the backend
      if (error.response) {
        setError(error.response.data.error || "Signup failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setSuccessMessage("");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-form-container">
        <button className="back-button" onClick={() => navigate("/login")}>
          ← Back to Login
        </button>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="su-input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="su-input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter your mobile number"
              className="su-input-field"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="su-input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Re-enter Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className="su-input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
        <p className="continue-with">Or Sign up with</p>
        <div className="social-login">
          <button className="social-btn google-btn">
            <img src={googleIcon} alt="Google" className="google-icon" />
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
