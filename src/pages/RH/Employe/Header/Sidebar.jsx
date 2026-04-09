import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../../../components/SidebarContext";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  ChevronRight,
  Banknote,
  Settings,
  LogOut,
  Dot,
} from 'lucide-react';

export default function Sidebar() {
  const { isSidebarOpen } = useSidebar();
  const location = useLocation();
  const [openSection, setOpenSection] = useState('listes');

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

    if (path.startsWith('/dashboard-RH/paie')) {
      setOpenSection('paie');
      return;
    }

    if (path.startsWith('/dashboard-RH/param')) {
      setOpenSection('parametrage');
      return;
    }

    if (
      path.startsWith('/dashboard-RH/employees') ||
      path.startsWith('/dashboard-RH/departements') ||
      path.startsWith('/dashboard-RH/liste/poste') ||
      path.startsWith('/dashboard-RH/managers') ||
      path.startsWith('/dashboard-RH/présence') ||
      path.startsWith('/dashboard-RH/presence') ||
      path.startsWith('/dashboard-RH/conge')
    ) {
      setOpenSection('listes');
    }
  }, [location.pathname]);

  return (
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
              <Link to="/dashboard-RH" className={`nav-link ${isActive('/dashboard-RH') ? 'active' : ''}`}>
                <LayoutDashboard size={18} className="me-2" />
                <span className="m-0 nav-label">Tableau de Bord</span>
              </Link>
            </li>

            <li className="sidebar-section-title">
              <span className="gradient-text">Ressources Humaines</span>
            </li>

            {/* Gestion Listes */}
            <li className="nav-item">
              <button
                className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'listes' ? 'section-open' : ''}`}
                onClick={() => toggleSection('listes')}
              >
                <Users size={18} className="me-2" />
                <span className="m-0 flex-grow-1 nav-label">Gestion Listes</span>
                {openSection === 'listes' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
              </button>
              {openSection === 'listes' && (
                <ul className="nav flex-column submenu">
                  <li><Link to="/dashboard-RH/employees" className={`nav-link small ${isActive('/dashboard-RH/employees') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Salariés</span></Link></li>
                  <li><Link to="/dashboard-RH/departements" className={`nav-link small ${isActive('/dashboard-RH/departements') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Départements</span></Link></li>
                  <li><Link to="/dashboard-RH/liste/poste" className={`nav-link small ${isActive('/dashboard-RH/liste/poste') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Postes</span></Link></li>
                  <li><Link to="/dashboard-RH/managers" className={`nav-link small ${isActive('/dashboard-RH/managers') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Managers</span></Link></li>
                  <li><Link to="/dashboard-RH/présence" className={`nav-link small ${isActive('/dashboard-RH/présence') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Pointages</span></Link></li>
                  <li><Link to="/dashboard-RH/conge" className={`nav-link small ${isActive('/dashboard-RH/conge') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Congés</span></Link></li>
                </ul>
              )}
            </li>

            {/* Paie & Finance */}
            <li className="nav-item">
              <button
                className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'paie' ? 'section-open' : ''}`}
                onClick={() => toggleSection('paie')}
              >
                <Banknote size={18} className="me-2" />
                <span className="m-0 flex-grow-1 nav-label">Gestion Paie & Finance</span>
                {openSection === 'paie' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
              </button>
              {openSection === 'paie' && (
                <ul className="nav flex-column submenu">
                  <li><Link to="/dashboard-RH/paie/edition" className={`nav-link small ${isActive('/dashboard-RH/paie/edition') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Edition Paie</span></Link></li>
                  <li><Link to="/dashboard-RH/paie/bulletin/departement" className={`nav-link small ${isActive('/dashboard-RH/paie/bulletin/departement') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Bulletins</span></Link></li>
                  <li><Link to="/dashboard-RH/paie/heureTravaillee" className={`nav-link small ${isActive('/dashboard-RH/paie/heureTravaillee') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Heures travaillees</span></Link></li>
                </ul>
              )}
            </li>

            <li className="sidebar-section-title">
              <span className="gradient-text">Configuration</span>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === 'parametrage' ? 'section-open' : ''}`}
                onClick={() => toggleSection('parametrage')}
              >
                <Settings size={18} className="me-2" />
                <span className="m-0 flex-grow-1 nav-label">Paramètres</span>
                {openSection === 'parametrage' ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
              </button>
              {openSection === 'parametrage' && (
                <ul className="nav flex-column submenu">
                  <li><Link to="/dashboard-RH/paramétrage/rubriques" className={`nav-link small ${isActive('/dashboard-RH/paramétrage/rubriques') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Rubriques Paie</span></Link></li>
                  <li><Link to="/dashboard-RH/paramétrage/horaire" className={`nav-link small ${isActive('/dashboard-RH/paramétrage/horaire') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Horaires</span></Link></li>
                  <li><Link to="/dashboard-RH/paramétrage/conger-irsa" className={`nav-link small ${isActive('/dashboard-RH/paramétrage/conger-irsa') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Congés & IRSA</span></Link></li>
                  <li><Link to="/dashboard-RH/paramétrage/pointage" className={`nav-link small ${isActive('/dashboard-RH/paramétrage/pointage') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Import</span></Link></li>
                  <li><Link to="/dashboard-RH/paramétrage/export" className={`nav-link small ${isActive('/dashboard-RH/paramétrage/export') ? 'active' : ''}`}><Dot size={18} className="me-1" /> <span className="nav-label">Export</span></Link></li>
                </ul>
              )}
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
  );
}
