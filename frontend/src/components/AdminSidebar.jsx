import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-links">
        <li>
          <Link to="/admin-dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin-dashboard/users">User Management</Link>
        </li>
        <li>
          <Link to="/admin-dashboard/evaluators">Evaluator Management</Link>
        </li>
        <li>
          <Link to="/admin-dashboard/events">Event Management</Link>
        </li>
        <li>
          <Link to="/admin-dashboard/quiz-management">Quiz Management</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
