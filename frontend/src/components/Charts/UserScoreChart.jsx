import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const UserScoreChart = ({ scores }) => {
  // Labels and fallback scores
  const defaultLabels = ['Public Speaking', 'Interview Practice', 'Written Communication', 'Critical Thinking'];
  const defaultScores = [85, 90, 78, 88];

  // Prepare chart data
  const chartLabels = scores
    ? scores.map((entry) => entry.category)
    : defaultLabels;

  const chartScores = scores
    ? scores.map((entry) => entry.score)
    : defaultScores;

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Scores',
        data: chartScores,
        backgroundColor: '#e8b028',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Performance in Different Modules',
        color: '#333',
        font: {
          size: 18,
          family: 'Poppins',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
          font: {
            family: 'Poppins',
          },
        },
      },
      y: {
        ticks: {
          color: '#333',
          font: {
            family: 'Poppins',
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: 300 }}>
      <Bar data={data} options={options} />
    </div>
  );
};

// PropTypes Validation
UserScoreChart.propTypes = {
  scores: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired
    })
  )
};

export default UserScoreChart;
