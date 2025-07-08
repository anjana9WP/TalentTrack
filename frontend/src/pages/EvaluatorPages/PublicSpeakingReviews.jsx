import { useState, useEffect } from "react";
import "./PublicSpeakingReviews.css";
import Avatar from "@mui/material/Avatar";
import axios from "axios";

const PublicSpeakingReviews = () => {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [comments, setComments] = useState("");
  const [score, setScore] = useState("");
  const [unmarkedResponses, setUnmarkedResponses] = useState([]);
  const [markedResponses, setMarkedResponses] = useState([]);

  // Fetch unmarked responses from the backend
  useEffect(() => {
    const fetchUnmarkedResponses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/public-speaking/unmarked", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUnmarkedResponses(
          response.data.unmarkedSpeeches.map((speech) => ({
            id: speech._id,
            name: speech.userId.name, // Assuming userId contains user details
            submissionDate: new Date(speech.submittedAt).toLocaleDateString(),
            status: "Unmarked",
            video: `http://localhost:5000${speech.videoUrl}`, // Adjust based on backend response
          }))
        );
      } catch (error) {
        console.error("Error fetching unmarked responses:", error);
      }
    };

    fetchUnmarkedResponses();
  }, []);

  const handleSelectResponse = (response) => {
    setSelectedResponse(response);
  };

  const handleSubmitReview = async () => {
    if (comments && score) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/public-speaking/feedback/${selectedResponse.id}`,
          { feedback: comments, score }, // Include score in the request body
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
    }
  };
  

  return (
    <div className="public-speaking-review">
      <h1 className="page-title">Public Speaking Reviews</h1>

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
                <Avatar sx={{ bgcolor: "#e8b028" }}>
                  {response.name.charAt(0)}
                </Avatar>
                <div className="response-details">
                  <p className="student-name">{response.name}</p>
                  <p className="submission-date">{response.submissionDate}</p>
                  <p className="status">{response.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedResponse && (
          <div className="review-section">
            <h2>Reviewing: {selectedResponse.name}</h2>
            <div className="video-player">
              <iframe
                width="560"
                height="315"
                src={selectedResponse.video}
                title="YouTube video player"
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
        <h2>Reviewed Responses</h2>
        <ul className="response-list">
          {markedResponses.map((response) => (
            <li key={response.id} className="response-item marked">
              <Avatar sx={{ bgcolor: "#e8b028" }}>
                {response.name.charAt(0)}
              </Avatar>
              <div className="response-details">
                <p className="student-name">{response.name}</p>
                <p className="submission-date">{response.submissionDate}</p>
                <p className="status">{response.status}</p>
                <p className="score">Score: {response.score}/10</p>
                <p className="comments">Comments: {response.comments}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PublicSpeakingReviews;
