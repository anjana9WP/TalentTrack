// src/pages/EvaluatorPages/WrittenCommunicationReviews.jsx
import { useState, useEffect } from 'react';
import './WrittenCommunicationReviews.css';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';

const WrittenCommunicationReviews = () => {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [comments, setComments] = useState('');
  const [score, setScore] = useState('');
  const [unmarkedResponses, setUnmarkedResponses] = useState([]);
  const [markedResponses, setMarkedResponses] = useState([]);

  useEffect(() => {
    const fetchUnmarkedResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/written-communication/unmarked', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUnmarkedResponses(
          response.data.unmarkedTasks.map((task) => ({
            id: task._id,
            name: task.userId.name,
            submissionDate: new Date(task.submittedAt).toLocaleDateString(),
            status: task.status,
            type: task.type,
            text: task.content,
            pdf: task.documentUrl ? `http://localhost:5000${task.documentUrl}` : null,
          }))
        );
      } catch (error) {
        console.error('Error fetching unmarked responses:', error);
      }
    };

    fetchUnmarkedResponses();
  }, []);

  const handleSelectResponse = (response) => {
    setSelectedResponse(response);
  };

  const handleSubmitReview = async () => {
    if (!comments || !score) {
      alert("Please provide both feedback and a score before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/written-communication/feedback/${selectedResponse.id}`,
        { feedback: comments, score },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedResponse = { ...selectedResponse, comments, score, status: "Marked" };
      setMarkedResponses((prev) => [...prev, updatedResponse]);
      setUnmarkedResponses((prev) => prev.filter((resp) => resp.id !== selectedResponse.id));
      setSelectedResponse(null);
      setComments("");
      setScore("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="written-communication-review">
      <h1 className="page-title">Written Communication Reviews</h1>

      <div className="responses-section">
        <div className="unmarked-responses">
          <h2>Unmarked Responses</h2>
          <ul className="response-list">
            {unmarkedResponses.map((response) => (
              <li
                key={response.id}
                className="response-item"
                onClick={() => handleSelectResponse(response)}
              >
                <Avatar sx={{ bgcolor: '#e8b028' }}>
                  {response.name.charAt(0)}
                </Avatar>
                <div className="response-details">
                  <p className="student-name">{response.name}</p>
                  <p className="submission-date">{response.submissionDate}</p>
                  <p className="status">{response.status}</p>
                  <p className="writing-type"><strong>Type:</strong> {response.type}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedResponse && (
          <div className="review-section">
            <h2>Reviewing: {selectedResponse.name}</h2>
            <p className="writing-type"><strong>Type:</strong> {selectedResponse.type}</p>

            {selectedResponse.text && (
              <div className="text-review">
                <h3>Text Submission</h3>
                <div
                  className="student-text"
                  dangerouslySetInnerHTML={{ __html: selectedResponse.text }}
                />
                <textarea
                  placeholder="Write your feedback here..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="feedback-textarea"
                />
              </div>
            )}

            {selectedResponse.pdf && (
              <div className="pdf-review">
                <h3>PDF Submission</h3>
                <a href={selectedResponse.pdf} target="_blank" rel="noopener noreferrer" className="download-link">
                  Download PDF
                </a>
                <textarea
                  placeholder="Write your feedback here..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="feedback-textarea"
                />
              </div>
            )}

            <div className="score-section">
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
        <h2>Reviewed Responses</h2>
        <ul className="response-list">
          {markedResponses.map((response) => (
            <li key={response.id} className="response-item marked">
              <Avatar sx={{ bgcolor: '#e8b028' }}>
                {response.name.charAt(0)}
              </Avatar>
              <div className="response-details">
                <p className="student-name">{response.name}</p>
                <p className="submission-date">{response.submissionDate}</p>
                <p className="status">{response.status}</p>
                <p className="score">Score: {response.score}/10</p>
                <p className="comments">Comments: {response.comments}</p>
                <p className="writing-type"><strong>Type:</strong> {response.type}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WrittenCommunicationReviews;