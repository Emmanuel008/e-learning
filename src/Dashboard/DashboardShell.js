import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserData, clearUserData } from './dashboardService';
import { auth } from '../api/api';
import './Dashboard.css';

const menuItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'mymodule', label: 'MyModule', icon: 'book' },
  { id: 'certification', label: 'Certification', icon: 'award' },
  { id: 'usermanagement', label: 'User Management', icon: 'users' },
  { id: 'modulemanagement', label: 'Module Management', icon: 'folder' },
  { id: 'helpcentre', label: 'Help Centre', icon: 'help-circle' }
];

const getIcon = (iconName) => {
  const icons = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    book: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    award: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </svg>
    ),
    users: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    folder: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    'help-circle': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  };
  return icons[iconName] || icons.home;
};

const DashboardShell = ({ activeMenuId = 'home', children }) => {
  const [userData, setUserData] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const data = getUserData();
    if (!data) {
      navigate('/login');
      return;
    }
    setUserData(data);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (_) {
      // Proceed to clear local state even if API call fails (e.g. token expired)
    }
    clearUserData();
    navigate('/login');
  };

  const handleMenuClick = (menuId) => {
    const currentParams = new URLSearchParams(location.search);
    const currentTab = currentParams.get('tab');

    const nextParams = new URLSearchParams();
    nextParams.set('menu', menuId);
    if (menuId === 'mymodule' && currentTab) nextParams.set('tab', currentTab);

    navigate(`/dashboard?${nextParams.toString()}`);
  };

  if (!userData) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#10b981" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="logo-text">
              <div className="logo-title">E-Learning Platform</div>
            </div>
          </div>
          <div className="user-section">
            <div className="user-profile" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <div className="user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="user-info">
                <div className="user-name">{userData.name || userData.email}</div>
              </div>
              <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeMenuId === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="nav-icon">{getIcon(item.icon)}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;

