import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../../components/SidebarContext";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut,
  Dot
} from 'lucide-react';

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const [openSection, setOpenSection] = useState('employes');

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const isActive = (path) => location.pathname === path;

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

        {/* Contenu scrollable */}
        <div className="sidebar-wrapper">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

              <li className="nav-header">NAVIGATION PRINCIPALE</li>

              {/* Fiches Personnel */}
              <li className={`nav-item ${openSection === 'employes' ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('employes'); }}>
                  <i className="nav-icon bi bi-people"></i>
                  <p>
                    Personnel
                    <i className={`nav-arrow bi ${openSection === 'employes' ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSection === 'employes' ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/emp/infos/fiche-perso" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Fiche personnel</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/emp/presence/pointage" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Présence</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="#" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Document personnel</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Congés */}
              <li className={`nav-item ${openSection === 'demandes' ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('demandes'); }}>
                  <i className="nav-icon bi bi-people"></i>
                  <p>
                    Demandes
                    <i className={`nav-arrow bi ${openSection === 'demandes' ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSection === 'demandes' ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/emp/conge/demande" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Demande congé</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/emp/absence/liste/demande" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Demande absence</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Déconnexion */}
              <li className="nav-item">
                <a href="#" className="nav-link text-danger">
                  <i className="nav-icon bi bi-box-arrow-right"></i>
                  <p>Se déconnecter</p>
                </a>
              </li>

            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
