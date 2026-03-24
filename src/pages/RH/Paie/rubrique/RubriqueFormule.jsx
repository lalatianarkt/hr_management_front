// src/pages/RH/Paie/RubriqueFormuleModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Spinner,
  Alert,
  Card,
  Badge,
  Button,
  Form,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import {
  Percent,
  Save,
  X,
  XCircle,
  AlertCircle,
  CheckCircle
} from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance'; // Importer axiosInstance

function RubriqueFormuleModal({ show, onHide, rubriqueId, employeId }) {
  const [rubrique, setRubrique] = useState(null);
  const [paie, setPaie] = useState(null);
  const [paieFille, setPaieFille] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // États pour les notifications Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('danger');
  const [toastTitle, setToastTitle] = useState('');

  // États pour les valeurs modifiables
  const [formValues, setFormValues] = useState({
    nombre: '',
    taux: '',
    base: '',
    montant: ''
  });

  // États pour gérer les champs disabled
  const [disabledFields, setDisabledFields] = useState({
    nombre: false,
    taux: false,
    base: false,
    montant: false
  });

  const showNotification = (title, message, variant = 'danger') => {
    setToastTitle(title);
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  // Fonction pour déterminer quels champs doivent être désactivés
  const determineDisabledFields = (rubriqueData) => {
    const formule = rubriqueData?.formule;
    const modeCalcul = rubriqueData?.modeCalcul;

    if (!formule) {
      return {
        nombre: true,
        taux: true,
        base: true,
        montant: false
      };
    }

    const hasBase = formule.base && formule.base !== 'FIXE';
    const hasTaux = formule.taux;
    const hasNombre = formule.nombre !== null && formule.nombre !== undefined;

    let newDisabled = {
      nombre: false,
      taux: false,
      base: false,
      montant: false
    };

    console.log("Analyse formule:", {
      hasBase, hasTaux, hasNombre,
      nombreValue: formule.nombre,
      modeCalcul
    });

    // CAS 1: Formule avec nombre (même = 1) * taux * base
    if (hasBase && hasTaux && hasNombre) {
      console.log("Formule: NOMBRE × TAUX × BASE");
      if (modeCalcul === 'AUTO' || modeCalcul === 'CALCULE') {
        newDisabled = {
          nombre: false,
          taux: true,
          base: true,
          montant: true
        };
      } else {
        newDisabled = {
          nombre: false,
          taux: false,
          base: false,
          montant: false
        };
      }
    }
    // CAS 2: Formule taux * base seulement
    else if (hasBase && hasTaux && !hasNombre) {
      console.log("Formule: TAUX × BASE (sans nombre)");
      if (modeCalcul === 'AUTO') {
        newDisabled = {
          nombre: true,
          taux: true,
          base: true,
          montant: true
        };
      } else {
        newDisabled = {
          nombre: true,
          taux: false,
          base: false,
          montant: false
        };
      }
    }
    // CAS 3: Formule avec nombre * base
    else if (hasBase && !hasTaux && hasNombre) {
      console.log("Formule: NOMBRE × BASE");
      if (modeCalcul === 'AUTO') {
        newDisabled = {
          nombre: false,
          taux: true,
          base: true,
          montant: true
        };
      } else {
        newDisabled = {
          nombre: false,
          taux: true,
          base: false,
          montant: false
        };
      }
    }
    // CAS 4: Formule base seulement
    else if (hasBase && !hasTaux && !hasNombre) {
      console.log("Formule: BASE SEULE");
      if (modeCalcul === 'AUTO') {
        newDisabled = {
          nombre: true,
          taux: true,
          base: true,
          montant: true
        };
      } else if (modeCalcul === 'MANUEL') {
        newDisabled = {
          nombre: true,
          taux: true,
          base: true,
          montant: false
        };
      } else {
        newDisabled = {
          nombre: true,
          taux: true,
          base: false,
          montant: true
        };
      }
    }
    // CAS 5: Formule taux seulement
    else if (!hasBase && hasTaux && !hasNombre) {
      console.log("Formule: TAUX SEUL");
      if (modeCalcul === 'AUTO') {
        newDisabled = {
          nombre: true,
          taux: true,
          base: false,
          montant: true
        };
      } else {
        newDisabled = {
          nombre: true,
          taux: false,
          base: false,
          montant: false
        };
      }
    }
    // CAS 6: Formule fixe
    else if (formule.base === 'FIXE') {
      console.log("Formule: MONTANT FIXE");
      if (modeCalcul === 'AUTO') {
        newDisabled = {
          nombre: true,
          taux: true,
          base: true,
          montant: true
        };
      } else {
        newDisabled = {
          nombre: false,
          taux: true,
          base: true,
          montant: false
        };
      }
    }

    console.log("Champs désactivés résultants:", newDisabled);
    return newDisabled;
  };

  // Charger toutes les données nécessaires
  useEffect(() => {
    if (show && rubriqueId && employeId) {
      fetchAllData();
    } else {
      resetStates();
    }
  }, [show, rubriqueId, employeId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log("rubrique_id : ", rubriqueId);
      console.log("employe_id : ", employeId);

      // 1. Charger la rubrique avec axiosInstance
      const rubriqueResponse = await axiosInstance.get(`/api/rubriques-paie/${rubriqueId}`);
      const rubriqueData = rubriqueResponse.data;
      console.log("azo ato ilay rubrique : ", rubriqueData);
      console.log("Mode calcul:", rubriqueData.modeCalcul);
      console.log("Formule:", rubriqueData.formule);

      setRubrique(rubriqueData);

      // Déterminer quels champs doivent être désactivés
      const disabled = determineDisabledFields(rubriqueData);
      setDisabledFields(disabled);

      // 2. Charger la dernière paie non clôturée
      try {
        const paieResponse = await axiosInstance.get(`/api/paies/employe/${employeId}/derniere-non-cloturee`);
        console.log("paie resp : ", paieResponse.data);

        if (paieResponse.data) {
          const paieData = paieResponse.data;
          setPaie(paieData);

          // 3. Charger la paieFille correspondante
          try {
            const paieFilleResponse = await axiosInstance.get(
              `/api/paie-fille/paie/${paieData.id}/rubrique/${rubriqueId}`
            );
            if (paieFilleResponse.data) {
              const paieFilleData = paieFilleResponse.data;
              setPaieFille(paieFilleData);

              // Remplir le formulaire avec les valeurs existantes
              setFormValues({
                nombre: paieFilleData.nombre || '',
                taux: paieFilleData.taux || '',
                base: paieFilleData.base || '',
                montant: paieFilleData.montantFixe || ''
              });
            } else {
              initializeDefaultValues(rubriqueData);
            }
          } catch (paieFilleError) {
            if (paieFilleError.response?.status === 404) {
              // Pas de paieFille existante, normal
              initializeDefaultValues(rubriqueData);
            } else {
              console.error('Erreur paieFille:', paieFilleError);
              initializeDefaultValues(rubriqueData);
            }
          }
        } else {
          setError('Aucune paie non clôturée trouvée pour cet employé.');
        }
      } catch (paieError) {
        if (paieError.response && paieError.response.status === 404) {
          setError('Aucune paie trouvée pour cet employé. Veuillez générer une paie.');
        } else {
          setError('Erreur lors du chargement de la paie');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      if (error.response && error.response.status === 404) {
        setError('Rubrique non trouvée');
      } else {
        setError('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultValues = (rubriqueData) => {
    if (rubriqueData?.formule) {
      const formule = rubriqueData.formule;
      setFormValues({
        nombre: formule.nombre || 1,
        taux: formule.taux || '',
        base: formule.base || '',
        montant: formule.montantFixe || ''
      });
    }
  };

  const resetStates = () => {
    setRubrique(null);
    setPaie(null);
    setPaieFille(null);
    setFormValues({
      nombre: '',
      taux: '',
      base: '',
      montant: ''
    });
    setDisabledFields({
      nombre: false,
      taux: false,
      base: false,
      montant: false
    });
    setLoading(true);
    setError('');
  };

  const handleBackendError = (error) => {
    console.error('Erreur backend:', error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          if (data.includes("déja été ajouté")) {
            showNotification('Rubrique existante', data, 'warning');
          } else if (data.includes("par ordre")) {
            showNotification('Erreur de saisie', data, 'warning');
          } else if (data.includes("obligatoire")) {
            showNotification('Champs manquants', data, 'warning');
          } else {
            showNotification('Erreur de validation', data, 'danger');
          }
          break;

        case 404:
          showNotification('Non trouvé', 'La ressource demandée n\'existe pas', 'warning');
          break;

        case 409:
          showNotification('Conflit', 'Cette rubrique existe déjà dans cette paie', 'warning');
          break;

        case 500:
          showNotification('Erreur serveur', 'Une erreur technique est survenue.', 'danger');
          break;

        default:
          showNotification('Erreur', data || 'Une erreur est survenue', 'danger');
      }
    } else if (error.request) {
      showNotification('Connexion échouée', 'Impossible de se connecter au serveur.', 'danger');
    } else {
      showNotification('Erreur', error.message || 'Une erreur est survenue', 'danger');
    }
  };

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!paie) {
      showNotification('Paie manquante', 'Aucune paie disponible pour sauvegarder.', 'warning');
      return;
    }

    try {
      setSaving(true);

      const paieFilleData = {
        employe: { id: employeId },
        nombre: formValues.nombre ? parseFloat(formValues.nombre) : null,
        taux: formValues.taux ? parseFloat(formValues.taux) : null,
        base: formValues.base ? parseFloat(formValues.base) : null,
        montant: formValues.montant ? parseFloat(formValues.montant) : null,
        paie: { id: paie.id },
        rubrique: { id: rubriqueId }
      };

      let response;
      if (paieFille) {
        console.log("update ++");
        response = await axiosInstance.put(
          `/api/paie-fille/${paieFille.id}`,
          paieFilleData
        );
      } else {
        console.log("insert+++");
        console.log("data send : ", paieFilleData);
        response = await axiosInstance.post(
          `/api/paie-fille`,
          paieFilleData
        );
      }

      if (response.data) {
        setPaieFille(response.data);
        showNotification('Succès', 'Données sauvegardées avec succès', 'success');
      }
    } catch (error) {
      handleBackendError(error);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour déterminer le placeholder selon le type de formule
  const getPlaceholder = (field, rubriqueData) => {
    const formule = rubriqueData?.formule;
    if (!formule) {
      return '';
    }

    switch (field) {
      case 'nombre':
        if (formule.nombre && formule.nombre !== 1) {
          return "";
        }
        return "";

      case 'taux':
        if (formule.taux) {
          return formule.taux.toString();
        }
        return "";

      case 'base':
        if (formule.base && formule.base !== 'FIXE') {
          return formule.base;
        }
        return "";

      case 'montant':
        if (formule.montant) {
          return formule.montant.toString();
        }
        return "";

      default:
        return '';
    }
  };

  // Fonction pour déterminer le type de formule
  const getFormuleType = (formule) => {
    if (!formule) return 'AUCUNE FORMULE';

    const hasBase = formule.base && formule.base !== 'FIXE';
    const hasTaux = formule.taux;
    const hasNombre = formule.nombre !== null && formule.nombre !== undefined;

    if (formule.base === 'FIXE') {
      return 'MONTANT FIXE';
    }

    if (hasBase && hasTaux && hasNombre) {
      return `NOMBRE × TAUX × BASE`;
    }
    else if (hasBase && hasTaux && !hasNombre) {
      return `TAUX × BASE`;
    }
    else if (hasBase && !hasTaux && hasNombre) {
      return `NOMBRE × BASE`;
    }
    else if (hasBase && !hasTaux && !hasNombre) {
      return `BASE`;
    }
    else if (!hasBase && hasTaux && !hasNombre) {
      return `TAUX`;
    }
    else if (!hasBase && hasTaux && hasNombre) {
      return `NOMBRE × TAUX`;
    }

    return 'FORMULE INCONNUE';
  };

  if (!show) return null;

  return (
    <>
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header className={`bg-${toastVariant} text-white`}>
            <strong className="me-auto">
              {toastTitle}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="modal_perso">
        <div className="modal-dialog-custom" style={{ maxWidth: '900px', width: '95%' }}>
          <div className="modal-content-custom" style={{
            background: 'white',
            border: '1px solid #e1b2db',
            color: '#3a1438'
          }}>
            {/* Header du modal */}
            <div className="modal-header d-flex justify-content-between align-items-center" style={{
              background: 'var(--bg-gradient)',
              borderBottom: 'none',
              padding: '1.25rem 1.5rem'
            }}>
              <h5 className="modal-title m-0" style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-heading)'
              }}>
                <Percent size={18} className="me-2 text-white" />
                <span className="text-white">Édition des valeurs</span>
                {rubrique && (
                  <span className="ms-2 fw-bold text-white" style={{ fontSize: '1.1rem' }}>
                    {rubrique.code} - {rubrique.libelle}
                  </span>
                )}
              </h5>
              <button
                type="button"
                className="btn-custom-close"
                onClick={onHide}
                aria-label="Fermer"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <X size={20} fontWeight="bold" />
              </button>
            </div>

            {/* Body du modal */}
            <div className="modal-body-custom" style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              padding: '1rem',
              background: 'white'
            }}>
              {error && (
                <Alert variant="warning" dismissible onClose={() => setError('')} className="mb-3 border-0 shadow-sm" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                  <AlertCircle size={18} className="me-2" />
                  {error}
                </Alert>
              )}

              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
                  <Spinner animation="border" size="sm" />
                  <span className="ms-3" style={{ fontSize: '0.875rem', color: '#5c2458' }}>
                    Chargement des données...
                  </span>
                </div>
              ) : (
                <>
                  {/* Informations de contexte */}
                  <Card className="mb-4 border-0 shadow-lg" style={{ background: 'var(--bg-gradient)', borderRadius: '16px' }}>
                    <Card.Body className="p-4">
                      <div className="row g-4">
                        <div className="col-md-7">
                          <div className="mb-0">
                            <label className="form-label text-uppercase mb-2 d-block" style={{
                              color: '#ffffff',
                              letterSpacing: '1.2px',
                              fontSize: '0.85rem',
                              fontWeight: '800',
                              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              opacity: 0.95
                            }}>
                              Rubrique de Paie
                            </label>
                            <div className="d-flex align-items-center mb-2">
                              <h4 className="mb-0 me-3 fw-extrabold text-white">{rubrique?.code || '-'}</h4>
                              <div className="d-flex gap-2">
                                {rubrique?.type && (
                                  <Badge bg="white" className="px-3 py-2 text-primary">
                                    {rubrique.type.libelle}
                                  </Badge>
                                )}
                                {rubrique?.modeCalcul && (
                                  <Badge
                                    bg="light"
                                    className="px-3 py-2 text-dark"
                                    style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.5)', fontWeight: 'bold' }}
                                  >
                                    {rubrique.modeCalcul}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="fs-5 fw-extrabold text-white">{rubrique?.libelle}</div>
                            <div className="mt-3 p-2 px-3 rounded-pill d-inline-flex align-items-center" style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <span className="small text-white me-2" style={{ fontWeight: '500' }}>Type de formule: </span>
                              <span className="small fw-extrabold text-white">
                                {getFormuleType(rubrique?.formule)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-5 border-start ps-md-4" style={{ borderColor: 'rgba(255, 255, 255, 0.2) !important' }}>
                          <div className="mb-0">
                            <label className="form-label text-uppercase mb-2 d-block" style={{
                              color: '#ffffff',
                              letterSpacing: '1.2px',
                              fontSize: '0.85rem',
                              fontWeight: '800',
                              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              opacity: 0.95
                            }}>
                              Période de Paie
                            </label>
                            <div className="mt-2">
                              {paie ? (
                                <>
                                  <div className="fs-5 fw-extrabold text-white">
                                    {paie.dateDebutPeriode ? new Date(paie.dateDebutPeriode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Période inconnue'}
                                  </div>
                                  <div className="small text-white mb-0" style={{ fontWeight: '600' }}>
                                    Du {paie.dateDebutPeriode ? new Date(paie.dateDebutPeriode).toLocaleDateString() : '...'} au {paie.dateFinPeriode ? new Date(paie.dateFinPeriode).toLocaleDateString() : '...'}
                                  </div>
                                  <div className="mt-2 text-white small fw-bold d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
                                    <CheckCircle size={14} className="me-1" /> Statut: {paie.statutCloture === 0 ? 'En cours' : 'Clôturée'}
                                  </div>
                                </>
                              ) : (
                                <div className="text-warning small fw-bold py-2">
                                  <AlertCircle size={16} className="me-2" />
                                  Aucune paie non clôturée
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Section des valeurs à modifier */}
                  <div className="mb-4">
                    <h6 className="mb-3" style={{ fontSize: '0.9rem', color: '#3a1438' }}>
                      Valeurs à enregistrer pour cette rubrique
                    </h6>

                    <div className="table-responsive">
                      <Table bordered className="mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        <thead className="bg-light text-uppercase small fw-bold" style={{ letterSpacing: '1px' }}>
                          <tr>
                            <th style={{ width: '24%' }} className="py-3 px-3">Détails</th>
                            <th style={{ width: '19%' }} className="py-3 px-3">Nombre</th>
                            <th style={{ width: '19%' }} className="py-3 px-3">Taux (%)</th>
                            <th style={{ width: '19%' }} className="py-3 px-3">Base</th>
                            <th style={{ width: '19%' }} className="py-3 px-3">Montant</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {/* Champ */}
                            <td className="py-2">
                              <div className="fw-medium">Valeurs</div>
                              <small className="text-muted">Saisie des paramètres</small>
                              <div className="mt-1">
                                <small className={`badge bg-${disabledFields.nombre ? 'secondary' : 'success'}`}>
                                  {disabledFields.nombre ? 'Verrouillé' : 'Déverrouillé'}
                                </small>
                              </div>
                            </td>

                            {/* Nombre */}
                            <td className="py-2">
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={formValues.nombre}
                                onChange={(e) => handleInputChange('nombre', e.target.value)}
                                placeholder={getPlaceholder('nombre', rubrique)}
                                size="sm"
                                className="w-100"
                                disabled={disabledFields.nombre}
                                style={{
                                  backgroundColor: disabledFields.nombre ? '#e1b2db' : 'white',
                                  cursor: disabledFields.nombre ? 'not-allowed' : 'text'
                                }}
                              />
                            </td>

                            {/* Taux */}
                            <td className="py-2">
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={formValues.taux}
                                onChange={(e) => handleInputChange('taux', e.target.value)}
                                placeholder={getPlaceholder('taux', rubrique)}
                                size="sm"
                                className="w-100"
                                disabled={disabledFields.taux}
                                style={{
                                  backgroundColor: disabledFields.taux ? '#e1b2db' : 'white',
                                  cursor: disabledFields.taux ? 'not-allowed' : 'text'
                                }}
                              />
                            </td>

                            {/* Base */}
                            <td className="py-2">
                              <Form.Control
                                type="text"
                                value={formValues.base}
                                onChange={(e) => handleInputChange('base', e.target.value)}
                                placeholder={getPlaceholder('base', rubrique)}
                                size="sm"
                                className="w-100"
                                disabled={disabledFields.base}
                                style={{
                                  backgroundColor: disabledFields.base ? '#e1b2db' : 'white',
                                  cursor: disabledFields.base ? 'not-allowed' : 'text'
                                }}
                              />
                            </td>

                            {/* Montant */}
                            <td className="py-2">
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={formValues.montant}
                                onChange={(e) => handleInputChange('montant', e.target.value)}
                                placeholder={getPlaceholder('montant', rubrique)}
                                size="sm"
                                className="w-100"
                                disabled={disabledFields.montant}
                                style={{
                                  backgroundColor: disabledFields.montant ? '#e1b2db' : 'white',
                                  cursor: disabledFields.montant ? 'not-allowed' : 'text'
                                }}
                              />
                            </td>
                          </tr>

                          {/* Ligne d'aperçu des valeurs */}
                          <tr className="bg-light">
                            <td className="py-2">
                              <div className="fw-medium">Aperçu</div>
                              <small className="text-muted">Valeurs actuelles</small>
                            </td>
                            <td className="py-2 text-center">
                              {formValues.nombre ? (
                                <Badge bg="secondary" className="fw-normal">
                                  {formValues.nombre}
                                </Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="py-2 text-center">
                              {formValues.taux ? (
                                <Badge bg="info" className="fw-normal">
                                  {formValues.taux}%
                                </Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="py-2 text-center">
                              {formValues.base ? (
                                <Badge bg="primary" className="fw-normal">
                                  {formValues.base}
                                </Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="py-2 text-center">
                              {formValues.montant ? (
                                <Badge bg="warning" className="fw-normal">
                                  {Number(formValues.montant).toLocaleString()} Ar
                                </Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>

                    {/* Légende des champs verrouillés */}
                    <div className="mt-3">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Les champs grisés sont verrouillés selon le mode de calcul ({rubrique?.modeCalcul || 'N/A'}) et le type de formule.
                      </small>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer du modal avec bouton de sauvegarde */}
            <div className="modal-footer-custom" style={{
              background: '#f9f1f8',
              borderTop: '1px solid #e1b2db',
              padding: '1.25rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div className="small fw-bold text-muted">
                  {paieFille ? 'Données existantes trouvées' : 'Nouvelle saisie'}
                </div>
              </div>

              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  onClick={onHide}
                  className="px-5 py-2 fw-bold d-flex align-items-center gap-2"
                  style={{ fontSize: '1rem', borderRadius: '12px', background: 'var(--bg-gradient)', border: 'none' }}
                >
                  <X size={18} />
                  <span>Annuler</span>
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving || !paie}
                  className="btn-primary px-5 py-2 fw-bold d-flex align-items-center gap-2"
                  style={{ fontSize: '1rem', borderRadius: '12px', background: 'var(--bg-gradient)' }}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Sauvegarder</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RubriqueFormuleModal;