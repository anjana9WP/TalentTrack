// src/pages/WrittenCommunication.jsx
import { useState } from 'react';
import { Typography, Button, Input, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CloudUpload from '@mui/icons-material/CloudUpload';
import './WrittenCommunication.css';
import heroImage from '../assets/placeholder3.jpg';
import logo from '../assets/CTTLine.png';
import axios from 'axios';

const WrittenCommunication = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [type, setType] = useState('');

  const handleTextChange = (value) => setText(value);
  const handleFileChange = (event) => setFile(event.target.files[0]);
  const handleDragOver = (event) => { event.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (event) => { event.preventDefault(); setDragging(false); setFile(event.dataTransfer.files[0]); };
  const handleTypeChange = (event) => setType(event.target.value);

  const handleSubmitText = async () => {
    if (!text.trim() || !type) {
      alert("Please select a writing type and write something before submitting!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", type);
      formData.append("content", text);
      formData.append("type", type);
      const response = await axios.post("http://localhost:5000/api/written-communication/submit", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        alert("Your written task has been submitted successfully!");
        setText("");
        setType("");
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error("Detailed Error:", error);
      alert("Error submitting your task. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitFile = async () => {
    if (!file || !type) {
      alert("Please select a writing type and upload a document before submitting!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", type);
      formData.append("document", file);
      formData.append("type", type);
      setUploading(true);
      const response = await axios.post("http://localhost:5000/api/written-communication/submit", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        alert("Your document has been submitted successfully!");
        setFile(null);
        setType("");
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error("Detailed Error:", error);
      alert("Error submitting your file. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <div className="written-communication">
      <div className="whero-section">
        <div className="whero-content">
          <h1 className="whero-title">Written Communication Practice</h1>
          <p className="whero-subtitle">Improve your writing skills with focused exercises and practice</p>
        </div>
        <div className="whero-image-wrapper">
          <img src={heroImage} alt="Written Communication Hero" className="whero-image" />
        </div>
      </div>

      <div className="wtips-section">
        <div className="wtips-box">
          <Typography variant="h4" fontFamily={"Poppins"} fontWeight={"bold"} color="#e8b028" gutterBottom>
            Writing Tips
          </Typography>
          <ul className="wtips-list">
            <li>Organize your thoughts before you start writing.</li>
            <li>Focus on clarity and avoid complex sentences.</li>
            <li>Review grammar and spelling before submitting.</li>
            <li>Practice writing concisely and to the point.</li>
            <li>Read examples of well-written texts to learn structure.</li>
            <li>Use active voice wherever possible for stronger impact.</li>
            <li>Keep your writing relevant to the topic at hand.</li>
          </ul>
        </div>
      </div>

      <div className="writing-area">
        <Typography variant="h5" fontFamily={"Poppins"} fontWeight={"bold"} color="#e8b028" gutterBottom>
          Write Your Essay
        </Typography>
        <div className="word-count">Word Count: {wordCount}</div>

        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="writing-type-label">Select Writing Type</InputLabel>
          <Select
            labelId="writing-type-label"
            value={type}
            label="Select Writing Type"
            onChange={handleTypeChange}
          >
            <MenuItem value="Email">Email</MenuItem>
            <MenuItem value="Essay">Essay</MenuItem>
            <MenuItem value="Informal Letter">Informal Letter</MenuItem>
            <MenuItem value="Formal Letter">Formal Letter</MenuItem>
            <MenuItem value="Blog">Blog</MenuItem>
          </Select>
        </FormControl>

        <ReactQuill
          value={text}
          onChange={handleTextChange}
          className="text-editor"
          placeholder="Start typing your essay here..."
        />
        <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleSubmitText}>
          Submit Text
        </Button>
      </div>

      <div className="document-upload">
        <div className="back-placeholder">
          <h3 className="upload-title">Upload Your Writing Practice</h3>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="writing-type-upload-label">Select Writing Type</InputLabel>
            <Select
              labelId="writing-type-upload-label"
              value={type}
              label="Select Writing Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="Email">Email</MenuItem>
              <MenuItem value="Essay">Essay</MenuItem>
              <MenuItem value="Informal Letter">Informal Letter</MenuItem>
              <MenuItem value="Formal Letter">Formal Letter</MenuItem>
              <MenuItem value="Blog">Blog</MenuItem>
            </Select>
          </FormControl>

          <div className={`upload-area ${dragging ? "dragging" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <p>Drag & Drop your document here or</p>
            <label htmlFor="upload-document">
              <Input accept=".doc,.docx,.pdf" id="upload-document" type="file" onChange={handleFileChange} style={{ display: "none" }} />
              <Button variant="contained" component="span" startIcon={<CloudUpload />} color="primary">
                Upload File
              </Button>
            </label>
          </div>
          {file && <p>Selected File: {file.name}</p>}
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleSubmitFile}>
            Submit File
          </Button>
          {uploading && <CircularProgress sx={{ marginTop: 2 }} />}
          {uploadSuccess && (
            <Typography variant="body2" color="success.main" fontFamily={"Poppins"} sx={{ marginTop: 2 }}>
              Document uploaded successfully!
            </Typography>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-logo">
          <img src={logo} alt="CurtinTalentTrack Logo" />
        </div>
        <ul className="footer-links">
          <li><a href="/home">Home</a></li>
          <li><a href="/public-speaking">Speaking</a></li>
          <li><a href="/interviews">Interviews</a></li>
          <li><a href="/writing">Writing</a></li>
          <li><a href="/thinking">Thinking</a></li>
          <li><a href="/events">Events</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
        </ul>
      </footer>
    </div>
  );
};

export default WrittenCommunication;