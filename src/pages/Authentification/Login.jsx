import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('employee');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer le message de l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMessage = searchParams.get('message');
    
    if (urlMessage) {
      const decodedMessage = decodeURIComponent(urlMessage);
      setMessage(decodedMessage);
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Créer l'objet UserRequest avec la structure attendue par le backend
    const userRequest = {
      user: {
        email: email,
        password: password,
        rememberMe: rememberMe
      },
      typeUser: null // Premier envoi, typeUser null
    };

    console.log('Envoi de la requête:', userRequest);

    try {
      const response = await axios.post('http://localhost:8080/api/users/auth', userRequest);
      console.log("Réponse reçue:", response.data);
      
      if (response.data.status === 200 && response.data.token) {
        // Stocker le token
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('userId', response.data.user?.id || '');
        sessionStorage.setItem('nomComplet', response.data.user?.nomComplet || '');
        sessionStorage.setItem('matricule', response.data.user?.matricule || '');
        sessionStorage.setItem('departement', response.data.infosPro?.departement?.nom || '');
        
        // Stocker les informations des rôles
        if (response.data.roles && response.data.roles.length > 0) {
          sessionStorage.setItem('userRoles', JSON.stringify(response.data.roles));
          sessionStorage.setItem('currentRole', response.data.currentRole || response.data.roles[0].type);
          sessionStorage.setItem('hasMultipleRoles', response.data.hasMultipleRoles ? 'true' : 'false');
        }
        
        // Redirection vers le path par défaut
        const redirectPath = response.data.path || '/dashboard-RH';
        console.log('Redirection vers:', redirectPath);
        window.location.href = redirectPath;
        
      } else {
        // Afficher le message d'erreur du backend
        setMessage(response.data.message || 'Erreur lors de la connexion');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse d\'erreur:', error.response?.data);
      
      // Afficher l'erreur reçue du backend
      if (error.response?.data) {
        // Si le backend a renvoyé un message d'erreur
        if (typeof error.response.data === 'object') {
          setMessage(error.response.data.message || error.response.data.error || 'Erreur lors de la connexion');
        } else if (typeof error.response.data === 'string') {
          setMessage(error.response.data);
        } else {
          setMessage('Erreur lors de la connexion. Veuillez réessayer.');
        }
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        setMessage('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        // Erreur lors de la configuration de la requête
        setMessage('Erreur lors de la préparation de la requête.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
      style={{ background: 'var(--bg-gradient-login)', minHeight: '100vh' }}>

      {/* Dynamic Background Waves */}
      <div className="position-absolute w-100 h-100 top-0 left-0" style={{ zIndex: 0, opacity: 0.8 }}>
        <svg className="position-absolute bottom-0 w-100 h-25" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="var(--bg-primary)" fillOpacity="0.1" d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,133.3C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg className="position-absolute bottom-0 w-100 h-50" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)', opacity: 0.3 }}>
          <path fill="#ffffff" fillOpacity="0.2" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="login-box card p-4 p-md-5 shadow-lg position-relative"
        style={{ maxWidth: '480px', width: '90%', border: 'none', borderRadius: '30px', zIndex: 1, backgroundColor: '#ffffff' }}>

        <div className="text-center mb-4 mb-md-5">
          <div className="d-inline-flex mb-3">
            <img
              src="/assets/img/smartdev1-removebg-preview (1).png"
              alt="SmartDev Logo"
              style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
            />
          </div>
          <p className="text-muted small">Système de Gestion des Ressources Humaines</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('Erreur') || message.includes('incorrect') || message.includes('trouvé') || message.includes('expiré') || message.includes('serveur') ? 'alert-danger' : 'alert-success'} py-3 mb-4 small border-0 shadow-sm`} 
            style={{ borderRadius: '15px' }}>
            <div className="d-flex align-items-center">
              <i className={`bi ${message.includes('Erreur') || message.includes('incorrect') || message.includes('trouvé') || message.includes('expiré') || message.includes('serveur') ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2`}></i>
              <span>{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small fw-bold text-uppercase ms-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Email Pro</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3" style={{ borderRadius: '15px 0 0 15px' }}>
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                className="form-control bg-light border-0 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@entreprise.com"
                required
                style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '15px' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-uppercase ms-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Mot de Passe</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3" style={{ borderRadius: '15px 0 0 15px' }}>
                <i className="bi bi-lock-fill text-muted"></i>
              </span>
              <input
                type="password"
                className="form-control bg-light border-0 py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '15px' }}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label className="form-check-label small text-muted" htmlFor="rememberMe" style={{ cursor: 'pointer' }}>
                Mémoriser
              </label>
            </div>
            <a href="/forgot-password" className="text-decoration-none small fw-bold" style={{ color: 'var(--bg-primary)' }}>Oublié ?</a>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-3 mb-4 rounded-pill" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            {loading ? 'Authentification...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center">
          <p className="small text-muted mb-2">
            Nouveau ici ? <a href="/inscription" className="text-decoration-none fw-bold" style={{ color: 'var(--bg-accent)' }}>Demande de compte</a>
          </p>
          <p className="small text-muted mb-0">Besoin d'aide ? <a href="/contact" className="text-decoration-none fw-bold" style={{ color: 'var(--bg-primary)' }}>Support RH</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;