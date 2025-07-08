// src/pages/AdminPages/SystemLogs.jsx
import { useState } from 'react';
import './SystemLogs.css';
import { Box, Modal, Button, TextField } from '@mui/material';

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const logs = [
    { id: 1, type: 'User Activity', description: 'John Doe logged in', date: '2024-10-01 10:23:45', details: 'Login from IP: 192.168.0.1' },
    { id: 2, type: 'System Error', description: 'Database connection failed', date: '2024-10-01 11:15:32', details: 'Error at 11:15 AM. Retried connection 3 times.' },
    { id: 3, type: 'Evaluator Action', description: 'Jane Smith graded a submission', date: '2024-10-02 09:45:12', details: 'Graded student ID 125 with score 90/100' },
    { id: 4, type: 'User Activity', description: 'Alice Johnson updated profile', date: '2024-10-02 14:27:19', details: 'Profile updated: Changed email address.' },
    { id: 5, type: 'System Error', description: 'API rate limit exceeded', date: '2024-10-03 08:59:02', details: 'Limit exceeded for API key XYZ123.' },
  ];

  const filteredLogs = logs.filter(
    (log) =>
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  return (
    <div className="system-logs">
      <h1 className="page-title">System Logs</h1>
      
      <div className="search-filter">
        <TextField
          label="Search logs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </div>
      
      <table className="logs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.type}</td>
              <td>{log.description}</td>
              <td>{log.date}</td>
              <td>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleViewDetails(log)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <Button variant="outlined">Previous</Button>
        <Button variant="outlined">Next</Button>
      </div>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box className="modal-box">
          <h2>Log Details</h2>
          {selectedLog && (
            <div>
              <p><strong>ID:</strong> {selectedLog.id}</p>
              <p><strong>Type:</strong> {selectedLog.type}</p>
              <p><strong>Description:</strong> {selectedLog.description}</p>
              <p><strong>Date:</strong> {selectedLog.date}</p>
              <p><strong>Details:</strong> {selectedLog.details}</p>
            </div>
          )}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#e8b028', color: '#fff', marginTop: '10px' }}
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default SystemLogs;
