// src/components/Charts/FeedbackTurnaroundChart.jsx
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';
  
  const data = [
    { month: 'Jan', days: 2.4 },
    { month: 'Feb', days: 2.9 },
    { month: 'Mar', days: 3.0 },
    { month: 'Apr', days: 2.5 },
    { month: 'May', days: 2.7 },
    { month: 'Jun', days: 2.2 },
    { month: 'Jul', days: 3.1 },
  ];
  
  const FeedbackTurnaroundChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="days" fill="#e8b028" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  export default FeedbackTurnaroundChart;
  