// src/components/Charts/AverageScoresChart.jsx
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';
  
  const data = [
    { name: 'Public Speaking', value: 4.2 },
    { name: 'Writing', value: 3.8 },
    { name: 'Interviews', value: 4.5 },
    { name: 'Critical Thinking', value: 4.0 },
  ];
  
  const COLORS = ['#e8b028', '#f0c85e', '#f7d993', '#ffe6bf'];
  
  const AverageScoresChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#e8b028"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  export default AverageScoresChart;
  