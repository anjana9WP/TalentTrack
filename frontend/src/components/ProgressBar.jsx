// src/components/ProgressBar.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './ProgressBar.css';

const ProgressBar = ({ percentage }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  return (
    <div className="progress-bar">
      <svg className="circle" viewBox="0 0 36 36">
        <path
          className="circle-bg"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="circle-fill"
          strokeDasharray={`${progress * 100 / 100}, 100`}
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="percentage">
        <h3>{percentage}%</h3>
      </div>
    </div>
  );
};

// PropTypes validation
ProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
};

export default ProgressBar;
