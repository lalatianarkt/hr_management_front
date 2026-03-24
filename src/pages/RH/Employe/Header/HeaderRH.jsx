import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../../../components/SidebarContext';
import AppFooter from '../../../../components/AppFooter';

const SidebarOverlay = ({ isOpen, onClose }) => (
  <div
    className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
    onClick={onClose}
  />
);

const LayoutContent = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="app-container">
      <SidebarOverlay isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <Sidebar />
      <div className={`main-content d-flex flex-column min-vh-100 ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header />
        <main className="content-wrapper flex-grow-1">
          <Outlet />
        </main>
        <AppFooter sectionLabel="Section RH" />
      </div>
    </div>
  );
};

const HeaderRH = () => (
  <LayoutContent />
);

export default HeaderRH;
