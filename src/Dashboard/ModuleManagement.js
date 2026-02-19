import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { moduleApi, learningMaterialApi, quizApi, certificateApi, assignmentApi, users as usersApi } from '../api/api';
import { BASE_URL } from '../api/apiClient';
import './Dashboard.css';

/** Build assignment document URL: support document_url (API response), path, and other keys. */
function getAssignmentDocumentUrl(row) {
  const raw = row?.document_url ?? row?.path ?? row?.document ?? row?.document_path ?? row?.file_url ?? row?.file_path ?? row?.url ?? row?.storage_path ?? (row?.document && typeof row.document === 'object' ? row.document.url : null);
  if (!raw || typeof raw !== 'string') return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const siteRoot = BASE_URL.replace(/\/api\/?$/, '');
  if (raw.startsWith('/')) return siteRoot + raw;
  return siteRoot + '/' + raw;
}

const swalConfirm = (options) => Swal.fire({ confirmButtonColor: '#2563eb', ...options });
const swalSuccess = (title, text) => swalConfirm({ icon: 'success', title, text });
const swalError = (title, text) => swalConfirm({ icon: 'error', title, text });

const MODULE_PER_PAGE = 5;

const MODULE_MANAGEMENT_TABS = [
  { id: 'module', label: 'Module' },
  { id: 'learning-material', label: 'Learning Material' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'assignment', label: 'Assignment' }
];

const MATERIAL_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'media', label: 'Media' }
];

const MATERIAL_PER_PAGE = 5;
const QUIZ_PER_PAGE = 5;
const CERTIFICATE_PER_PAGE = 5;
const ASSIGNMENT_PER_PAGE = 5;


/** Normalize pagination meta from API (handles list_of_item.meta, returnData.pagination, or top-level; computes last_page from total/per_page if missing). */
function getPaginatedMeta(data, perPage) {
  const returnData = data?.returnData || {};
  const listOfItem = returnData.list_of_item || returnData;
  const paginationObj = returnData.pagination || listOfItem?.pagination || data?.pagination;
  const meta = listOfItem?.meta || returnData.meta || paginationObj || data?.meta || listOfItem || returnData || data;
  const total = Number(meta.total ?? meta.totalCount ?? meta.total_count ?? meta.totalRecords ?? meta.count ?? paginationObj?.total ?? returnData.total ?? returnData.total_count ?? listOfItem?.total ?? 0) || 0;
  const per = Number(meta.per_page ?? meta.perPage ?? paginationObj?.per_page ?? returnData.per_page ?? returnData.perPage ?? perPage) || perPage;
  const current = Number(meta.current_page ?? meta.currentPage ?? paginationObj?.current_page ?? returnData.current_page ?? returnData.currentPage ?? 1) || 1;
  const lastFromApi = meta.last_page ?? meta.lastPage ?? paginationObj?.last_page ?? returnData.last_page ?? returnData.lastPage;
  const last = lastFromApi != null ? Number(lastFromApi) : (per > 0 ? Math.max(1, Math.ceil(total / per)) : 1);
  return {
    current_page: current,
    last_page: Math.max(1, last),
    total,
    per_page: per
  };
}

