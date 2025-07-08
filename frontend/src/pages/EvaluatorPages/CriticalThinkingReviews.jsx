// src/pages/EvaluatorPages/CriticalThinkingReview.jsx
import './CriticalThinkingReviews.css';
import CriticalThinkingScoreChart from '../../components/Charts/CriticalThinkingScoreChart.jsx';

const CriticalThinkingReviews = () => {
  return (
    <div className="critical-thinking-review">
      <h1 className="page-title">Critical Thinking Responses</h1>
      <div className="overview-cards">
        <div className="card">
          <h3>Total Scenarios Reviewed</h3>
          <p>45</p>
        </div>
        <div className="card">
          <h3>Average Score</h3>
          <p>85%</p>
        </div>
        <div className="card">
          <h3>Highest Score</h3>
          <p>98%</p>
        </div>
        <div className="card">
          <h3>Lowest Score</h3>
          <p>67%</p>
        </div>
      </div>

      <div className="chart-section">
        <h2 className="chart-title">Scenario Score Distribution</h2>
        <CriticalThinkingScoreChart />
      </div>

      <div className="feedback-list">
        <h2 className="section-title">Recent Feedback</h2>
        <ul className="feedback-items">
          <li className="feedback-item">
            <p><strong>Student:</strong> John Doe</p>
            <p><strong>Scenario:</strong> Critical Thinking in Business Management</p>
            <p><strong>Score:</strong> 90%</p>
            <p><strong>Feedback:</strong> Excellent analysis and approach to problem-solving.</p>
          </li>
          <li className="feedback-item">
            <p><strong>Student:</strong> Alice Smith</p>
            <p><strong>Scenario:</strong> Logical Reasoning and Decision Making</p>
            <p><strong>Score:</strong> 78%</p>
            <p><strong>Feedback:</strong> Good understanding, but more details needed in the explanation.</p>
          </li>
          <li className="feedback-item">
            <p><strong>Student:</strong> Bob Johnson</p>
            <p><strong>Scenario:</strong> Analytical Thinking in Crisis Situations</p>
            <p><strong>Score:</strong> 85%</p>
            <p><strong>Feedback:</strong> Strong points, but could work on time management.</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CriticalThinkingReviews;
