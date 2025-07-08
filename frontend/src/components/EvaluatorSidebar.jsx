// src/components/EvaluatorSidebar.jsx
import { Link } from 'react-router-dom';
import './EvaluatorSidebar.css';

const EvaluatorSidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Evaluator Panel</h2>
      <ul className="sidebar-links">
        <li>
          <Link to="/evaluator-dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/evaluator-dashboard/public-speaking-reviews">Public Speaking Reviews</Link>
        </li>
        <li>
          <Link to="/evaluator-dashboard/interview-practice-reviews">Interview Practice Reviews</Link>
        </li>
        <li>
          <Link to="/evaluator-dashboard/written-communication-reviews">Written Communication Reviews</Link>
        </li>
        <li>
          <Link to="/evaluator-dashboard/critical-thinking-reviews">Critical Thinking Reviews</Link>
        </li>
        <li>
          <Link to="/evaluator-dashboard/feedback-logs">Feedback Logs</Link>
        </li>
      </ul>
    </div>
  );
};

export default EvaluatorSidebar;
