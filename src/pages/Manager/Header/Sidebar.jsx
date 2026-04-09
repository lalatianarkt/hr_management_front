import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../../../components/SidebarContext";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  ChevronRight,
  Clock,
  Network,
  LogOut,
  Dot
} from 'lucide-react';

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [openSection, setOpenSection] = useState('dashboard');

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay active" onClick={closeSidebar} />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Decorative Waves (Brand Colored) */}
        <div className="sidebar-wave">
          <svg viewBox="0 0 120 28" preserveAspectRatio="none">
            <path d="M0 20 C 30 20, 30 15, 60 15 S 90 20, 120 20 V 28 H 0" fill="var(--bg-primary)" opacity="0.1" />
            <path d="M0 24 C 30 24, 30 18, 60 18 S 90 24, 120 24 V 28 H 0" fill="var(--bg-accent)" opacity="0.05" />
          </svg>
        </div>

        <div className="sidebar-brand">
          <Link to="/" className="text-decoration-none d-flex align-items-center justify-content-center w-100">
            <img
              src="/assets/img/smartdev1-removebg-preview (1).png"
              alt="Logo"
              className="sidebar-logo"
            />
          </Link>
        </div>

        <div className="sidebar-wrapper">
          <nav>
            <ul className="nav nav-sidebar flex-column">

              <li className="nav-item">
                <Link to="/dashboard-Manager" className={`nav-link ${openSection === 'dashboard' ? 'active' : ''}`}>
                  <LayoutDashboard size={18} className="me-2" />
                  <span className="m-0 nav-label">Tableau de bord</span>
                </Link>
              </li>

              <li className="sidebar-section-title">
                <span className="gradient-text">Gestion</span>
              </li>

              {/* Fiches Employés */}
              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'employes' ? 'section-open' : ''}`}
                  onClick={() => toggleSection('employes')}
                >
                  <Users size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Employés</span>
                  {openSection === 'employes' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === 'employes' && (
                  <ul className="nav flex-column submenu">
                    <li><Link to="/dashboard-Manager/emp/liste" className="nav-link small"><Dot size={18} className="me-1" /> <span className="nav-label">Liste des employés</span></Link></li>
                  </ul>
                )}
              </li>

              {/* Suivi de présence */}
              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'presence' ? 'section-open' : ''}`}
                  onClick={() => toggleSection('presence')}
                >
                  <Clock size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Congé</span>
                  {openSection === 'presence' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === 'presence' && (
                  <ul className="nav flex-column submenu">
                    <li><Link to="/dashboard-Manager/conge/validation" className="nav-link small"><Dot size={18} className="me-1" /> <span className="nav-label">Validation des congés</span></Link></li>
                  </ul>
                )}
              </li>

              {/* Suivi de mouvements */}
              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'mouvements' ? 'section-open' : ''}`}
                  onClick={() => toggleSection('mouvements')}
                >
                  <Clock size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Mouvements</span>
                  {openSection === 'mouvements' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === 'mouvements' && (
                  <ul className="nav flex-column submenu">
                    <li><Link to="/dashboard-Manager/mouvements/validation" className="nav-link small"><Dot size={18} className="me-1" /> <span className="nav-label">Validation des mouvements</span></Link></li>
                  </ul>
                )}
              </li>


              <li className="nav-item">
                <Link to="/dashboard-Manager/organisation/hierarchie" className="nav-link">
                  <Network size={18} className="me-2" />
                  <span className="m-0 nav-label">Vue hiérarchique</span>
                </Link>
              </li>

              <li className="nav-item mt-auto">
                <Link to="/" className="nav-link logout-link">
                  <LogOut size={18} className="me-2" />
                  <span className="m-0 nav-label">Déconnexion</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
