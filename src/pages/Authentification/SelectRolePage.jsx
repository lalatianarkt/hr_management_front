import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function SelectRolePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Récupérer les rôles depuis le state ou sessionStorage
    const rolesFromState = location.state?.roles;
    const rolesFromStorage = sessionStorage.getItem('userRoles');
    const needsRoleSelection = sessionStorage.getItem('needsRoleSelection');
    
    if (rolesFromState) {
      setRoles(rolesFromState);
      if (location.state?.message) {
        setMessage(location.state.message);
      }
    } else if (rolesFromStorage && needsRoleSelection === 'true') {
      setRoles(JSON.parse(rolesFromStorage));
      setMessage('Veuillez choisir le rôle avec lequel vous souhaitez vous connecter');
    } else {
      // Rediriger vers login si pas de rôles
      navigate('/');
    }
  }, [location, navigate]);

  const handleRoleSelect = async (role) => {
    setLoading(true);
    setError('');
    setSelectedRoleId(role.id);
    
    try {
      const token = sessionStorage.getItem('token');
      const email = sessionStorage.getItem('email');
      
      if (!token || !email) {
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      
      // Créer la requête avec le rôle sélectionné
      const userRequest = {
        user: {
          email: email,
          password: null // Le mot de passe n'est plus nécessaire
        },
        typeUser: role.type // Le rôle choisi
      };
      
      const response = await axios.post(
        'http://localhost:8080/api/users/select-role',
        userRequest,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === 200) {
        // Mettre à jour le token et les informations
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('selectedRole', role.type);
        sessionStorage.setItem('hasMultipleRoles', 'false');
        sessionStorage.setItem('nomComplet', response.data.user?.nomComplet || '');
        sessionStorage.setItem('matricule', response.data.user?.matricule || '');
        sessionStorage.setItem('departement', response.data.infosPro?.departement?.nom || '');
        
        // Nettoyer les données temporaires
        sessionStorage.removeItem('userRoles');
        sessionStorage.removeItem('needsRoleSelection');
        
        // Rediriger vers le dashboard approprié
        window.location.href = role.path || response.data.path;
      } else {
        setError(response.data.message || 'Erreur lors de la sélection du rôle');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la sélection du rôle. Veuillez réessayer.');
      
      // Si erreur d'authentification, rediriger vers login
      if (err.response?.status === 401) {
        setTimeout(() => {
          sessionStorage.clear();
          navigate('/');
        }, 2000);
      }
    } finally {
      setLoading(false);
      setSelectedRoleId(null);
    }
  };

  const handleGoBack = () => {
    sessionStorage.removeItem('userRoles');
    sessionStorage.removeItem('needsRoleSelection');
    sessionStorage.removeItem('token');
    navigate('/');
  };

  // Fonction pour obtenir l'icône correspondant au rôle
  const getRoleIcon = (roleType) => {
    switch (roleType?.toLowerCase()) {
      case 'admin':
        return 'bi-shield-lock-fill';
      case 'manager':
        return 'bi-person-badge-fill';
      case 'it':
        return 'bi-pc-display';
      case 'rh':
        return 'bi-people-fill';
      default:
        return 'bi-person-fill';
    }
  };

  return (
    <div 
      className="select-role-container d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="card p-4 p-md-5 shadow-lg" style={{ maxWidth: '500px', width: '90%', borderRadius: '20px' }}>
        <div className="text-center mb-4">
          <div className="mb-3">
            <img
              src="/assets/img/smartdev1-removebg-preview (1).png"
              alt="SmartDev Logo"
              style={{ width: '100%', maxWidth: '180px', height: 'auto' }}
            />
          </div>
          <h3 className="mb-2">Bienvenue !</h3>
          <p className="text-muted">{message || 'Veuillez sélectionner votre rôle pour continuer'}</p>
        </div>

        {error && (
          <div className="alert alert-danger py-3 mb-4" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="roles-list">
          <p className="text-muted mb-3">Vous avez accès aux rôles suivants :</p>
          {roles.map((role, index) => (
            <button
              key={index}
              onClick={() => handleRoleSelect(role)}
              disabled={loading}
              className="btn w-100 mb-3 py-3"
              style={{
                background: selectedRoleId === role.id && loading 
                  ? '#6c757d' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {selectedRoleId === role.id && loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Chargement...
                </>
              ) : (
                <>
                  <i className={`${getRoleIcon(role.type)} me-2`}></i>
                  {role.libelle || role.type}
                </>
              )}
            </button>
          ))}
        </div>

        <div className="text-center mt-3">
          <button
            onClick={handleGoBack}
            className="btn btn-link text-decoration-none"
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Retour à la page de connexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectRolePage;