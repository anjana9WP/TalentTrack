import { useState, useEffect } from 'react';
import axios from 'axios';
import './InterviewPracticeReviews.css';
import Avatar from '@mui/material/Avatar';

const InterviewPracticeReviews = () => {
    const [pendingResponses, setPendingResponses] = useState([]);
    const [markedResponses, setMarkedResponses] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [comments, setComments] = useState('');
    const [score, setScore] = useState('');

    useEffect(() => {
        fetchPendingResponses();
        fetchMarkedResponses();
    }, []);

    const fetchPendingResponses = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/interviews/pending", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingResponses(res.data);
        } catch (error) {
            console.error("Error fetching pending responses:", error);
        }
    };

    const fetchMarkedResponses = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/interviews/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const reviewedResponses = res.data.filter(response => response.status === "Reviewed");
            setMarkedResponses(reviewedResponses);
        } catch (error) {
            console.error("Error fetching marked responses:", error);
        }
    };

    const handleSelectResponse = (response) => {
        setSelectedResponse(response);
    };

    const handleSubmitReview = async () => {
        if (comments && score && selectedResponse) {
            try {
                const token = localStorage.getItem("token");
                await axios.post(
                    `http://localhost:5000/api/interviews/review/${selectedResponse._id}`,
                    { score, feedback: comments },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPendingResponses(prev => prev.filter(resp => resp._id !== selectedResponse._id));
                setSelectedResponse(null);
                setComments('');
                setScore('');
                fetchMarkedResponses();
            } catch (error) {
                console.error("Error submitting review:", error);
            }
        }
    };

    const handleDeleteResponse = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/interviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingResponses(prev => prev.filter(resp => resp._id !== id));
            setMarkedResponses(prev => prev.filter(resp => resp._id !== id));
        } catch (error) {
            console.error("Error deleting response:", error);
        }
    };

    return (
        <div className="interview-practice-review">
            <h1 className="page-title">Interview Practice Reviews</h1>
            <div className="responses-section">
                <div className="unmarked-responses">
                    <h2>Pending Video Submissions</h2>
                    <ul className="response-list">
                        {pendingResponses.map((response) => (
                            <li
                                key={response._id}
                                className="response-item"
                                onClick={() => handleSelectResponse(response)}
                            >
                                <Avatar sx={{ bgcolor: '#e8b028' }}>
                                    {response.userId.name.charAt(0)}
                                </Avatar>
                                <div className="response-details">
                                    <p className="student-name">{response.userId.name}</p>
                                    <p className="submission-date">
                                        {new Date(response.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="status">{response.status}</p>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteResponse(response._id);
                                    }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {selectedResponse && (
                    <div className="review-section">
                        <h2>Reviewing: {selectedResponse.userId.name}</h2>
                        <div className="video-player">
                            <iframe
                                width="560"
                                height="315"
                                src={selectedResponse.videoUrl.startsWith('http') ? selectedResponse.videoUrl : `http://localhost:5000${selectedResponse.videoUrl}`}
                                title="Video review"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="feedback-form">
                            <textarea
                                placeholder="Write your feedback here..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="feedback-textarea"
                            />
                            <input
                                type="number"
                                placeholder="Score out of 10"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="score-input"
                                max={10}
                                min={0}
                            />
                            <button className="submit-btn" onClick={handleSubmitReview}>
                                Submit Review
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="marked-responses">
                <h2>Marked Video Submissions</h2>
                <ul className="response-list">
                    {markedResponses.map((response) => (
                        <li key={response._id} className="response-item">
                            <Avatar sx={{ bgcolor: '#e8b028' }}>
                                {response.userId.name.charAt(0)}
                            </Avatar>
                            <div className="response-details">
                                <p className="student-name">{response.userId.name}</p>
                                <p className="submission-date">
                                    {new Date(response.createdAt).toLocaleDateString()}
                                </p>
                                <p className="status">{response.status}</p>
                                <p className="score">Score: {response.score}/10</p>
                            </div>
                            {response.videoUrl && (
                                <div className="video-player">
                                    <iframe
                                        width="320"
                                        height="180"
                                        src={response.videoUrl.startsWith('http') ? response.videoUrl : `http://localhost:5000${response.videoUrl}`}
                                        title="Reviewed video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                            <button className="delete-btn" onClick={() => handleDeleteResponse(response._id)}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InterviewPracticeReviews;
