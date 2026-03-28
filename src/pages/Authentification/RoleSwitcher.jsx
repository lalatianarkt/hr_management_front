// components/RoleSwitcher.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoleSwitcher() {
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedRoles = sessionStorage.getItem('userRoles');
    const storedCurrentRole = sessionStorage.getItem('currentRole');
    const hasMultipleRoles = sessionStorage.getItem('hasMultipleRoles') === 'true';
    
    if (storedRoles && hasMultipleRoles) {
      setRoles(JSON.parse(storedRoles));
      setCurrentRole(storedCurrentRole);
    }
  }, []);

  const switchRole = async (roleType) => {
    if (roleType === currentRole) {
      setShowDropdown(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = sessionStorage.getItem('token');
      const userId = sessionStorage.getItem('userId');
      
      const response = await axios.post(
        'http://localhost:8080/api/users/switch-role',
        { userId, roleType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === 200) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('currentRole', response.data.role);
        window.location.href = response.data.path;
      }
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      alert('Erreur lors du changement de rôle');
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  if (roles.length <= 1) {
    return null;
  }

  return (
    <div className="position-relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn btn-outline-light d-flex align-items-center gap-2"
        disabled={loading}
        style={{ borderRadius: '20px', padding: '6px 16px' }}
      >
        <i className="bi bi-arrow-repeat"></i>
        <span>{currentRole}</span>
        <i className="bi bi-chevron-down"></i>
      </button>
      
      {showDropdown && (
        <div 
          className="dropdown-menu show"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '8px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            zIndex: 1050
          }}
        >
          {roles.map((role, index) => (
            <button
              key={index}
              onClick={() => switchRole(role.type)}
              className="dropdown-item d-flex align-items-center gap-2"
              style={{ 
                backgroundColor: currentRole === role.type ? '#f8f9fa' : 'transparent',
                fontWeight: currentRole === role.type ? 'bold' : 'normal'
              }}
            >
              <i className={`bi ${getRoleIcon(role.type)}`}></i>
              <span>{role.libelle || role.type}</span>
              {currentRole === role.type && (
                <i className="bi bi-check ms-auto text-success"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const getRoleIcon = (roleType) => {
  switch (roleType?.toLowerCase()) {
    case 'admin':
      return 'bi-shield-lock-fill';
    case 'manager':
      return 'bi-person-badge-fill';
    case 'rh':
      return 'bi-people-fill';
    case 'it':
      return 'bi-pc-display';
    default:
      return 'bi-person-fill';
  }
};

export default RoleSwitcher;