/** Get list array from API response (list_of_item.data or returnData.data or returnData if array). */
function getListFromResponse(data) {
  const returnData = data?.returnData;
  if (!returnData) return [];
  const listOfItem = returnData.list_of_item ?? returnData;
  if (Array.isArray(listOfItem)) return listOfItem;
  return listOfItem?.data ?? returnData.data ?? [];
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ModuleManagement = () => {
  const [activeTab, setActiveTab] = useState('module');
  const [modules, setModules] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState(null);
  const [modulePage, setModulePage] = useState(1);
  const [moduleMeta, setModuleMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: MODULE_PER_PAGE });
  const [moduleOptions, setModuleOptions] = useState([]); // for Quiz & Learning Material dropdowns
  const [materials, setMaterials] = useState([]);
  const [materialLoading, setMaterialLoading] = useState(true);
  const [materialError, setMaterialError] = useState(null);
  const [materialPage, setMaterialPage] = useState(1);
  const [materialMeta, setMaterialMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: MATERIAL_PER_PAGE });
  const [materialSaving, setMaterialSaving] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState(null);
  const [quizPage, setQuizPage] = useState(1);
  const [quizMeta, setQuizMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: QUIZ_PER_PAGE });
  const [quizSaving, setQuizSaving] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [certificateError, setCertificateError] = useState(null);
  const [certificatePage, setCertificatePage] = useState(1);
  const [certificateMeta, setCertificateMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: CERTIFICATE_PER_PAGE });
  const [certificateSaving, setCertificateSaving] = useState(false);
  const [userOptions, setUserOptions] = useState([]); // for Certificate & Assignment user dropdown
  const [assignments, setAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [assignmentError, setAssignmentError] = useState(null);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentMeta, setAssignmentMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: ASSIGNMENT_PER_PAGE });
  const [assignmentSaving, setAssignmentSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'add' | 'edit'
  const [modalType, setModalType] = useState(null); // 'module' | 'learning-material' | 'quiz' | 'certificate' | 'assignment'
  const [editingItem, setEditingItem] = useState(null);
  const [moduleSaving, setModuleSaving] = useState(false);

  const [formModule, setFormModule] = useState({ name: '', description: '', code: '' });
  const [formMaterial, setFormMaterial] = useState({ module_id: '', title: '', description: '', type: 'document', fileName: '' });
  const [formQuiz, setFormQuiz] = useState({ module_id: '', name: '', question: '', options: ['', ''], correctAnswerIndex: 0 });
  const [formCertificate, setFormCertificate] = useState({ user_id: '', fileName: '', file: null });
  const [formAssignment, setFormAssignment] = useState({ title: '', description: '', assigned_user_id: '', fileName: '', file: null });

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
    if (type === 'module') setFormModule({ name: '', description: '', code: '' });
    if (type === 'learning-material') setFormMaterial({ module_id: moduleOptions[0]?.id ?? '', title: '', description: '', type: 'document', fileName: '' });
    if (type === 'quiz') setFormQuiz({ module_id: moduleOptions[0]?.id ?? '', name: '', question: '', options: ['', ''], correctAnswerIndex: 0 });
    if (type === 'certificate') setFormCertificate({ user_id: userOptions[0]?.id ?? '', fileName: '', file: null });
    if (type === 'assignment') setFormAssignment({ title: '', description: '', assigned_user_id: userOptions[0]?.id ?? '', fileName: '', file: null });
    setModalOpen(true);
  };

  const openEdit = (type, item) => {
    setModalType(type);
    setModalMode('edit');
    setEditingItem(item);
    if (type === 'module') {
      setFormModule({ name: item.name || '', description: item.description || '', code: item.code || '' });
    }
    if (type === 'learning-material') {
      setFormMaterial({
        module_id: item.module_id ?? '',
        title: item.title || '',
        description: item.description || '',
        type: item.type || 'document',
        fileName: item.media ? 'Uploaded file' : ''
      });
    }
    if (type === 'quiz') {
      const opts = item.options?.map((o) => (typeof o === 'object' && o?.value != null ? o.value : o)) ?? [];
      const idx = item.correct_option != null && item.options?.length
        ? item.options.findIndex((o) => (typeof o === 'object' ? o.option : o) === item.correct_option)
        : 0;
      setFormQuiz({
        module_id: item.module_id ?? (moduleOptions[0]?.id ?? ''),
        name: item.quizName ?? '',
        question: item.question || '',
        options: opts.length ? opts : ['', ''],
        correctAnswerIndex: idx >= 0 ? idx : 0
      });
    }
    if (type === 'certificate') {
      setFormCertificate({ user_id: item.user_id ?? '', fileName: item.path ? 'Uploaded file' : '', file: null });
    }
    if (type === 'assignment') {
      setFormAssignment({
        title: item.title || '',
        description: item.description || '',
        assigned_user_id: item.assigned_user_id ?? '',
        fileName: item.document || item.path ? 'Uploaded file' : '',
        file: null
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setModalType(null);
    setEditingItem(null);
  };

  const fetchModules = useCallback(async (pageNum = 1, perPage = MODULE_PER_PAGE) => {
    setModuleLoading(true);
    setModuleError(null);
    try {
      const { data } = await moduleApi.ilist({ page: pageNum, per_page: perPage });
      const ok = data?.status === 'OK';
      if (ok) {
        setModules(getListFromResponse(data));
        setModuleMeta(getPaginatedMeta(data, perPage));
        setModuleError(null);
      } else {
        setModules([]);
        setModuleError(data?.errorMessage || 'Failed to load modules');
      }
    } catch (err) {
      setModules([]);
      setModuleError(err.response?.data?.errorMessage || err.message || 'Failed to load modules');
    } finally {
      setModuleLoading(false);
    }
  }, []);

  const fetchModuleOptions = useCallback(async () => {
    try {
      const { data } = await moduleApi.ilist({ page: 1, per_page: 100 });
      const ok = data?.status === 'OK';
      const listOfItem = data?.returnData?.list_of_item;
      if (ok && listOfItem) setModuleOptions(listOfItem.data || []);
      else setModuleOptions([]);
    } catch {
      setModuleOptions([]);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'module') fetchModules(modulePage);
  }, [activeTab, modulePage, fetchModules]);

  useEffect(() => {
    if (activeTab === 'quiz' || activeTab === 'learning-material') fetchModuleOptions();
  }, [activeTab, fetchModuleOptions]);

  const fetchMaterials = useCallback(async (pageNum = 1) => {
    setMaterialLoading(true);
    setMaterialError(null);
    try {
      const { data } = await learningMaterialApi.ilist({ page: pageNum, per_page: MATERIAL_PER_PAGE });
      const ok = data?.status === 'OK';
      if (ok) {
        setMaterials(getListFromResponse(data));
        setMaterialMeta(getPaginatedMeta(data, MATERIAL_PER_PAGE));
        setMaterialError(null);
      } else {
        setMaterials([]);
        setMaterialError(data?.errorMessage || 'Failed to load learning materials');
      }
    } catch (err) {
      setMaterials([]);
      setMaterialError(err.response?.data?.errorMessage || err.message || 'Failed to load learning materials');
    } finally {
      setMaterialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'learning-material') fetchMaterials(materialPage);
  }, [activeTab, materialPage, fetchMaterials]);

  const fetchQuizzes = useCallback(async (pageNum = 1) => {
    setQuizLoading(true);
    setQuizError(null);
    try {
      const { data } = await quizApi.ilist({ page: pageNum, per_page: QUIZ_PER_PAGE });
      const ok = data?.status === 'OK';
      if (ok) {
        setQuizzes(getListFromResponse(data));
        setQuizMeta(getPaginatedMeta(data, QUIZ_PER_PAGE));
        setQuizError(null);
      } else {
        setQuizzes([]);
        setQuizError(data?.errorMessage || 'Failed to load quizzes');
      }
    } catch (err) {
      setQuizzes([]);
      setQuizError(err.response?.data?.errorMessage || err.message || 'Failed to load quizzes');
    } finally {
      setQuizLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quiz') fetchQuizzes(quizPage);
  }, [activeTab, quizPage, fetchQuizzes]);

  const fetchCertificates = useCallback(async (pageNum = 1) => {
    setCertificateLoading(true);
    setCertificateError(null);
    try {
      const { data } = await certificateApi.ilist({ page: pageNum, per_page: CERTIFICATE_PER_PAGE });
      const ok = data?.status === 'OK';
      if (ok) {
        setCertificates(getListFromResponse(data));
        setCertificateMeta(getPaginatedMeta(data, CERTIFICATE_PER_PAGE));
        setCertificateError(null);
      } else {
        setCertificates([]);
        setCertificateError(data?.errorMessage || 'Failed to load certificates');
      }
    } catch (err) {
      setCertificates([]);
      setCertificateError(err.response?.data?.errorMessage || err.message || 'Failed to load certificates');
    } finally {
      setCertificateLoading(false);
    }
  }, []);

  const fetchUserOptions = useCallback(async () => {
    try {
      const { data } = await usersApi.ilist({ page: 1, per_page: 100 });
      const ok = data?.status === 'OK';
      const listOfItem = data?.returnData?.list_of_item;
      if (ok && listOfItem) setUserOptions(listOfItem.data || []);
      else setUserOptions([]);
    } catch {
      setUserOptions([]);
    }
  }, []);

  const fetchAssignments = useCallback(async (pageNum = 1) => {
    setAssignmentLoading(true);
    setAssignmentError(null);
    try {
      const { data } = await assignmentApi.ilist({ page: pageNum, per_page: ASSIGNMENT_PER_PAGE });
      const ok = data?.status === 'OK';
      if (ok) {
        setAssignments(getListFromResponse(data));
        setAssignmentMeta(getPaginatedMeta(data, ASSIGNMENT_PER_PAGE));
        setAssignmentError(null);
      } else {
        setAssignments([]);
        setAssignmentError(data?.errorMessage || 'Failed to load assignments');
      }
    } catch (err) {
      setAssignments([]);
      setAssignmentError(err.response?.data?.errorMessage || err.message || 'Failed to load assignments');
    } finally {
      setAssignmentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'certificate') {
      fetchCertificates(certificatePage);
      fetchUserOptions();
    }
  }, [activeTab, certificatePage, fetchCertificates, fetchUserOptions]);

  useEffect(() => {
    if (activeTab === 'assignment') {
      fetchAssignments(assignmentPage);
      fetchUserOptions();
    }
  }, [activeTab, assignmentPage, fetchAssignments, fetchUserOptions]);

  const getDeleteLabel = (type, item) => {
    if (type === 'Module') return item.name || item.code || 'this module';
    if (type === 'Learning Material') return item.title || 'this item';
    if (type === 'Quiz') return item.question || item.title || 'this item';
    if (type === 'Certificate') return item.username || item.email || 'this certificate';
    if (type === 'Assignment') return item.title || 'this assignment';
    return item.title || item.name || 'this item';
  };

  const handleDelete = async (type, item, list, setList) => {
    const label = getDeleteLabel(type, item);
    const typeLabel = type;
    const result = await swalConfirm({
      title: `Delete ${typeLabel}?`,
      text: `Are you sure you want to delete "${String(label).substring(0, 50)}${String(label).length > 50 ? '...' : ''}"?`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });
    if (!result.isConfirmed) return;
    if (type === 'Module') {
      try {
        const { data } = await moduleApi.iformAction({ form_method: 'delete', id: item.id });
        const ok = data?.status === 'OK';
        const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
        if (ok) {
          await swalSuccess('Deleted', msg || 'Module has been deleted.');
          fetchModules(moduleMeta.current_page);
        } else {
          await swalError('Delete failed', msg || 'Could not delete module.');
        }
      } catch (err) {
        const msg = err.response?.data?.errorMessage;
        const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not delete module.';
        await swalError('Error', text);
      }
      return;
    }
    if (type === 'Learning Material') {
      try {
        const { data } = await learningMaterialApi.iformAction({ form_method: 'delete', id: item.id });
        const ok = data?.status === 'OK';
        const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
        if (ok) {
          await swalSuccess('Deleted', msg || 'Learning material has been deleted.');
          fetchMaterials(materialMeta.current_page);
        } else {
          await swalError('Delete failed', msg || 'Could not delete learning material.');
        }
      } catch (err) {
        const msg = err.response?.data?.errorMessage;
        const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not delete learning material.';
        await swalError('Error', text);
      }
      return;
    }
    if (type === 'Quiz') {
      try {
        const { data } = await quizApi.iformAction({ form_method: 'delete', id: item.id });
        const ok = data?.status === 'OK';
        const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
        if (ok) {
          await swalSuccess('Deleted', msg || 'Quiz has been deleted.');
          fetchQuizzes(quizMeta.current_page);
        } else {
          await swalError('Delete failed', msg || 'Could not delete quiz.');
        }
      } catch (err) {
        const msg = err.response?.data?.errorMessage;
        const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not delete quiz.';
        await swalError('Error', text);
      }
      return;
    }
    if (type === 'Certificate') {
      try {
        const { data } = await certificateApi.iformAction({ form_method: 'delete', id: item.id });
        const ok = data?.status === 'OK';
        const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
        if (ok) {
          await swalSuccess('Deleted', msg || 'Certificate has been deleted.');
          fetchCertificates(certificateMeta.current_page);
        } else {
          await swalError('Delete failed', msg || 'Could not delete certificate.');
        }
      } catch (err) {
        const msg = err.response?.data?.errorMessage;
        const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not delete certificate.';
        await swalError('Error', text);
      }
      return;
    }
    if (type === 'Assignment') {
      try {
        const { data } = await assignmentApi.iformAction({ form_method: 'delete', id: item.id });
        const ok = data?.status === 'OK';
        const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
        if (ok) {
          await swalSuccess('Deleted', msg || 'Assignment has been deleted.');
          fetchAssignments(assignmentMeta.current_page);
        } else {
          await swalError('Delete failed', msg || 'Could not delete assignment.');
        }
      } catch (err) {
        const msg = err.response?.data?.errorMessage;
        const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not delete assignment.';
        await swalError('Error', text);
      }
      return;
    }
      setList(list.filter((i) => i.id !== item.id));
      await swalSuccess('Deleted!', 'The item has been deleted.');
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    setModuleSaving(true);
    try {
      const isEdit = modalType === 'module' && modalMode === 'edit' && editingItem != null;
      const body = {
        form_method: isEdit ? 'update' : 'save',
        name: formModule.name.trim(),
        description: formModule.description.trim(),
        code: formModule.code.trim()
      };
      if (isEdit && editingItem.id != null) {
        body.id = Number(editingItem.id);
      }
      const { data } = await moduleApi.iformAction(body);
      const ok = data?.status === 'OK';
      const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
      if (ok) {
        closeModal();
        await swalSuccess(modalMode === 'add' ? 'Module added!' : 'Module updated!', msg || (modalMode === 'add' ? 'The module has been added.' : 'The module has been updated.'));
        fetchModules(moduleMeta.current_page);
      } else {
        await swalError('Save failed', msg || 'Could not save module.');
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage;
      const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not save module.';
      await swalError('Error', text);
    } finally {
      setModuleSaving(false);
    }
  };

  const handleCertificateFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormCertificate((p) => ({ ...p, fileName: file ? file.name : '', file: file || null }));
  };

  const handleSaveCertificate = async (e) => {
    e.preventDefault();
    const userId = formCertificate.user_id === '' ? null : Number(formCertificate.user_id);
    if (userId == null) {
      await swalError('Validation', 'Please select a user.');
      return;
    }
    const isEdit = modalType === 'certificate' && modalMode === 'edit' && editingItem != null;
    const file = formCertificate.file;
    if (!file && !isEdit) {
      await swalError('Validation', 'Please select a certificate file to upload.');
      return;
    }
    setCertificateSaving(true);
    try {
      const body = { form_method: isEdit ? 'update' : 'save', user_id: userId };
      if (file) {
        body.certificate = await readFileAsDataUrl(file);
      }
      if (isEdit && editingItem.id != null) body.id = Number(editingItem.id);
      const { data } = await certificateApi.iformAction(body);
      const ok = data?.status === 'OK';
      const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
      if (ok) {
        closeModal();
        await swalSuccess(modalMode === 'add' ? 'Certificate added!' : 'Certificate updated!', msg || (modalMode === 'add' ? 'The certificate has been added.' : 'The certificate has been updated.'));
        fetchCertificates(certificateMeta.current_page);
      } else {
        await swalError('Save failed', msg || 'Could not save certificate.');
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage;
      const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not save certificate.';
      await swalError('Error', text);
    } finally {
      setCertificateSaving(false);
    }
  };

  const handleAssignmentFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormAssignment((p) => ({ ...p, fileName: file ? file.name : '', file: file || null }));
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    const assignedUserId = formAssignment.assigned_user_id === '' ? null : Number(formAssignment.assigned_user_id);
    if (assignedUserId == null) {
      await swalError('Validation', 'Please select an assigned user.');
      return;
    }
    const isEdit = modalType === 'assignment' && modalMode === 'edit' && editingItem != null;
    const file = formAssignment.file;
    if (!file && !isEdit) {
      await swalError('Validation', 'Please select a document to upload.');
      return;
    }
    setAssignmentSaving(true);
    try {
      const body = {
        form_method: isEdit ? 'update' : 'save',
        title: formAssignment.title.trim(),
        description: formAssignment.description.trim(),
        assigned_user_id: assignedUserId
      };
      if (file) {
        body.document = await readFileAsDataUrl(file);
      }
      if (isEdit && editingItem.id != null) body.id = Number(editingItem.id);
      const { data } = await assignmentApi.iformAction(body);
      const ok = data?.status === 'OK';
      const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
      if (ok) {
    closeModal();
        await swalSuccess(modalMode === 'add' ? 'Assignment added!' : 'Assignment updated!', msg || (modalMode === 'add' ? 'The assignment has been added.' : 'The assignment has been updated.'));
        fetchAssignments(assignmentMeta.current_page);
      } else {
        await swalError('Save failed', msg || 'Could not save assignment.');
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage;
      const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not save assignment.';
      await swalError('Error', text);
    } finally {
      setAssignmentSaving(false);
    }
  };

  const handleMaterialFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormMaterial((p) => ({ ...p, fileName: file ? file.name : '' }));
  };

  const handleMaterialTypeChange = (value) => {
    setFormMaterial((p) => ({ ...p, type: value, fileName: '' }));
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    const moduleId = formMaterial.module_id === '' ? null : Number(formMaterial.module_id);
    if (moduleId == null) {
      await swalError('Validation', 'Please select a module.');
      return;
    }
    setMaterialSaving(true);
    try {
      const isEdit = modalType === 'learning-material' && modalMode === 'edit' && editingItem != null;
      const body = {
        form_method: isEdit ? 'update' : 'save',
        module_id: moduleId,
        title: formMaterial.title.trim(),
        description: formMaterial.description.trim(),
        type: formMaterial.type
      };
      if (isEdit && editingItem.id != null) body.id = Number(editingItem.id);
      const { data } = await learningMaterialApi.iformAction(body);
      const ok = data?.status === 'OK';
      const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
      if (ok) {
    closeModal();
        await swalSuccess(modalMode === 'add' ? 'Learning material added!' : 'Learning material updated!', msg || (modalMode === 'add' ? 'The learning material has been added.' : 'The learning material has been updated.'));
        fetchMaterials(materialMeta.current_page);
      } else {
        await swalError('Save failed', msg || 'Could not save learning material.');
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage;
      const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not save learning material.';
      await swalError('Error', text);
    } finally {
      setMaterialSaving(false);
    }
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
    const moduleId = formQuiz.module_id === '' ? null : Number(formQuiz.module_id);
    if (moduleId == null) {
      await swalError('Validation', 'Please select a module.');
      return;
    }
    const optionValues = formQuiz.options.filter((o) => o.trim() !== '');
    if (optionValues.length < 2) {
      await swalError('Validation', 'Please add at least 2 options.');
      return;
    }
    let correctIdx = formQuiz.correctAnswerIndex;
    if (correctIdx >= optionValues.length) correctIdx = 0;
    const optionLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const optionsForApi = optionValues.map((value, i) => ({ option: optionLetters[i], value: value.trim() }));
    const correct_option = optionLetters[correctIdx];

    setQuizSaving(true);
    try {
      const isEdit = modalType === 'quiz' && modalMode === 'edit' && editingItem != null;
      const body = {
        form_method: isEdit ? 'update' : 'save',
        module_id: moduleId,
        name: (formQuiz.name || formQuiz.question || '').trim() || 'Quiz',
        question: formQuiz.question.trim(),
        options: optionsForApi,
        correct_option
      };
      if (isEdit && editingItem.id != null) body.id = Number(editingItem.id);
      const { data } = await quizApi.iformAction(body);
      const ok = data?.status === 'OK';
      const msg = Array.isArray(data?.errorMessage) ? data.errorMessage[0] : data?.errorMessage;
      if (ok) {
    closeModal();
        await swalSuccess(modalMode === 'add' ? 'Quiz added!' : 'Quiz updated!', msg || (modalMode === 'add' ? 'The quiz has been added.' : 'The quiz has been updated.'));
        fetchQuizzes(quizMeta.current_page);
      } else {
        await swalError('Save failed', msg || 'Could not save quiz.');
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage;
      const text = Array.isArray(msg) ? msg[0] : msg || err.message || 'Could not save quiz.';
      await swalError('Error', text);
    } finally {
      setQuizSaving(false);
    }
  };

  const renderModal = () => {
    if (!modalOpen || !modalType) return null;

    if (modalMode === 'view' && editingItem) {
      const viewTitles = {
        module: 'View Module',
        'learning-material': 'View Learning Material',
        quiz: 'View Quiz',
        certificate: 'View Certificate',
        assignment: 'View Assignment'
      };
      const title = viewTitles[modalType] || 'View';

      if (modalType === 'module') {
        const rows = [
          ['Name', editingItem.name || '—'],
        ['Description', editingItem.description || '—'],
          ['Code', editingItem.code || '—']
        ];
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

      if (modalType === 'certificate') {
        const pathCell = editingItem.path ? (
          <a href={editingItem.path} target="_blank" rel="noopener noreferrer">View certificate</a>
        ) : '—';
        const rows = [
          ['User', editingItem.username || editingItem.email || '—'],
          ['Email', editingItem.email || '—'],
          ['Phone', editingItem.phone || '—'],
          ['Certificate', pathCell]
        ];
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

      if (modalType === 'learning-material') {
        const mediaCell = editingItem.media ? (
          <a href={editingItem.media} target="_blank" rel="noopener noreferrer">View file</a>
        ) : '—';
        const rows = [
          ['Module', editingItem.module || '—'],
        ['Title', editingItem.title],
        ['Description', editingItem.description || '—'],
          ['Type', editingItem.type === 'document' ? 'Document' : 'Media'],
          ['Media', mediaCell]
        ];
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

      if (modalType === 'quiz') {
        const opts = editingItem.options ?? [];
        const optionsContent = opts.length
          ? opts.map((o, i) => (
            <React.Fragment key={i}>
                {typeof o === 'object' ? o.value : o}
                {i < opts.length - 1 && <br />}
            </React.Fragment>
          ))
        : '—';
        const correctOpt = editingItem.correct_option != null && opts.length
          ? opts.find((o) => (typeof o === 'object' ? o.option : o) === editingItem.correct_option)
          : null;
        const correctAnswerDisplay = correctOpt != null ? (typeof correctOpt === 'object' ? correctOpt.value : correctOpt) : '—';
      const quizRows = [
          ['Module', editingItem.name || '—'],
        ['Question', editingItem.question || '—'],
        ['Options', optionsContent],
          ['Correct answer', correctAnswerDisplay]
        ];
        return (
          <Modal title={title} show={modalOpen} onClose={closeModal}>
            <table className="modal-view-table">
              <tbody>
                {quizRows.map(([label, value], i) => (
                  <tr key={i}><th>{label}</th><td>{value}</td></tr>
                ))}
              </tbody>
            </table>
          </Modal>
        );
      }

      if (modalType === 'assignment') {
        const viewAssignedUser = userOptions.find((u) => Number(u.id) === Number(editingItem.assigned_user_id));
        const viewAssignedUserName = editingItem.assigned_user_name ?? (viewAssignedUser ? (viewAssignedUser.name || viewAssignedUser.email) : (editingItem.assigned_username || editingItem.username || editingItem.email || '—'));
        const viewDocUrl = getAssignmentDocumentUrl(editingItem);
        const docCell = viewDocUrl ? (
          <a href={viewDocUrl} target="_blank" rel="noopener noreferrer">View document</a>
        ) : '—';
        const rows = [
          ['Title', editingItem.title || '—'],
          ['Description', editingItem.description || '—'],
          ['Assigned user', viewAssignedUserName],
          ['Document', docCell]
        ];
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
    }

    if (modalType === 'module') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Module' : 'Update Module'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveModule}>
            <div className="form-row">
              <label>Name</label>
              <input type="text" value={formModule.name} onChange={(e) => setFormModule((p) => ({ ...p, name: e.target.value }))} required disabled={moduleSaving} />
            </div>
            <div className="form-row form-row-textarea">
              <label>Description</label>
              <textarea value={formModule.description} onChange={(e) => setFormModule((p) => ({ ...p, description: e.target.value }))} rows={3} className="modal-form-textarea" disabled={moduleSaving} />
            </div>
            <div className="form-row">
              <label>Code</label>
              <input type="text" value={formModule.code} onChange={(e) => setFormModule((p) => ({ ...p, code: e.target.value }))} required disabled={moduleSaving} />
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal} disabled={moduleSaving}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={moduleSaving}>{moduleSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modalType === 'learning-material') {
      const isDocument = formMaterial.type === 'document';
      const uploadAccept = isDocument ? '.pdf,.doc,.docx' : 'video/*,.mp4,.webm,.mov';
      const uploadLabel = isDocument ? 'Upload document (optional)' : 'Upload video (optional)';

      return (
        <Modal title={modalMode === 'add' ? 'Add Learning Material' : 'Update Learning Material'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveMaterial}>
            <div className="form-row">
              <label>Module</label>
              <select
                value={formMaterial.module_id}
                onChange={(e) => setFormMaterial((p) => ({ ...p, module_id: e.target.value }))}
                required
                disabled={materialSaving}
              >
                <option value="">Select module</option>
                {moduleOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.code} – {m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Title</label>
              <input type="text" value={formMaterial.title} onChange={(e) => setFormMaterial((p) => ({ ...p, title: e.target.value }))} required disabled={materialSaving} />
            </div>
            <div className="form-row form-row-textarea">
              <label>Description</label>
              <textarea value={formMaterial.description} onChange={(e) => setFormMaterial((p) => ({ ...p, description: e.target.value }))} rows={3} className="modal-form-textarea" disabled={materialSaving} />
            </div>
            <div className="form-row">
              <label>Type</label>
              <select
                value={formMaterial.type}
                onChange={(e) => handleMaterialTypeChange(e.target.value)}
                disabled={materialSaving}
              >
                {MATERIAL_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>{uploadLabel}</label>
              <div className="modal-form-file-wrap">
                <input
                  type="file"
                  accept={uploadAccept}
                  onChange={handleMaterialFileChange}
                  className="modal-form-file"
                  id="learning-material-upload"
                  key={formMaterial.type}
                />
                <label htmlFor="learning-material-upload" className="modal-form-file-label">
                  {formMaterial.fileName || (isDocument ? 'Choose document...' : 'Choose video...')}
                </label>
              </div>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal} disabled={materialSaving}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={materialSaving}>{materialSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modalType === 'quiz') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Quiz' : 'Update Quiz'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveQuiz}>
            <div className="form-row">
              <label>Module</label>
              <select value={formQuiz.module_id} onChange={(e) => setFormQuiz((p) => ({ ...p, module_id: e.target.value }))} required disabled={quizSaving}>
                <option value="">Select module</option>
                {moduleOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.code} – {m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Name (optional)</label>
              <input type="text" value={formQuiz.name} onChange={(e) => setFormQuiz((p) => ({ ...p, name: e.target.value }))} placeholder="Quiz title" disabled={quizSaving} />
            </div>
            <div className="form-row form-row-textarea">
              <label>Question</label>
              <textarea value={formQuiz.question} onChange={(e) => setFormQuiz((p) => ({ ...p, question: e.target.value }))} rows={2} className="modal-form-textarea" required disabled={quizSaving} />
            </div>
            <div className="form-row form-row-options">
              <label>Options</label>
              <div className="modal-form-options-list">
                {formQuiz.options.map((opt, index) => (
                  <div key={index} className="modal-form-option-row">
                    <input type="text" value={opt} onChange={(e) => updateQuizOption(index, e.target.value)} placeholder={`Option ${index + 1}`} className="modal-form-option-input" disabled={quizSaving} />
                    <button type="button" className="modal-form-option-remove" onClick={() => removeQuizOption(index)} title="Remove option" aria-label="Remove option" disabled={quizSaving}>&times;</button>
                  </div>
                ))}
                <button type="button" className="modal-form-option-add" onClick={addQuizOption} disabled={quizSaving}>+ Add option</button>
              </div>
            </div>
            <div className="form-row">
              <label>Correct answer</label>
              <select value={formQuiz.correctAnswerIndex} onChange={(e) => setFormQuiz((p) => ({ ...p, correctAnswerIndex: parseInt(e.target.value, 10) }))} disabled={quizSaving}>
                {formQuiz.options.map((opt, index) => (
                  <option key={index} value={index}>{opt.trim() || `Option ${index + 1}`}</option>
                ))}
              </select>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal} disabled={quizSaving}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={quizSaving}>{quizSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modalType === 'certificate') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Certificate' : 'Update Certificate'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveCertificate}>
            <div className="form-row">
              <label>User</label>
              <select
                value={formCertificate.user_id}
                onChange={(e) => setFormCertificate((p) => ({ ...p, user_id: e.target.value }))}
                required
                disabled={certificateSaving}
              >
                <option value="">Select user</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} – {u.email}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Certificate upload {modalMode === 'edit' && '(leave empty to keep current)'}</label>
              <div className="modal-form-file-wrap">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleCertificateFileChange}
                  className="modal-form-file"
                  id="certificate-upload"
                />
                <label htmlFor="certificate-upload" className="modal-form-file-label">
                  {formCertificate.fileName || 'Choose file...'}
                </label>
              </div>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal} disabled={certificateSaving}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={certificateSaving}>{certificateSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      );
    }

    if (modalType === 'assignment') {
      return (
        <Modal title={modalMode === 'add' ? 'Add Assignment' : 'Update Assignment'} show={modalOpen} onClose={closeModal}>
          <form className="modal-form" onSubmit={handleSaveAssignment}>
            <div className="form-row">
              <label>Title</label>
              <input type="text" value={formAssignment.title} onChange={(e) => setFormAssignment((p) => ({ ...p, title: e.target.value }))} required disabled={assignmentSaving} />
            </div>
            <div className="form-row form-row-textarea">
              <label>Description</label>
              <textarea value={formAssignment.description} onChange={(e) => setFormAssignment((p) => ({ ...p, description: e.target.value }))} rows={3} className="modal-form-textarea" disabled={assignmentSaving} />
            </div>
            <div className="form-row">
              <label>Assigned user</label>
              <select
                value={formAssignment.assigned_user_id}
                onChange={(e) => setFormAssignment((p) => ({ ...p, assigned_user_id: e.target.value }))}
                required
                disabled={assignmentSaving}
              >
                <option value="">Select user</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} – {u.email}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Document upload {modalMode === 'edit' && '(leave empty to keep current)'}</label>
              <div className="modal-form-file-wrap">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleAssignmentFileChange}
                  className="modal-form-file"
                  id="assignment-upload"
                />
                <label htmlFor="assignment-upload" className="modal-form-file-label">
                  {formAssignment.fileName || 'Choose file...'}
                </label>
              </div>
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-secondary" onClick={closeModal} disabled={assignmentSaving}>Cancel</button>
              <button type="submit" className="modal-btn modal-btn-primary" disabled={assignmentSaving}>{assignmentSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (activeTab === 'module') {
      const total = moduleMeta.total;
      const currentPage = moduleMeta.current_page;
      const perPage = moduleMeta.per_page;
      const lastPage = Math.max(moduleMeta.last_page, perPage > 0 && total > 0 ? Math.ceil(total / perPage) : 1);
      const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
      const to = Math.min(currentPage * perPage, total);
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('module')}>+ Add Module</button>
          </div>
          {moduleError && <p className="management-error">{moduleError}</p>}
          {moduleLoading ? (
            <p className="management-loading">Loading modules…</p>
          ) : (
            <>
          <table className="management-table">
            <thead>
              <tr>
                    <th>Name</th>
                <th>Description</th>
                    <th>Code</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {modules.map((row) => (
                <tr key={row.id}>
                      <td>{row.name}</td>
                  <td className="management-td-desc">{row.description || '—'}</td>
                      <td>{row.code}</td>
                  <td className="management-td-actions">
                        <button type="button" className="management-btn management-btn-view" onClick={() => openView('module', row)}>View</button>
                        <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('module', row)}>Update</button>
                        <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Module', row, modules, setModules)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              {modules.length === 0 && <p className="management-empty">No modules yet. Add one to get started.</p>}
              <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setModulePage} total={total} from={from} to={to} />
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'learning-material') {
      const total = materialMeta.total;
      const currentPage = materialMeta.current_page;
      const perPage = materialMeta.per_page;
      const lastPage = Math.max(materialMeta.last_page, perPage > 0 && total > 0 ? Math.ceil(total / perPage) : 1);
      const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
      const to = Math.min(currentPage * perPage, total);
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('learning-material')}>+ Add Learning Material</button>
          </div>
          {materialError && <p className="management-error">{materialError}</p>}
          {materialLoading ? (
            <p className="management-loading">Loading learning materials…</p>
          ) : (
            <>
          <table className="management-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Module</th>
                    <th>Type</th>
                    <th>Media</th>
                <th className="management-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {materials.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td className="management-td-desc">{row.description || '—'}</td>
                      <td>{row.module || '—'}</td>
                      <td>{row.type === 'document' ? 'Document' : 'Media'}</td>
                      <td>
                        {row.media ? (
                          <a href={row.media} target="_blank" rel="noopener noreferrer">View</a>
                        ) : '—'}
                      </td>
                  <td className="management-td-actions">
                        <button type="button" className="management-btn management-btn-view" onClick={() => openView('learning-material', row)}>View</button>
                        <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('learning-material', row)}>Update</button>
                        <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Learning Material', row, materials, setMaterials)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              {materials.length === 0 && <p className="management-empty">No learning materials yet. Add one to get started.</p>}
              <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setMaterialPage} total={total} from={from} to={to} />
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'quiz') {
      const total = quizMeta.total;
      const currentPage = quizMeta.current_page;
      const perPage = quizMeta.per_page;
      const lastPage = Math.max(quizMeta.last_page, perPage > 0 && total > 0 ? Math.ceil(total / perPage) : 1);
      const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
      const to = Math.min(currentPage * perPage, total);
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('quiz')}>+ Add Quiz</button>
          </div>
          {quizError && <p className="management-error">{quizError}</p>}
          {quizLoading ? (
            <p className="management-loading">Loading quizzes…</p>
          ) : (
            <>
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
                  {quizzes.map((row) => {
                    const opts = row.options ?? [];
                    const correctOpt = row.correct_option != null ? opts.find((o) => (typeof o === 'object' ? o.option : o) === row.correct_option) : null;
                    const correctDisplay = correctOpt != null ? (typeof correctOpt === 'object' ? correctOpt.value : correctOpt) : '—';
                    return (
                <tr key={row.id}>
                  <td className="management-td-desc">{row.question || '—'}</td>
                        <td>{row.name || '—'}</td>
                        <td>{opts.length}</td>
                        <td>{correctDisplay}</td>
                  <td className="management-td-actions">
                    <button type="button" className="management-btn management-btn-view" onClick={() => openView('quiz', row)}>View</button>
                          <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('quiz', row)}>Update</button>
                    <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Quiz', row, quizzes, setQuizzes)}>Delete</button>
                  </td>
                </tr>
                    );
                  })}
            </tbody>
          </table>
          {quizzes.length === 0 && <p className="management-empty">No quizzes yet. Add one to get started.</p>}
              <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setQuizPage} total={total} from={from} to={to} />
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'certificate') {
      const total = certificateMeta.total;
      const currentPage = certificateMeta.current_page;
      const perPage = certificateMeta.per_page;
      const lastPage = Math.max(certificateMeta.last_page, perPage > 0 && total > 0 ? Math.ceil(total / perPage) : 1);
      const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
      const to = Math.min(currentPage * perPage, total);
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('certificate')}>+ Add Certificate</button>
          </div>
          {certificateError && <p className="management-error">{certificateError}</p>}
          {certificateLoading ? (
            <p className="management-loading">Loading certificates…</p>
          ) : (
            <>
              <table className="management-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Certificate</th>
                    <th className="management-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((row) => (
                    <tr key={row.id}>
                      <td>{row.username || '—'}</td>
                      <td>{row.email || '—'}</td>
                      <td>
                        {row.path ? (
                          <a href={row.path} target="_blank" rel="noopener noreferrer" className="management-doc-link">View</a>
                        ) : '—'}
                      </td>
                      <td className="management-td-actions">
                        <button type="button" className="management-btn management-btn-view" onClick={() => openView('certificate', row)}>View</button>
                        <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('certificate', row)}>Update</button>
                        <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Certificate', row, certificates, setCertificates)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {certificates.length === 0 && <p className="management-empty">No certificates yet. Add one to get started.</p>}
              <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setCertificatePage} total={total} from={from} to={to} />
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'assignment') {
      const total = assignmentMeta.total;
      const currentPage = assignmentMeta.current_page;
      const perPage = assignmentMeta.per_page;
      const lastPage = Math.max(assignmentMeta.last_page, perPage > 0 && total > 0 ? Math.ceil(total / perPage) : 1);
      const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
      const to = Math.min(currentPage * perPage, total);
      return (
        <div className="management-table-wrap">
          <div className="management-toolbar">
            <button type="button" className="action-btn" onClick={() => openAdd('assignment')}>+ Add Assignment</button>
          </div>
          {assignmentError && <p className="management-error">{assignmentError}</p>}
          {assignmentLoading ? (
            <p className="management-loading">Loading assignments…</p>
          ) : (
            <>
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Assigned user</th>
                    <th>Document</th>
                    <th className="management-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((row) => {
                    const assignedUser = userOptions.find((u) => Number(u.id) === Number(row.assigned_user_id));
                    const assignedUserName = row.assigned_user_name ?? (assignedUser ? (assignedUser.name || assignedUser.email) : (row.assigned_username || row.username || row.email || '—'));
                    const documentUrl = getAssignmentDocumentUrl(row);
                    return (
                    <tr key={row.id}>
                      <td>{row.title}</td>
                      <td className="management-td-desc">{row.description || '—'}</td>
                      <td>{assignedUserName}</td>
                      <td>
                        {documentUrl ? (
                          <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="management-doc-link">View</a>
                        ) : '—'}
                      </td>
                      <td className="management-td-actions">
                        <button type="button" className="management-btn management-btn-view" onClick={() => openView('assignment', row)}>View</button>
                        <button type="button" className="management-btn management-btn-edit" onClick={() => openEdit('assignment', row)}>Update</button>
                        <button type="button" className="management-btn management-btn-delete" onClick={() => handleDelete('Assignment', row, assignments, setAssignments)}>Delete</button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              {assignments.length === 0 && <p className="management-empty">No assignments yet. Add one to get started.</p>}
              <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setAssignmentPage} total={total} from={from} to={to} />
            </>
          )}
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
