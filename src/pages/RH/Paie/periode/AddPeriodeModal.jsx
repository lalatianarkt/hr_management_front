// components/Modals/AddPeriodePaieModal.jsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Calendar, X, CheckCircle, Save } from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance';

const AddPeriodePaieModal = ({ open, onClose, onSuccess }) => {
  // État initial du formulaire
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    statut: '1',
    idMois: '', 
    annee: new Date().getFullYear().toString() 
  });

  // États pour la gestion du formulaire
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [moisList, setMoisList] = useState([]);
  const [loadingMois, setLoadingMois] = useState(false);

  // Options de statut
  const statutOptions = [
    { value: '0', label: 'Actif' },
    { value: '1', label: 'En attente' }
  ];

  // Charger la liste des mois
  useEffect(() => {
    if (open) {
      fetchMois();
    }
  }, [open]);

  const fetchMois = async () => {
    setLoadingMois(true);
    try {
      const response = await axiosInstance.get('/api/mois');
      console.log("mois : ", response.data);
      setMoisList(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des mois:', err);
      setError('Impossible de charger la liste des mois');
    } finally {
      setLoadingMois(false);
    }
  };

  // Calcul de la durée
  const calculateDuration = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 pour inclure le jour de début
  };

  // Formatage des dates pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Mettre à jour l'année quand la date de début change
  useEffect(() => {
    if (formData.dateDebut) {
      const annee = new Date(formData.dateDebut).getFullYear();
      setFormData(prev => ({
        ...prev,
        annee: annee.toString()
      }));
    }
  }, [formData.dateDebut]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.dateDebut) {
      setError('La date de début est requise');
      return false;
    }
    
    if (!formData.dateFin) {
      setError('La date de fin est requise');
      return false;
    }
    
    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      setError('La date de fin doit être postérieure à la date de début');
      return false;
    }
    
    if (!formData.idMois) {
      setError('Veuillez sélectionner un mois');
      return false;
    }
    
    if (!formData.statut) {
      setError('Le statut est requis');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        statut: parseInt(formData.statut),
        mois: {
          id: parseInt(formData.idMois)
        },
        annee : formData.annee
      };

      console.log('📤 Envoi des données:', payload);

      const response = await axiosInstance.post('/api/periodes-paie', payload);
      
      console.log('✅ Réponse reçue:', response.data);
      
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          if (typeof data === 'string') {
            setError(data);
          } else if (data.message) {
            setError(data.message);
          } else {
            setError('Données invalides. Vérifiez votre saisie.');
          }
        } else if (status === 409) {
          setError('Une période existe déjà pour ce mois et cette année');
        } else if (status === 500) {
          setError('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          setError(`Erreur ${status}: ${data.message || 'Une erreur est survenue'}`);
        }
      } else if (err.request) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError('Erreur lors de l\'envoi de la requête.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      dateDebut: '',
      dateFin: '',
      statut: '1',
      idMois: '',
      annee: new Date().getFullYear().toString()
    });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  const duration = calculateDuration(formData.dateDebut, formData.dateFin);

  return (
    <div className="modal_perso">
      <div className="modal-dialog-custom" style={{ maxWidth: '500px', width: '95%' }}>
        <div className="modal-content-custom" style={{
          background: 'white',
          border: '1px solid #e1b2db',
          color: '#3a1438',
          borderRadius: '8px'
        }}>
          {/* Header du modal */}
          <div className="modal-header-custom" style={{
            background: 'var(--bg-gradient)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.2rem 1.5rem',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <h5 className="modal-title m-0" style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: 'white'
            }}>
              <Calendar size={20} className="me-2" />
              Nouvelle période de paie
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Fermer"
              style={{ fontSize: '0.8rem', opacity: 0.8 }}
            ></button>
          </div>

          {/* Body du modal */}
          <div className="modal-body-custom" style={{
            padding: '1.5rem',
            background: 'white'
          }}>
            {success ? (
              <div className="text-center py-4">
                <CheckCircle size={64} className="text-success mb-3" />
                <h5 className="text-success mb-2">Période ajoutée avec succès !</h5>
                <p className="text-muted">La période de paie a été créée.</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                {/* Dates de la période */}
                <div className="mb-4">
                  <label className="form-label fw-bold mb-3">Période de paie</label>
                  
                  {/* Date de début */}
                  <div className="mb-3">
                    <Form.Label className="fw-bold small">Date de début *</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      max={formData.dateFin || undefined}
                      className={formData.dateDebut && formData.dateFin && new Date(formData.dateDebut) > new Date(formData.dateFin) ? 'is-invalid' : ''}
                    />
                  </div>

                  {/* Date de fin */}
                  <div className="mb-3">
                    <Form.Label className="fw-bold small">Date de fin *</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      min={formData.dateDebut || undefined}
                      className={formData.dateDebut && formData.dateFin && new Date(formData.dateFin) < new Date(formData.dateDebut) ? 'is-invalid' : ''}
                    />
                  </div>

                  {/* Affichage de la durée si les dates sont valides */}
                  {formData.dateDebut && formData.dateFin && 
                   new Date(formData.dateFin) >= new Date(formData.dateDebut) && (
                    <div className="mt-2 p-2" style={{
                      background: '#f9f1f8',
                      borderRadius: '4px',
                      border: '1px solid #e1b2db'
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Durée de la période :</span>
                        <span className="badge" style={{
                          background: 'var(--bg-gradient)',
                          color: 'white',
                          padding: '0.5rem 1rem'
                        }}>
                          {duration} jour{duration > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                          Du {formatDate(formData.dateDebut)}
                        </small>
                        <small className="text-muted">
                          Au {formatDate(formData.dateFin)}
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mois et Année */}
                <Row className="mb-4">
                  <Col md={7}>
                    <Form.Label className="fw-bold">Mois *</Form.Label>
                    <Form.Select
                      name="idMois"
                      value={formData.idMois}
                      onChange={handleChange}
                      required
                      disabled={loading || loadingMois}
                    >
                      <option value="">Sélectionnez un mois</option>
                      {moisList.map((mois) => (
                        <option key={mois.id} value={mois.id}>
                          {mois.libelle}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingMois && (
                      <small className="text-muted">
                        <Spinner size="sm" animation="border" className="me-1" />
                        Chargement...
                      </small>
                    )}
                  </Col>
                  <Col md={5}>
                    <Form.Label className="fw-bold">Année</Form.Label>
                    <Form.Control
                      type="number"
                      name="annee"
                      value={formData.annee}
                      onChange={handleChange}
                      min="2000"
                      max="2100"
                      disabled={true} // Désactivé car calculé automatiquement
                      readOnly
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                    <Form.Text className="text-muted">
                      Calculée automatiquement
                    </Form.Text>
                  </Col>
                </Row>

                {/* Sélection du statut */}
                <div className="mb-4">
                  <Form.Label className="fw-bold">Statut *</Form.Label>
                  <Form.Select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    {statutOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Le statut détermine si la période est active ou en attente
                  </Form.Text>
                </div>

                {/* Informations importantes */}
                <Alert variant="info" className="mb-0">
                  <div className="d-flex">
                    <Calendar size={18} className="me-2 mt-1" />
                    <div>
                      <small>
                        <strong>Note :</strong> Une seule période par mois et par année.
                        Assurez-vous que les dates correspondent au mois sélectionné.
                      </small>
                    </div>
                  </div>
                </Alert>

                {/* Messages d'erreur */}
                {error && (
                  <Alert variant="danger" className="mt-3">
                    <small>{error}</small>
                  </Alert>
                )}

                {/* Footer du modal avec boutons */}
                <div className="modal-footer-custom mt-4" style={{
                  background: 'white',
                  borderTop: '1px solid #e1b2db',
                  padding: '1.2rem 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    <X size={16} className="me-2" />
                    Annuler
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || !formData.dateDebut || !formData.dateFin || !formData.idMois}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Créer la période
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPeriodePaieModal;