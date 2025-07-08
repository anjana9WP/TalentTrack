// src/pages/AdminPages/SystemMaintenance.jsx
import { useState } from 'react';
import './SystemMaintenance.css';

const SystemMaintenance = () => {
  const [logs] = useState([
    { id: 1, timestamp: '2024-10-11 10:15:30', message: 'Server restarted successfully', level: 'Info' },
    { id: 2, timestamp: '2024-10-11 11:00:42', message: 'Cache cleared', level: 'Info' },
    { id: 3, timestamp: '2024-10-11 12:21:10', message: 'System diagnostics run - no issues found', level: 'Info' },
    { id: 4, timestamp: '2024-10-11 13:45:15', message: 'User login failed - incorrect password', level: 'Warning' },
    { id: 5, timestamp: '2024-10-11 14:03:22', message: 'Evaluator feedback submission error', level: 'Error' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timestamp.includes(searchTerm)
  );

  const handleAction = (action) => {
    alert(`${action} initiated.`);
  };

  return (
    <div className="system-maintenance">
      <h1 className="page-title">System Maintenance</h1>
      
      <div className="overview-cards">
        <div className="card">
          <h3>Server Uptime</h3>
          <p>23 days, 4 hours, 15 minutes</p>
        </div>
        <div className="card">
          <h3>Active Sessions</h3>
          <p>152</p>
        </div>
        <div className="card">
          <h3>System Health</h3>
          <p className="health-status good">Good</p>
        </div>
        <div className="card">
          <h3>Pending Updates</h3>
          <p>2</p>
        </div>
      </div>

      <div className="maintenance-actions">
        <h2 className="section-title">Maintenance Actions</h2>
        <div className="actions">
          <button className="action-btn" onClick={() => handleAction('Restart Server')}>Restart Server</button>
          <button className="action-btn" onClick={() => handleAction('Run Diagnostics')}>Run Diagnostics</button>
          <button className="action-btn" onClick={() => handleAction('Clear Cache')}>Clear Cache</button>
          <button className="action-btn" onClick={() => handleAction('Update System')}>Update System</button>
        </div>
      </div>

      <div className="logs-viewer">
        <h2 className="section-title">System Logs</h2>
        <input
          type="text"
          placeholder="Search logs by keyword or date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td className={`log-level ${log.level.toLowerCase()}`}>{log.level}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemMaintenance;
