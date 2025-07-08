// src/components/Navbar.jsx
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/user-profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    navigate('/login');
    handleMenuClose();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">CurtinTalentTrack</div>
      <ul className="navbar-links">
        <li><Link to="home">Home</Link></li>
        <li><Link to="/public-speaking">Speaking</Link></li>
        <li><Link to="/interview-practice">Interviews</Link></li>
        <li><Link to="/written-communication">Writing</Link></li>
        <li><Link to="/critical-thinking">Thinking</Link></li>
        <li><Link to="/event-calendar">Events</Link></li>
        <li><Link to="/feedback">Feedback</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li>
          <div className="user-icon" onClick={handleMenuOpen}>
            <Avatar className="profile-avatar">
              <PersonIcon fontSize="small" />
            </Avatar>
          </div>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
