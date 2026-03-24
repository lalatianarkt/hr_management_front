// src/pages/RH/Mouvements/MouvementsEmploye.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
  Dropdown,
  DropdownButton,
  Pagination,
  Breadcrumb,
  Tabs,
  Tab
} from 'react-bootstrap';
import {
  FaFilter,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaSync,
  FaHistory,
  FaArrowRight,
  FaIdCard,
  FaClipboardCheck,
  FaUserTie,
  FaFileAlt,
  FaArrowLeft,
  FaUserCircle,
  FaPlus,
  FaList,
  FaCheckCircle,
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
  FaCoins,
  FaChartLine,
  FaInfoCircle
} from 'react-icons/fa';
import axiosInstance from '../../../utils/AxiosInstance';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import AddMouvementModal from './AddMouvementModal';

const MouvementsEmploye = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [mouvements, setMouvements] = useState([]);
  const [filteredMouvements, setFilteredMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Informations sur l'employé
  const [employe, setEmploye] = useState(null);
  const [loadingEmploye, setLoadingEmploye] = useState(true);
  
  // États pour la recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // États pour les modaux
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedMouvement, setSelectedMouvement] = useState(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // États pour les données de référence
  const [typesMouvement, setTypesMouvement] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);

  // État pour les onglets
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'validated', 'pending'

  // Charger les données initiales
  useEffect(() => {
    if (id) {
      fetchEmploye();
      fetchMouvementsEmploye();
      fetchTypesMouvement();
    }
  }, [id]);

  // Charger les mouvements de l'employé spécifique
  const fetchMouvementsEmploye = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get(`/api/mouvements/employe/${id}`);
      console.log("Mouvements de l'employé:", response.data);
      
      // Trier par date de création (du plus récent au plus ancien)
      const sortedMouvements = (response.data || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateDemande || 0);
        const dateB = new Date(b.createdAt || b.dateDemande || 0);
        return dateB - dateA;
      });
      
      setMouvements(sortedMouvements);
      setFilteredMouvements(sortedMouvements);
    } catch (err) {
      setError('Erreur lors du chargement des mouvements de l\'employé');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les informations de l'employé
  const fetchEmploye = async () => {
    if (!id) return;
    
    setLoadingEmploye(true);
    
    try {
      const response = await axiosInstance.get(`/api/employes/${id}`);
      setEmploye(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des informations de l\'employé:', err);
    } finally {
      setLoadingEmploye(false);
    }
  };

  // Charger les types de mouvement
  const fetchTypesMouvement = async () => {
    try {
      const response = await axiosInstance.get('/api/type-mouvements');
      console.log("Types de mouvement:", response.data);

      // Formater les types de mouvement
      const formattedTypes = (response.data || []).map(type => {
        const typeLabel = type.type || type.libelle || '';
        return {
          id: type.id,
          label: typeLabel,
          value: typeLabel?.toLowerCase(),
          icon: getTypeIcon(typeLabel),
          color: getTypeColor(typeLabel)
        };
      });
      setTypesMouvement(formattedTypes);
    } catch (err) {
      console.error('Erreur lors du chargement des types de mouvement:', err);
    }
  };

  // Filtrer les mouvements
  useEffect(() => {
    let result = mouvements;
    
    // Filtrer par onglet
    if (activeTab === 'validated') {
      result = result.filter(mvt => mvt && mvt.statut === 2); // Validés seulement
    } else if (activeTab === 'pending') {
      result = result.filter(mvt => mvt && mvt.statut === 1); // En attente seulement
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(mvt => {
        if (!mvt) return false;
        
        const matchesMotif = mvt.motif?.toLowerCase().includes(term) || false;
        const matchesCommentaire = mvt.commentaire?.toLowerCase().includes(term) || false;
        const matchesType = mvt.typeMouvement?.type?.toLowerCase().includes(term) || 
                           mvt.typeMouvement?.libelle?.toLowerCase().includes(term) || false;
        
        return matchesMotif || matchesCommentaire || matchesType;
      });
    }
    
    // Filtrer par statut (si différent de l'onglet)
    if (statutFilter !== 'all') {
      const statutValue = parseInt(statutFilter);
      result = result.filter(mvt => mvt && mvt.statut === statutValue);
    }
    
    // Filtrer par type
    if (typeFilter !== 'all') {
      result = result.filter(mvt => mvt && mvt.typeMouvement?.id === typeFilter);
    }
    
    setFilteredMouvements(result);
    setCurrentPage(1); // Retour à la première page après filtrage
  }, [searchTerm, statutFilter, typeFilter, mouvements, activeTab]);

  // Formater la date
  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      if (withTime) {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
      }
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Formater le montant
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  // Obtenir le badge de statut
  const getStatutBadge = (statut) => {
    if (statut === undefined || statut === null) {
      return <Badge bg="secondary">Inconnu</Badge>;
    }
    
    switch (statut) {
      case 1: // En attente
        return <Badge bg="warning">En attente</Badge>;
      case 2: // Validé
        return <Badge bg="success">Validé</Badge>;
      case 3: // Appliqué
        return <Badge bg="info">Appliqué</Badge>;
      case 0: // Rejeté
        return <Badge bg="danger">Rejeté</Badge>;
      default:
        return <Badge bg="secondary">Inconnu ({statut})</Badge>;
    }
  };

  const getTypeIcon = (typeMouvement) => {
    let typeLabel;
    
    if (!typeMouvement) return <FaExchangeAlt />;
    
    if (typeof typeMouvement === 'object' && typeMouvement.libelle) {
      typeLabel = typeMouvement.libelle;
    } else if (typeof typeMouvement === 'object' && typeMouvement.type) {
      typeLabel = typeMouvement.type;
    } else if (typeof typeMouvement === 'string') {
      typeLabel = typeMouvement;
    } else {
      return <FaExchangeAlt />;
    }
    
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
  
  // Obtenir la couleur selon le type de mouvement
  const getTypeColor = (typeMouvement) => {
    let typeLabel;
    
    if (!typeMouvement) return 'primary';
    
    if (typeof typeMouvement === 'object' && typeMouvement.libelle) {
      typeLabel = typeMouvement.libelle;
    } else if (typeof typeMouvement === 'object' && typeMouvement.type) {
      typeLabel = typeMouvement.type;
    } else if (typeof typeMouvement === 'string') {
      typeLabel = typeMouvement;
    } else {
      return 'primary';
    }
    
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
  
  // Obtenir le libellé du type de mouvement
  const getTypeLabel = (typeMouvement) => {
    if (!typeMouvement) return 'Non spécifié';
    
    if (typeof typeMouvement === 'object' && typeMouvement.libelle) {
      return typeMouvement.libelle;
    } else if (typeof typeMouvement === 'object' && typeMouvement.type) {
      return typeMouvement.type;
    } else if (typeof typeMouvement === 'string') {
      return typeMouvement;
    }
    
    return 'Non spécifié';
  };

  // Obtenir les informations précédentes d'un mouvement
  const getPreviousInfo = (mouvement) => {
    if (!mouvement || !mouvement.infosProActuel) {
      return {
        poste: 'Non spécifié',
        departement: 'Non spécifié',
        salaire: 'Non spécifié'
      };
    }
    
    const infosActuel = mouvement.infosProActuel;
    return {
      poste: infosActuel.poste?.nom || 'Non spécifié',
      departement: infosActuel.departement?.nom || 'Non spécifié',
      salaire: infosActuel.salaire || infosActuel.salaireBase || 'Non spécifié'
    };
  };

  // Obtenir les informations actuelles (proposées) d'un mouvement
  const getCurrentInfo = (mouvement) => {
    if (!mouvement || !mouvement.infosProPropose) {
      return {
        poste: 'Non spécifié',
        departement: 'Non spécifié',
        salaire: 'Non spécifié'
      };
    }
    
    const infosPropose = mouvement.infosProPropose;
    return {
      poste: infosPropose.poste?.nom || 'Non spécifié',
      departement: infosPropose.departement?.nom || 'Non spécifié',
      salaire: infosPropose.salaire || infosPropose.salaireBase || 'Non spécifié'
    };
  };

  // Afficher les détails d'un mouvement
  const handleViewDetails = (mouvement) => {
    setSelectedMouvement(mouvement);
    setShowDetailsModal(true);
  };

  // Ouvrir le modal de validation
  const handleOpenValidation = (mouvement) => {
    setSelectedMouvement(mouvement);
    setShowValidationModal(true);
  };

  // Valider un mouvement
  const handleValidateMouvement = async (status, commentaire = '') => {
    if (!selectedMouvement) return;
    
    try {
      const dataToSend = {
        statut: status,
        commentaire: commentaire || `Mouvement ${status === 2 ? 'validé' : 'rejeté'}`,
        dateValidation: new Date().toISOString().split('T')[0]
      };

      console.log("dataToSend : ", dataToSend);
      
      await axiosInstance.put(`/api/mouvements/${selectedMouvement.id}/validation`, dataToSend);
      
      setSuccessMessage(`Mouvement ${status === 2 ? 'validé' : 'rejeté'} avec succès!`);
      fetchMouvementsEmploye(); // Rafraîchir la liste
      setShowValidationModal(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de la validation du mouvement');
      console.error('Erreur:', err);
    }
  };

  // Supprimer un mouvement
  const handleDeleteMouvement = async () => {
    if (!selectedMouvement) return;
    
    try {
      await axiosInstance.delete(`/api/mouvements/${selectedMouvement.id}`);
      setSuccessMessage('Mouvement supprimé avec succès!');
      fetchMouvementsEmploye(); // Rafraîchir la liste
      setShowDeleteModal(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression du mouvement');
      console.error('Erreur:', err);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMouvements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMouvements.length / itemsPerPage) || 1;

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setStatutFilter('all');
    setTypeFilter('all');
  };

  // Statistiques
  const getStats = () => {
    const total = mouvements.length;
    const enAttente = mouvements.filter(m => m && m.statut === 1).length;
    const valides = mouvements.filter(m => m && m.statut === 2).length;
    const appliques = mouvements.filter(m => m && m.statut === 3).length;
    const rejetes = mouvements.filter(m => m && m.statut === 0).length;
    
    return { total, enAttente, valides, appliques, rejetes };
  };

  const stats = getStats();

  // Redirection si pas d'ID
  if (!id) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <h4>Erreur</h4>
          <p>Aucun employé spécifié</p>
          <Button variant="primary" onClick={() => navigate('/api/dashboard-RH/employees')}>
            Retour à la liste des employés
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading || loadingEmploye) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des données...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Fil d'Ariane */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/api/employes' }}>
          <FaUser className="me-1" />
          Employés
        </Breadcrumb.Item>
        {employe && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/api/employes/${id}` }}>
            {employe.nom} {employe.prenom}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>
          <FaHistory className="me-1" />
          Historique des Mouvements
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête avec informations de l'employé */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3 mb-2">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/dashboard-RH/employees/${id}/personnel`)}
              size="sm"
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              Retour à la fiche
            </Button>
            <h1 className="h3 mb-0">Historique des Mouvements</h1>
          </div>
          
          {employe && (
            <Card className="border-0 bg-light">
              <Card.Body className="py-3">
                <Row className="align-items-center">
                  <Col md="auto" className="text-center mb-3 mb-md-0">
                    <div className="bg-primary text-white rounded-circle p-3 d-inline-block">
                      <FaUserCircle size={24} />
                    </div>
                  </Col>
                  <Col>
                    <h5 className="mb-1">
                      {employe.nom} {employe.prenom}
                      {employe.matricule && (
                        <Badge bg="secondary" className="ms-2">
                          {employe.matricule}
                        </Badge>
                      )}
                    </h5>
                    <p className="text-muted mb-0">
                      {employe.infosProfessionnelles?.poste?.nom || 'Poste non défini'} | 
                      {employe.infosProfessionnelles?.departement?.nom || 'Département non défini'}
                    </p>
                  </Col>
                  <Col md="auto">
                    <Button
                      variant="primary"
                      onClick={() => setShowAddModal(true)}
                      className="d-flex align-items-center"
                    >
                      <FaPlus className="me-2" />
                      Nouveau Mouvement
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Messages d'alerte */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="mb-4">
          <FaCheck className="me-2" />
          {successMessage}
        </Alert>
      )}

      {/* Statistiques */}
      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon"><FaList /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon"><FaHistory /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.enAttente}</div>
              <div className="stat-label">En attente</div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon"><FaCheck /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.valides}</div>
              <div className="stat-label">Validés</div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.appliques}</div>
              <div className="stat-label">Appliqués</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Onglets */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="py-3">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
            fill
          >
            <Tab eventKey="all" title={
              <span className="d-flex align-items-center">
                <FaList className="me-2" />
                Tous les mouvements
                <Badge bg="primary" className="ms-2">{stats.total}</Badge>
              </span>
            } />
            <Tab eventKey="validated" title={
              <span className="d-flex align-items-center">
                <FaCheck className="me-2" />
                Mouvements validés
                <Badge bg="success" className="ms-2">{stats.valides}</Badge>
              </span>
            } />
            <Tab eventKey="pending" title={
              <span className="d-flex align-items-center">
                <FaHistory className="me-2" />
                En attente
                <Badge bg="warning" className="ms-2">{stats.enAttente}</Badge>
              </span>
            } />
          </Tabs>
        </Card.Body>
      </Card>

      {/* Filtres et recherche */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par motif, commentaire, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="1">En attente</option>
                <option value="2">Validé</option>
                <option value="3">Appliqué</option>
                <option value="0">Rejeté</option>
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tous les types</option>
                {typesMouvement.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label || 'Non nommé'}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <small className="text-muted">
                {filteredMouvements.length} mouvement{filteredMouvements.length !== 1 ? 's' : ''} trouvé{filteredMouvements.length !== 1 ? 's' : ''}
              </small>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={resetFilters}
                size="sm"
              >
                <FaSync className="me-1" />
                Réinitialiser
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => fetchMouvementsEmploye()}
                size="sm"
              >
                <FaSync className="me-1" />
                Actualiser
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Table des mouvements */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 ps-4">ID</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Précédent</th>
                  <th className="py-3">Actuel</th>
                  <th className="py-3">Motif</th>
                  <th className="py-3">Date Demande</th>
                  <th className="py-3">Statut</th>
                  <th className="py-3 pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <FaHistory size={48} className="text-muted mb-3" />
                      <p className="text-muted">Aucun mouvement trouvé pour cet employé</p>
                      <Button
                        variant="primary"
                        onClick={() => setShowAddModal(true)}
                        className="me-2"
                      >
                        <FaPlus className="me-2" />
                        Créer un premier mouvement
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={resetFilters}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </td>
                  </tr>
                ) : (
                  currentItems.map(mouvement => {
                    const previousInfo = getPreviousInfo(mouvement);
                    const currentInfo = getCurrentInfo(mouvement);
                    
                    return (
                      <tr key={mouvement?.id || Math.random()}>
                        <td className="py-3 ps-4">
                          <small className="fw-bold">{mouvement?.id || 'N/A'}</small>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            {getTypeIcon(mouvement?.typeMouvement)}
                            <span>{getTypeLabel(mouvement?.typeMouvement)}</span>
                          </div>
                        </td>
                        
                        {/* Colonne Précédent */}
                        <td className="py-3">
                          <div className="small">
                            <div className="mb-1">
                              <FaBriefcase className="me-1 text-muted" size={12} />
                              <strong>Poste:</strong> {previousInfo.poste}
                            </div>
                            <div className="mb-1">
                              <FaBuilding className="me-1 text-muted" size={12} />
                              <strong>Dépt:</strong> {previousInfo.departement}
                            </div>
                            <div>
                              <FaCoins className="me-1 text-muted" size={12} />
                              <strong>Salaire:</strong> {formatAmount(previousInfo.salaire)}
                            </div>
                          </div>
                        </td>
                        
                        {/* Colonne Actuel */}
                        <td className="py-3">
                          <div className="small">
                            <div className="mb-1">
                              <FaBriefcase className="me-1 text-success" size={12} />
                              <strong>Poste:</strong> {currentInfo.poste}
                            </div>
                            <div className="mb-1">
                              <FaBuilding className="me-1 text-primary" size={12} />
                              <strong>Dépt:</strong> {currentInfo.departement}
                            </div>
                            <div>
                              <FaCoins className="me-1 text-warning" size={12} />
                              <strong>Salaire:</strong> {formatAmount(currentInfo.salaire)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3">
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {mouvement?.motif || 'Non spécifié'}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt className="text-muted" />
                            {formatDate(mouvement?.dateDemande)}
                          </div>
                        </td>
                        <td className="py-3">
                          {getStatutBadge(mouvement?.statut)}
                        </td>
                        <td className="py-3 pe-4 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {/* Bouton Voir détails - toujours visible */}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(mouvement)}
                              aria-label="Voir détails"
                            >
                              <FaEye />
                            </Button>
                            
                            {/* Bouton Valider - visible uniquement pour statut = 1 (En attente) */}
                            {mouvement?.statut === 1 && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleOpenValidation(mouvement)}
                                  aria-label="Valider"
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleValidateMouvement(0, 'Rejeté par le responsable')}
                                  aria-label="Rejeter"
                                >
                                  <FaTimes />
                                </Button>
                              </>
                            )}
                            
                            {/* Bouton Supprimer - visible pour statut = 2 (Validé) ou 3 (Appliqué) */}
                            {(mouvement?.statut === 2 || mouvement?.statut === 3) && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedMouvement(mouvement);
                                  setShowDeleteModal(true);
                                }}
                                aria-label="Supprimer"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredMouvements.length > 0 && (
            <div className="border-top px-4 py-3">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      style={{ width: 'auto' }}
                      size="sm"
                    >
                      <option value={5}>5 par page</option>
                      <option value={10}>10 par page</option>
                      <option value={20}>20 par page</option>
                      <option value={50}>50 par page</option>
                    </Form.Select>
                    <small className="text-muted">
                      Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredMouvements.length)} sur {filteredMouvements.length}
                    </small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-md-end">
                    <Pagination className="mb-0">
                      <Pagination.First 
                        onClick={() => setCurrentPage(1)} 
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                      />
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last 
                        onClick={() => setCurrentPage(totalPages)} 
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Détails du Mouvement */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaEye className="me-2" />
            Détails du Mouvement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMouvement ? (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label text-muted">ID Mouvement</label>
                  <p className="fw-bold">{selectedMouvement.id || 'N/A'}</p>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">Type de Mouvement</label>
                  <div className="d-flex align-items-center gap-2">
                    {getTypeIcon(selectedMouvement.typeMouvement)}
                    <span className="fw-medium">{getTypeLabel(selectedMouvement.typeMouvement)}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">Motif</label>
                  <p>{selectedMouvement.motif || 'Non spécifié'}</p>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">Commentaire</label>
                  <div className="p-3 bg-light rounded">
                    {selectedMouvement.commentaire || 'Aucun commentaire'}
                  </div>
                </div>
              </Col>
              
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label text-muted">Statut</label>
                  <div className="mb-2">{getStatutBadge(selectedMouvement.statut)}</div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">Comparaison</label>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <Row>
                        <Col md={6}>
                          <h6 className="text-muted mb-3">
                            <FaArrowLeft className="me-2" />
                            Précédent
                          </h6>
                          {(() => {
                            const previousInfo = getPreviousInfo(selectedMouvement);
                            return (
                              <div className="small">
                                <div className="mb-2">
                                  <FaBriefcase className="me-2 text-muted" size={14} />
                                  <strong>Poste:</strong> {previousInfo.poste}
                                </div>
                                <div className="mb-2">
                                  <FaBuilding className="me-2 text-muted" size={14} />
                                  <strong>Département:</strong> {previousInfo.departement}
                                </div>
                                <div>
                                  <FaCoins className="me-2 text-muted" size={14} />
                                  <strong>Salaire:</strong> {formatAmount(previousInfo.salaire)}
                                </div>
                              </div>
                            );
                          })()}
                        </Col>
                        <Col md={6}>
                          <h6 className="text-success mb-3">
                            <FaArrowRight className="me-2" />
                            Actuel
                          </h6>
                          {(() => {
                            const currentInfo = getCurrentInfo(selectedMouvement);
                            return (
                              <div className="small">
                                <div className="mb-2">
                                  <FaBriefcase className="me-2 text-success" size={14} />
                                  <strong>Poste:</strong> {currentInfo.poste}
                                </div>
                                <div className="mb-2">
                                  <FaBuilding className="me-2 text-primary" size={14} />
                                  <strong>Département:</strong> {currentInfo.departement}
                                </div>
                                <div>
                                  <FaCoins className="me-2 text-warning" size={14} />
                                  <strong>Salaire:</strong> {formatAmount(currentInfo.salaire)}
                                </div>
                              </div>
                            );
                          })()}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">Dates</label>
                  <div>
                    <small className="d-block">
                      <FaCalendarAlt className="me-2 text-muted" />
                      <strong>Demande:</strong> {formatDate(selectedMouvement.dateDemande)}
                    </small>
                    <small className="d-block mt-1">
                      <FaCalendarAlt className="me-2 text-muted" />
                      <strong>Validation:</strong> {formatDate(selectedMouvement.dateValidation) || 'Non validé'}
                    </small>
                    <small className="d-block mt-1">
                      <FaCalendarAlt className="me-2 text-muted" />
                      <strong>Création:</strong> {formatDate(selectedMouvement.createdAt, true)}
                    </small>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">Aucune donnée disponible</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
          {selectedMouvement?.statut === 1 && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowDetailsModal(false);
                handleOpenValidation(selectedMouvement);
              }}
            >
              <FaCheck className="me-2" />
              Valider ce mouvement
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Validation */}
      <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)}>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FaClipboardCheck className="me-2" />
            Validation du Mouvement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMouvement ? (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Mouvement à valider:</strong> {getTypeLabel(selectedMouvement.typeMouvement)}
                <br />
                <strong>Employé concerné:</strong> {employe?.nom || ''} {employe?.prenom || ''}
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Commentaire (optionnel)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ajouter un commentaire pour la validation..."
                  id="validationComment"
                />
              </Form.Group>
              
              <div className="alert alert-warning">
                <small>
                  <FaHistory className="me-2" />
                  Cette action est définitive. Une fois validé, le mouvement pourra être appliqué.
                </small>
              </div>
            </>
          ) : (
            <p className="text-muted">Aucun mouvement sélectionné</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowValidationModal(false)}>
            Annuler
          </Button>
          {selectedMouvement && (
            <>
              <Button 
                variant="danger" 
                onClick={() => {
                  const comment = document.getElementById('validationComment')?.value;
                  handleValidateMouvement(0, comment);
                }}
              >
                <FaTimes className="me-2" />
                Rejeter
              </Button>
              <Button 
                variant="success" 
                onClick={() => {
                  const comment = document.getElementById('validationComment')?.value;
                  handleValidateMouvement(2, comment);
                }}
              >
                <FaCheck className="me-2" />
                Valider
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaTrash className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMouvement ? (
            <>
              <Alert variant="danger" className="mb-3">
                <strong>Attention:</strong> Vous êtes sur le point de supprimer définitivement ce mouvement.
              </Alert>
              
              <p className="mb-0">
                Êtes-vous sûr de vouloir supprimer le mouvement <strong>{selectedMouvement.id}</strong> ?
                <br />
                <small className="text-muted">
                  Type: {getTypeLabel(selectedMouvement.typeMouvement)} | 
                  Date: {formatDate(selectedMouvement.dateDemande)}
                </small>
              </p>
            </>
          ) : (
            <p className="text-muted">Aucun mouvement sélectionné</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          {selectedMouvement && (
            <Button variant="danger" onClick={handleDeleteMouvement}>
              <FaTrash className="me-2" />
              Supprimer définitivement
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Ajout de mouvement */}
      <AddMouvementModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        employeId={id}
        employeNom={employe?.nom}
        employePrenom={employe?.prenom}
        onSuccess={(nouveauMouvement) => {
          setSuccessMessage('Mouvement créé avec succès!');
          fetchMouvementsEmploye(); // Rafraîchir la liste
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />

      {/* Styles CSS */}
      <style>{`
        .table th {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          color: #5c2458;
        }
        
        .table td {
          vertical-align: middle;
        }
        
        .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }
        
        .breadcrumb {
          background-color: transparent;
          padding: 0;
        }
        
        .breadcrumb-item a {
          text-decoration: none;
          color: #b053ad;
        }
        
        .breadcrumb-item.active {
          color: #5c2458;
        }
        
        .nav-tabs .nav-link {
          font-weight: 500;
        }
        
        .nav-tabs .nav-link.active {
          font-weight: 600;
        }
      `}</style>
    </Container>
  );
};

export default MouvementsEmploye;