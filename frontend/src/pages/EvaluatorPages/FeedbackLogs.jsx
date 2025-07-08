// src/pages/EvaluatorPages/FeedbackLogs.jsx
import { useState } from 'react';
import './FeedbackLogs.css';

const FeedbackLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const feedbackLogs = [
    {
      id: 1,
      studentName: 'John Doe',
      evaluatorName: 'Jane Smith',
      section: 'Public Speaking',
      feedback: 'Great delivery, but try to maintain eye contact.',
      date: '2024-10-10',
    },
    {
      id: 2,
      studentName: 'Alice Johnson',
      evaluatorName: 'Bob Brown',
      section: 'Interview Practice',
      feedback: 'Good response to technical questions. Work on body language.',
      date: '2024-10-08',
    },
    {
      id: 3,
      studentName: 'Michael Lee',
      evaluatorName: 'Sara White',
      section: 'Written Communication',
      feedback: 'Well-organized essay, but pay attention to grammar.',
      date: '2024-10-07',
    },
    {
      id: 4,
      studentName: 'Emily Davis',
      evaluatorName: 'John Smith',
      section: 'Critical Thinking',
      feedback: 'Excellent analysis, but the conclusion could be stronger.',
      date: '2024-10-06',
    },
  ];

  const filteredLogs = feedbackLogs.filter(
    (log) =>
      log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.evaluatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="feedback-logs">
      <h1 className="page-title">Feedback Logs</h1>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by student, evaluator, or section"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="logs-list">
        {filteredLogs.map((log) => (
          <div key={log.id} className="log-card">
            <h3 className="log-title">
              Feedback for {log.studentName} in {log.section}
            </h3>
            <p>
              <strong>Evaluator:</strong> {log.evaluatorName}
            </p>
            <p>
              <strong>Feedback:</strong> {log.feedback}
            </p>
            <p>
              <strong>Date:</strong> {log.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackLogs;
