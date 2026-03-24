// src/contexts/SidebarContext.jsx
import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Par défaut ouvert sur desktop

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const value = {
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
