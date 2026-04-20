import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../../components/SidebarContext";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  ChevronRight,
  Banknote,
  Settings,
  LogOut,
  Dot,
} from "lucide-react";

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState("users");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const normalizePath = (path) => {
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  };

  const isActive = (path) => normalizePath(location.pathname) === normalizePath(path);
  const isActivePrefix = (path) => normalizePath(location.pathname).startsWith(normalizePath(path));

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    const path = normalizePath(location.pathname);

    if (path.startsWith("/dashboard-RH/paie")) {
      setOpenSection("rh_paie");
      return;
    }

    if (path.startsWith("/dashboard-RH/param")) {
      setOpenSection("rh_param");
      return;
    }

    if (path.startsWith("/dashboard-RH")) {
      setOpenSection("rh_listes");
      return;
    }

    if (path.startsWith("/dashboard-IT")) {
      setOpenSection("users");
    }
  }, [location.pathname]);

  return (
    <>
      {isSidebarOpen && (
        <div className="sidebar-overlay active" onClick={closeSidebar} />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-wave">
          <svg viewBox="0 0 120 28" preserveAspectRatio="none">
            <path d="M0 20 C 30 20, 30 15, 60 15 S 90 20, 120 20 V 28 H 0" fill="var(--bg-primary)" opacity="0.1" />
            <path d="M0 24 C 30 24, 30 18, 60 18 S 90 24, 120 24 V 28 H 0" fill="var(--bg-accent)" opacity="0.05" />
          </svg>
        </div>

        <div className="sidebar-brand">
          <Link to="/dashboard-IT" className="text-decoration-none d-flex align-items-center justify-content-center w-100">
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
                <span className="gradient-text">Admin IT</span>
              </li>

              <li className="nav-item">
                <Link
                  to="/dashboard-IT"
                  className={`nav-link ${isActive("/dashboard-IT") ? "active" : ""}`}
                >
                  <LayoutDashboard size={18} className="me-2" />
                  <span className="m-0 nav-label">Dashboard</span>
                </Link>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === "users" ? "section-open" : ""}`}
                  onClick={() => toggleSection("users")}
                >
                  <Users size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Gestion des utilisateurs</span>
                  {openSection === "users" ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>

                {openSection === "users" && (
                  <ul className="nav flex-column submenu">
                    <li>
                      <Link
                        to="/dashboard-IT/users"
                        className={`nav-link small ${isActivePrefix("/dashboard-IT") ? "active" : ""}`}
                      >
                        <Dot size={18} className="me-1" />
                        <span className="nav-label">Liste utilisateurs</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="sidebar-section-title">
                <span className="gradient-text">Administration</span>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === "rh_listes" ? "section-open" : ""}`}
                  onClick={() => toggleSection("rh_listes")}
                >
                  <Users size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Gestion Listes</span>
                  {openSection === "rh_listes" ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === "rh_listes" && (
                  <ul className="nav flex-column submenu">
                    <li><Link to="/dashboard-RH" className={`nav-link small ${isActive("/dashboard-RH") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Tableau de bord RH</span></Link></li>
                    <li><Link to="/dashboard-RH/employees" className={`nav-link small ${isActive("/dashboard-RH/employees") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Salaries</span></Link></li>
                    <li><Link to="/dashboard-RH/departements" className={`nav-link small ${isActive("/dashboard-RH/departements") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Departements</span></Link></li>
                    <li><Link to="/dashboard-RH/liste/poste" className={`nav-link small ${isActive("/dashboard-RH/liste/poste") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Postes</span></Link></li>
                    <li><Link to="/dashboard-RH/managers" className={`nav-link small ${isActive("/dashboard-RH/managers") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Managers</span></Link></li>
                    <li><Link to="/dashboard-RH/présence" className={`nav-link small ${isActive("/dashboard-RH/présence") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Pointages</span></Link></li>
                    <li><Link to="/dashboard-RH/conge" className={`nav-link small ${isActive("/dashboard-RH/conge") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Conges</span></Link></li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link w-100 bg-transparent border-0 text-start d-flex align-items-center ${openSection === "rh_param" ? "section-open" : ""}`}
                  onClick={() => toggleSection("rh_param")}
                >
                  <Settings size={18} className="me-2" />
                  <span className="m-0 flex-grow-1 nav-label">Configuration</span>
                  {openSection === "rh_param" ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />}
                </button>
                {openSection === "rh_param" && (
                  <ul className="nav flex-column submenu">
                    <li><Link to="/dashboard-RH/paramétrage/rubriques" className={`nav-link small ${isActive("/dashboard-RH/paramétrage/rubriques") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Rubriques Paie</span></Link></li>
                    <li><Link to="/dashboard-RH/paramétrage/horaire" className={`nav-link small ${isActive("/dashboard-RH/paramétrage/horaire") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Horaires</span></Link></li>
                    <li><Link to="/dashboard-RH/paramétrage/conger-irsa" className={`nav-link small ${isActive("/dashboard-RH/paramétrage/conger-irsa") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Conges & IRSA</span></Link></li>
                    <li><Link to="/dashboard-RH/paramétrage/pointage" className={`nav-link small ${isActive("/dashboard-RH/paramétrage/pointage") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Import</span></Link></li>
                    <li><Link to="/dashboard-RH/paramétrage/export" className={`nav-link small ${isActive("/dashboard-RH/paramétrage/export") ? "active" : ""}`}><Dot size={18} className="me-1" /> <span className="nav-label">Export</span></Link></li>
                  </ul>
                )}
              </li>

              <li className="nav-item mt-auto">
                <button type="button" className="nav-link logout-link border-0 bg-transparent w-100 text-start" onClick={handleLogout}>
                  <LogOut size={18} className="me-2" />
                  <span className="m-0 nav-label">Deconnexion</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
