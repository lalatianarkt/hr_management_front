import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { Lock, Calendar, Clock, CheckSquare, AlertTriangle } from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance'; 

const ClotureModal = ({
  show,  
  onHide,  
  onClotureSuccess
}) => {
  // États
  const [periodeActive, setPeriodeActive] = useState(null);
  const [loadingPeriode, setLoadingPeriode] = useState(false);
  const [messageCloture, setMessageCloture] = useState('');
  const [loadingCloture, setLoadingCloture] = useState(false);
  const [error, setError] = useState('');

  // ============ FONCTIONS ============

  // Charger la période active
  const chargerPeriodeActive = async () => {
    try {
      setLoadingPeriode(true);
      setError('');
      setMessageCloture('');

      const response = await axiosInstance.get('/api/periodes-paie/actif');

      if (response.data) {
        setPeriodeActive(response.data);

        if (response.data.statut === 1) {
          setMessageCloture(
            <Alert variant="warning" className="mb-0">
              <AlertTriangle className="me-2" />
              <strong>Période déjà clôturée</strong>
            </Alert>
          );
        } else {
          setMessageCloture(
            <Alert variant="info" className="mb-0">
              <Clock className="me-2" />
              <strong>Période prête pour clôture</strong>
            </Alert>
          );
        }
      } else {
        setMessageCloture(
          <Alert variant="danger" className="mb-0">
            <AlertTriangle className="me-2" />
            <strong>Aucune période active trouvée</strong>
          </Alert>
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la période:', error);

      if (error.response?.status === 404) {
        setMessageCloture(
          <Alert variant="warning" className="mb-0">
            <AlertTriangle className="me-2" />
            <strong>Aucune période active</strong> - Créez une période de paie d'abord.
          </Alert>
        );
      } else {
        setError('Erreur lors du chargement de la période');
      }
    } finally {
      setLoadingPeriode(false);
    }
  };

  // Effectuer la clôture
  const effectuerCloture = async () => {
    if (!periodeActive || periodeActive.statut === 1) {
      alert('Impossible de clôturer cette période');
      return;
    }

    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir clôturer la période ${periodeActive.id} ?\n` +
      `Cette action est irréversible.`
    );

    if (!confirmation) return;

    try {
      setLoadingCloture(true);

      const aujourdhui = new Date();
      const annee = aujourdhui.getFullYear();
      const mois = String(aujourdhui.getMonth() + 1).padStart(2, '0');
      const jour = String(aujourdhui.getDate()).padStart(2, '0');
      const dateCloture = `${annee}-${mois}-${jour}`; // Format: 2025-03-21
      
      // Préparer l'objet complet avec la date de clôture
      const periodeACloturer = {
        ...periodeActive,
        statut: 1,
        dateCloture: dateCloture // Format YYYY-MM-DD pour LocalDate
      };

      const response = await axiosInstance.put(
        `/api/periodes-paie/cloture/${periodeActive.id}`,
        periodeACloturer,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setPeriodeActive({ ...periodeActive, statut: 1 });

        setMessageCloture(
          <Alert variant="success" className="mb-0">
            Période clôturée avec succès !
          </Alert>
        );

        if (onClotureSuccess) {
          onClotureSuccess(periodeActive.id);
        }

        setTimeout(() => {
          onHide();
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingCloture(false);
    }
  };

  // Formater la date
  const formaterDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calculer la durée
  const calculateDuration = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    try {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const diffTime = Math.abs(fin - debut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    } catch (e) {
      return 0;
    }
  };

  // Charger la période quand le modal s'ouvre
  useEffect(() => {
    if (show) {
      chargerPeriodeActive();
    } else {
      // Réinitialiser les états quand le modal se ferme
      setPeriodeActive(null);
      setMessageCloture('');
      setError('');
    }
  }, [show]);

  // Si le modal n'est pas visible, ne rien afficher
  if (!show) return null;

  return (
    <div className="modal_perso">
      <div className="modal-dialog-custom">
        <div className="modal-content-custom">
          {/* En-tête du modal */}
          <div className="modal-header-custom" style={{ background: 'var(--bg-gradient)', color: 'white', borderBottom: 'none' }}>
            <h5 className="modal-title m-0 d-flex align-items-center gap-2 text-white">
              <Lock size={20} />
              Clôture Mensuelle
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onHide}
              aria-label="Fermer"
            ></button>
          </div>

          {/* Corps du modal */}
          <div className="modal-body-custom">
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {loadingPeriode ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3">Recherche de la période active...</p>
              </div>
            ) : (
              <>
                {/* Message d'état */}
                {messageCloture}

                {/* Affichage de la période active */}
                {periodeActive && (
                  <Card className="mt-3 border-primary">
                    <Card.Body>
                      <Card.Title className="d-flex align-items-center gap-2 text-primary">
                        <Calendar size={18} />
                        Période Active
                      </Card.Title>

                      <Row className="mt-3">
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Statut</label>
                            <div>
                              {periodeActive.statut === 0 ? (
                                <Badge bg="warning" className="px-3 py-2">
                                  <Clock className="me-1" size={14} />
                                  En cours
                                </Badge>
                              ) : (
                                <Badge bg="success" className="px-3 py-2">
                                  <CheckSquare className="me-1" size={14} />
                                  Clôturée
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Date de début</label>
                            <div className="form-control bg-light">
                              {formaterDate(periodeActive.dateDebut)}
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-bold">Date de fin</label>
                            <div className="form-control bg-light">
                              {formaterDate(periodeActive.dateFin)}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* Informations supplémentaires */}
                      <div className="mt-3">
                        <label className="form-label fw-bold">Durée de la période</label>
                        <div className="alert alert-info mb-0">
                          <div className="d-flex justify-content-between flex-wrap gap-2">
                            <span>
                              <strong>Du:</strong> {formaterDate(periodeActive.dateDebut)}
                            </span>
                            <span>
                              <strong>Au:</strong> {formaterDate(periodeActive.dateFin)}
                            </span>
                            <span>
                              <strong>Durée:</strong> {calculateDuration(periodeActive.dateDebut, periodeActive.dateFin)} jours
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Avertissement pour la clôture */}
                {periodeActive && periodeActive.statut === 0 && (
                  <Alert variant="warning" className="mt-3">
                    <AlertTriangle className="me-2" />
                    <strong>Attention !</strong> La clôture est une action irréversible.
                  </Alert>
                )}
              </>
            )}
          </div>

          {/* Pied du modal */}
          <div className="modal-footer-custom">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
              disabled={loadingCloture}
            >
              Annuler
            </button>

            {periodeActive && periodeActive.statut === 0 && (
              <button
                type="button"
                className="btn btn-warning d-flex align-items-center gap-2"
                onClick={effectuerCloture}
                disabled={loadingCloture}
              >
                {loadingCloture ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Clôture en cours...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Effectuer la clôture
                  </>
                )}
              </button>
            )}

            {periodeActive && periodeActive.statut === 1 && (
              <button
                type="button"
                className="btn btn-success"
                disabled
              >
                <CheckSquare className="me-2" size={16} />
                Période déjà clôturée
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClotureModal;
