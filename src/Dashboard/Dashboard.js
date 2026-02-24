import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import SectionHeader from '../components/SectionHeader';
import StatusTabs from '../components/StatusTabs';
import ModuleManagement from './ModuleManagement';
import UserManagement from './UserManagement';
import Pagination from '../components/Pagination';
import { getUserData } from './dashboardService';
import { moduleApi, userModuleApi, certificateApi, assignmentApi } from '../api/api';
import { BASE_URL } from '../api/apiClient';

const MODULE_LIST_PER_PAGE = 6;

function getListFromResponse(data) {
  const rd = data?.returnData;
  if (!rd) return [];
  const list = rd.list_of_item ?? rd;
  return Array.isArray(list) ? list : list?.data ?? rd.data ?? [];
}

function getModuleMetaFromResponse(data, perPage) {
  const rd = data?.returnData || {};
  const list = rd.list_of_item || rd;
  const meta = list?.meta || rd.meta || list || rd || data;
  const total = Number(meta.total ?? meta.totalCount ?? rd.total ?? 0) || 0;
  const per = Number(meta.per_page ?? meta.perPage ?? perPage) || perPage;
  const current = Number(meta.current_page ?? meta.currentPage ?? 1) || 1;
  const last = meta.last_page ?? meta.lastPage ?? (per > 0 ? Math.max(1, Math.ceil(total / per)) : 1);
  return { current_page: current, last_page: Math.max(1, Number(last) || 1), total, per_page: per };
}

function getAssignmentDocumentUrl(row) {
  const raw = row?.document_url ?? row?.path ?? row?.document ?? row?.document_path ?? row?.file_url;
  if (!raw || typeof raw !== 'string') return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const root = BASE_URL.replace(/\/api\/?$/, '');
  return raw.startsWith('/') ? root + raw : root + '/' + raw;
}

function getModuleInitials(m) {
  return ((m?.code || m?.name || '—').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()) || '—';
}

const MENU_LABELS = {
  home: 'Home',
  mymodule: 'MyModule',
  certification: 'Certification',
  assignment: 'Assignment',
  usermanagement: 'User Management',
  modulemanagement: 'Module Management',
  helpcentre: 'Help Centre'
};

const SECTION_ITEMS = {
  certification: [{ id: 'c-1', title: 'Pending certifications' }, { id: 'c-2', title: 'Issued certifications' }],
  helpcentre: [{ id: 'hc-1', title: 'Open tickets' }, { id: 'hc-2', title: 'Knowledge base' }]
};

