import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const fallbackData = [
  { month: 'Jan', students: 400 },
  { month: 'Feb', students: 600 },
  { month: 'Mar', students: 800 },
  { month: 'Apr', students: 1200 },
  { month: 'May', students: 1500 },
  { month: 'Jun', students: 1700 },
  { month: 'Jul', students: 2000 },
  { month: 'Aug', students: 2300 },
  { month: 'Sep', students: 2500 },
  { month: 'Oct', students: 2700 }
];

const StudentGrowthChart = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : fallbackData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="students" stroke="#e8b028" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

StudentGrowthChart.propTypes = {
  data: PropTypes.array
};

export default StudentGrowthChart;
