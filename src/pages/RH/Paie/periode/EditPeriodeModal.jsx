// src/pages/RH/Paie/periodes/EditPeriodeModal.jsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Calendar, X, CheckCircle, Save, Edit } from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance';

const EditPeriodeModal = ({ open, onClose, onSuccess, periodeId }) => {
  // États
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    idMois: '',
    annee: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [moisList, setMoisList] = useState([]);
  const [loadingMois, setLoadingMois] = useState(false);
  const [periode, setPeriode] = useState(null);

  // Charger la liste des mois
  useEffect(() => {
    if (open) {
      fetchMois();
    }
  }, [open]);

  // Charger les données de la période quand le modal s'ouvre
  useEffect(() => {
    if (open && periodeId) {
      fetchPeriode();
    }
  }, [open, periodeId]);

  // Charger les données de la période
  const fetchPeriode = async () => {
    setLoadingData(true);
    setError('');
    try {
      console.log(`Chargement de la période ${periodeId}...`);
      const response = await axiosInstance.get(`/api/periodes-paie/${periodeId}`);
      const data = response.data;
      console.log('Période chargée:', data);
      setPeriode(data);
      
      // Remplir le formulaire avec les données reçues (sans le statut)
      setFormData({
        dateDebut: data.dateDebut || '',
        dateFin: data.dateFin || '',
        idMois: data.mois?.id?.toString() || '',
        annee: data.annee?.toString() || new Date().getFullYear().toString()
      });
      
    } catch (err) {
      console.error('Erreur lors du chargement de la période:', err);
      setError('Impossible de charger les données de la période');
    } finally {
      setLoadingData(false);
    }
  };

  // Charger la liste des mois
  const fetchMois = async () => {
    setLoadingMois(true);
    try {
      const response = await axiosInstance.get('/api/mois');
      console.log("Mois chargés:", response.data);
      setMoisList(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des mois:', err);
      setError('Impossible de charger la liste des mois');
    } finally {
      setLoadingMois(false);
    }
  };

  // Vérifier si la période peut être modifiée (seulement si elle est active)
  const canEdit = () => {
    return periode?.statut === 0;
  };

  // Calcul de la durée
  const calculateDuration = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
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
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Vérifier si la période est modifiable
    if (!canEdit()) {
      setError('Seules les périodes actives peuvent être modifiées');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Conserver le statut original de la période (ne pas le modifier)
      const payload = {
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        statut: periode.statut, // Garder le statut original
        mois: {
          id: parseInt(formData.idMois)
        },
        annee: parseInt(formData.annee)
      };

      console.log(`📤 Modification période ${periodeId}:`, payload);
      
      const response = await axiosInstance.put(`/api/periodes-paie/${periodeId}`, payload);
      
      console.log('✅ Période modifiée:', response.data);
      
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
        } else if (status === 404) {
          setError('Période non trouvée');
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
      idMois: '',
      annee: ''
    });
    setError('');
    setSuccess(false);
    setPeriode(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  const duration = calculateDuration(formData.dateDebut, formData.dateFin);

  // Affichage du chargement
  if (loadingData) {
    return (
      <div className="modal_perso">
        <div className="modal-dialog-custom" style={{ maxWidth: '500px', width: '95%' }}>
          <div className="modal-content-custom" style={{
            background: 'white',
            border: '1px solid #e1b2db',
            borderRadius: '8px'
          }}>
            <div className="modal-header-custom" style={{
              background: 'var(--bg-gradient)',
              padding: '1.2rem 1.5rem',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <h5 className="modal-title m-0" style={{ color: 'white' }}>
                <Edit size={20} className="me-2" />
                Modification période
              </h5>
            </div>
            <div className="modal-body-custom text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Edit size={20} className="me-2" />
              Modifier la période
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
                <h5 className="text-success mb-2">Période modifiée avec succès !</h5>
                <p className="text-muted">Les modifications ont été enregistrées.</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                {/* Message d'avertissement si période non modifiable */}
                {periode && !canEdit() && (
                  <Alert variant="warning" className="mb-3">
                    <small>
                      <strong>⚠️ Attention :</strong> Cette période n'est pas active et ne peut pas être modifiée.
                    </small>
                  </Alert>
                )}

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
                      disabled={loading || !canEdit()}
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
                      disabled={loading || !canEdit()}
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
                      disabled={loading || loadingMois || !canEdit()}
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
                      disabled={true}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                    <Form.Text className="text-muted">
                      Calculée automatiquement
                    </Form.Text>
                  </Col>
                </Row>

                {/* Informations supplémentaires (cachées) */}
                {periode && (
                  <input type="hidden" name="statut" value={periode.statut} />
                )}

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
                    disabled={loading || !canEdit() || !formData.dateDebut || !formData.dateFin || !formData.idMois}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Enregistrer
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

export default EditPeriodeModal;