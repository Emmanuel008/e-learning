import React, { useState } from 'react';
import Modal from '../components/Modal';
import './Dashboard.css';

const MODULE_OPTIONS = [
  { value: 'HMU08001', label: 'HMU08001 - Innovation Management' },
  { value: 'HMU08002', label: 'HMU08002 - IP Management' },
  { value: 'HMU08003', label: 'HMU08003 - Research Commercialization' },
  { value: 'HMU08004', label: 'HMU08004 - Fundraising' }
];

const STATUS_OPTIONS = ['Draft', 'Published'];

const MODULE_MANAGEMENT_TABS = [
  { id: 'books', label: 'Books' },
  { id: 'videos', label: 'Videos' },
  { id: 'quiz', label: 'Quiz' }
];

const MOCK_BOOKS = [
  { id: 'b1', title: 'Foundations of Innovation Management', module: 'HMU08001', status: 'Published' },
  { id: 'b2', title: 'Basics of Intellectual Property', module: 'HMU08002', status: 'Draft' },
  { id: 'b3', title: 'From Research to Market', module: 'HMU08003', status: 'Published' }
];

const MOCK_VIDEOS = [
  { id: 'v1', title: 'Stage-gate model overview', module: 'HMU08001', duration: '02:42' },
  { id: 'v2', title: 'From idea to patent filing', module: 'HMU08002', duration: '02:42' },
  { id: 'v3', title: 'Licensing to existing companies', module: 'HMU08003', duration: '03:24' }
];

const MOCK_QUIZZES = [
  { id: 'q1', title: 'Innovation Readiness Assessment', module: 'HMU08001', questions: 5 },
  { id: 'q2', title: 'IP Management Checkpoint', module: 'HMU08002', questions: 5 },
  { id: 'q3', title: 'Funding Strategy Quiz', module: 'HMU08004', questions: 5 }
];

const generateId = (prefix) => `${prefix}-${Date.now()}`;

