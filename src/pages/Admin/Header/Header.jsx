import React from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../../components/SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const nomComplet = sessionStorage.getItem("nomComplet") || "Utilisateur";
  const currentRole = sessionStorage.getItem("currentRole") || "IT";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

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
            style={{ borderRadius: "12px", background: "var(--surface-bg)" }}
          >
            <i className="bi bi-list fs-4" style={{ color: "var(--bg-primary)" }}></i>
          </button>

          <div className="d-none d-lg-block border-start-0 ps-0 ms-0 ms-lg-3 ps-lg-3 border-lg-start">
            <h5 className="m-0 fw-bold" style={{ color: "var(--color-heading)", fontSize: "15px" }}>
              Administration IT
            </h5>
            <p className="m-0 small text-muted" style={{ fontSize: "10px" }}>
              Gestion et validation des comptes utilisateurs
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2">
            <i className="bi bi-pc-display me-2 text-primary"></i>
            <div className="d-none d-md-block">
              <div className="fw-bold" style={{ fontSize: "12px", lineHeight: "1.2", color: "var(--color-heading)" }}>
                {currentRole}
              </div>
              <div className="text-muted" style={{ fontSize: "10px" }}>{nomComplet}</div>
            </div>
          </div>

          <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            D&eacute;connexion
          </button>
        </div>
      </div>
    </nav>
  );
}
