import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '../../../components/SidebarContext';
import AppFooter from '../../../components/AppFooter';

const LayoutContent = () => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-bg)' }}
    >
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
        style={{ zIndex: 1040, backgroundColor: 'var(--brand-900)' }}
      >
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div
        className={`flex flex-col flex-1 transition-[margin] duration-300 ease-in-out`}
        style={{
          marginLeft: isSidebarOpen ? '16rem' : '4rem', // correspond à w-64 et w-16
        }}
      >
        <Header />
        <main className="flex-1 p-6 mt-[60px] overflow-y-auto">
          <Outlet />
        </main>
        <AppFooter sectionLabel="Section Manager" />
      </div>
    </div>
  );
};

const HeaderManager = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default HeaderManager;
