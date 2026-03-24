import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../../components/SidebarContext";
import {
  User,
  Calendar,
  ChevronDown,
  ChevronRight,
  LogOut,
  Dot
} from 'lucide-react';

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const [openSection, setOpenSection] = useState('personnel');

  const normalizePath = (path) => {
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  };

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const isActive = (path) => normalizePath(location.pathname) === normalizePath(path);

  useEffect(() => {
    const path = normalizePath(location.pathname);

    if (path.startsWith('/emp/conge') || path.startsWith('/emp/absence')) {
      setOpenSection('demandes');
      return;
    }

    if (path.startsWith('/emp/infos') || path.startsWith('/emp/presence')) {
      setOpenSection('personnel');
      return;
    }

    if (path.startsWith('/emp/mouvement')) {
      setOpenSection('mouvement');
    }
  }, [location.pathname]);

  return (
    <>
      {isSidebarOpen && (
        <div className="sidebar-overlay active" onClick={closeSidebar} />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
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

              <li className="sidebar-section-title">
                <span className="gradient-text">Mon Espace</span>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'personnel' ? 'section-open' : ''}`}
                  onClick={() => toggleSection('personnel')}
                >
                  <User size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Personnel</span>
                  {openSection === 'personnel' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === 'personnel' && (
                  <ul className="nav flex-column submenu">
                    <li>
                      <Link to="/emp/infos/fiche-perso" className={`nav-link small ${isActive('/emp/infos/fiche-perso') ? 'active' : ''}`}>
                        <Dot size={18} className="me-1" /> <span className="nav-label">Fiche personnelle</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/emp/presence/pointage" className={`nav-link small ${isActive('/emp/presence/pointage') ? 'active' : ''}`}>
                        <Dot size={18} className="me-1" /> <span className="nav-label">Pointage</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="sidebar-section-title">
                <span className="gradient-text">Demandes</span>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'demandes' ? 'section-open' : ''}`}
                  onClick={() => toggleSection('demandes')}
                >
                  <Calendar size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Conges et absences</span>
                  {openSection === 'demandes' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === 'demandes' && (
                  <ul className="nav flex-column submenu">
                    <li>
                      <Link to="/emp/conge/demande" className={`nav-link small ${isActive('/emp/conge/demande') ? 'active' : ''}`}>
                        <Dot size={18} className="me-1" /> <span className="nav-label">Demande conge</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="sidebar-section-title">
                <span className="gradient-text">Mouvement</span>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'mouvement' ? 'section-open' : ''}`}
                  onClick={() => toggleSection('mouvement')}
                >
                  <Calendar size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Demande mouvement</span>
                  {openSection === 'mouvement' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === 'mouvement' && (
                  <ul className="nav flex-column submenu">
                    <li>
                      <Link to="/emp/mouvement/demande" className={`nav-link small ${isActive('/emp/mouvement/demande') ? 'active' : ''}`}>
                        <Dot size={18} className="me-1" /> <span className="nav-label">Demande mouvement</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item mt-auto">
                <Link to="/" className="nav-link logout-link">
                  <LogOut size={18} className="me-2" />
                  <span className="m-0 nav-label">Deconnexion</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
