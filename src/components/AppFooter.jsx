import React from 'react';

const AppFooter = ({ sectionLabel = 'RH' }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <span className="app-footer-section">{sectionLabel}</span>
        <span className="app-footer-separator">|</span>
        <span className="app-footer-brand">@Smartdev Solutions</span>
        <span className="app-footer-separator">|</span>
        <span className="app-footer-year">{year}</span>
      </div>
    </footer>
  );
};

export default AppFooter;
