import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Inscription = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matricule, setMatricule] = useState('');
  const [requiresAdminValidation, setRequiresAdminValidation] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validation des mots de passe
    if (password !== confirmPassword) {
      setMessage('Erreur: Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setMessage('Erreur: Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    // Structure d'objet selon votre principe
    const newUser = {
      email: email,
      password: password,
      typeUser: requiresAdminValidation ? { type: "Admin" } : null
    };


    console.log("Données envoyées au backend:", newUser);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/sendToken?matricule=${encodeURIComponent(matricule)}`,
         newUser);

      console.log("Réponse du backend:", response.data);

      if (response.data.success || response.data.message) {
        let successMessage = "Succès: Demande d'inscription envoyée. ";
        
        if (requiresAdminValidation) {
          successMessage += "Votre demande d'accès administrateur nécessite une validation supplémentaire par l'IT.";
        } else {
          successMessage += "Vérifiez votre email pour valider votre compte.";
        }
        
        setMessage(successMessage);

        // Redirection vers la page de validation pour TOUS les utilisateurs
        setTimeout(() => {
          navigate(`/inscription/validation?email=${encodeURIComponent(email)}&adminPending=${requiresAdminValidation}`);
        }, 2000);

      } else {
        setMessage('Erreur: Réponse inattendue du serveur.');
      }
    } catch (error) {
      console.error("Erreur complète:", error);

      if (error.response) {
        const errorMessage = error.response.data.message || error.response.data;
        setMessage(`Erreur: ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        setMessage('Erreur: Aucune réponse du serveur. Vérifiez votre connexion.');
      } else {
        setMessage("Erreur: Échec de l'envoi de la requête.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
      style={{ background: 'var(--surface-bg)', minHeight: '100vh' }}>

      {/* Dynamic Background Waves (Sync with Login) */}
      <div className="position-absolute w-100 h-100 top-0 left-0" style={{ zIndex: 0, opacity: 0.8 }}>
        <svg className="position-absolute bottom-0 w-100 h-25" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="var(--bg-primary)" fillOpacity="0.1" d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,133.3C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg className="position-absolute bottom-0 w-100 h-50" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)', opacity: 0.3 }}>
          <path fill="#ffffff" fillOpacity="0.2" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="login-box card p-4 p-md-5 shadow-lg position-relative"
        style={{ maxWidth: '600px', width: '95%', border: 'none', borderRadius: '30px', zIndex: 1, backgroundColor: '#ffffff' }}>

        <div className="text-center mb-4">
          <div className="d-inline-flex mb-3">
            <img
              src="/assets/img/smartdev1-removebg-preview (1).png"
              alt="SmartDev Logo"
              style={{ width: '100%', maxWidth: '180px', height: 'auto' }}
            />
          </div>
          <p className="text-muted small">Portail d'Inscription Collaborateurs</p>
        </div>

        {message && (
          <div className={`alert ${message.startsWith('Succès:') ? 'alert-success' : 'alert-danger'} py-3 mb-4 small border-0 shadow-sm`} style={{ borderRadius: '15px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12 mb-3">
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
                  style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="col-md-6 mb-3">
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
                  placeholder="••••••••"
                  required
                  style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold text-uppercase ms-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Confirmation</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 px-3" style={{ borderRadius: '15px 0 0 15px' }}>
                  <i className="bi bi-shield-check text-muted"></i>
                </span>
                <input
                  type="password"
                  className="form-control bg-light border-0 py-3"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <label className="form-label small fw-bold text-uppercase ms-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>Matricule</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 px-3" style={{ borderRadius: '15px 0 0 15px' }}>
                  <i className="bi bi-card-text text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-3"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  placeholder="MAT001"
                  required
                  style={{ boxShadow: 'none', borderRadius: '0 15px 15px 0', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* ✅ Section du checkbox pour demande d'accès admin */}
            <div className="col-md-12 mb-4">
              <div className="form-check d-flex align-items-center">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  id="requiresAdminValidation"
                  checked={requiresAdminValidation}
                  onChange={(e) => setRequiresAdminValidation(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label 
                  className="form-check-label small fw-bold" 
                  htmlFor="requiresAdminValidation"
                  style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <i className="bi bi-person-badge me-2" style={{ color: requiresAdminValidation ? 'var(--bg-primary)' : '' }}></i>
                  Demander un accès administrateur
                </label>
              </div>
              <div className="text-muted small mt-2 ms-4">
                <i className="bi bi-info-circle me-1"></i>
                {requiresAdminValidation ? (
                  <span style={{ color: 'var(--bg-primary)' }}>
                    <strong>Note importante :</strong> Vous devrez d'abord valider votre email, puis attendre la validation 
                    par l'équipe IT pour obtenir les privilèges administrateur.
                  </span>
                ) : (
                  <span>
                    Si coché, vous demandez un accès administrateur avec des privilèges étendus (gestion RH, validation des comptes, etc.).
                    Vous devrez valider votre email puis attendre l'approbation IT.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-2">
            <button
              type="button"
              className="btn btn-secondary flex-grow-1 py-3 rounded-pill"
              onClick={() => navigate('/')}
              disabled={loading}
              style={{ fontSize: '15px' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-grow-1 py-3 rounded-pill"
              disabled={loading}
              style={{ fontSize: '15px' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {loading ? 'Traitement...' : requiresAdminValidation ? 'Demander accès Admin' : 'S\'inscrire'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="small text-muted mb-0">Déjà un compte ? <a href="/" className="text-decoration-none fw-bold" style={{ color: 'var(--bg-primary)' }}>Se connecter</a></p>
          <p className="small text-muted mt-2">
            <i className="bi bi-shield-lock me-1"></i>
            Tous les comptes nécessitent une validation email. Les comptes admin requièrent une validation IT supplémentaire.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;