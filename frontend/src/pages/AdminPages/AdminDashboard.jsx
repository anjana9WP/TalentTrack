import { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import StudentGrowthChart from '../../components/Charts/StudentGrowthChart';
import EvaluatorActivityChart from '../../components/Charts/EvaluatorActivityChart';

const BASE_URL = 'http://localhost:5000';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({ studentGrowth: [], evaluatorActivity: [] });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      }
    };

    const fetchMonthlyStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/dashboard-monthly`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMonthlyStats(res.data);
      } catch (err) {
        console.error('Failed to fetch monthly dashboard data:', err);
      }
    };

    fetchStats();
    fetchMonthlyStats();
  }, [token]);

  const totalStudents = stats?.roles?.User || 0;
  const totalEvaluators = stats?.roles?.Evaluator || 0;
  const totalResponses =
    (stats?.submissions?.publicSpeaking || 0) +
    (stats?.submissions?.writtenCommunication || 0) +
    (stats?.submissions?.criticalThinking || 0);

  const studentChartData = monthlyStats.studentGrowth.map((item) => ({
    month: item.month,
    students: item.count
  }));

  const evaluatorChartData = monthlyStats.evaluatorActivity.map((item) => ({
    month: item.month,
    reviews: item.count
  }));

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Admin Overview</h1>

      <div className="overview-cards">
        <div className="card">
          <h2>Total Students</h2>
          <p>{totalStudents}</p>
        </div>
        <div className="card">
          <h2>Total Evaluators</h2>
          <p>{totalEvaluators}</p>
        </div>
        <div className="card">
          <h2>Student Responses</h2>
          <p>{totalResponses}</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Student Registration Growth</h3>
          <StudentGrowthChart data={studentChartData} />
        </div>
        <div className="chart-card">
          <h3>Evaluator Activity</h3>
          <EvaluatorActivityChart data={evaluatorChartData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
