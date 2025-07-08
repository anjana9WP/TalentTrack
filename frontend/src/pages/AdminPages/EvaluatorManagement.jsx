import { useState, useEffect } from 'react';
import axios from 'axios';
import './EvaluatorManagement.css';

const BASE_URL = 'http://localhost:5000';

const EvaluatorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluators, setEvaluators] = useState([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvaluator, setNewEvaluator] = useState({ name: '', email: '', password: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchEvaluators = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/evaluators`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvaluators(res.data.evaluators);
      } catch (err) {
        console.error('Failed to fetch evaluators:', err);
      }
    };
  
    fetchEvaluators();
  }, [token]);
  

  const fetchEvaluators = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/admin/evaluators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvaluators(res.data.evaluators);
    } catch (err) {
      console.error('Failed to fetch evaluators:', err);
    }
  };

  const filteredEvaluators = evaluators.filter(
    (evaluator) =>
      evaluator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditEvaluator = (evaluator) => {
    setSelectedEvaluator({ ...evaluator });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvaluator(null);
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/auth/admin/evaluators/${selectedEvaluator._id}`,
        { name: selectedEvaluator.name, email: selectedEvaluator.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseModal();
      fetchEvaluators();
    } catch (err) {
      console.error('Failed to update evaluator:', err);
    }
  };

  const handleAddEvaluator = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/admin/evaluators`, newEvaluator, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewEvaluator({ name: '', email: '', password: '' });
      fetchEvaluators();
    } catch (err) {
      console.error('Failed to add evaluator:', err);
    }
  };

  const handleDeleteEvaluator = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/auth/admin/evaluators/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvaluators();
    } catch (err) {
      console.error('Failed to delete evaluator:', err);
    }
  };

  return (
    <div className="evaluator-management">
      <h1 className="page-title">Evaluator Management</h1>

      {/* Add New Evaluator Section */}
      <div className="add-evaluator-form">
        <h3>Add New Evaluator</h3>
        <input
          type="text"
          placeholder="Name"
          value={newEvaluator.name}
          onChange={(e) => setNewEvaluator({ ...newEvaluator, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newEvaluator.email}
          onChange={(e) => setNewEvaluator({ ...newEvaluator, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newEvaluator.password}
          onChange={(e) => setNewEvaluator({ ...newEvaluator, password: e.target.value })}
        />
        <button onClick={handleAddEvaluator}>Register Evaluator</button>
      </div>

      {/* Stats */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total Evaluators</h3>
          <p>{evaluators.length}</p>
        </div>
        <div className="card">
          <h3>Active Evaluators</h3>
          <p>{evaluators.length}</p>
        </div>
      </div>

      {/* Evaluator List */}
      <div className="evaluator-list">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="evaluator-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvaluators.map((evaluator) => (
              <tr key={evaluator._id}>
                <td>{evaluator.name}</td>
                <td>{evaluator.email}</td>
                <td>Active</td>
                <td className="action-buttons">
                  <button className="edit-btn" onClick={() => handleEditEvaluator(evaluator)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteEvaluator(evaluator._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && selectedEvaluator && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Evaluator</h3>
            <form>
              <label>Name</label>
              <input
                type="text"
                value={selectedEvaluator.name}
                onChange={(e) =>
                  setSelectedEvaluator({ ...selectedEvaluator, name: e.target.value })
                }
                className="modal-input"
              />
              <label>Email</label>
              <input
                type="email"
                value={selectedEvaluator.email}
                onChange={(e) =>
                  setSelectedEvaluator({ ...selectedEvaluator, email: e.target.value })
                }
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="button" className="save-btn" onClick={handleSaveChanges}>
                  Save
                </button>
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatorManagement;
