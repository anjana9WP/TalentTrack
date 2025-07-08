// src/components/Charts/SubmissionReviewChart.jsx
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';
  
  const data = [
    { date: 'Jan', reviews: 20 },
    { date: 'Feb', reviews: 35 },
    { date: 'Mar', reviews: 45 },
    { date: 'Apr', reviews: 30 },
    { date: 'May', reviews: 50 },
    { date: 'Jun', reviews: 70 },
    { date: 'Jul', reviews: 65 },
  ];
  
  const SubmissionReviewChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="reviews"
            stroke="#e8b028"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  export default SubmissionReviewChart;
  