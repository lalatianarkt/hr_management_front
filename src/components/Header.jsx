import React from "react";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="app-header navbar navbar-expand">
      <div className="container-fluid">
        {/* Left Navbar Links */}
        <ul className="navbar-nav align-items-center">
          <li className="nav-item">
            <button
              className="btn btn-link nav-link"
              onClick={(e) => {
                e.preventDefault();
                toggleSidebar();
              }}
              style={{ padding: '0.5rem', marginRight: '1rem' }}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
          </li>
          <li className="nav-item d-none d-md-block">
            <a href="#" className="nav-link fw-semibold">Dashboard</a>
          </li>
        </ul>

        {/* Right Navbar Links */}
        <ul className="navbar-nav ms-auto align-items-center">
          {/* Notifications */}
          <li className="nav-item dropdown">
            <a className="nav-link position-relative" data-bs-toggle="dropdown" href="#">
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                15
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end shadow-lg border-0">
              <span className="dropdown-item dropdown-header fw-bold">15 Notifications</span>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item">
                <i className="bi bi-envelope me-2"></i> 4 new messages
                <span className="float-end text-muted fs-7">3 mins</span>
              </a>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item dropdown-footer text-center">See All Notifications</a>
            </div>
          </li>

          {/* User Profile */}
          <li className="nav-item dropdown user-menu ms-3">
            <a href="#" className="nav-link d-flex align-items-center" data-bs-toggle="dropdown">
              <img src="/assets/img/user2-160x160.jpg" className="user-image rounded-circle shadow-sm" alt="User" style={{ width: '32px', height: '32px' }} />
              <span className="d-none d-md-inline ms-2 fw-medium">Admin User</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
              <li className="user-header bg-primary p-4 text-center text-white rounded-top">
                <img src="/assets/img/user2-160x160.jpg" className="rounded-circle shadow mb-2" alt="User" style={{ width: '80px', height: '80px' }} />
                <p className="mb-0 fw-bold">Alexander Pierce</p>
                <small>Web Developer</small>
              </li>
              <li className="user-footer p-3 d-flex justify-content-between">
                <a href="#" className="btn btn-outline-secondary btn-sm">Profile</a>
                <a href="#" className="btn btn-danger btn-sm">Sign out</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
