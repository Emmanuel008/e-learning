import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { users as usersApi } from '../api/api';
import './Dashboard.css';

const swalConfirm = (options) => Swal.fire({ confirmButtonColor: '#2563eb', ...options });
const swalSuccess = (title, text) => swalConfirm({ icon: 'success', title, text });
const swalError = (title, text) => swalConfirm({ icon: 'error', title, text });

const ROLES = ['User', 'Administrator'];
const PER_PAGE = 5;

const UserManagement = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: PER_PAGE });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formUser, setFormUser] = useState({ name: '', email: '', password: '', phone: '', role: 'User' });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await usersApi.ilist({ page: pageNum, per_page: PER_PAGE });
      const ok = data?.status === 'OK';
      const listOfItem = data?.returnData?.list_of_item;
      if (ok && listOfItem) {
        setList(listOfItem.data || []);
        setMeta({
          current_page: listOfItem.meta?.current_page ?? 1,
          last_page: listOfItem.meta?.last_page ?? 1,
          total: listOfItem.meta?.total ?? 0,
          per_page: listOfItem.meta?.per_page ?? PER_PAGE
        });
      } else {
        setList([]);
        setError(data?.errorMessage || 'Failed to load users');
      }
    } catch (err) {
      setList([]);
      setError(err.response?.data?.errorMessage || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const openView = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowPassword(false);
    setFormUser({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      role: user.role === 'Admin' ? 'Administrator' : (user.role || 'User')
    });
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
    if (!result.isConfirmed) return;
    try {
      const { data } = await usersApi.iformAction({ form_method: 'delete', id: user.id });
      const ok = data?.status === 'OK';
      const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
      if (ok) {
        await swalSuccess('Deleted', msg || 'User has been deleted.');
        fetchUsers(meta.current_page);
      } else {
        await swalError('Delete failed', msg || 'Could not delete user.');
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage;
      const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not delete user.';
      await swalError('Error', text);
    }
  };

  const getApiMessage = (dataOrErr, fallback) => {
    const msg = dataOrErr?.errorMessage ?? dataOrErr?.response?.data?.errorMessage;
    if (Array.isArray(msg)) return msg[0] || fallback;
    return msg || fallback;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        form_method: 'save',
        name: formUser.name.trim(),
        email: formUser.email.trim(),
        phone: formUser.phone.trim() || '',
        role: formUser.role === 'Administrator' ? 'Admin' : formUser.role
      };
      const password = formUser.password.trim();
      if (password) body.password = password;
      if (selectedUser?.id) body.id = selectedUser.id;

      const { data } = await usersApi.iformAction(body);
      const ok = data?.status === 'OK';

      if (ok) {
        closeModal();
        await swalSuccess('User updated!', getApiMessage(data, 'The user has been updated.'));
        fetchUsers(meta.current_page);
      } else {
        await swalError('Save failed', getApiMessage(data, 'Could not save user.'));
      }
    } catch (err) {
      const message = getApiMessage(err, 'Could not save user.');
      await swalError('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const total = meta.total;
  const lastPage = meta.last_page;
  const currentPage = meta.current_page;
  const from = (currentPage - 1) * meta.per_page + 1;
  const to = Math.min(currentPage * meta.per_page, total);

  return (
    <div className="dashboard-content management-content">
      <div className="management-table-wrap">
        {error && (
          <p className="management-error">{error}</p>
        )}

        {loading ? (
          <p className="management-loading">Loading users…</p>
        ) : (
          <>
            <table className="management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="management-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
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
            {list.length === 0 && !loading && (
              <p className="management-empty">No users yet. Add one to get started.</p>
            )}

            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setPage} total={total} from={from} to={to} />
          </>
        )}
      </div>

      {modalOpen && modalMode === 'view' && selectedUser && (
        <Modal title="View User" show onClose={closeModal}>
          <table className="modal-view-table">
            <tbody>
              <tr><th>Name</th><td>{selectedUser.name}</td></tr>
              <tr><th>Email</th><td>{selectedUser.email}</td></tr>
              <tr><th>Phone</th><td>{selectedUser.phone || '—'}</td></tr>
              <tr><th>Role</th><td>{selectedUser.role}</td></tr>
            </tbody>
          </table>
        </Modal>
      )}

      {modalOpen && modalMode === 'edit' && (
        <Modal
          title="Edit User"
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
                readOnly
              />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input
                type="tel"
                value={formUser.phone}
                onChange={(e) => setFormUser((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="form-row">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formUser.password}
                  onChange={(e) => setFormUser((p) => ({ ...p, password: e.target.value }))}
                  className="password-input"
                  placeholder="Leave blank to keep current"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