const DEFAULT_SECTION_ITEMS = [{ id: 'overview', title: 'Overview' }];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [apiModules, setApiModules] = useState([]);
  const [apiModuleLoading, setApiModuleLoading] = useState(false);
  const [apiModuleError, setApiModuleError] = useState(null);
  const [apiModulePage, setApiModulePage] = useState(1);
  const [apiModuleMeta, setApiModuleMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: MODULE_LIST_PER_PAGE });
  const [myCertificates, setMyCertificates] = useState([]);
  const [myCertificatesLoading, setMyCertificatesLoading] = useState(false);
  const [myCertificatesError, setMyCertificatesError] = useState(null);
  const [myAssignments, setMyAssignments] = useState([]);
  const [myAssignmentsLoading, setMyAssignmentsLoading] = useState(false);
  const [myAssignmentsError, setMyAssignmentsError] = useState(null);
  const [enrollingModuleId, setEnrollingModuleId] = useState(null);
  const [enrollError, setEnrollError] = useState(null);

  const activeMenu = searchParams.get('menu') || 'home';
  const activeTab = searchParams.get('tab') || 'all';

  useEffect(() => {
    setUserData(getUserData());
  }, []);

  const fetchMyCertificates = useCallback(async () => {
    const user = getUserData();
    if (!user?.id) { setMyCertificates([]); return; }
    setMyCertificatesLoading(true); setMyCertificatesError(null);
    try {
      const { data } = await certificateApi.ilist({ user_id: user.id, per_page: 50, page: 1, paginate: true });
      if (data?.status === 'OK') {
        const list = getListFromResponse(data);
        setMyCertificates(list.filter((c) => Number(c.user_id) === Number(user.id)));
      } else {
        setMyCertificates([]); setMyCertificatesError(data?.errorMessage || 'Failed to load certificates.');
      }
    } catch (err) {
      setMyCertificates([]); setMyCertificatesError(err.response?.data?.errorMessage || err.message || 'Failed to load certificates.');
    } finally { setMyCertificatesLoading(false); }
  }, []);

  const fetchMyAssignments = useCallback(async () => {
    const user = getUserData();
    if (!user?.id) { setMyAssignments([]); return; }
    setMyAssignmentsLoading(true); setMyAssignmentsError(null);
    try {
      const { data } = await assignmentApi.ilist({ user_id: user.id, per_page: 50, page: 1, paginate: true });
      if (data?.status === 'OK') {
        const list = getListFromResponse(data);
        setMyAssignments(list.filter((a) => Number(a.user_id) === Number(user.id)));
      } else {
        setMyAssignments([]); setMyAssignmentsError(data?.errorMessage || 'Failed to load assignments.');
      }
    } catch (err) {
      setMyAssignments([]); setMyAssignmentsError(err.response?.data?.errorMessage || err.message || 'Failed to load assignments.');
    } finally { setMyAssignmentsLoading(false); }
  }, []);

  const fetchHomeModules = useCallback(async () => {
    const user = getUserData();
    if (!user?.id) return;
    setApiModuleLoading(true); setApiModuleError(null);
    try {
      const { data } = await moduleApi.ilist({ paginate: true, per_page: 6, page: 1, user_id: user.id });
      if (data?.status === 'OK') {
        setApiModules(getListFromResponse(data));
        setApiModuleMeta(getModuleMetaFromResponse(data, 6));
      } else {
        setApiModules([]); setApiModuleError(data?.errorMessage || 'Failed to load modules.');
      }
    } catch (err) {
      setApiModules([]); setApiModuleError(err.response?.data?.errorMessage || err.message || 'Failed to load modules.');
    } finally { setApiModuleLoading(false); }
  }, []);

  const fetchUserModules = useCallback(async (pageNum) => {
    const user = getUserData();
    if (!user?.id) return;
    setApiModuleLoading(true); setApiModuleError(null);
    try {
      const { data } = await userModuleApi.ilist({ user_id: user.id, page: pageNum, per_page: MODULE_LIST_PER_PAGE });
      if (data?.status === 'OK') {
        const raw = getListFromResponse(data);
        const normalized = raw.map((row) => ({
          id: row.module_id ?? row.module?.id ?? row.id,
          code: row.module?.code ?? row.code,
          name: row.module?.name ?? row.name,
          progress: row.progress ?? row.module?.progress ?? 0
        }));
        setApiModules(normalized);
        setApiModuleMeta(getModuleMetaFromResponse(data, MODULE_LIST_PER_PAGE));
      } else {
        setApiModules([]); setApiModuleError(data?.errorMessage || 'Failed to load my modules.');
      }
    } catch (err) {
      setApiModules([]); setApiModuleError(err.response?.data?.errorMessage || err.message || 'Failed to load my modules.');
    } finally { setApiModuleLoading(false); }
  }, []);

  useEffect(() => {
    if (activeMenu === 'mymodule') fetchUserModules(apiModulePage);
    if (activeMenu === 'home' && userData?.id) fetchHomeModules();
    if (activeMenu === 'certification' && userData?.id) fetchMyCertificates();
    if (activeMenu === 'assignment' && userData?.id) fetchMyAssignments();
  }, [activeMenu, apiModulePage, fetchUserModules, userData?.id, fetchHomeModules, fetchMyCertificates, fetchMyAssignments]);

  const setTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('menu', activeMenu); nextParams.set('tab', nextTab);
    setSearchParams(nextParams);
  };

  const handleEnroll = useCallback(async (moduleId) => {
    const user = getUserData();
    if (!user?.id) return;
    setEnrollError(null);
    setEnrollingModuleId(moduleId);
    try {
      const { data } = await userModuleApi.iformAction({ form_method: 'save', user_id: user.id, module_id: moduleId });
      if (data?.status === 'OK') {
        setSearchParams(new URLSearchParams({ menu: 'mymodule' }));
      } else {
        setEnrollError(data?.errorMessage || 'Enrollment failed.');
      }
    } catch (err) {
      setEnrollError(err.response?.data?.errorMessage || err.message || 'Enrollment failed.');
    } finally {
      setEnrollingModuleId(null);
    }
  }, [setSearchParams]);

  const title = MENU_LABELS[activeMenu] || 'Home';

  const renderBody = () => {
    if (activeMenu === 'mymodule') {
      const total = apiModuleMeta.total;
      const lastPage = Math.max(apiModuleMeta.last_page, apiModuleMeta.per_page > 0 && total > 0 ? Math.ceil(total / apiModuleMeta.per_page) : 1);
      const currentPage = apiModuleMeta.current_page;
      const from = total > 0 ? (currentPage - 1) * apiModuleMeta.per_page + 1 : 0;
      const to = Math.min(currentPage * apiModuleMeta.per_page, total);
      const filteredForTab =
        activeTab === 'active'
          ? apiModules.filter((m) => (m.progress ?? 0) < 100)
          : activeTab === 'expired'
            ? apiModules.filter((m) => (m.progress ?? 0) >= 100)
            : apiModules;
      return (
        <div className="dashboard-content">
          <div className="mymodule-course-list">
            {apiModuleError && <p className="management-error">{apiModuleError}</p>}
            {apiModuleLoading ? (
              <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>Loading modules…</p>
            ) : (
              <>
                {filteredForTab.map((module) => (
                  <div
                    key={module.id}
                    className="mymodule-course-card"
                    onClick={() => navigate(`/modules/${module.id}`)}
                  >
                    <div className="mymodule-course-main">
                      <div className="mymodule-course-logo">HM</div>
                      <div className="mymodule-course-text">
                        <div className="mymodule-course-name">
                          {module.code || module.name} &mdash; {module.name}
                        </div>
                        <div className="mymodule-course-meta">
                          <span>Documents</span>
                          <span>Videos</span>
                          <span>Quiz</span>
                        </div>
                      </div>
                    </div>
                    <div className="mymodule-course-status">
                      <span className="mymodule-status-badge start">Open</span>
                    </div>
                  </div>
                ))}
                {filteredForTab.length === 0 && !apiModuleLoading && (
                  <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>No modules found for this filter.</p>
                )}
                <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setApiModulePage} total={total} from={from} to={to} />
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeMenu === 'certification' && userData) {
      return (
        <div className="dashboard-content">
          <div className="management-table-wrap">
            <h3 className="home-modules-title">My certificates</h3>
            {myCertificatesError && <p className="management-error">{myCertificatesError}</p>}
            {myCertificatesLoading ? (
              <p className="management-empty">Loading certificates…</p>
            ) : (
              <>
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Certificate</th>
                      <th className="management-th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCertificates.map((cert) => (
                      <tr key={cert.id}>
                        <td>{cert.title || cert.name || `Certificate #${cert.id}`}{cert.created_at && <span className="certificate-date"> — {cert.created_at}</span>}</td>
                        <td className="management-td-actions">
                          {cert.path ? (<><a href={cert.path} target="_blank" rel="noopener noreferrer" className="management-btn management-btn-view">View</a><a href={cert.path} download className="management-btn management-btn-edit">Download</a></>) : <span className="management-empty">No file</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {myCertificates.length === 0 && !myCertificatesLoading && (
                  <p className="management-empty">You have no certificates yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeMenu === 'assignment' && userData) {
      return (
        <div className="dashboard-content">
          <div className="management-table-wrap">
            <h3 className="home-modules-title">My assignments</h3>
            {myAssignmentsError && <p className="management-error">{myAssignmentsError}</p>}
            {myAssignmentsLoading ? (
              <p className="management-empty">Loading assignments…</p>
            ) : (
              <>
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th className="management-th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAssignments.map((row) => {
                      const docUrl = getAssignmentDocumentUrl(row);
                      return (
                        <tr key={row.id}>
                          <td>{row.title || '—'}</td>
                          <td className="management-td-desc">{row.description || '—'}</td>
                          <td className="management-td-actions">{docUrl ? (<><a href={docUrl} target="_blank" rel="noopener noreferrer" className="management-doc-link">View</a><a href={docUrl} download className="management-btn management-btn-edit">Download</a></>) : <span className="management-empty">No document</span>}</td>
                        </tr>
                      );
                    })}           
                  </tbody>
                </table>
                {myAssignments.length === 0 && !myAssignmentsLoading && (
                  <p className="management-empty">You have no assignments.</p>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeMenu === 'modulemanagement') {
      return <ModuleManagement />;
    }

    if (activeMenu === 'usermanagement') {
      return <UserManagement />;
    }

    if (activeMenu === 'home' && userData) {
      return (
        <div className="dashboard-content">
          <div className="home-modules-section">
            {enrollError && <p className="management-error">{enrollError}</p>}
            {apiModuleLoading ? (
              <p className="management-empty">Loading modules…</p>
            ) : apiModuleError ? (
              <p className="management-error">{apiModuleError}</p>
            ) : apiModules.length === 0 ? (
              <p className="management-empty">No modules found.</p>
            ) : (
              <div className="home-module-cards">
                {apiModules.map((m) => (
                  <div key={m.id} className="home-module-card">
                    <div className="home-module-card-icon" aria-hidden>{getModuleInitials(m)}</div>
                    <div className="home-module-card-body">
                      <h4 className="home-module-card-title">{m.code ?? '—'} — {m.name ?? '—'}</h4>
                      <p className="home-module-card-types">Documents Videos Quiz</p>
                    </div>
                    <button
                      type="button"
                      className="home-module-card-open"
                      onClick={() => handleEnroll(m.id)}
                      disabled={enrollingModuleId === m.id}
                    >
                      {enrollingModuleId === m.id ? 'Enrolling…' : 'Enroll'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    const items = SECTION_ITEMS[activeMenu] || DEFAULT_SECTION_ITEMS;

    return (
      <div className="dashboard-content">
        <div className="content-cards">
          {items.map((item) => (
            <div key={item.id} className="content-card">
              <div className="card-header">
                <h3 className="card-title">{item.title}</h3>
                <span className="card-count">Info</span>
              </div>
              <p className="card-content">
                This is a placeholder block for {title}. Replace with real data later.
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardShell activeMenuId={activeMenu}>
      <div className="content-wrapper">
        <SectionHeader title={title}>
          {activeMenu === 'mymodule' && <StatusTabs value={activeTab} onChange={setTab} />}
        </SectionHeader>
        {renderBody()}
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
