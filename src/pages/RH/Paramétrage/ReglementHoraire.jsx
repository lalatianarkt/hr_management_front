// src/pages/RH/Paramétrage/ReglementHoraire.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
  Modal,
  Badge,
  Tabs,
  Tab,
  InputGroup,
  FormControl,
  Accordion
} from 'react-bootstrap';
import {
  Clock,
  Settings,
  Save,
  Edit,
  Trash2,
  Plus,
  Eye,
  Calendar,
  Watch,
  Bell,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Coffee,
  Users,
  Briefcase,
  BarChart2,
  RefreshCw,
  FileText
} from 'react-feather';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import axiosInstance from '../../utils/AxiosInstance'; 

function ReglementHoraire() {
  // États principaux
  const [reglements, setReglements] = useState([]);
  const [currentReglement, setCurrentReglement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // États pour l'export
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    heureMatEntree: '08:00',
    heureApremSortie: '17:00',
    dureeNormalePauseMinutes: '60',
    heureNormaleJournaliere: '',
    heureNormaleSemaine: '',
    heureNormaleMois: ''
  });
  
  // États pour les modals
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReglement, setSelectedReglement] = useState(null);
  
  // États pour le calcul
  const [calculResult, setCalculResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  
  // États pour la vérification d'heure
  const [heureAVerifier, setHeureAVerifier] = useState('09:00');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  
  // États pour les onglets
  const [activeTab, setActiveTab] = useState('config');

  // Charger les données au montage
  useEffect(() => {
    fetchReglements();
    fetchCurrentReglement();
  }, []);

  // Fonction pour exporter les règlements horaires
  const handleExportReglements = async () => {
    try {
      setExporting(true);
      setError('');
      
      const response = await axiosInstance.get('/api/export/format/heureSup', {
        responseType: 'blob' // Important pour les fichiers
      });
      
      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `heuresup_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL
      window.URL.revokeObjectURL(url);
      
      setExportSuccess('Format heure supp exportés avec succès !');
      setTimeout(() => setExportSuccess(''), 5000);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError('Erreur lors de l\'export des heures supp');
    } finally {
      setExporting(false);
    }
  };
  
  // Fonction pour charger tous les règlements
  const fetchReglements = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/reglements-horaires');
      setReglements(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des règlements:', error);
      setError('Erreur lors du chargement des règlements');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour charger le règlement actuel
  const fetchCurrentReglement = async () => {
    try {
      const response = await axiosInstance.get('/api/reglements-horaires/actuel');
      if (response.data.data) {
        setCurrentReglement(response.data.data);
      }
    } catch (error) {
      console.log('Aucun règlement actuel trouvé');
    }
  };
  
  // Gestion des changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Calculer automatiquement les heures
  const calculateHours = async () => {
    if (!formData.heureMatEntree || !formData.heureApremSortie || !formData.dureeNormalePauseMinutes) {
      setError('Veuillez remplir toutes les heures pour le calcul');
      return;
    }
    
    try {
      setCalculating(true);
      const response = await axiosInstance.post('/api/reglements-horaires/calculer-heures', {
        heureEntree: formData.heureMatEntree,
        heureSortie: formData.heureApremSortie,
        pauseMinutes: formData.dureeNormalePauseMinutes
      });
      
      if (response.data.data) {
        setCalculResult(response.data.data);
        setFormData(prev => ({
          ...prev,
          heureNormaleJournaliere: response.data.data.heureNormaleJournaliere,
          heureNormaleSemaine: response.data.data.heureNormaleSemaine,
          heureNormaleMois: response.data.data.heureNormaleMois
        }));
      }
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      setError('Erreur lors du calcul des heures');
    } finally {
      setCalculating(false);
    }
  };
  
  // Créer un nouveau règlement
  const handleCreateReglement = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Préparer les données
      const dataToSend = {
        heureMatEntree: formData.heureMatEntree + ':00',
        heureApremSortie: formData.heureApremSortie + ':00',
        dureeNormalePauseMinutes: parseFloat(formData.dureeNormalePauseMinutes),
        heureNormaleJournaliere: formData.heureNormaleJournaliere ? 
          parseFloat(formData.heureNormaleJournaliere) : null,
        heureNormaleSemaine: formData.heureNormaleSemaine,
        heureNormaleMois: formData.heureNormaleMois
      };
      
      const response = await axiosInstance.post('/api/reglements-horaires', dataToSend);
      
      if (response.data.success) {
        setSuccess('Règlement horaire créé avec succès !');
        setShowModal(false);
        resetForm();
        
        // Rafraîchir les données
        await Promise.all([
          fetchReglements(),
          fetchCurrentReglement()
        ]);
        
        // Afficher le succès pendant 5 secondes
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création du règlement');
    } finally {
      setLoading(false);
    }
  };
  
  // Mettre à jour un règlement
  const handleUpdateReglement = async () => {
    if (!selectedReglement) return;
    
    try {
      setLoading(true);
      setError('');
      
      const dataToSend = {
        heureMatEntree: formData.heureMatEntree + ':00',
        heureApremSortie: formData.heureApremSortie + ':00',
        dureeNormalePauseMinutes: parseFloat(formData.dureeNormalePauseMinutes),
        heureNormaleJournaliere: formData.heureNormaleJournaliere ? 
          parseFloat(formData.heureNormaleJournaliere) : null,
        heureNormaleSemaine: formData.heureNormaleSemaine,
        heureNormaleMois: formData.heureNormaleMois
      };
      
      const response = await axiosInstance.put(
        `/api/reglements-horaires/${selectedReglement.id}`,
        dataToSend
      );
      
      if (response.data.success) {
        setSuccess('Règlement horaire mis à jour avec succès !');
        setShowEditModal(false);
        resetForm();
        
        // Rafraîchir les données
        await Promise.all([
          fetchReglements(),
          fetchCurrentReglement()
        ]);
        
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };
  
  // Supprimer un règlement
  const handleDeleteReglement = async () => {
    if (!selectedReglement) return;
    
    try {
      await axiosInstance.delete(`/api/reglements-horaires/${selectedReglement.id}`);
      setSuccess('Règlement horaire supprimé avec succès !');
      setShowDeleteModal(false);
      
      // Rafraîchir les données
      await Promise.all([
        fetchReglements(),
        fetchCurrentReglement()
      ]);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };
  
  // Vérifier une heure
  const verifyHour = async () => {
    try {
      setVerifying(true);
      const response = await axiosInstance.post('/api/reglements-horaires/verifier-heure', {
        heure: heureAVerifier
      });
      
      setVerificationResult(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setError('Erreur lors de la vérification de l\'heure');
    } finally {
      setVerifying(false);
    }
  };
  
  // Ouvrir le modal d'édition
  const openEditModal = (reglement) => {
    setSelectedReglement(reglement);
    
    // Formater les heures pour l'input
    const formatTime = (timeString) => {
      if (!timeString) return '';
      return timeString.substring(0, 5);
    };
    
    setFormData({
      heureMatEntree: formatTime(reglement.heureMatEntree),
      heureApremSortie: formatTime(reglement.heureApremSortie),
      dureeNormalePauseMinutes: reglement.dureeNormalePauseMinutes || '60',
      heureNormaleJournaliere: reglement.heureNormaleJournaliere || '',
      heureNormaleSemaine: formatTime(reglement.heureNormaleSemaine) || '',
      heureNormaleMois: formatTime(reglement.heureNormaleMois) || ''
    });
    
    setShowEditModal(true);
  };
  
  // Ouvrir le modal de suppression
  const openDeleteModal = (reglement) => {
    setSelectedReglement(reglement);
    setShowDeleteModal(true);
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      heureMatEntree: '08:00',
      heureApremSortie: '17:00',
      dureeNormalePauseMinutes: '60',
      heureNormaleJournaliere: '',
      heureNormaleSemaine: '',
      heureNormaleMois: ''
    });
    setCalculResult(null);
  };
  
  // Formater une heure pour l'affichage
  const formatDisplayTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };
  
  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obtenir le statut du règlement
  const getReglementStatus = (reglement) => {
    if (!currentReglement) return 'inactif';
    return currentReglement.id === reglement.id ? 'actif' : 'inactif';
  };
  
  if (loading && !reglements.length) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des règlements horaires...</span>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
              <Clock size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="h3 mb-1 fw-bold">Règlement Horaire Intérieur</h1>
              <p className="text-muted mb-0">
                Configurez les horaires de travail et les plages horaires de l'entreprise
              </p>
            </div>
          </div>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2 flex-wrap justify-content-md-end mt-3 mt-md-0">
          {/* Bouton d'export */}
          <Button
            variant="outline-success"
            onClick={handleExportReglements}
            disabled={exporting}
            className="d-flex align-items-center gap-2"
          >
            {exporting ? (
              <Spinner size="sm" animation="border" />
            ) : (
              <FileText size={16} />
            )}
            Exporter en Excel
          </Button>
          
          {/* Bouton Nouveau Règlement */}
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={16} />
            Nouveau Règlement
          </Button>
        </Col>
      </Row>
      
      {/* Messages d'alerte */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          <XCircle size={16} className="me-2" />
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">
          <CheckCircle size={16} className="me-2" />
          {success}
        </Alert>
      )}
      
      {exportSuccess && (
        <Alert variant="info" dismissible onClose={() => setExportSuccess('')} className="mb-4">
          <FileText size={16} className="me-2" />
          {exportSuccess}
          <div className="mt-2 small">
            Le fichier Excel a été téléchargé avec les règlements horaires.
          </div>
        </Alert>
      )}
      
      {/* Règlement actuel (carte en haut) */}
      {currentReglement && (
        <Card className="border-primary mb-4">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Briefcase size={18} />
              <h5 className="mb-0">Règlement Horaire Actuel</h5>
            </div>
            <Badge bg="light" text="dark" className="px-3 py-2">
              <Clock size={12} className="me-1" />
              En vigueur
            </Badge>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center p-3 border-end">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Sun className="text-warning" />
                    <span className="fw-bold">Entrée</span>
                  </div>
                  <h3 className="text-primary">{formatDisplayTime(currentReglement.heureMatEntree)}</h3>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 border-end">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Moon className="text-info" />
                    <span className="fw-bold">Sortie</span>
                  </div>
                  <h3 className="text-primary">{formatDisplayTime(currentReglement.heureApremSortie)}</h3>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 border-end">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Coffee className="text-secondary" />
                    <span className="fw-bold">Pause</span>
                  </div>
                  <h3 className="text-primary">{currentReglement.dureeNormalePauseMinutes} min</h3>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <Watch className="text-success" />
                    <span className="fw-bold">Journalier</span>
                  </div>
                  <h3 className="text-success">{currentReglement.heureNormaleJournaliere || '?'} h</h3>
                </div>
              </Col>
            </Row>
            
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted">Créé le:</small>
                  <div className="fw-semibold">{formatDate(currentReglement.createdAt)}</div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditModal(currentReglement)}
                    className="d-flex align-items-center gap-1"
                  >
                    <Edit size={14} />
                    Modifier
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => openDeleteModal(currentReglement)}
                    className="d-flex align-items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Onglets */}
      <Card className="mb-4">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="px-3 pt-3 border-bottom-0"
            fill
          >
            <Tab eventKey="config" title={
              <span className="d-flex align-items-center gap-2">
                <Settings size={16} />
                Configuration
              </span>
            }>
              <div className="p-3">
                <Row>
                  <Col lg={6}>
                    {/* Formulaire de calcul */}
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                          <BarChart2 size={18} />
                          Calcul des Heures
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  <Sun size={14} className="me-2 text-warning" />
                                  Heure d'entrée matinale
                                </Form.Label>
                                <Form.Control
                                  type="time"
                                  name="heureMatEntree"
                                  value={formData.heureMatEntree}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  <Moon size={14} className="me-2 text-info" />
                                  Heure de sortie après-midi
                                </Form.Label>
                                <Form.Control
                                  type="time"
                                  name="heureApremSortie"
                                  value={formData.heureApremSortie}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  <Coffee size={14} className="me-2 text-secondary" />
                                  Durée normale de pause (minutes)
                                </Form.Label>
                                <InputGroup>
                                  <Form.Control
                                    type="number"
                                    name="dureeNormalePauseMinutes"
                                    value={formData.dureeNormalePauseMinutes}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="180"
                                    step="15"
                                  />
                                  <InputGroup.Text>min</InputGroup.Text>
                                </InputGroup>
                                <Form.Text className="text-muted">
                                  Durée standard de la pause déjeuner
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                              <Button
                                variant="outline-primary"
                                onClick={calculateHours}
                                disabled={calculating}
                                className="d-flex align-items-center gap-2 w-100"
                              >
                                {calculating ? (
                                  <>
                                    <Spinner size="sm" animation="border" />
                                    Calcul en cours...
                                  </>
                                ) : (
                                  <>
                                    <BarChart2 size={16} />
                                    Calculer automatiquement les heures
                                  </>
                                )}
                              </Button>
                            </Col>
                          </Row>
                          
                          {/* Résultats du calcul */}
                          {calculResult && (
                            <div className="mt-4 p-3 border rounded bg-light">
                              <h6 className="fw-bold mb-3">Résultats du calcul :</h6>
                              <Row>
                                <Col md={4}>
                                  <div className="text-center p-2">
                                    <small className="text-muted">Heure journalière</small>
                                    <div className="h5 fw-bold text-primary">
                                      {calculResult.heureNormaleJournaliere} h
                                    </div>
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <div className="text-center p-2">
                                    <small className="text-muted">Heure hebdomadaire</small>
                                    <div className="h5 fw-bold text-primary">
                                      {formatDisplayTime(calculResult.heureNormaleSemaine)}
                                    </div>
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <div className="text-center p-2">
                                    <small className="text-muted">Heure mensuelle</small>
                                    <div className="h5 fw-bold text-primary">
                                      {formatDisplayTime(calculResult.heureNormaleMois)}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          )}
                        </Form>
                      </Card.Body>
                    </Card>
                    
                    {/* Vérification d'heure */}
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                          <Bell size={18} />
                          Vérification d'Heure
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Row className="align-items-end">
                            <Col md={8}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">
                                  Vérifier si une heure est dans les heures de travail
                                </Form.Label>
                                <Form.Control
                                  type="time"
                                  value={heureAVerifier}
                                  onChange={(e) => setHeureAVerifier(e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Button
                                variant="outline-success"
                                onClick={verifyHour}
                                disabled={verifying}
                                className="w-100 d-flex align-items-center justify-content-center gap-2"
                              >
                                {verifying ? (
                                  <Spinner size="sm" animation="border" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                                Vérifier
                              </Button>
                            </Col>
                          </Row>
                          
                          {/* Résultat de vérification */}
                          {verificationResult && (
                            <div className="mt-3 p-3 border rounded">
                              <div className="d-flex align-items-center justify-content-between">
                                <div>
                                  <div className="fw-bold">Heure {heureAVerifier}</div>
                                  <small className="text-muted">Statut de vérification</small>
                                </div>
                                <div>
                                  {verificationResult.estDansLesHeuresDeTravail ? (
                                    <Badge bg="success" className="px-3 py-2">
                                      <CheckCircle size={12} className="me-1" />
                                      Dans les heures
                                    </Badge>
                                  ) : (
                                    <Badge bg="danger" className="px-3 py-2">
                                      <XCircle size={12} className="me-1" />
                                      Hors heures
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col lg={6}>
                    {/* Historique des règlements */}
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                          <RefreshCw size={18} />
                          Historique des Règlements
                        </h5>
                        <Badge bg="secondary" className="px-3">
                          {reglements.length} règlements
                        </Badge>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th>Heures</th>
                                <th>Pause</th>
                                <th>Journalier</th>
                                <th>Créé le</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reglements.length > 0 ? (
                                reglements.map((reglement) => (
                                  <tr key={reglement.id}>
                                    <td>
                                      <div>
                                        <small className="text-muted">Entrée:</small>
                                        <div className="fw-semibold">
                                          {formatDisplayTime(reglement.heureMatEntree)}
                                        </div>
                                      </div>
                                      <div>
                                        <small className="text-muted">Sortie:</small>
                                        <div className="fw-semibold">
                                          {formatDisplayTime(reglement.heureApremSortie)}
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="fw-semibold">
                                        {reglement.dureeNormalePauseMinutes} min
                                      </div>
                                    </td>
                                    <td>
                                      <div className="fw-semibold text-success">
                                        {reglement.heureNormaleJournaliere || '?'} h
                                      </div>
                                    </td>
                                    <td>
                                      <small>{formatDate(reglement.createdAt)}</small>
                                    </td>
                                    <td>
                                      <div className="d-flex gap-1">
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() => openEditModal(reglement)}
                                          aria-label="Modifier"
                                        >
                                          <Edit size={12} />
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => openDeleteModal(reglement)}
                                          aria-label="Supprimer"
                                        >
                                          <Trash2 size={12} />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" className="text-center py-4">
                                    <div className="d-flex flex-column align-items-center">
                                      <Settings size={24} className="text-muted mb-2" />
                                      <small className="text-muted">Aucun règlement configuré</small>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>
            
            <Tab eventKey="aide" title={
              <span className="d-flex align-items-center gap-2">
                <Eye size={16} />
                Guide & Aide
              </span>
            }>
              <div className="p-3">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-3">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0">Comment configurer les horaires</h5>
                      </Card.Header>
                      <Card.Body>
                        <Accordion defaultActiveKey="0">
                          <Accordion.Item eventKey="0">
                            <Accordion.Header>
                              <span className="fw-semibold">Étape 1: Définir les heures de base</span>
                            </Accordion.Header>
                            <Accordion.Body>
                              <ul>
                                <li><strong>Heure d'entrée:</strong> L'heure à laquelle les employés commencent le matin</li>
                                <li><strong>Heure de sortie:</strong> L'heure à laquelle les employés finissent l'après-midi</li>
                                <li><strong>Pause déjeuner:</strong> Durée standard de la pause méridienne</li>
                              </ul>
                            </Accordion.Body>
                          </Accordion.Item>
                          
                          <Accordion.Item eventKey="1">
                            <Accordion.Header>
                              <span className="fw-semibold">Étape 2: Calcul automatique</span>
                            </Accordion.Header>
                            <Accordion.Body>
                              <p>Le système calcule automatiquement:</p>
                              <ul>
                                <li><strong>Heures journalières:</strong> Temps de travail effectif par jour</li>
                                <li><strong>Heures hebdomadaires:</strong> Pour 5 jours de travail</li>
                                <li><strong>Heures mensuelles:</strong> Pour 22 jours de travail</li>
                              </ul>
                            </Accordion.Body>
                          </Accordion.Item>
                          
                          <Accordion.Item eventKey="2">
                            <Accordion.Header>
                              <span className="fw-semibold">Étape 3: Vérification</span>
                            </Accordion.Header>
                            <Accordion.Body>
                              <p>Utilisez l'outil de vérification pour:</p>
                              <ul>
                                <li>Vérifier si une heure spécifique est dans les horaires de travail</li>
                                <li>Valider les pointages des employés</li>
                                <li>Détecter les heures supplémentaires potentielles</li>
                              </ul>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0">Paramètres recommandés</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <h6>Horaires standards (8h-17h)</h6>
                          <div className="p-3 border rounded bg-light">
                            <div className="row">
                              <div className="col-6">
                                <small>Entrée:</small>
                                <div className="fw-bold">08:00</div>
                              </div>
                              <div className="col-6">
                                <small>Sortie:</small>
                                <div className="fw-bold">17:00</div>
                              </div>
                              <div className="col-12 mt-2">
                                <small>Pause:</small>
                                <div className="fw-bold">60 minutes</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h6>Calcul automatique</h6>
                          <p className="small text-muted">
                            Avec ces paramètres, le système calcule:
                          </p>
                          <ul className="small">
                            <li>7h de travail journalier (8h-17h avec 1h de pause)</li>
                            <li>35h de travail hebdomadaire (7h × 5 jours)</li>
                            <li>154h de travail mensuel (7h × 22 jours)</li>
                          </ul>
                        </div>
                        
                        <Alert variant="info">
                          <div className="d-flex align-items-start gap-2">
                            <Bell size={16} className="mt-1" />
                            <div>
                              <strong>Conseil:</strong> Les règlements horaires impactent directement le calcul des heures supplémentaires et les pointages.
                            </div>
                          </div>
                        </Alert>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Modal de création */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>
            <Plus size={18} className="me-2" />
            Nouveau Règlement Horaire
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Heure d'entrée matinale</Form.Label>
                  <Form.Control
                    type="time"
                    name="heureMatEntree"
                    value={formData.heureMatEntree}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Heure de sortie après-midi</Form.Label>
                  <Form.Control
                    type="time"
                    name="heureApremSortie"
                    value={formData.heureApremSortie}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Durée normale de pause (minutes)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="dureeNormalePauseMinutes"
                      value={formData.dureeNormalePauseMinutes}
                      onChange={handleInputChange}
                      min="0"
                      max="180"
                      step="15"
                      required
                    />
                    <InputGroup.Text>min</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Heure normale journalière (h)</Form.Label>
                  <Form.Control
                    type="number"
                    name="heureNormaleJournaliere"
                    value={formData.heureNormaleJournaliere}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="12"
                  />
                  <Form.Text className="text-muted">
                    Laisser vide pour calcul automatique
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Button
                  variant="outline-primary"
                  onClick={calculateHours}
                  disabled={calculating}
                  className="w-100 mt-4"
                >
                  {calculating ? 'Calcul en cours...' : 'Calculer automatiquement'}
                </Button>
              </Col>
              
              {calculResult && (
                <Col md={12}>
                  <Alert variant="info">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>Résultats calculés:</strong>
                        <div className="mt-2">
                          <Badge bg="light" text="dark" className="me-2">
                            Journalier: {calculResult.heureNormaleJournaliere} h
                          </Badge>
                          <Badge bg="light" text="dark" className="me-2">
                            Hebdo: {formatDisplayTime(calculResult.heureNormaleSemaine)}
                          </Badge>
                          <Badge bg="light" text="dark">
                            Mensuel: {formatDisplayTime(calculResult.heureNormaleMois)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Alert>
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleCreateReglement} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Création...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Créer le règlement
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal d'édition */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>
            <Edit size={18} className="me-2" />
            Modifier le Règlement Horaire
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Heure d'entrée matinale</Form.Label>
                  <Form.Control
                    type="time"
                    name="heureMatEntree"
                    value={formData.heureMatEntree}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Heure de sortie après-midi</Form.Label>
                  <Form.Control
                    type="time"
                    name="heureApremSortie"
                    value={formData.heureApremSortie}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Durée normale de pause (minutes)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="dureeNormalePauseMinutes"
                      value={formData.dureeNormalePauseMinutes}
                      onChange={handleInputChange}
                      min="0"
                      max="180"
                      step="15"
                      required
                    />
                    <InputGroup.Text>min</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Heure normale journalière (h)</Form.Label>
                  <Form.Control
                    type="number"
                    name="heureNormaleJournaliere"
                    value={formData.heureNormaleJournaliere}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="12"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Button
                  variant="outline-primary"
                  onClick={calculateHours}
                  disabled={calculating}
                  className="w-100 mt-4"
                >
                  {calculating ? 'Calcul en cours...' : 'Recalculer'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleUpdateReglement} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton closeLabel="Fermer" className="border-0">
          <Modal.Title className="text-danger">
            <Trash2 size={18} className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-4">
            <ExclamationTriangleFill className="me-2" />
            <strong>Attention :</strong> Cette action est irréversible
          </Alert>
          
          {selectedReglement && (
            <div className="p-3 border rounded bg-light mb-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 p-2 rounded">
                  <Clock size={20} className="text-danger" />
                </div>
                <div>
                  <h6 className="mb-1">Règlement à supprimer</h6>
                  <small className="text-muted">
                    {formatDisplayTime(selectedReglement.heureMatEntree)} - {formatDisplayTime(selectedReglement.heureApremSortie)}
                    ({selectedReglement.dureeNormalePauseMinutes} min de pause)
                  </small>
                  <div className="mt-1">
                    <small className="text-muted">Créé le: {formatDate(selectedReglement.createdAt)}</small>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <p className="mb-0">
            Êtes-vous sûr de vouloir supprimer ce règlement horaire ? 
            Cette action ne peut pas être annulée.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteReglement}>
            <Trash2 size={16} className="me-2" />
            Supprimer définitivement
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ReglementHoraire;
