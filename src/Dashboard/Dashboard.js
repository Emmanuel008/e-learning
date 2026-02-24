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

  const allowedMenuIds = React.useMemo(() => {
    const r = (userData?.role || '').toString().toLowerCase();
    const isAdmin = r === 'admin' || r === 'administrator';
    if (isAdmin) return ['home', 'usermanagement', 'modulemanagement', 'helpcentre'];
    return ['home', 'mymodule', 'certification', 'assignment', 'helpcentre'];
  }, [userData?.role]);

  useEffect(() => {
    setUserData(getUserData());
  }, []);

  useEffect(() => {
    if (!userData || allowedMenuIds.includes(activeMenu)) return;
    setSearchParams(new URLSearchParams({ menu: 'home' }));
  }, [userData, activeMenu, allowedMenuIds, setSearchParams]);

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
          name: row.module?.name ?? row.name ?? row.module_name ?? row.moduleName ?? row.module?.title ?? row.title ?? '',
          progress: row.progress ?? row.module?.progress ?? 0
        }));
        const missingNames = normalized.filter((m) => (m.id != null || m.code) && !m.name);
        if (missingNames.length > 0) {
          try {
            const { data: moduleData } = await moduleApi.ilist({ paginate: true, per_page: 100, page: 1 });
            if (moduleData?.status === 'OK') {
              const allModules = getListFromResponse(moduleData);
              const byId = {};
              const byCode = {};
              allModules.forEach((mod) => {
                const id = mod.id ?? mod.module_id;
                const code = mod.code;
                if (id != null) byId[id] = mod;
                if (code) byCode[code] = mod;
              });
              const enriched = normalized.map((m) => {
                if (m.name) return m;
                const mod = byId[m.id] ?? byCode[m.code];
                const name = mod?.name ?? mod?.title ?? '';
                return name ? { ...m, name } : m;
              });
              setApiModules(enriched);
            } else {
              setApiModules(normalized);
            }
          } catch {
            setApiModules(normalized);
          }
        } else {
          setApiModules(normalized);
        }
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
                          {module.code ?? '—'} — {module.name ?? '—'}
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
          <div className="home-modules-section">
            {myCertificatesError && <p className="management-error">{myCertificatesError}</p>}
            {myCertificatesLoading ? (
              <p className="management-empty">Loading certificates…</p>
            ) : myCertificates.length === 0 ? (
              <p className="management-empty">You have no certificates yet.</p>
            ) : (
              <div className="home-module-cards">
                {myCertificates.map((cert) => {
                  const title = cert.title || cert.name || `Certificate #${cert.id}`;
                  const initials = (title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()) || 'CT';
                  const hasFile = !!cert.path;
                  return (
                    <div key={cert.id} className="home-module-card">
                      <div className="home-module-card-icon" aria-hidden>{initials}</div>
                      <div className="home-module-card-body">
                        <h4 className="home-module-card-title">{title}</h4>
                        <p className="home-module-card-types">{cert.created_at ? cert.created_at : 'Certificate'}</p>
                      </div>
                      {hasFile ? (
                        <a href={cert.path} download className="home-module-card-open" target="_blank" rel="noopener noreferrer">Download</a>
                      ) : (
                        <span className="home-module-card-no-file">No file</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeMenu === 'assignment' && userData) {
      return (
        <div className="dashboard-content">
          <div className="home-modules-section">
            {myAssignmentsError && <p className="management-error">{myAssignmentsError}</p>}
            {myAssignmentsLoading ? (
              <p className="management-empty">Loading assignments…</p>
            ) : myAssignments.length === 0 ? (
              <p className="management-empty">You have no assignments.</p>
            ) : (
              <div className="home-module-cards">
                {myAssignments.map((row) => {
                  const docUrl = getAssignmentDocumentUrl(row);
                  const title = row.title || 'Assignment';
                  const initials = (title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()) || 'AS';
                  const hasFile = !!docUrl;
                  return (
                    <div key={row.id} className="home-module-card">
                      <div className="home-module-card-icon" aria-hidden>{initials}</div>
                      <div className="home-module-card-body">
                        <h4 className="home-module-card-title">{row.title || '—'}</h4>
                        <p className="home-module-card-types">{row.description || 'Assignment document'}</p>
                      </div>
                      {hasFile ? (
                        <a href={docUrl} download className="home-module-card-open" target="_blank" rel="noopener noreferrer">Download</a>
                      ) : (
                        <span className="home-module-card-no-file">No document</span>
                      )}
                    </div>
                  );
                })}
              </div>
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

    if (activeMenu === 'helpcentre') {
      return (
        <div className="dashboard-content">
          <div className="helpcentre-section">
            <h2 className="helpcentre-title">Help Centre</h2>
            <h3 className="helpcentre-subtitle">Get in touch</h3>
            <p className="helpcentre-intro">Need assistance? Contact our support team:</p>
            <div className="helpcentre-contact helpcentre-contact-vertical">
              <div className="helpcentre-contact-item">
                <span className="helpcentre-contact-label">Phone</span>
                <a href="tel:+255625313162" className="helpcentre-contact-value">+255684991881</a>
              </div>
              <div className="helpcentre-contact-item">
                <span className="helpcentre-contact-label">Email</span>
                <a href="mailto:info@bunihub.or.tz" className="helpcentre-contact-value">info@bunihub.or.tz</a>
              </div>
            </div>
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
