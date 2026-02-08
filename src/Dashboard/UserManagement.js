import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '../components/Modal';
import './Dashboard.css';

const swalConfirm = (options) => Swal.fire({ confirmButtonColor: '#2563eb', ...options });
const swalSuccess = (title, text) => swalConfirm({ icon: 'success', title, text });

const ROLES = ['Admin', 'Instructor', 'Learner'];

const MOCK_USERS = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex.johnson@example.com', role: 'Admin' },
  { id: 'u2', name: 'Sam Williams', email: 'sam.williams@example.com', role: 'Instructor' },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'Learner' }
];

const generateId = () => `u-${Date.now()}`;

const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formUser, setFormUser] = useState({ name: '', email: '', role: 'Learner' });

  const openView = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormUser({ name: '', email: '', role: 'Learner' });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormUser({ name: user.name, email: user.email, role: user.role });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleDelete = async (user) => {
    const result = await swalConfirm({
      title: 'Delete user?',
      text: `Are you sure you want to delete "${user.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    });
    if (result.isConfirmed) {
      setUsers(users.filter((u) => u.id !== user.id));
      await swalSuccess('Deleted!', 'The user has been deleted.');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setUsers((prev) => [...prev, { id: generateId(), ...formUser }]);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...formUser } : u))
      );
    }
    closeModal();
    await swalSuccess(modalMode === 'add' ? 'User added!' : 'User updated!', modalMode === 'add' ? 'The user has been added.' : 'The user has been updated.');
  };

  return (
    <div className="dashboard-content management-content">
      <div className="management-table-wrap">
        <div className="management-toolbar">
          <button type="button" className="action-btn" onClick={openAdd}>
            + Add User
          </button>
        </div>
        <table className="management-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="management-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="management-badge management-badge-role">{user.role}</span>
                </td>
                <td className="management-td-actions">
                  <button type="button" className="management-btn management-btn-view" onClick={() => openView(user)}>View</button>
                  <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit(user)}>Edit</button>
                  <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete(user)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="management-empty">No users yet. Add one to get started.</p>
        )}
      </div>

      {modalOpen && modalMode === 'view' && selectedUser && (
        <Modal title="View User" show onClose={closeModal}>
          <table className="modal-view-table">
            <tbody>
              <tr><th>Name</th><td>{selectedUser.name}</td></tr>
              <tr><th>Email</th><td>{selectedUser.email}</td></tr>
              <tr><th>Role</th><td>{selectedUser.role}</td></tr>
            </tbody>
          </table>
        </Modal>
      )}

      {modalOpen && (modalMode === 'add' || modalMode === 'edit') && (
        <Modal
          title={modalMode === 'add' ? 'Add User' : 'Edit User'}
          show
          onClose={closeModal}
        >
          <form className="modal-form" onSubmit={handleSaveUser}>
            <div className="form-row">
              <label>Name</label>
              <input
                type="text"
                value={formUser.name}
                onChange={(e) => setFormUser((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={formUser.email}
                onChange={(e) => setFormUser((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <label>Role</label>
              <select
                value={formUser.role}
                onChange={(e) => setFormUser((p) => ({ ...p, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-primary">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