const ModuleManagement = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [quizzes, setQuizzes] = useState(MOCK_QUIZZES);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'add' | 'edit'
  const [modalType, setModalType] = useState(null); // 'book' | 'video' | 'quiz'
  const [editingItem, setEditingItem] = useState(null);

  const [formBook, setFormBook] = useState({ title: '', module: 'HMU08001', status: 'Draft' });
  const [formVideo, setFormVideo] = useState({ title: '', module: 'HMU08001', duration: '' });
  const [formQuiz, setFormQuiz] = useState({ title: '', module: 'HMU08001', questions: '' });

  const openView = (type, item) => {
    setModalType(type);
    setModalMode('view');
    setEditingItem(item);
    setModalOpen(true);
  };

  const openAdd = (type) => {
    setModalType(type);
    setModalMode('add');
    setEditingItem(null);
    if (type === 'book') setFormBook({ title: '', module: 'HMU08001', status: 'Draft' });
    if (type === 'video') setFormVideo({ title: '', module: 'HMU08001', duration: '' });
    if (type === 'quiz') setFormQuiz({ title: '', module: 'HMU08001', questions: '' });
    setModalOpen(true);
  };

  const openEdit = (type, item) => {
    setModalType(type);
    setModalMode('edit');
    setEditingItem(item);
    if (type === 'book') setFormBook({ title: item.title, module: item.module, status: item.status });
    if (type === 'video') setFormVideo({ title: item.title, module: item.module, duration: item.duration || '' });
    if (type === 'quiz') setFormQuiz({ title: item.title, module: item.module, questions: String(item.questions || '') });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setModalType(null);
    setEditingItem(null);
  };

  const handleDelete = (type, item, list, setList) => {
    if (window.confirm(`Delete "${item.title}"?`)) {
      setList(list.filter((i) => i.id !== item.id));
    }
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setBooks((prev) => [...prev, { id: generateId('b'), ...formBook }]);
    } else {
      setBooks((prev) => prev.map((b) => (b.id === editingItem.id ? { ...b, ...formBook } : b)));
    }
    closeModal();
  };

  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setVideos((prev) => [...prev, { id: generateId('v'), ...formVideo }]);
    } else {
      setVideos((prev) => prev.map((v) => (v.id === editingItem.id ? { ...v, ...formVideo } : v)));
    }
    closeModal();
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();
    const payload = { ...formQuiz, questions: parseInt(formQuiz.questions, 10) || 0 };
    if (modalMode === 'add') {
      setQuizzes((prev) => [...prev, { id: generateId('q'), ...payload }]);
    } else {
      setQuizzes((prev) => prev.map((q) => (q.id === editingItem.id ? { ...q, ...payload } : q)));
    }
    closeModal();
  };

  const renderModal = () => {
    if (!modalOpen || !modalType) return null;

    if (modalMode === 'view' && editingItem) {
      const isBook = modalType === 'book';
      const isVideo = modalType === 'video';
      const title = modalType === 'book' ? 'View Book' : modalType === 'video' ? 'View Video' : 'View Quiz';
      return (
        <Modal title={title} show={modalOpen} onClose={closeModal}>
          <div className="modal-view-field"><label>Title</label><div className="value">{editingItem.title}</div></div>
          <div className="modal-view-field"><label>Module</label><div className="value">{editingItem.module}</div></div>
          {isBook && <div className="modal-view-field"><label>Status</label><div className="value">{editingItem.status}</div></div>}
          {isVideo && <div className="modal-view-field"><label>Duration</label><div className="value">{editingItem.duration}</div></div>}
          {modalType === 'quiz' && <div className="modal-view-field"><label>Questions</label><div className="value">{editingItem.questions}</div></div>}
        </Modal>
      );
    }

    if (modalType === 'book') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Book' : 'Edit Book'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveBook}>
            <div className="form-row">
              <label>Title</label>
              <input type="text" value={formBook.title} onChange={(e) => setFormBook((p) => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Module</label>
              <select value={formBook.module} onChange={(e) => setFormBook((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Status</label>
              <select value={formBook.status} onChange={(e) => setFormBook((p) => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modalType === 'video') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Video' : 'Edit Video'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveVideo}>
            <div className="form-row">
              <label>Title</label>
              <input type="text" value={formVideo.title} onChange={(e) => setFormVideo((p) => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Module</label>
              <select value={formVideo.module} onChange={(e) => setFormVideo((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Duration (e.g. 02:42)</label>
              <input type="text" value={formVideo.duration} onChange={(e) => setFormVideo((p) => ({ ...p, duration: e.target.value }))} placeholder="02:42" />
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modalType === 'quiz') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Quiz' : 'Edit Quiz'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveQuiz}>
            <div className="form-row">
              <label>Title</label>
              <input type="text" value={formQuiz.title} onChange={(e) => setFormQuiz((p) => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Module</label>
              <select value={formQuiz.module} onChange={(e) => setFormQuiz((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Number of questions</label>
              <input type="number" min="1" value={formQuiz.questions} onChange={(e) => setFormQuiz((p) => ({ ...p, questions: e.target.value }))} />
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (activeTab === 'books') {
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('book')}>+ Add Book</button>
          </div>
          <table className="management-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Module</th>
                <th>Status</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.module}</td>
                  <td><span className="management-badge">{row.status}</span></td>
                  <td className="management-td-actions">
                    <button type="button" className="management-btn management-btn-view" onClick={() => openView('book', row)}>View</button>
                    <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('book', row)}>Edit</button>
                    <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Book', row, books, setBooks)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && <p className="management-empty">No books yet. Add one to get started.</p>}
        </div>
      );
    }

    if (activeTab === 'videos') {
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('video')}>+ Add Video</button>
          </div>
          <table className="management-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Module</th>
                <th>Duration</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.module}</td>
                  <td>{row.duration}</td>
                  <td className="management-td-actions">
                    <button type="button" className="management-btn management-btn-view" onClick={() => openView('video', row)}>View</button>
                    <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('video', row)}>Edit</button>
                    <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Video', row, videos, setVideos)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {videos.length === 0 && <p className="management-empty">No videos yet. Add one to get started.</p>}
        </div>
      );
    }

    if (activeTab === 'quiz') {
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('quiz')}>+ Add Quiz</button>
          </div>
          <table className="management-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Module</th>
                <th>Questions</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.module}</td>
                  <td>{row.questions}</td>
                  <td className="management-td-actions">
                    <button type="button" className="management-btn management-btn-view" onClick={() => openView('quiz', row)}>View</button>
                    <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('quiz', row)}>Edit</button>
                    <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Quiz', row, quizzes, setQuizzes)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quizzes.length === 0 && <p className="management-empty">No quizzes yet. Add one to get started.</p>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard-content management-content">
      <div className="management-tabs">
        {MODULE_MANAGEMENT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`management-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderTable()}
      {renderModal()}
    </div>
  );
};

export default ModuleManagement;
