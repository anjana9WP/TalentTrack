// src/pages/PublicSpeaking.jsx
import { useState } from 'react';
import { Typography, Button, Input, CircularProgress, LinearProgress, TextField } from '@mui/material';
import CloudUpload from '@mui/icons-material/CloudUpload';
import './PublicSpeaking.css';
import heroImage from '../assets/placeholder1.jpg';
//import logo from '../assets/CTTLine.png';
import axios from 'axios';

const PublicSpeaking = () => {
  const [uploading, setUploading] = useState(false);  // State to handle loading state during upload
  const [uploadSuccess, setUploadSuccess] = useState(false);  // State to track upload success
  const [dragging, setDragging] = useState(false);  // State to track drag-and-drop status
  const [progress, setProgress] = useState(0);  // State for tracking upload progress
  const [videoUrl, setVideoUrl] = useState('');  // To store the video URL after upload
  const [errorMessage, setErrorMessage] = useState('');  // To store any error messages
  const [title, setTitle] = useState('');  // State for the speech title

  // Handle video upload functionality
  const handleVideoUpload = async (event) => {
    event.preventDefault();
    setUploading(true); // Start the upload process
    setProgress(0); // Reset progress to 0

    const formData = new FormData();
    formData.append('video', event.target.files[0]);
    formData.append('title', title);  // Append the title to the form data

    try {
      // Uploading the video with progress tracking
      const response = await axios.post('http://localhost:5000/api/public-speaking/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentage); // Update progress state
        },
      });

      setUploading(false);
      setUploadSuccess(true);
      setVideoUrl(`http://localhost:5000${response.data.speech.videoUrl}`); // Save video URL from backend
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploading(false);
      setErrorMessage("Failed to upload speech. Please try again.");
    }
  };

  // Handle drag over event for drag-and-drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true); // Change state when dragging over the upload area
  };

  // Handle drag leave event for drag-and-drop
  const handleDragLeave = () => {
    setDragging(false); // Change state when the drag leaves the upload area
  };

  // Handle drop event for drag-and-drop file upload
  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false); // Reset dragging state when file is dropped
    handleVideoUpload(event); // Proceed with video upload
  };

  return (
    <div className="public-speaking">
      {/* Hero Section */}
      <div className="phero-section">
        <div className="phero-content">
          <h1 className="phero-title">Public Speaking Practice</h1>
          <p className="phero-subtitle">Master the art of public speaking with practical exercises</p>
        </div>
        <div className="phero-image-wrapper">
          <img src={heroImage} alt="Public Speaking Hero" className="phero-image" />
        </div>
      </div>

      {/* Tips Section */}
      <div className="ptips-section">
        <div className="ptips-box">
          <Typography variant="h4" fontFamily={'Poppins'} fontWeight={'bold'} color="#e8b028" gutterBottom>
            Public Speaking Tips
          </Typography>
          <ul className="ptips-list">
            <li>Maintain eye contact with your audience.</li>
            <li>Use appropriate gestures and facial expressions.</li>
            <li>Practice clear and confident speech.</li>
            <li>Record and review your practice sessions to identify areas of improvement.</li>
            <li>Organize your thoughts and structure your speech clearly.</li>
            <li>Engage with your audience by asking questions or using anecdotes.</li>
            <li>Practice controlling your pace and tone for emphasis and clarity.</li>
          </ul>
        </div>
      </div>

      {/* Title Input */}
      <div className="title-input">
        <TextField
          label="Speech Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ width: '50%', margin: '0 auto', display: 'block' }}
        />
      </div>

      {/* Video Upload Section */}
      <div className="video-upload">
        <div className="back-placeholder">
          <h3 className="upload-title">Upload Your Practice Video</h3>
          <div
            className={`upload-area ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>Drag & Drop your video file here or</p>
            <label htmlFor="upload-video">
              <Input
                accept="video/*"
                id="upload-video"
                type="file"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
                color="primary"
              >
                Upload File
              </Button>
            </label>
          </div>

          {/* Show loading spinner and progress bar */}
          {uploading && (
            <>
              <CircularProgress sx={{ marginTop: 2 }} />
              <LinearProgress variant="determinate" value={progress} sx={{ marginTop: 2 }} />
            </>
          )}

          {/* Success message after upload */}
          {uploadSuccess && (
            <Typography variant="body2" color="success.main" fontFamily={'Poppins'} sx={{ marginTop: 2 }}>
              Video uploaded successfully!
            </Typography>
          )}

          {/* Error message */}
          {errorMessage && (
            <Typography variant="body2" color="error" fontFamily={'Poppins'} sx={{ marginTop: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </div>
      </div>

    {/* Display Uploaded Video */}
    {videoUrl && (
      <div className="uploaded-video">
        <Typography variant="h6">Your Uploaded Video</Typography>

        {/* Log the video URL for debugging */}
        {console.log("Video URL:", videoUrl)}

        <video controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
      </video>
    </div>
    )}

    </div>
  );
};

export default PublicSpeaking;
