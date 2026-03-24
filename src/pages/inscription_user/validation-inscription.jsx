import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const ValidationInscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email');

  const [email, setEmail] = useState(emailFromQuery || '');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailField, setShowEmailField] = useState(!emailFromQuery);
  const [timer, setTimer] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Compte à rebours du token
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-remplir l'email s'il vient de l'URL
  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      setShowEmailField(false);
    }
  }, [emailFromQuery]);

  // Initialiser le timer à l'arrivée sur la page
  useEffect(() => {
    if (email && !isConfirmed) {
      // Démarre le timer avec 120 secondes (2 minutes)
      setTimer(120);
    }
  }, [email, isConfirmed]);

  // Formater le temps en minutes:secondes
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Confirmer le token
  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!email || !token) {
      setMessage('Erreur: Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.post('http://localhost:8080/api/users/confirmUser', {
        email,
        token
      });

      setMessage('Succès: Compte confirmé avec succès. Redirection vers la connexion...');
      setIsConfirmed(true);
      setTimer(0);

      // Redirection vers la page de login après 3 secondes
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message
            ? `Erreur: ${error.response.data.message}`
            : `Erreur: ${error.response.status} lors de la validation.`
        );
      } else if (error.request) {
        setMessage('Erreur: Aucune réponse du serveur. Vérifiez votre connexion.');
      } else {
        setMessage("Erreur: Échec de l'envoi de la requête.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le token
  const handleResend = async () => {
    if (!email) {
      setShowEmailField(true);
      setMessage("Erreur: Veuillez saisir votre email pour renvoyer le code.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.post(
        'http://localhost:8080/api/users/resendToken',
        null,
        {
          params: { email }
        }
      );

      setMessage("Succès: Un nouveau code vous a été envoyé par email.");
      setTimer(120); // 2 minutes

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message
            ? `Erreur: ${error.response.data.message}`
            : `Erreur: ${error.response.status} lors de l'envoi.`
        );
      } else if (error.request) {
        setMessage("Erreur: Aucune réponse du serveur. Vérifiez votre connexion.");
      } else {
        setMessage("Erreur: Échec de l'envoi du nouveau code.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
      style={{ background: 'var(--surface-bg)', minHeight: '100vh' }}>

      {/* Dynamic Background Waves (Sync with Login/Inscription) */}
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

        <div className="text-center mb-4">
          <div className="d-inline-flex mb-3">
            <img
              src="/assets/img/smartdev1-removebg-preview (1).png"
              alt="SmartDev Logo"
              style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
            />
          </div>
          <p className="text-muted small">Validation de Compte</p>
        </div>

        {/* Info Box */}
        {!message && !isConfirmed && (
          <div className="alert alert-info py-3 mb-4 small border-0 shadow-sm d-flex align-items-center" style={{ borderRadius: '15px', backgroundColor: 'rgba(97, 18, 202, 0.05)', color: 'var(--bg-primary)' }}>
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <div>Un code de confirmation a été envoyé à votre email.</div>
          </div>
        )}

        {/* Message Alert */}
        {message && (
          <div className={`alert ${message.startsWith('Succès:') ? 'alert-success' : 'alert-danger'} py-3 mb-4 small border-0 shadow-sm`} style={{ borderRadius: '15px' }}>
            {message}
          </div>
        )}

        {/* Timer Alert */}
        {timer > 0 && !isConfirmed && (
          <div className="alert py-2 mb-4 small border-0 shadow-sm d-flex align-items-center justify-content-between"
            style={{ borderRadius: '15px', backgroundColor: 'rgba(242, 133, 65, 0.1)', color: 'var(--color-orange)' }}>
            <span className="fw-bold"><i className="bi bi-clock-history me-2"></i>Code valide:</span>
            <span className="fs-5 fw-bold">{formatTime(timer)}</span>
          </div>
        )}

        <form onSubmit={handleConfirm}>
          {showEmailField && (
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
                  disabled={isConfirmed}
                  style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '15px' }}
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="form-label small fw-bold text-uppercase ms-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Code de Confirmation</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 px-3" style={{ borderRadius: '15px 0 0 15px' }}>
                <i className="bi bi-shield-lock text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 py-3 text-center fw-bold"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Code"
                required
                maxLength="40"
                disabled={isConfirmed}
                style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '20px', letterSpacing: '2px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-3 mb-3 rounded-pill" disabled={loading || isConfirmed}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            {isConfirmed ? 'Compte Confirmé' : (loading ? 'Validation...' : 'Activer mon compte')}
          </button>

          <button type="button"
            className="btn btn-outline-secondary w-100 py-2 mb-4 rounded-pill border-0 small"
            onClick={handleResend}
            disabled={loading || timer > 0 || isConfirmed}
            style={{ fontSize: '14px' }}>
            {timer > 0 ? `Renvoyer dans ${formatTime(timer)}` : 'Renvoyer le code'}
          </button>
        </form>

        <div className="text-center pt-3 border-top">
          <p className="small text-muted mb-0">
            Besoin d'aide ? <a href="/contact" className="text-decoration-none fw-bold" style={{ color: 'var(--bg-primary)' }}>Support Technique</a>
          </p>
          <a href="/" className="text-decoration-none small fw-bold mt-2 d-inline-block" style={{ color: 'var(--bg-accent)' }}>Retour à la connexion</a>
        </div>
      </div>
    </div>
  );
};

export default ValidationInscription;