import { useState, useEffect } from "react";
import { Typography, Button, Input, CircularProgress, LinearProgress } from "@mui/material";
import CloudUpload from "@mui/icons-material/CloudUpload";
import "./InterviewPractice.css";
import heroImage from "../assets/placeholder2.jpg";
import axios from "axios";
import logo from "../assets/CTTLine.png";

const InterviewPractice = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        // Default to today in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        return today;
    });
    const [isBooking, setIsBooking] = useState(false);
    const [bookingMessage, setBookingMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState("");
    const [title, setTitle] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [userInterviews, setUserInterviews] = useState([]);

    useEffect(() => {
        fetchUserInterviews();
    }, []);

    const fetchUserInterviews = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/interviews", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserInterviews(response.data);
        } catch (error) {
            console.error("Error fetching user interviews:", error);
        }
    };

    const availableSlots = [
        "10:00 AM - 10:30 AM",
        "11:00 AM - 11:30 AM",
        "1:00 PM - 1:30 PM",
        "3:00 PM - 3:30 PM",
        "4:30 PM - 5:00 PM",
    ];

    const handleSlotSelection = (slot) => setSelectedSlot(slot);

    const handleSlotBooking = async () => {
        setIsBooking(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/interviews/book-slot",
                { slot: selectedSlot, date: selectedDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookingMessage(response.data.message || "Slot booked successfully!");
            fetchUserInterviews();
        } catch (error) {
            setBookingMessage(
                error.response?.data?.error || "Failed to book slot. Try again!"
            );
        } finally {
            setIsBooking(false);
        }
    };

    // Video upload handler
    const handleVideoUpload = async (event) => {
        event.preventDefault();
        setUploading(true);
        setProgress(0);

        const file = event.target.files && event.target.files[0];
        if (!file) {
            setErrorMessage("No file selected.");
            setUploading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("video", file);
            formData.append("title", title);
            // Note: Slot is not appended in video upload

            const response = await axios.post(
                "http://localhost:5000/api/interviews/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentage);
                    },
                }
            );

            setUploading(false);
            setUploadSuccess(true);
            setVideoUrl(`http://localhost:5000${response.data.videoUrl}`);
            fetchUserInterviews();
        } catch (error) {
            console.error("Error uploading video:", error);
            setUploading(false);
            setErrorMessage("Failed to upload video. Please try again.");
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const fileEvent = { target: { files: event.dataTransfer.files } };
        handleVideoUpload(fileEvent);
    };

    // Separate interviews into video and non-video submissions
    const videoInterviews = userInterviews.filter(interview => interview.videoUrl);
    const textInterviews = userInterviews.filter(interview => !interview.videoUrl);

    return (
        <div className="interview-practice">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Interview Practice</h1>
                    <p className="hero-subtitle">
                        Prepare for your interviews with real-world practice scenarios.
                    </p>
                </div>
                <div className="hero-image-wrapper">
                    <img src={heroImage} alt="Interview Hero" className="hero-image" />
                </div>
            </div>

            {/* Tips Section */}
            <div className="i-tips-section">
                <div className="i-tips-box">
                    <Typography variant="h4" fontFamily={"Poppins"} fontWeight={"bold"} color="#e8b028" gutterBottom>
                        Interview Tips
                    </Typography>
                    <ul className="i-tips-list">
                        <li>Practice answering common interview questions.</li>
                        <li>Maintain good posture and eye contact.</li>
                        <li>Be prepared to talk about your achievements.</li>
                        <li>Research the company and the role beforehand.</li>
                        <li>Keep your answers concise and to the point.</li>
                        <li>Practice confident and clear communication.</li>
                        <li>Prepare questions to ask the interviewer.</li>
                    </ul>
                </div>
            </div>

            {/* Available Slots Section (for booking purposes only) */}
            <div className="available-slots">
                <Typography variant="h4" fontFamily={"Poppins"} fontWeight={"bold"} color="#e8b028" gutterBottom>
                    Available Slots
                </Typography>
                <div className="slots-grid">
                    {availableSlots.map((slot, index) => (
                        <div
                            key={index}
                            className={`slot-item ${selectedSlot === slot ? "selected" : ""}`}
                            onClick={() => handleSlotSelection(slot)}
                        >
                            {slot}
                        </div>
                    ))}
                </div>
                {/* Date Picker for Slot Booking */}
                <div style={{ marginTop: "20px" }}>
                    <Typography variant="body1" fontFamily={"Poppins"}>
                        Select Date:
                    </Typography>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        style={{ padding: "8px", fontSize: "16px", marginTop: "5px" }}
                    />
                </div>
                {selectedSlot && (
                    <div>
                        <Typography variant="body1" color="primary" fontFamily={"Poppins"} sx={{ mt: 2 }}>
                            Selected Slot: {selectedSlot} on {selectedDate}
                        </Typography>
                        <Button variant="contained" color="primary" onClick={handleSlotBooking} disabled={isBooking} sx={{ mt: 2 }}>
                            {isBooking ? <CircularProgress size={24} /> : "Book Slot"}
                        </Button>
                    </div>
                )}
                {bookingMessage && (
                    <Typography variant="body2" color={bookingMessage.includes("success") ? "success.main" : "error"} fontFamily={"Poppins"} sx={{ mt: 2 }}>
                        {bookingMessage}
                    </Typography>
                )}
            </div>

            {/* Video Upload Section */}
            <div className="video-upload">
                <div className="back-placeholder">
                    <h3 className="upload-title">Upload Your Interview Practice Video</h3>
                    <div style={{ marginBottom: "10px" }}>
                        <Input
                            placeholder="Enter Video Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div
                        className={`upload-area ${dragging ? "dragging" : ""}`}
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
                                style={{ display: "none" }}
                            />
                            <Button variant="contained" component="span" startIcon={<CloudUpload />} color="primary">
                                Upload File
                            </Button>
                        </label>
                    </div>
                    {errorMessage && (
                        <Typography variant="body2" color="error" fontFamily={"Poppins"} sx={{ marginTop: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    {uploading && (
                        <>
                            <CircularProgress sx={{ marginTop: 2 }} />
                            <LinearProgress variant="determinate" value={progress} sx={{ marginTop: 2 }} />
                            <Typography variant="body2" fontFamily={"Poppins"} sx={{ marginTop: 1 }}>
                                Uploading... {progress}%
                            </Typography>
                        </>
                    )}
                    {uploadSuccess && (
                        <div style={{ marginTop: "10px" }}>
                            <Typography variant="body2" color="success.main" fontFamily={"Poppins"}>
                                Video uploaded successfully!
                            </Typography>
                            {videoUrl && (
                                <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "blue" }}>
                                    View Video
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* User's Uploaded Interviews Section */}
            <div className="user-interviews" style={{ padding: "0 60px 60px 60px" }}>
                {/* Text (Non-Video) Interview Submissions */}
                <Typography variant="h4" fontFamily={"Poppins"} color="#e8b028" fontWeight={"bold"} gutterBottom style={{ marginTop: "40px" }}>
                    Your Interviews
                </Typography>
                {textInterviews.length === 0 ? (
                    <p>You have no interview submissions yet.</p>
                ) : (
                    textInterviews.map((interview) => (
                        <div key={interview._id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                            <p>
                                <strong>Slot:</strong> {interview.slot || "N/A"}
                            </p>
                            <p>
                                <strong>Date:</strong> {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : "N/A"}
                            </p>
                            <p>
                                <strong>Status:</strong> {interview.status}
                            </p>
                            {interview.status === "Confirmed" && interview.evaluatorId ? (
                                <div>
                                    <p>
                                        <strong>Evaluator:</strong> {interview.evaluatorId.name} ({interview.evaluatorId.email})
                                    </p>
                                    {interview.interviewLink && (
                                        <a href={interview.interviewLink} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
                                            Join Interview
                                        </a>
                                    )}
                                </div>
                            ) : interview.status === "Reviewed" ? (
                                <div>
                                    <p>
                                        <strong>Score:</strong> {interview.score}/10
                                    </p>
                                    <p>
                                        <strong>Feedback:</strong> {interview.feedback}
                                    </p>
                                </div>
                            ) : interview.status === "Submitted" ? (
                                <p style={{ color: "green", fontWeight: "bold" }}>
                                    Interview submitted successfully!
                                </p>
                            ) : (
                                <p style={{ color: "orange", fontWeight: "bold" }}>
                                    {interview.status === "Pending" ? "Awaiting evaluator review" : "Request Pending – Awaiting evaluator confirmation"}
                                </p>
                            )}
                        </div>
                    ))
                )}

                {/* Video Interview Submissions */}
                <Typography variant="h4" fontFamily={"Poppins"} color="#e8b028" fontWeight={"bold"} gutterBottom style={{ marginTop: "40px" }}>
                    Your Video Interview Submissions
                </Typography>
                {videoInterviews.length === 0 ? (
                    <p>You have no video interview submissions yet.</p>
                ) : (
                    videoInterviews.map((interview) => (
                        <div key={interview._id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                            <p>
                                <strong>Title:</strong> {interview.title || "N/A"}
                            </p>
                            <div style={{ margin: "10px 0" }}>
                                <video width="320" height="240" controls>
                                    <source src={`http://localhost:5000${interview.videoUrl}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <p>
                                <strong>Status:</strong> {interview.status}
                            </p>
                            {interview.status === "Confirmed" && interview.evaluatorId ? (
                                <div>
                                    <p>
                                        <strong>Evaluator:</strong> {interview.evaluatorId.name} ({interview.evaluatorId.email})
                                    </p>
                                    {interview.interviewLink && (
                                        <a href={interview.interviewLink} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
                                            Join Interview
                                        </a>
                                    )}
                                </div>
                            ) : interview.status === "Reviewed" ? (
                                <div>
                                    <p>
                                        <strong>Score:</strong> {interview.score}/10
                                    </p>
                                    <p>
                                        <strong>Feedback:</strong> {interview.feedback}
                                    </p>
                                </div>
                            ) : interview.status === "Submitted" ? (
                                <p style={{ color: "green", fontWeight: "bold" }}>
                                    Video submitted successfully!
                                </p>
                            ) : (
                                <p style={{ color: "orange", fontWeight: "bold" }}>
                                    {interview.status === "Pending" ? "Awaiting evaluator review" : "Request Pending – Awaiting evaluator confirmation"}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer Section */}
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

export default InterviewPractice;

