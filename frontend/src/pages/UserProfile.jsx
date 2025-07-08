import { useState, useEffect } from 'react';
import './UserProfile.css';
import UserScoreChart from '../components/Charts/UserScoreChart';
import { IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const UserProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [isEditing, setIsEditing] = useState(false);
  const [scores, setScores] = useState(null);

  const token = localStorage.getItem('token');
  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { user, scores } = response.data;
        setName(user.name || '');
        setEmail(user.email || '');
        setBio(user.bio || 'No bio yet');
        setProfileImage(user.profileImage ? `${BASE_URL}/${user.profileImage}` : 'https://via.placeholder.com/150');
        setScores(scores);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await axios.post(`${BASE_URL}/api/user/profile/picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfileImage(`${BASE_URL}/${response.data.profileImage}`);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${BASE_URL}/api/user/profile`, { name, email, bio }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Prepare chart data (ignore null scores)
  const chartData = scores
  ? Object.entries(scores)
      .filter(([, value]) => typeof value === 'number')
      .map(([key, value]) => ({
        category:
          key === 'publicSpeaking' ? 'Public Speaking' :
          key === 'writtenCommunication' ? 'Written Communication' :
          key === 'criticalThinking' ? 'Critical Thinking' :
          key === 'interviewPractice' ? 'Interview Practice' :
          key,
        score: value
      }))
  : [];

  return (
    <div className="user-profile">
      <h1 className="profile-title">User Profile</h1>
      <div className="profile-section">
        <div className="profile-image-wrapper">
          <img src={profileImage} alt="Profile" className="profile-image" />
          <input
            accept="image/*"
            type="file"
            id="upload-image"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <label htmlFor="upload-image">
            <IconButton color="primary" component="span" className="upload-button">
              <PhotoCamera />
            </IconButton>
          </label>
        </div>

        <div className="profile-details">
          {isEditing ? (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field"
                placeholder="Tell us about yourself"
              ></textarea>
              <div className="action-buttons">
                <button onClick={handleSave} className="save-btn">Save Changes</button>
                <button onClick={handleEditToggle} className="cancel-btn">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h2>{name || 'No name available'}</h2>
              <p className="email-text">{email || 'No email available'}</p>
              <p className="bio-text">{bio || 'No bio yet'}</p>
              <button onClick={handleEditToggle} className="edit-btn">Edit Profile</button>
            </>
          )}
        </div>
      </div>

      <div className="score-summary">
        <h2 className="summary-title">Performance Summary</h2>
        {chartData.length > 0 ? (
          <UserScoreChart scores={chartData} />
        ) : (
          <p className="no-score-message">No performance scores available yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
