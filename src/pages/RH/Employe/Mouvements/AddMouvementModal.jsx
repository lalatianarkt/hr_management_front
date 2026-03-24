// src/pages/RH/Employe/Mouvements/AddMouvementModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  Badge,
  Card
} from 'react-bootstrap';
import {
  FaPlus,
  FaSave,
  FaTimes,
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExchangeAlt,
  FaArrowUp,
  FaSignOutAlt,
  FaUserPlus,
  FaMoneyBillWave,
  FaIdBadge,
  FaInfoCircle,
  FaHistory,
  FaFileAlt,
  FaCoins,
  FaCheckCircle,
  FaHourglassHalf,
  FaAngleDown,
  FaAngleUp
} from 'react-icons/fa';
import axiosInstance from '../../../utils/AxiosInstance';

const AddMouvementModal = ({ 
  show, 
  onHide, 
  employeId,
  employeNom,
  employePrenom,
  onSuccess,
  hideSalarySection = false
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // États du formulaire
  const [formData, setFormData] = useState({
    typeMouvementId: '',
    motif: '',
    commentaire: '',
    dateDemande: new Date().toISOString().split('T')[0],
    statut: '3',
    
    nouveauDepartementId: '',
    nouveauPosteId: '',
    nouveauNiveauId: '',
    nouveauSalaire: '',
    salaireBase: '',
    
    dateDebut: '',
    dateFin: '',
    dateDebutAssignationPoste: '',
    
    typeContratId: '',
    classification: '',
    categorieProfessionnelleId: ''
  });
  
  // États pour les données de référence
  const [typesMouvement, setTypesMouvement] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [postes, setPostes] = useState([]);
  const [postesByDepartement, setPostesByDepartement] = useState([]);
  const [niveauxHierarchique, setNiveauxHierarchique] = useState([]);
  const [infosProActuel, setInfosProActuel] = useState(null);
  const [statutsRH, setStatutsRH] = useState([]);
  
  const [currentSalaire, setCurrentSalaire] = useState(null);
  const [currentInfosProId, setCurrentInfosProId] = useState(null);
  const [categoriesProfessionnelles, setCategoriesProfessionnelles] = useState([]);
  const [typePromotion, setTypePromotion] = useState('');

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      if (!show || !employeId) return;
      
      try {
        setLoadingData(true);
        setError('');
        
        // 1. Charger les types de mouvement
        const typesResponse = await axiosInstance.get('/api/type-mouvements');
        const formattedTypes = (typesResponse.data || []).map(type => {
          const typeLabel = type.type || type.libelle || type.nom || '';
          const typeId = type.id || type.value || '';
          
          return {
            id: typeId,
            label: typeLabel,
            value: String(typeLabel).toLowerCase(),
            icon: getTypeIcon(typeLabel),
            color: getTypeColor(typeLabel)
          };
        });
        setTypesMouvement(formattedTypes);
        
        // 2. Charger les catégories professionnelles
        const categoriesResponse = await axiosInstance.get('/api/categories-professionnelles');
        setCategoriesProfessionnelles(categoriesResponse.data || []);
        
        // 3. Charger les statuts RH
        try {
          const statutsResponse = await axiosInstance.get('/api/statuts/RH/statut');
          const formattedStatuts = (statutsResponse.data || []).map(statut => ({
            id: String(statut.id),
            libelle: statut.libelle,
            value: statut.id
          }));
          setStatutsRH(formattedStatuts);
        } catch (err) {
          setStatutsRH([
            { id: '3', libelle: 'En attente', value: 3 },
            { id: '4', libelle: 'Validé', value: 4 }
          ]);
        }
        
        // 4. Charger les informations professionnelles actuelles
        try {
          const infosProResponse = await axiosInstance.get(`/api/infosPro/infosEmp/${employeId}`);
          let infosProData;
          
          if (infosProResponse.data && infosProResponse.data.data) {
            infosProData = infosProResponse.data.data;
          } else if (infosProResponse.data) {
            infosProData = infosProResponse.data;
          } else {
            infosProData = infosProResponse;
          }
          
          setInfosProActuel(infosProData);
          
          if (infosProData) {
            setCurrentSalaire(infosProData.salaireBase || infosProData.salaire);
            setCurrentInfosProId(infosProData.id);
            
            setFormData(prev => ({
              ...prev,
              nouveauDepartementId: infosProData.departement?.id || '',
              typeContratId: infosProData.typeContrat?.id || '',
              salaireBase: infosProData.salaireBase || infosProData.salaire || '',
              dateDebutAssignationPoste: infosProData.dateDebutAssignationPoste || '',
              classification: infosProData.classification || '',
              categorieProfessionnelleId: infosProData.categorieProfessionnelle?.id || '',
              nouveauSalaire: infosProData.salaireBase || infosProData.salaire || ''
            }));
          }
        } catch (err) {
          console.warn('Aucune information professionnelle trouvée:', err);
          setInfosProActuel(null);
        }
        
        // 5. Charger les départements
        const deptsResponse = await axiosInstance.get('/api/departements');
        setDepartements(deptsResponse.data || []);
        
        // 6. Charger tous les postes avec leurs salaires
        const postesResponse = await axiosInstance.get('/api/postes');
        setPostes(postesResponse.data || []);
        
        // 7. Charger les niveaux hiérarchiques
        const niveauxResponse = await axiosInstance.get('/api/niveaux');
        setNiveauxHierarchique(niveauxResponse.data || []);
        
      } catch (err) {
        setError('Erreur lors du chargement des données de référence');
        console.error('Erreur:', err);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [show, employeId]);

  // Charger les postes par département
  useEffect(() => {
    const fetchPostesByDepartement = async () => {
      if (!formData.nouveauDepartementId) {
        setPostesByDepartement([]);
        return;
      }
      
      try {
        const response = await axiosInstance.get(`/api/postes/dep/${formData.nouveauDepartementId}`);
        setPostesByDepartement(response.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des postes par département:', err);
        setPostesByDepartement([]);
      }
    };
    
    const selectedType = typesMouvement.find(t => t.id === formData.typeMouvementId);
    const typeValue = selectedType?.value;
    
    if (formData.nouveauDepartementId && 
        (typeValue === 'mutation' || typeValue === 'promotion' || 
         typeValue === 'changement de poste' || typeValue === 'changement_poste')) {
      fetchPostesByDepartement();
    }
  }, [formData.nouveauDepartementId, formData.typeMouvementId, typesMouvement]);

  const getTypeIcon = (typeLabel) => {
    if (!typeLabel || typeof typeLabel !== 'string') return <FaExchangeAlt />;
    const type = typeLabel.toLowerCase();
    if (type.includes('promotion')) return <FaArrowUp className="text-success" />;
    if (type.includes('mutation')) return <FaExchangeAlt className="text-primary" />;
    if (type.includes('changement de poste') || type.includes('changement_poste')) return <FaBriefcase className="text-info" />;
    if (type.includes('départ') || type.includes('depart')) return <FaSignOutAlt className="text-danger" />;
    if (type.includes('arrivée') || type.includes('arrivee')) return <FaUserPlus className="text-success" />;
    if (type.includes('augmentation') || type.includes('salaire')) return <FaMoneyBillWave className="text-warning" />;
    return <FaExchangeAlt />;
  };

  const getTypeColor = (typeLabel) => {
    if (!typeLabel || typeof typeLabel !== 'string') return 'primary';
    const type = typeLabel.toLowerCase();
    if (type.includes('promotion')) return 'success';
    if (type.includes('mutation')) return 'primary';
    if (type.includes('changement de poste') || type.includes('changement_poste')) return 'info';
    if (type.includes('départ') || type.includes('depart')) return 'danger';
    if (type.includes('arrivée') || type.includes('arrivee')) return 'success';
    if (type.includes('augmentation') || type.includes('salaire')) return 'warning';
    return 'secondary';
  };

  const getStatutIcon = (statutId) => {
    if (statutId === '4') return <FaCheckCircle className="text-success" />;
    if (statutId === '3') return <FaHourglassHalf className="text-warning" />;
    return <FaHourglassHalf />;
  };

  const getStatutColor = (statutId) => {
    if (statutId === '4') return 'success';
    if (statutId === '3') return 'warning';
    return 'secondary';
  };

  const getStatutLabel = (statutId) => {
    const statut = statutsRH.find(s => s.id === statutId);
    return statut ? statut.libelle : 'Non défini';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'typeMouvementId') {
      setFormData(prev => ({
        ...prev,
        nouveauDepartementId: infosProActuel?.departement?.id || '',
        nouveauPosteId: '',
        nouveauNiveauId: '',
        nouveauSalaire: currentSalaire || ''
      }));
      setTypePromotion('');
    }
    
    if (name === 'nouveauDepartementId') {
      setFormData(prev => ({
        ...prev,
        nouveauPosteId: '',
        nouveauSalaire: currentSalaire || '' // Réinitialiser le salaire
      }));
    }
    
    if (name === 'nouveauPosteId' && !hideSalarySection) {
      // Quand un poste est sélectionné, mettre à jour le salaire proposé
      const selectedPoste = [...postesByDepartement, ...postes].find(p => p.id === value);
      if (selectedPoste && selectedPoste.salaireBase) {
        setFormData(prev => ({
          ...prev,
          nouveauSalaire: selectedPoste.salaireBase
        }));
      }
    }
  };

  const handleTypePromotionChange = (type) => {
    setTypePromotion(type);
    
    if (type === 'salaire') {
      setFormData(prev => ({
        ...prev,
        nouveauPosteId: infosProActuel?.poste?.id || '',
        nouveauDepartementId: infosProActuel?.departement?.id || '',
        nouveauNiveauId: '',
        nouveauSalaire: currentSalaire || ''
      }));
    } else if (type === 'poste') {
      setFormData(prev => ({
        ...prev,
        nouveauDepartementId: infosProActuel?.departement?.id || '',
        nouveauPosteId: '',
        nouveauNiveauId: '',
        nouveauSalaire: currentSalaire || ''
      }));
    } else if (type === 'poste_departement') {
      setFormData(prev => ({
        ...prev,
        nouveauPosteId: '',
        nouveauNiveauId: '',
        nouveauSalaire: currentSalaire || ''
      }));
    }
  };

  const validateForm = () => {
    if (!formData.typeMouvementId) {
      setError('Veuillez sélectionner un type de mouvement');
      return false;
    }
    
    if (!formData.motif.trim()) {
      setError('Veuillez saisir un motif');
      return false;
    }
    
    if (!formData.dateDemande) {
      setError('Veuillez saisir une date de demande');
      return false;
    }
    
    if (!formData.statut) {
      setError('Veuillez sélectionner un statut');
      return false;
    }
    
    const selectedType = typesMouvement.find(t => t.id === formData.typeMouvementId);
    if (selectedType) {
      const typeValue = selectedType.value;
      
      if (hideSalarySection && typeValue === 'promotion' && typePromotion === 'salaire') {
        setError("Ce type de promotion n'est pas autorisé");
        return false;
      }
      
      // Mutation
      if (typeValue === 'mutation') {
        if (!formData.nouveauDepartementId) {
          setError('Veuillez sélectionner un nouveau département pour la mutation');
          return false;
        }
        if (!formData.nouveauPosteId) {
          setError('Veuillez sélectionner un nouveau poste pour la mutation');
          return false;
        }
        if (!hideSalarySection && (!formData.nouveauSalaire || parseFloat(formData.nouveauSalaire) <= 0)) {
          setError('Veuillez saisir un nouveau salaire pour la mutation');
          return false;
        }
      }
      
      // Changement de poste
      if ((typeValue === 'changement de poste' || typeValue === 'changement_poste')) {
        if (!formData.nouveauPosteId) {
          setError('Veuillez sélectionner un nouveau poste');
          return false;
        }
        if (!hideSalarySection && (!formData.nouveauSalaire || parseFloat(formData.nouveauSalaire) <= 0)) {
          setError('Veuillez saisir un nouveau salaire pour le changement de poste');
          return false;
        }
      }
      
      // Promotion
      if (typeValue === 'promotion') {
        if (!typePromotion) {
          setError('Veuillez sélectionner un type de promotion');
          return false;
        }
        
        if (typePromotion === 'salaire') {
          if (!hideSalarySection && (!formData.nouveauSalaire || parseFloat(formData.nouveauSalaire) <= 0)) {
            setError('Veuillez saisir un nouveau salaire valide pour la promotion');
            return false;
          }
        } else if (typePromotion === 'poste') {
          if (!formData.nouveauPosteId) {
            setError('Veuillez sélectionner un nouveau poste pour la promotion');
            return false;
          }
          if (!hideSalarySection && (!formData.nouveauSalaire || parseFloat(formData.nouveauSalaire) <= 0)) {
            setError('Veuillez saisir un nouveau salaire pour la promotion');
            return false;
          }
        } else if (typePromotion === 'poste_departement') {
          if (!formData.nouveauDepartementId) {
            setError('Veuillez sélectionner un nouveau département pour la promotion');
            return false;
          }
          if (!formData.nouveauPosteId) {
            setError('Veuillez sélectionner un nouveau poste pour la promotion');
            return false;
          }
          if (!hideSalarySection && (!formData.nouveauSalaire || parseFloat(formData.nouveauSalaire) <= 0)) {
            setError('Veuillez saisir un nouveau salaire pour la promotion');
            return false;
          }
        }
      }
      
      // Augmentation de salaire
      if (!hideSalarySection && typeValue === 'augmentation_salaire' && !formData.nouveauSalaire) {
        setError('Veuillez saisir un nouveau salaire');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const selectedType = typesMouvement.find(t => t.id === formData.typeMouvementId);
      const typeValue = selectedType?.value;
      
      const demandeMouvementData = {
        motif: formData.motif,
        dateDemande: formData.dateDemande,
        commentaire: formData.commentaire || '',
        
        employeDemandeur: { id: employeId },
        employeConcerne: { id: employeId },
        
        typeMouvement: { id: formData.typeMouvementId },
        
        infosProActuel: currentInfosProId ? { id: currentInfosProId } : null,
      };
      
      if (shouldIncludeInfosProPropose(typeValue)) {
        const resolvedSalaire = hideSalarySection
          ? (currentSalaire || formData.salaireBase || null)
          : (formData.nouveauSalaire || formData.salaireBase || currentSalaire);
        const infosProPropose = {
          employe: { id: employeId },
          statut: parseInt(formData.statut),
          dateDebut: formData.dateDebut || new Date().toISOString().split('T')[0],
          dateFin: formData.dateFin || null,
          salaire: resolvedSalaire,
          salaireBase: resolvedSalaire,
          dateDebutAssignationPoste: formData.dateDebutAssignationPoste || formData.dateDebut || new Date().toISOString().split('T')[0],
          classification: formData.classification || '',
          categorieProfessionnelle: formData.categorieProfessionnelleId ? {
            id: formData.categorieProfessionnelleId
          } : infosProActuel?.categorieProfessionnelle ? {
            id: infosProActuel.categorieProfessionnelle.id
          } : null
        };
        
        if (formData.nouveauPosteId) {
          infosProPropose.poste = { id: formData.nouveauPosteId };
        } else if (infosProActuel?.poste?.id) {
          infosProPropose.poste = { id: infosProActuel.poste.id };
        }
        
        if (formData.nouveauDepartementId) {
          infosProPropose.departement = { id: formData.nouveauDepartementId };
        } else if (infosProActuel?.departement?.id) {
          infosProPropose.departement = { id: infosProActuel.departement.id };
        }
        
        if (formData.typeContratId) {
          infosProPropose.typeContrat = { id: formData.typeContratId };
        } else if (infosProActuel?.typeContrat?.id) {
          infosProPropose.typeContrat = { id: infosProActuel.typeContrat.id };
        }
        
        demandeMouvementData.infosProPropose = infosProPropose;
      }
      
      const response = await axiosInstance.post('/api/mouvements/demande', demandeMouvementData);
      
      const statutMessage = formData.statut === '4' 
        ? 'Demande de mouvement créée et validée avec succès!' 
        : 'Demande de mouvement créée avec succès! Elle est maintenant en attente de validation.';
      
      setSuccess(statutMessage);
      
      if (onSuccess) onSuccess(response.data);
      
      setTimeout(() => {
        onHide();
        resetForm();
        setSuccess('');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Erreur lors de la création du mouvement';
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const shouldIncludeInfosProPropose = (typeValue) => {
    if (!typeValue) return false;
    return typeValue === 'mutation' || 
           typeValue === 'changement de poste' || 
           typeValue === 'changement_poste' ||
           typeValue === 'promotion' ||
           typeValue === 'augmentation_salaire';
  };

  const resetForm = () => {
    setFormData({
      typeMouvementId: '',
      motif: '',
      commentaire: '',
      dateDemande: new Date().toISOString().split('T')[0],
      statut: '3',
      nouveauDepartementId: '',
      nouveauPosteId: '',
      nouveauNiveauId: '',
      nouveauSalaire: '',
      salaireBase: '',
      dateDebut: '',
      dateFin: '',
      dateDebutAssignationPoste: '',
      typeContratId: '',
      classification: '',
      categorieProfessionnelleId: ''
    });
    setTypePromotion('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const formatDateDisplay = (dateString) => {
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

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTypeLabel = (typeId) => {
    const type = typesMouvement.find(t => t.id === typeId);
    return type ? type.label : 'Non spécifié';
  };

  const getFilteredPostes = () => {
    let filtered = postesByDepartement.length > 0 ? postesByDepartement : postes;
    
    // Exclure le poste actuel si nécessaire
    if (infosProActuel?.poste?.id && typePromotion !== 'salaire') {
      filtered = filtered.filter(poste => poste.id !== infosProActuel.poste.id);
    }
    
    return filtered;
  };

  const renderSalaireComparison = () => {
    const ancienSalaire = currentSalaire || 0;
    const nouveauSalaire = formData.nouveauSalaire || 0;
    const difference = nouveauSalaire - ancienSalaire;
    const pourcentage = ancienSalaire > 0 ? ((difference / ancienSalaire) * 100).toFixed(2) : 0;

    return (
      <Card className="mb-3 border-warning">
        <Card.Header className="bg-warning text-dark">
          <h6 className="mb-0 d-flex align-items-center">
            <FaCoins className="me-2" />
            Comparaison des Salaires
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="text-center p-3 border-end">
                <div className="text-muted small">Ancien Salaire</div>
                <div className="h4 text-danger fw-bold mt-2">
                  {ancienSalaire.toLocaleString()} Ar
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center p-3">
                <div className="text-muted small">Nouveau Salaire</div>
                <div className="h4 text-success fw-bold mt-2">
                  {nouveauSalaire.toLocaleString()} Ar
                </div>
                <div className="mt-2">
                  {difference > 0 ? (
                    <Badge bg="success" className="me-2">
                      +{difference.toLocaleString()} Ar
                    </Badge>
                  ) : difference < 0 ? (
                    <Badge bg="danger" className="me-2">
                      {difference.toLocaleString()} Ar
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="me-2">
                      Aucun changement
                    </Badge>
                  )}
                  {difference !== 0 && (
                    <Badge bg={difference > 0 ? "success" : "danger"}>
                      {difference > 0 ? "+" : ""}{pourcentage}%
                    </Badge>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderFormByType = () => {
    const selectedType = typesMouvement.find(t => t.id === formData.typeMouvementId);
    if (!selectedType) return null;
    
    const typeValue = selectedType.value;
    
    return (
      <>
        {/* Situation actuelle */}
        <div className="mb-4 p-3 border rounded bg-light">
          <h6 className="mb-3 d-flex align-items-center">
            <FaBriefcase className="me-2 text-primary" />
            Situation actuelle
          </h6>
          
          {infosProActuel ? (
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Poste:</strong>
                  <div className="fw-medium">
                    {infosProActuel.poste ? (
                      <Badge bg="info" className="ms-2">
                        {infosProActuel.poste.nom}
                      </Badge>
                    ) : (
                      <span className="text-muted ms-2">Non défini</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Département:</strong>
                  <div className="fw-medium">
                    {infosProActuel.departement ? (
                      <Badge bg="secondary" className="ms-2">
                        {infosProActuel.departement.nom}
                      </Badge>
                    ) : (
                      <span className="text-muted ms-2">Non défini</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Salaire:</strong>
                  <div className="fw-medium ms-2">
                    {currentSalaire ? `${currentSalaire.toLocaleString()} Ar` : 'Non défini'}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Classification:</strong>
                  <div className="fw-medium ms-2">
                    {infosProActuel.classification || 'Non défini'}
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <Alert variant="warning" className="mb-0">
              <FaInfoCircle className="me-2" />
              Aucune information professionnelle trouvée pour cet employé.
            </Alert>
          )}
        </div>

        {/* Nouvelle situation */}
        <div className="mb-4 p-3 border rounded">
          <h6 className="mb-3 d-flex align-items-center">
            <FaExchangeAlt className="me-2 text-info" />
            Nouvelle situation
          </h6>
          
          {/* Promotion : Type de promotion */}
          {typeValue === 'promotion' && (
            <div className="mb-4">
              <Form.Label className="fw-bold mb-2">Type de promotion *</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {!hideSalarySection && (
                  <Button
                    variant={typePromotion === 'salaire' ? 'success' : 'outline-success'}
                    onClick={() => handleTypePromotionChange('salaire')}
                    className="d-flex align-items-center"
                  >
                    <FaMoneyBillWave className="me-2" />
                    Augmentation de salaire seulement
                  </Button>
                )}
                <Button
                  variant={typePromotion === 'poste' ? 'info' : 'outline-info'}
                  onClick={() => handleTypePromotionChange('poste')}
                  className="d-flex align-items-center"
                >
                  <FaBriefcase className="me-2" />
                  Nouveau poste (même département)
                </Button>
                <Button
                  variant={typePromotion === 'poste_departement' ? 'primary' : 'outline-primary'}
                  onClick={() => handleTypePromotionChange('poste_departement')}
                  className="d-flex align-items-center"
                >
                  <FaBuilding className="me-2" />
                  Nouveau poste et département
                </Button>
              </div>
            </div>
          )}
          
          {/* Mutation - Département */}
          {typeValue === 'mutation' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nouveau département *</Form.Label>
                <Form.Select
                  name="nouveauDepartementId"
                  value={formData.nouveauDepartementId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un département</option>
                  {departements
                    .filter(dept => !infosProActuel?.departement || dept.id !== infosProActuel.departement.id)
                    .map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Sélectionnez un département différent du département actuel
                </Form.Text>
              </Form.Group>
            </>
          )}
          
          {/* Changement de poste et Mutation - Poste */}
          {(typeValue === 'mutation' || 
            typeValue === 'changement de poste' || 
            typeValue === 'changement_poste' ||
            (typeValue === 'promotion' && (typePromotion === 'poste' || typePromotion === 'poste_departement'))) && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>
                  Nouveau poste *
                  {typeValue === 'mutation' && formData.nouveauDepartementId && (
                    <span className="text-info ms-2">
                      (Postes disponibles dans {departements.find(d => d.id === formData.nouveauDepartementId)?.nom})
                    </span>
                  )}
                </Form.Label>
                <Form.Select
                  name="nouveauPosteId"
                  value={formData.nouveauPosteId}
                  onChange={handleChange}
                  required
                  disabled={typeValue === 'mutation' && !formData.nouveauDepartementId}
                >
                  <option value="">Sélectionnez un poste</option>
                  {getFilteredPostes().map(poste => (
                    <option key={poste.id} value={poste.id}>
                      {poste.nom} 
                      {poste.departement?.nom && ` - ${poste.departement.nom}`}
                      {poste.salaireBase && (
                        <span className="text-success ms-2">
                          ({poste.salaireBase.toLocaleString()} Ar)
                        </span>
                      )}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {typeValue === 'mutation' 
                    ? 'Sélectionnez un poste dans le département choisi'
                    : 'Sélectionnez un nouveau poste'}
                  {!formData.nouveauDepartementId && typeValue === 'mutation' && (
                    <span className="text-warning d-block">
                      Veuillez d'abord sélectionner un département pour voir les postes disponibles
                    </span>
                  )}
                </Form.Text>
              </Form.Group>
            </>
          )}
          
          {!hideSalarySection && (
            <>
              {/* Nouveau salaire - Pour tous les mouvements qui impliquent un changement */}
              {(typeValue === 'mutation' || 
                typeValue === 'changement de poste' || 
                typeValue === 'changement_poste' ||
                typeValue === 'promotion' ||
                typeValue === 'augmentation_salaire') && (
                <>
                  {renderSalaireComparison()}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Nouveau salaire (Ar) *
                      {typeValue === 'mutation' && formData.nouveauPosteId && (
                        <span className="text-info ms-2">
                          (Salaire du poste sélectionné)
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="nouveauSalaire"
                      value={formData.nouveauSalaire}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      required
                    />
                    <Form.Text className="text-muted">
                      {typeValue === 'mutation' && formData.nouveauPosteId && (
                        `Le salaire proposé doit correspondre au poste sélectionné`
                      )}
                      {typeValue === 'changement de poste' && (
                        `Saisissez le salaire correspondant au nouveau poste`
                      )}
                    </Form.Text>
                  </Form.Group>
                </>
              )}
            </>
          )}
          
          {/* Date début assignation poste */}
          {(typeValue === 'mutation' || typeValue === 'promotion' || 
            typeValue === 'changement de poste' || typeValue === 'changement_poste') && (
            <Form.Group className="mb-3">
              <Form.Label>Date début assignation poste *</Form.Label>
              <Form.Control
                type="date"
                name="dateDebutAssignationPoste"
                value={formData.dateDebutAssignationPoste}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}
        </div>
      </>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered
      backdrop="static"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <FaPlus className="me-2" />
          Nouvelle Demande de Mouvement
          {employeNom && employePrenom && (
            <Badge bg="light" text="dark" className="ms-2">
              <FaIdBadge className="me-1" />
              {employePrenom} {employeNom}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
              <strong>Erreur:</strong> {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">
              {success}
            </Alert>
          )}
          
          {loadingData ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de mouvement *</Form.Label>
                    <Form.Select
                      name="typeMouvementId"
                      value={formData.typeMouvementId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      {typesMouvement.map(type => (
                        <option key={type.id} value={type.id}>
                          <span className="d-flex align-items-center">
                            <span className="me-2">{type.icon}</span>
                            {type.label}
                          </span>
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de demande *</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateDemande"
                      value={formData.dateDemande}
                      onChange={handleChange}
                      max={getMaxDate()}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Statut *</Form.Label>
                    <Form.Select
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionnez un statut</option>
                      {statutsRH.map(statut => (
                        <option key={statut.id} value={statut.id}>
                          <span className="d-flex align-items-center">
                            <span className="me-2">{getStatutIcon(statut.id)}</span>
                            {statut.libelle}
                          </span>
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {formData.typeMouvementId && renderFormByType()}
              
              <Form.Group className="mb-3">
                <Form.Label>Motif *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="motif"
                  value={formData.motif}
                  onChange={handleChange}
                  placeholder="Décrivez la raison du mouvement"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Commentaire (optionnel)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="commentaire"
                  value={formData.commentaire}
                  onChange={handleChange}
                  placeholder="Informations complémentaires..."
                />
              </Form.Group>
              
              {formData.typeMouvementId && (
                <Card className="mt-4 border-primary">
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0 d-flex align-items-center">
                      <FaExchangeAlt className="me-2" />
                      Récapitulatif de la demande
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>Type:</strong>
                          <Badge bg={getTypeColor(typesMouvement.find(t => t.id === formData.typeMouvementId)?.label)} className="ms-2">
                            {getTypeLabel(formData.typeMouvementId)}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <strong>Date de demande:</strong>
                          <span className="ms-2">{formatDateDisplay(formData.dateDemande)}</span>
                        </div>
                        <div className="mb-2">
                          <strong>Statut:</strong>
                          <Badge bg={getStatutColor(formData.statut)} className="ms-2 d-flex align-items-center" style={{ width: 'fit-content' }}>
                            {getStatutIcon(formData.statut)}
                            <span className="ms-1">{getStatutLabel(formData.statut)}</span>
                          </Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>Employé:</strong>
                          <span className="ms-2 fw-medium">{employePrenom} {employeNom}</span>
                        </div>
                        {!hideSalarySection && (
                          <div className="mb-2">
                            <strong>Nouveau salaire:</strong>
                            <span className="ms-2 text-success fw-bold">
                              {formData.nouveauSalaire ? `${formData.nouveauSalaire.toLocaleString()} Ar` : 'Non spécifié'}
                            </span>
                          </div>
                        )}
                      </Col>
                    </Row>
                    {formData.motif && (
                      <div className="mt-2">
                        <strong>Motif:</strong>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.9em' }}>{formData.motif}</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
            <FaTimes className="me-2" />
            Annuler
          </Button>
          
          <Button variant="primary" type="submit" disabled={loading || loadingData} className="d-flex align-items-center">
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {formData.statut === '4' ? 'Valider et enregistrer' : 'Envoyer la demande'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddMouvementModal;
