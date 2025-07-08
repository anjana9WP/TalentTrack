import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const BASE_URL = 'http://localhost:5000';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user) => {
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/auth/admin/users/${selectedUser._id}`,
        {
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      handleCloseModal();
      const res = await axios.get(`${BASE_URL}/api/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${BASE_URL}/api/auth/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await axios.get(`${BASE_URL}/api/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({ name: '', email: '', password: '', role: 'User' });
      const res = await axios.get(`${BASE_URL}/api/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  const roleCount = (role) => users.filter((u) => u.role === role).length;

  return (
    <div className="user-management">
      <h1 className="page-title">User Management</h1>

      {/* Add New User */}
      <div className="add-user-form">
        <h3>Add New User</h3>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="User">Student</option>
          <option value="Evaluator">Evaluator</option>
          <option value="Admin">Admin</option>
        </select>
        <button onClick={handleAddUser}>Register User</button>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="card">
          <h3>Students</h3>
          <p>{roleCount('User')}</p>
        </div>
        <div className="card">
          <h3>Evaluators</h3>
          <p>{roleCount('Evaluator')}</p>
        </div>
        <div className="card">
          <h3>Admins</h3>
          <p>{roleCount('Admin')}</p>
        </div>
      </div>

      {/* User Table */}
      <div className="user-list">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="action-buttons">
                  <button className="edit-btn" onClick={() => handleEditUser(user)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User Details</h3>
            <form>
              <label>Name</label>
              <input
                type="text"
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
                className="modal-input"
              />
              <label>Email</label>
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                className="modal-input"
              />
              <label>Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                className="modal-input"
              >
                <option value="User">Student</option>
                <option value="Evaluator">Evaluator</option>
                <option value="Admin">Admin</option>
              </select>
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

export default UserManagement;
