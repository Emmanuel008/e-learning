import React from 'react';

const DEFAULT_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'expired', label: 'Expired' }
];

const StatusTabs = ({
  value = 'all',
  onChange,
  tabs = DEFAULT_TABS,
  ariaLabel = 'Status filter'
}) => {
  return (
    <div className="status-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`status-tab ${isActive ? 'active' : ''}`}
            onClick={() => onChange?.(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default StatusTabs;

