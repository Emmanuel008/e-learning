import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '../components/Modal';
import './Dashboard.css';

const swalConfirm = (options) => Swal.fire({ confirmButtonColor: '#2563eb', ...options });
const swalSuccess = (title, text) => swalConfirm({ icon: 'success', title, text });

const MODULE_OPTIONS = [
  { value: 'HMU08001', label: 'HMU08001 - Innovation Management' },
  { value: 'HMU08002', label: 'HMU08002 - IP Management' },
  { value: 'HMU08003', label: 'HMU08003 - Research Commercialization' },
  { value: 'HMU08004', label: 'HMU08004 - Fundraising' }
];

const MODULE_MANAGEMENT_TABS = [
  { id: 'books', label: 'Books' },
  { id: 'videos', label: 'Videos' },
  { id: 'quiz', label: 'Quiz' }
];

const MOCK_BOOKS = [
  { id: 'b1', title: 'Foundations of Innovation Management', description: 'Key concepts for innovation in hubs.', module: 'HMU08001', docName: 'foundations.pdf' },
  { id: 'b2', title: 'Basics of Intellectual Property', description: 'Introduction to IP types and protection.', module: 'HMU08002', docName: '' },
  { id: 'b3', title: 'From Research to Market', description: 'Turning research into products.', module: 'HMU08003', docName: 'research-market.pdf' }
];

const MOCK_VIDEOS = [
  { id: 'v1', title: 'Stage-gate model overview', description: 'Overview of the stage-gate process.', module: 'HMU08001', duration: '02:42', videoName: 'stage-gate-overview.mp4' },
  { id: 'v2', title: 'From idea to patent filing', description: 'Steps from idea to patent.', module: 'HMU08002', duration: '02:42', videoName: '' },
  { id: 'v3', title: 'Licensing to existing companies', description: 'How to license IP to companies.', module: 'HMU08003', duration: '03:24', videoName: 'licensing.mp4' }
];

