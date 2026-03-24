import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [openSection, setOpenSection] = useState('hr');

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1025, backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/" className="text-decoration-none">
            <h2 className="m-0 fs-4 fw-bold text-white">RH <span style={{ color: 'var(--color-button)' }}>Manage</span></h2>
          </Link>
        </div>

        <div className="sidebar-wrapper">
          <nav>
            <ul className="nav nav-sidebar flex-column">
              <li className="px-4 py-2 small text-uppercase opacity-50 fw-bold">Gestion RH</li>

              <li className="nav-item">
                <button
                  className="nav-link w-100 bg-transparent border-0 text-start"
                  onClick={() => toggleSection('hr')}
                >
                  <i className="bi bi-people nav-icon"></i>
                  <p className="m-0 flex-grow-1">Employés</p>
                  <i className={`bi ${openSection === 'hr' ? 'bi-chevron-down' : 'bi-chevron-right'} small`}></i>
                </button>
                {openSection === 'hr' && (
                  <ul className="nav flex-column ms-3 mt-1">
                    <li className="nav-item">
                      <Link to="/dashboard-RH/employees" className="nav-link">
                        <i className="bi bi-circle small nav-icon"></i>
                        <p className="m-0">Liste Employés</p>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <button
                  className="nav-link w-100 bg-transparent border-0 text-start"
                  onClick={() => toggleSection('paie')}
                >
                  <i className="bi bi-cash-stack nav-icon"></i>
                  <p className="m-0 flex-grow-1">Paie</p>
                  <i className={`bi ${openSection === 'paie' ? 'bi-chevron-down' : 'bi-chevron-right'} small`}></i>
                </button>
                {openSection === 'paie' && (
                  <ul className="nav flex-column ms-3 mt-1">
                    <li className="nav-item">
                      <Link to="/dashboard-RH/rubriques" className="nav-link">
                        <i className="bi bi-circle small nav-icon"></i>
                        <p className="m-0">Rubriques</p>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="px-4 py-2 mt-3 small text-uppercase opacity-50 fw-bold">Administration</li>

              <li className="nav-item">
                <Link to="/dashboard-RH/settings" className="nav-link">
                  <i className="bi bi-gear nav-icon"></i>
                  <p className="m-0">Paramètres</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
