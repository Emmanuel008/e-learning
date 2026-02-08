import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import SectionHeader from '../components/SectionHeader';
import StatusTabs from '../components/StatusTabs';
import ModuleManagement from './ModuleManagement';
import UserManagement from './UserManagement';
import { getUserData, getModulesForUser } from './dashboardService';

const MENU_LABELS = {
  home: 'Home',
  mymodule: 'MyModule',
  certification: 'Certification',
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

  const activeMenu = searchParams.get('menu') || 'home';
  const activeTab = searchParams.get('tab') || 'all';

  useEffect(() => {
    setUserData(getUserData());
  }, []);

  const setTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('menu', activeMenu);
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams);
  };

  const modules = useMemo(
    () => getModulesForUser(userData?.id) ?? [],
    [userData?.id]
  );

  const filteredModules = useMemo(() => {
    if (activeTab === 'active') return modules.filter((m) => m.progress < 100);
    if (activeTab === 'expired') return modules.filter((m) => m.progress >= 100);
    return modules;
  }, [activeTab, modules]);

  const title = MENU_LABELS[activeMenu] || 'Home';

  const renderBody = () => {
    if (activeMenu === 'mymodule') {
      return (
        <div className="dashboard-content">
          <div className="mymodule-course-list">
            {filteredModules.map((module) => (
              <div
                key={module.code}
                className="mymodule-course-card"
                onClick={() => navigate(module.route)}
              >
                <div className="mymodule-course-main">
                  <div className="mymodule-course-logo">HM</div>
                  <div className="mymodule-course-text">
                    <div className="mymodule-course-name">
                      {module.code} &mdash; {module.name}
                    </div>
                    <div className="mymodule-course-meta">
                      <span>4 chapters</span>
                      <span>12 videos</span>
                      <span>20 questions</span>
                    </div>
                  </div>
                </div>

                <div className="mymodule-course-status">
                  <div className="mymodule-progress">
                    <div className="mymodule-progress-bar">
                      <div
                        className="mymodule-progress-fill"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                    <span className="mymodule-progress-percent">{module.progress}%</span>
                  </div>
                  <span className={`mymodule-status-badge ${module.status.toLowerCase()}`}>
                    {module.status}
                  </span>
                </div>
              </div>
            ))}

            {filteredModules.length === 0 && (
              <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>
                No modules found for this filter.
              </p>
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
      const total = modules.length;
      const completed = modules.filter((m) => m.progress >= 100).length;
      const inProgress = modules.filter((m) => m.progress > 0 && m.progress < 100).length;
      const notStarted = total - completed - inProgress;

      return (
        <div className="dashboard-content">
          <div className="home-stats">
            <div className="home-stat-card">
              <span className="home-stat-value">{total}</span>
              <span className="home-stat-label">Total modules</span>
            </div>
            <div className="home-stat-card">
              <span className="home-stat-value">{completed}</span>
              <span className="home-stat-label">Completed</span>
            </div>
            <div className="home-stat-card">
              <span className="home-stat-value">{inProgress}</span>
              <span className="home-stat-label">In progress</span>
            </div>
            <div className="home-stat-card">
              <span className="home-stat-value">{notStarted}</span>
              <span className="home-stat-label">Not started</span>
            </div>
          </div>
          <div className="home-modules-section">
            <h3 className="home-modules-title">Your modules</h3>
            <div className="management-table-wrap">
              <table className="management-table home-modules-table">
                <thead>
                  <tr>
                    <th>Module code</th>
                    <th>Module name</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m.code}>
                      <td>{m.code}</td>
                      <td>{m.name}</td>
                      <td>
                        <span className={`mymodule-status-badge ${(m.status || '').toLowerCase()}`}>
                          {m.status || '—'}
                        </span>
                      </td>
                      <td>{m.progress ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {modules.length === 0 && (
              <p className="management-empty">No modules selected yet. Go to MyModule to see available modules.</p>
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
