import { useState, useEffect } from 'react';
import { Mic, ChatBubble, Book, Extension } from '@mui/icons-material';
import axios from 'axios';
import './Feedback.css';

const sampleFeedback = {
  publicSpeaking: [],
  interviewPractice: [],
  writtenCommunication: [],
  criticalThinking: [],
};

const Feedback = () => {
  const [selectedCategory, setSelectedCategory] = useState('publicSpeaking');
  const [feedback, setFeedback] = useState(sampleFeedback);
  const [averageScore, setAverageScore] = useState('N/A');
  const [lastFeedbackDate, setLastFeedbackDate] = useState('N/A');

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const calculateStats = (items) => {
    if (!items.length) {
      setAverageScore('N/A');
      setLastFeedbackDate('N/A');
      return;
    }

    const scores = items
      .map(item => parseFloat(item.score))
      .filter(score => !isNaN(score));

    const avg = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 'N/A';

    setAverageScore(avg !== 'N/A' ? `${avg}%` : 'N/A');

    const dates = items.map(item => new Date(item.date));
    const latest = new Date(Math.max(...dates));
    setLastFeedbackDate(latest.toLocaleDateString());
  };

  useEffect(() => {
    const fetchPublicSpeaking = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/public-speaking/reviews', authHeader);
        const formatted = res.data.reviews.map((review) => ({
          id: review._id,
          evaluator: review.evaluatorId?.name || 'Unknown',
          score: review.score || 'N/A',
          feedback: review.feedback || 'No feedback provided',
          date: new Date(review.submittedAt).toLocaleDateString(),
          submittedAt: new Date(review.submittedAt),
          isNew: false,
        })).sort((a, b) => b.submittedAt - a.submittedAt);
        setFeedback((prev) => ({ ...prev, publicSpeaking: formatted }));
      } catch (err) {
        console.error('Error fetching public speaking feedback:', err);
      }
    };
    fetchPublicSpeaking();
  }, []);

  useEffect(() => {
    const fetchInterviewPractice = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/interviews', authHeader);
        const formatted = res.data
          .filter(item => item.status === 'Reviewed')
          .map(item => ({
            id: item._id,
            evaluator: item.evaluatorId?.name || 'Unknown',
            score: item.score !== undefined ? item.score : 'N/A',
            feedback: item.feedback || 'No feedback provided',
            date: new Date(item.updatedAt).toLocaleDateString(),
            submittedAt: new Date(item.updatedAt),
            isNew: false,
          })).sort((a, b) => b.submittedAt - a.submittedAt);
        setFeedback((prev) => ({ ...prev, interviewPractice: formatted }));
      } catch (err) {
        console.error('Error fetching interview feedback:', err);
      }
    };
    fetchInterviewPractice();
  }, []);

  useEffect(() => {
    const fetchWrittenCommunication = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/written-communication/reviews', authHeader);
        const formatted = res.data.reviews.map((review) => ({
          id: review._id,
          evaluator: review.evaluatorId?.name || 'Unknown',
          score: review.score || 'N/A',
          feedback: review.feedback || 'No feedback provided',
          date: new Date(review.submittedAt).toLocaleDateString(),
          submittedAt: new Date(review.submittedAt),
          isNew: false,
        })).sort((a, b) => b.submittedAt - a.submittedAt);
        setFeedback((prev) => ({ ...prev, writtenCommunication: formatted }));
      } catch (err) {
        console.error('Error fetching written communication feedback:', err);
      }
    };
    fetchWrittenCommunication();
  }, []);

  useEffect(() => {
    const fetchCriticalThinking = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/critical-thinking/reviews', authHeader);
        const formatted = res.data.reviews.map((review) => ({
          id: review._id,
          evaluator: review.userId?.name || 'Unknown User',
          score: review.score !== undefined ? review.score : 'N/A',
          feedback: review.feedback || 'No feedback provided',
          date: new Date(review.submittedAt).toLocaleDateString(),
          submittedAt: new Date(review.submittedAt),
          isNew: true,
        })).sort((a, b) => b.submittedAt - a.submittedAt);
        setFeedback((prev) => ({ ...prev, criticalThinking: formatted }));
      } catch (err) {
        console.error('Error fetching critical thinking feedback:', err);
      }
    };
    fetchCriticalThinking();
  }, []);

  useEffect(() => {
    calculateStats(feedback[selectedCategory]);
  }, [selectedCategory, feedback]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const markAsRead = (feedbackType, id) => {
    setFeedback((prevFeedback) => {
      const updated = { ...prevFeedback };
      updated[feedbackType] = updated[feedbackType].map((item) =>
        item.id === id ? { ...item, isNew: false } : item
      );
      return updated;
    });
  };

  const feedbackCategories = {
    publicSpeaking: <Mic />,
    interviewPractice: <ChatBubble />,
    writtenCommunication: <Book />,
    criticalThinking: <Extension />,
  };

  return (
    <div className="feedback-page">
      <div className="feedback-summary">
        <h2 className="summary-title">Your Feedback Summary</h2>
        <div className="summary-stats">
          <div className="stat-card">Total Feedbacks: {feedback[selectedCategory].length}</div>
          <div className="stat-card">Average Score: {averageScore}</div>
          <div className="stat-card">Last Feedback: {lastFeedbackDate}</div>
        </div>
      </div>

      <div className="feedback-selector">
        {Object.keys(feedbackCategories).map((category) => (
          <button
            key={category}
            className={`feedback-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {feedbackCategories[category]}
            <span className="feedback-category-name">{category}</span>
            {feedback[category].some((item) => item.isNew) && <span className="notification-dot" />}
          </button>
        ))}
      </div>

      <div className="feedback-list">
        {feedback[selectedCategory].length ? (
          feedback[selectedCategory].map((item) => (
            <div
              key={item.id}
              className={`feedback-card ${item.isNew ? 'new-feedback' : ''}`}
              onClick={() => markAsRead(selectedCategory, item.id)}
            >
              <h3 className="feedback-title">{item.evaluator}</h3>
              <p className="feedback-score">Score: {item.score}</p>
              <p className="feedback-text">{item.feedback}</p>
              <p className="feedback-date">Date: {item.date}</p>
              {item.isNew && <span className="new-label">New</span>}
            </div>
          ))
        ) : (
          <div className="no-feedback">
            <p>No feedback available for this category yet. Keep practicing!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;