const MOCK_QUIZZES = [
  { id: 'q1', module: 'HMU08001', question: 'Which statement best describes an innovation hub?', options: ['A place to file patents only', 'A space that connects people, ideas and resources', 'A traditional lecture room'], correctAnswerIndex: 1 },
  { id: 'q2', module: 'HMU08002', question: 'Which of the following is typically protected by a patent?', options: ['A brand name', 'An original invention or process', 'A logo design'], correctAnswerIndex: 1 },
  { id: 'q3', module: 'HMU08004', question: 'Why is a diversified funding mix important?', options: ['To depend on a single donor', 'To reduce risk and increase resilience', 'To avoid reporting requirements'], correctAnswerIndex: 1 }
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

  const [formBook, setFormBook] = useState({ title: '', description: '', module: 'HMU08001', docName: '' });
  const [formVideo, setFormVideo] = useState({ title: '', description: '', module: 'HMU08001', videoName: '' });
  const [formQuiz, setFormQuiz] = useState({ module: 'HMU08001', question: '', options: ['', ''], correctAnswerIndex: 0 });

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
    if (type === 'book') setFormBook({ title: '', description: '', module: 'HMU08001', docName: '' });
    if (type === 'video') setFormVideo({ title: '', description: '', module: 'HMU08001', videoName: '' });
    if (type === 'quiz') setFormQuiz({ module: 'HMU08001', question: '', options: ['', ''], correctAnswerIndex: 0 });
    setModalOpen(true);
  };

  const openEdit = (type, item) => {
    setModalType(type);
    setModalMode('edit');
    setEditingItem(item);
    if (type === 'book') setFormBook({ title: item.title, description: item.description || '', module: item.module, docName: item.docName || '' });
    if (type === 'video') setFormVideo({ title: item.title, description: item.description || '', module: item.module, videoName: item.videoName || '' });
    if (type === 'quiz') setFormQuiz({ module: item.module, question: item.question || '', options: item.options?.length ? [...item.options] : ['', ''], correctAnswerIndex: item.correctAnswerIndex ?? 0 });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setModalType(null);
    setEditingItem(null);
  };

  const handleDelete = async (type, item, list, setList) => {
    const label = type === 'Quiz' ? (item.question || item.title || 'this item') : item.title;
    const typeLabel = type === 'Book' ? 'Book' : type === 'Video' ? 'Video' : 'Quiz';
    const result = await swalConfirm({
      title: 'Delete ' + typeLabel + '?',
      text: `Are you sure you want to delete "${label.substring(0, 50)}${label.length > 50 ? '...' : ''}"?`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });
    if (result.isConfirmed) {
      setList(list.filter((i) => i.id !== item.id));
      await swalSuccess('Deleted!', 'The item has been deleted.');
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormBook((p) => ({ ...p, docName: file ? file.name : '' }));
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormVideo((p) => ({ ...p, videoName: file ? file.name : '' }));
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setBooks((prev) => [...prev, { id: generateId('b'), ...formBook }]);
    } else {
      setBooks((prev) => prev.map((b) => (b.id === editingItem.id ? { ...b, ...formBook } : b)));
    }
    closeModal();
    await swalSuccess(modalMode === 'add' ? 'Book added!' : 'Book updated!', modalMode === 'add' ? 'The book has been added.' : 'The book has been updated.');
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    const payload = { ...formVideo, duration: editingItem?.duration || '' };
    if (modalMode === 'add') {
      setVideos((prev) => [...prev, { id: generateId('v'), ...payload }]);
    } else {
      setVideos((prev) => prev.map((v) => (v.id === editingItem.id ? { ...v, ...payload } : v)));
    }
    closeModal();
    await swalSuccess(modalMode === 'add' ? 'Video added!' : 'Video updated!', modalMode === 'add' ? 'The video has been added.' : 'The video has been updated.');
  };

  const addQuizOption = () => {
    setFormQuiz((p) => ({ ...p, options: [...p.options, ''] }));
  };

  const updateQuizOption = (index, value) => {
    setFormQuiz((p) => ({
      ...p,
      options: p.options.map((opt, i) => (i === index ? value : opt))
    }));
  };

  const removeQuizOption = (index) => {
    setFormQuiz((p) => {
      const nextOptions = p.options.filter((_, i) => i !== index);
      const nextCorrect = p.correctAnswerIndex >= nextOptions.length ? Math.max(0, nextOptions.length - 1) : p.correctAnswerIndex;
      return { ...p, options: nextOptions.length ? nextOptions : [''], correctAnswerIndex: nextCorrect };
    });
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    const options = formQuiz.options.filter((o) => o.trim() !== '');
    const correctText = (formQuiz.options[formQuiz.correctAnswerIndex] || '').trim();
    let correctAnswerIndex = correctText ? options.indexOf(correctText) : 0;
    if (correctAnswerIndex < 0) correctAnswerIndex = 0;
    const payload = { module: formQuiz.module, question: formQuiz.question.trim(), options, correctAnswerIndex };
    if (modalMode === 'add') {
      setQuizzes((prev) => [...prev, { id: generateId('q'), ...payload }]);
    } else {
      setQuizzes((prev) => prev.map((q) => (q.id === editingItem.id ? { ...q, ...payload } : q)));
    }
    closeModal();
    await swalSuccess(modalMode === 'add' ? 'Quiz added!' : 'Quiz updated!', modalMode === 'add' ? 'The quiz has been added.' : 'The quiz has been updated.');
  };

  const renderModal = () => {
    if (!modalOpen || !modalType) return null;

    if (modalMode === 'view' && editingItem) {
      const isBook = modalType === 'book';
      const isVideo = modalType === 'video';
      const title = isBook ? 'View Book' : isVideo ? 'View Video' : 'View Quiz';

      const bookRows = [
        ['Title', editingItem.title],
        ['Description', editingItem.description || '—'],
        ['Module', editingItem.module],
        ['Document', editingItem.docName || editingItem.doc || '—']
      ];
      const videoRows = [
        ['Title', editingItem.title],
        ['Description', editingItem.description || '—'],
        ['Module', editingItem.module],
        ['Video', editingItem.videoName || editingItem.video || '—'],
        ['Duration', editingItem.duration || '—']
      ];
      const optionsContent = editingItem.options?.length
        ? editingItem.options.map((opt, i) => (
            <React.Fragment key={i}>
              {opt}
              {i < editingItem.options.length - 1 && <br />}
            </React.Fragment>
          ))
        : '—';
      const quizRows = [
        ['Module', editingItem.module],
        ['Question', editingItem.question || '—'],
        ['Options', optionsContent],
        ['Correct answer', editingItem.options?.[editingItem.correctAnswerIndex] ?? '—']
      ];

      const rows = isBook ? bookRows : isVideo ? videoRows : quizRows;

      return (
        <Modal title={title} show={modalOpen} onClose={closeModal}>
          <table className="modal-view-table">
            <tbody>
              {rows.map(([label, value], i) => (
                <tr key={i}><th>{label}</th><td>{value}</td></tr>
              ))}
            </tbody>
          </table>
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
            <div className="form-row form-row-textarea">
              <label>Description</label>
              <textarea value={formBook.description} onChange={(e) => setFormBook((p) => ({ ...p, description: e.target.value }))} rows={3} className="modal-form-textarea" />
            </div>
            <div className="form-row">
              <label>Module</label>
              <select value={formBook.module} onChange={(e) => setFormBook((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Upload doc</label>
              <div className="modal-form-file-wrap">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleBookFileChange} className="modal-form-file" id="book-doc-upload" />
                <label htmlFor="book-doc-upload" className="modal-form-file-label">
                  {formBook.docName || 'Choose file...'}
                </label>
              </div>
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
            <div className="form-row form-row-textarea">
              <label>Description</label>
              <textarea value={formVideo.description} onChange={(e) => setFormVideo((p) => ({ ...p, description: e.target.value }))} rows={3} className="modal-form-textarea" />
            </div>
            <div className="form-row">
              <label>Module</label>
              <select value={formVideo.module} onChange={(e) => setFormVideo((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Upload video</label>
              <div className="modal-form-file-wrap">
                <input type="file" accept="video/*,.mp4,.webm,.mov" onChange={handleVideoFileChange} className="modal-form-file" id="video-file-upload" />
                <label htmlFor="video-file-upload" className="modal-form-file-label">
                  {formVideo.videoName || 'Choose file...'}
                </label>
              </div>
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
              <label>Module</label>
              <select value={formQuiz.module} onChange={(e) => setFormQuiz((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-row form-row-textarea">
              <label>Question</label>
              <textarea value={formQuiz.question} onChange={(e) => setFormQuiz((p) => ({ ...p, question: e.target.value }))} rows={2} className="modal-form-textarea" required />
            </div>
            <div className="form-row form-row-options">
              <label>Options</label>
              <div className="modal-form-options-list">
                {formQuiz.options.map((opt, index) => (
                  <div key={index} className="modal-form-option-row">
                    <input type="text" value={opt} onChange={(e) => updateQuizOption(index, e.target.value)} placeholder={`Option ${index + 1}`} className="modal-form-option-input" />
                    <button type="button" className="modal-form-option-remove" onClick={() => removeQuizOption(index)} title="Remove option" aria-label="Remove option">&times;</button>
                  </div>
                ))}
                <button type="button" className="modal-form-option-add" onClick={addQuizOption}>+ Add option</button>
              </div>
            </div>
            <div className="form-row">
              <label>Correct answer</label>
              <select value={formQuiz.correctAnswerIndex} onChange={(e) => setFormQuiz((p) => ({ ...p, correctAnswerIndex: parseInt(e.target.value, 10) }))}>
                {formQuiz.options.map((opt, index) => (
                  <option key={index} value={index}>{opt.trim() || `Option ${index + 1}`}</option>
                ))}
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
                <th>Description</th>
                <th>Module</th>
                <th>Doc</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td className="management-td-desc">{row.description || '—'}</td>
                  <td>{row.module}</td>
                  <td>{row.docName || '—'}</td>
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
                <th>Description</th>
                <th>Module</th>
                <th>Video</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td className="management-td-desc">{row.description || '—'}</td>
                  <td>{row.module}</td>
                  <td>{row.videoName || '—'}</td>
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
                <th>Question</th>
                <th>Module</th>
                <th>Options</th>
                <th>Correct answer</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((row) => (
                <tr key={row.id}>
                  <td className="management-td-desc">{row.question || '—'}</td>
                  <td>{row.module}</td>
                  <td>{row.options?.length ?? 0}</td>
                  <td>{row.options?.[row.correctAnswerIndex] ?? '—'}</td>
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
