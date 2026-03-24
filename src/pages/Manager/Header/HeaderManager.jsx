import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../../components/SidebarContext';
import AppFooter from '../../../components/AppFooter';

const LayoutContent = () => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="app-container">
      <Sidebar />
      <div className={`main-content d-flex flex-column min-vh-100 ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header />
        <main className="content-wrapper flex-grow-1">
          <Outlet />
        </main>
        <AppFooter sectionLabel="Section Manager" />
      </div>
    </div>
  );
};

const HeaderManager = () => (
  <LayoutContent />
);

export default HeaderManager;
