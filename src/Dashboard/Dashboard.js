import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import SectionHeader from '../components/SectionHeader';
import StatusTabs from '../components/StatusTabs';

const MENU_LABELS = {
  home: 'Home',
  mymodule: 'MyModule',
  certification: 'Certification',
  usermanagement: 'User Management',
  modulemanagement: 'Module Management',
  helpcentre: 'Help Centre'
};

const SECTION_ITEMS = {
  home: [{ id: 'h-1', title: 'Welcome checklist' }, { id: 'h-2', title: 'Last month summary' }],
  certification: [{ id: 'c-1', title: 'Pending certifications' }, { id: 'c-2', title: 'Issued certifications' }],
  usermanagement: [{ id: 'u-1', title: 'New user requests' }, { id: 'u-2', title: 'All users' }],
  modulemanagement: [{ id: 'mm-1', title: 'Modules needing review' }, { id: 'mm-2', title: 'Published modules' }],
  helpcentre: [{ id: 'hc-1', title: 'Open tickets' }, { id: 'hc-2', title: 'Knowledge base' }]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeMenu = searchParams.get('menu') || 'home';
  const activeTab = searchParams.get('tab') || 'all';

  const setTab = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('menu', activeMenu);
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams);
  };

  const modules = useMemo(
    () => [
      { code: 'HMU08001', name: 'Innovation Management', status: 'Start', progress: 0, route: '/modules/hmu08001' },
      { code: 'HMU08002', name: 'Intellectual Property (IP) Management', status: 'Start', progress: 0, route: '/modules/hmu08002' },
      { code: 'HMU08003', name: 'Research Commercialization', status: 'Finished', progress: 100, route: '/modules/hmu08003' },
      { code: 'HMU08004', name: 'Fundraising and Sustainable Hub Operations', status: 'Finished', progress: 100, route: '/modules/hmu08004' }
    ],
    []
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

    const items = SECTION_ITEMS[activeMenu] || SECTION_ITEMS.home;

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
