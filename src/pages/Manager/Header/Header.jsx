// src/components/Header.jsx
import React from "react";
import { useSidebar } from "../../../components/SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  const getNomComplet = () => {
    try {
      const nomComplet = sessionStorage.getItem('nomComplet');
          
      if (!nomComplet) {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.nomComplet || "Utilisateur";
        }
      }
      
      return nomComplet || "Utilisateur";
    } catch (error) {
      console.error("Erreur lecture nom utilisateur:", error);
      return "Utilisateur";
    }
  };

  const getNomDepartement = () => {
    try {
      const departement = sessionStorage.getItem('département');
      if (!departement) {
        const departementStr = sessionStorage.getItem('département');
        if (departementStr) {
          const departement = JSON.parse(departementStr);
          return departement || "Département";
        }
      }
    } catch(error){
      console.error("Erreur lecture nom département:", error);
      return "Département";
    }
  }
  const departement = getNomDepartement();
  const nomComplet = getNomComplet();

  return (
    <nav className="app-header">
      <div className="container-fluid d-flex align-items-center justify-content-between px-0">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link nav-link p-2 me-3"
            onClick={(e) => {
              e.preventDefault();
              toggleSidebar();
            }}
            style={{ borderRadius: '12px', background: 'var(--surface-bg)' }}
          >
            <i className="bi bi-list fs-4" style={{ color: 'var(--bg-primary)' }}></i>
          </button>

          <div className="d-none d-lg-block border-start-0 ps-0 ms-0 ms-lg-3 ps-lg-3 border-lg-start">
            <h5 className="m-0 fw-bold" style={{ color: 'var(--color-heading)', fontSize: '15px' }}>Portail Manager</h5>
            <p className="m-0 small text-muted" style={{ fontSize: '10px' }}>Département {departement}</p>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <button className="btn btn-link text-muted me-2 me-sm-3">
            <i className="bi bi-bell-fill fs-5"></i>
          </button>

          <div className="d-flex align-items-center p-1 p-sm-2 rounded-pill bg-light" style={{ border: '1px solid var(--color-border)' }}>
            <img
              src="/assets/img/no_profile_pic.jpg"
              className="rounded-circle shadow-sm"
              alt="User"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
            <div className="ms-2 me-2 d-none d-md-block">
              <div className="fw-bold" style={{ fontSize: '12px', lineHeight: '1.2', color: 'var(--color-heading)' }}>Manager</div>
              <div className="text-muted" style={{ fontSize: '10px' }}>{nomComplet}</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


