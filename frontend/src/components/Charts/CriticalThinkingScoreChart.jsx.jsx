// src/components/Charts/CriticalThinkingScoreChart.jsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CriticalThinkingScoreChart = () => {
  const data = {
    labels: ['Scenario 1', 'Scenario 2', 'Scenario 3', 'Scenario 4', 'Scenario 5'],
    datasets: [
      {
        label: 'Scores',
        data: [85, 78, 90, 82, 75],
        backgroundColor: '#e8b028',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default CriticalThinkingScoreChart;
