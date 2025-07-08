import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const fallbackData = [
  { month: 'Jan', reviews: 50 },
  { month: 'Feb', reviews: 80 },
  { month: 'Mar', reviews: 65 },
  { month: 'Apr', reviews: 100 },
  { month: 'May', reviews: 150 },
  { month: 'Jun', reviews: 130 },
  { month: 'Jul', reviews: 170 },
  { month: 'Aug', reviews: 180 },
  { month: 'Sep', reviews: 220 },
  { month: 'Oct', reviews: 240 }
];

const EvaluatorActivityChart = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : fallbackData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="reviews" fill="#e8b028" />
      </BarChart>
    </ResponsiveContainer>
  );
};

EvaluatorActivityChart.propTypes = {
  data: PropTypes.array
};

export default EvaluatorActivityChart;
