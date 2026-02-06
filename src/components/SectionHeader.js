import React from 'react';

const SectionHeader = ({ title, children }) => {
  return (
    <div className="section-header">
      <div className="section-header-left">
        <h2 className="section-header-title">{title}</h2>
      </div>
      <div className="section-header-right">{children}</div>
    </div>
  );
};

export default SectionHeader;

