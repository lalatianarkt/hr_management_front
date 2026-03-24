import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../../../../components/SidebarContext";

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [openSections, setOpenSections] = useState({
    dashboard: true,
    employes: true,
    organisation: true,
    presence: true,
    competences: true,
    rapports: true,
    historique: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      
      <aside className={`app-sidebar bg-body-secondary shadow ${isSidebarOpen ? 'sidebar-open' : ''}`} data-bs-theme="dark">
      {/* <aside className={`app-sidebar bg-body-secondary shadow ${isSidebarOpen ? 'sidebar-open' : ''}`} data-bs-theme="dark"></aside> */}
        {/* Brand fixe en haut */}
        <div className="sidebar-brand">
          <Link to="/" className="brand-link logo-switch">
            <img
              src="/assets/img/AdminLTELogo.png"
              alt="AdminLTE Small Logo"
              className="brand-image-xl logo-xs opacity-75 shadow"
            />
            <img
              src="/assets/img/logo_smd.png"
              alt="Smartdev Solutions Large Logo"
              className="brand-image-xs logo-xl opacity-75"
            />
          </Link>
        </div>

        {/* Contenu scrollable */}
        <div className="sidebar-wrapper">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
              
              <li className="nav-header">NAVIGATION PRINCIPALE</li>

              {/* Dashboard Section */}
              <li className={`nav-item ${openSections.dashboard ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('dashboard'); }}>
                  <i className="nav-icon bi bi-speedometer"></i>
                  <p>
                    Tableau de bord
                    <i className={`nav-arrow bi ${openSections.dashboard ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.dashboard ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard/v1" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Dashboard</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Fiches Employés */}
              <li className={`nav-item ${openSections.employes ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('employes'); }}>
                  <i className="nav-icon bi bi-people"></i>
                  <p>
                    Employés
                    <i className={`nav-arrow bi ${openSections.employes ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.employes ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/employees" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Liste des employés</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/employees/add" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Nouvel employé</p>
                    </Link>
                  </li>
                  {/* <li className="nav-item">
                    <Link to="/dashboard-RH/employees/archives" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Employés archivés</p>
                    </Link>
                  </li> */}
                </ul>
              </li>

              {/* Organisation et Hiérarchie */}
              <li className={`nav-item ${openSections.organisation ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('organisation'); }}>
                  <i className="nav-icon bi bi-diagram-3"></i>
                  <p>
                    Organisation
                    <i className={`nav-arrow bi ${openSections.organisation ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.organisation ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/organisation/listManager" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Gestion Manager</p>
                    </Link>
                  </li>
                  {/* <li className="nav-item">
                    <Link to="/dashboard-RH/organisation/department" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Départements</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/organisation/postes" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Postes</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/organisation/assignEmp" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Affecter Employé</p>
                    </Link>
                  </li> */}
                  <li className="nav-item">
                    <Link to="/dashboard-RH/organisation/mouvement" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Mouvements</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/organisation/mouvement/validation" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Validation de mouvement</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/organisation/hierarchie" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Vue hiérarchique</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Suivi de présence & heures travaillées */}
              <li className={`nav-item ${openSections.presence ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('presence'); }}>
                  <i className="nav-icon bi bi-clock"></i>
                  <p>
                    Présences
                    <i className={`nav-arrow bi ${openSections.presence ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.presence ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/presence/pointage" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Pointage</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/param/edtHoraireEmploye" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Emploi du temps des employés</p>
                    </Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link to="/dashboard-RH/presence/calendrier" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Calendrier de présence</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/presence/statMensuel" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Statistique mensuel</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/presence/heure_travaillee" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Heures travaillées</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/presence/stat" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Statistique de présence</p>
                    </Link>
                  </li>  
                  <li className="nav-item">
                    <Link to="/dashboard-RH/" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Tableau de bord</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Suivi de congés */}
              <li className={`nav-item ${openSections.presence ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('presence'); }}>
                  <i className="nav-icon bi bi-clock"></i>
                  <p>
                    Congés
                    <i className={`nav-arrow bi ${openSections.presence ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.presence ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/conge/liste" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Validation des congés</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/conge/regle" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Règle de congés</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/conge/soldeAnnuel" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Clôture paie</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Tableau de bord</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Gestion des compétences & formations */}
              <li className={`nav-item ${openSections.competences ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('competences'); }}>
                  <i className="nav-icon bi bi-award"></i>
                  <p>
                    Compétences
                    <i className={`nav-arrow bi ${openSections.competences ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.competences ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/competence/comp" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Inventaire compétences</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/competence/planningFormations" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Planning formations</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/Formations/Formations" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Formations</p>
                    </Link>
                  </li>
                  {/* <li className="nav-item">
                    <Link to="/competences/certifications" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Certifications</p>
                    </Link>
                  </li> */}
                </ul>
              </li>

              {/* Rapports */}
              <li className={`nav-item ${openSections.rapports ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('rapports'); }}>
                  <i className="nav-icon bi bi-graph-up"></i>
                  <p>
                    Rapports
                    <i className={`nav-arrow bi ${openSections.rapports ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.rapports ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/rapports/generateur" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Générateur rapport</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/rapports/performances" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Performances</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/rapports/statistiques" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Statistiques RH</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/rapports/analytiques" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Analytiques</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Historique et mouvements */}
              <li className={`nav-item ${openSections.historique ? 'menu-open' : ''}`}>
                <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); toggleSection('historique'); }}>
                  <i className="nav-icon bi bi-archive"></i>
                  <p>
                    Historique
                    <i className={`nav-arrow bi ${openSections.historique ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </p>
                </a>
                <ul className="nav nav-treeview" style={{ display: openSections.historique ? 'block' : 'none' }}>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/mouvement/historique" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Historique mouvements</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/mouvement/synthese" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Vue d'ensemble mouvements</p>
                    </Link>
                  </li>
                  
                  <li className="nav-item">
                    <Link to="/dashboard-RH/mouvement/inventaire" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Inventaire mouvements</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard-RH/mouvement/archive" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Archives</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Paramètres */}
              <li className="nav-item">
                <Link to="/parametres" className="nav-link">
                  <i className="nav-icon bi bi-gear"></i>
                  <p>Paramètres</p>
                </Link>
              </li>

              {/* Déconnexion */}
              <li className="nav-item">
                <a href="#" className="nav-link text-danger">
                  <i className="nav-icon bi bi-box-arrow-right"></i>
                  <p>Se déconnecter</p>
                </a>
              </li>

              {/* Ajout d'éléments supplémentaires pour forcer le scroll */}
              <li className="nav-header">AUTRES MODULES</li>
              <li className="nav-item">
                <Link to="/paie" className="nav-link">
                  <i className="nav-icon bi bi-cash-coin"></i>
                  <p>Gestion de la paie</p>
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link to="/recrutement" className="nav-link">
                  <i className="nav-icon bi bi-person-plus"></i>
                  <p>Recrutement</p>
                </Link>
              </li> */}
              <li className="nav-item">
                <Link to="/evaluations" className="nav-link">
                  <i className="nav-icon bi bi-star"></i>
                  <p>Évaluations</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/documents" className="nav-link">
                  <i className="nav-icon bi bi-folder"></i>
                  <p>Documents</p>
                </Link>
              </li>

            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
