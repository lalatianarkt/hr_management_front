// src/pages/RH/Mouvements/MouvementsEmploye.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Pagination,
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
  FaInfoCircle,
  FaDotCircle
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
  const [showFilters, setShowFilters] = useState(false);
  
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
  const [activeTab, setActiveTab] = useState('all');

  // Charger les données initiales
  useEffect(() => {
    if (id) {
      fetchEmploye();
      fetchMouvementsEmploye();
      fetchTypesMouvement();
    }
  }, [id]);

  // Charger les mouvements de l'employé spécifique
  const fetchMouvementsEmploye = useCallback(async () => {
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
  }, [id]);

  // Charger les informations de l'employé
  const fetchEmploye = useCallback(async () => {
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
  }, [id]);

  // Charger les types de mouvement
  const fetchTypesMouvement = useCallback(async () => {
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
  }, []);

  // Filtrer les mouvements
  useEffect(() => {
    let result = [...mouvements];
    
    // Filtrer par onglet
    if (activeTab === 'validated') {
      result = result.filter(mvt => mvt && mvt.statut === 2);
    } else if (activeTab === 'pending') {
      result = result.filter(mvt => mvt && mvt.statut === 1);
    } else if (activeTab === 'applied') {
      result = result.filter(mvt => mvt && mvt.statut === 3);
    } else if (activeTab === 'rejected') {
      result = result.filter(mvt => mvt && mvt.statut === 0);
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
    if (statutFilter !== 'all' && activeTab === 'all') {
      const statutValue = parseInt(statutFilter);
      result = result.filter(mvt => mvt && mvt.statut === statutValue);
    }
    
    // Filtrer par type
    if (typeFilter !== 'all') {
      result = result.filter(mvt => mvt && mvt.typeMouvement?.id === parseInt(typeFilter));
    }
    
    setFilteredMouvements(result);
    setCurrentPage(1);
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
      case 1:
        return <Badge bg="warning" className="px-3 py-2">En attente</Badge>;
      case 2:
        return <Badge bg="success" className="px-3 py-2">Validé</Badge>;
      case 3:
        return <Badge bg="info" className="px-3 py-2">Appliqué</Badge>;
      case 0:
        return <Badge bg="danger" className="px-3 py-2">Rejeté</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2">Inconnu ({statut})</Badge>;
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
        commentaire: commentaire || `Mouvement ${status === 2 ? 'validé' : status === 0 ? 'rejeté' : 'mis à jour'}`,
        dateValidation: new Date().toISOString().split('T')[0]
      };

      console.log("dataToSend : ", dataToSend);
      
      await axiosInstance.put(`/api/mouvements/${selectedMouvement.id}/validation`, dataToSend);
      
      setSuccessMessage(`Mouvement ${status === 2 ? 'validé' : status === 0 ? 'rejeté' : 'mis à jour'} avec succès!`);
      await fetchMouvementsEmploye();
      setShowValidationModal(false);
      setSelectedMouvement(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de la validation du mouvement');
      console.error('Erreur:', err);
    }
  };

  // Appliquer un mouvement validé
  const handleApplyMouvement = async (mouvement) => {
    if (!mouvement || mouvement.statut !== 2) return;
    
    try {
      await axiosInstance.post(`/api/mouvements/${mouvement.id}/apply`);
      setSuccessMessage('Mouvement appliqué avec succès!');
      await fetchMouvementsEmploye();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'application du mouvement');
      console.error('Erreur:', err);
    }
  };

  // Supprimer un mouvement
  const handleDeleteMouvement = async () => {
    if (!selectedMouvement) return;
    
    try {
      await axiosInstance.delete(`/api/mouvements/${selectedMouvement.id}`);
      setSuccessMessage('Mouvement supprimé avec succès!');
      await fetchMouvementsEmploye();
      setShowDeleteModal(false);
      setSelectedMouvement(null);
      
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
  const stats = useMemo(() => {
    const total = mouvements.length;
    const enAttente = mouvements.filter(m => m && m.statut === 1).length;
    const valides = mouvements.filter(m => m && m.statut === 2).length;
    const appliques = mouvements.filter(m => m && m.statut === 3).length;
    const rejetes = mouvements.filter(m => m && m.statut === 0).length;
    
    return { total, enAttente, valides, appliques, rejetes };
  }, [mouvements]);

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
      {/* Styles CSS améliorés */}
      <style>{`
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 1rem;
          color: white;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .stat-card .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }
        
        .stat-card .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          line-height: 1;
        }
        
        .stat-card .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .table th {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          color: #4a5568;
          background-color: #f7fafc;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .table td {
          vertical-align: middle;
          font-size: 0.9rem;
        }
        
        .table-hover tbody tr:hover {
          background-color: #f7fafc;
          transition: background-color 0.2s ease;
        }
        
        .badge {
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-weight: 500;
        }
        
        .nav-tabs {
          border-bottom: 2px solid #e2e8f0;
        }
        
        .nav-tabs .nav-link {
          font-weight: 600;
          color: #4a5568;
          border: none;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s ease;
        }
        
        .nav-tabs .nav-link:hover {
          color: #667eea;
          border: none;
        }
        
        .nav-tabs .nav-link.active {
          color: #667eea;
          border: none;
          border-bottom: 3px solid #667eea;
          background: transparent;
        }
        
        .btn-new-mouvement {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 0.5rem 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .btn-new-mouvement:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-new-mouvement .icon-plus {
          color: #fff;
          margin-right: 8px;
          font-size: 24px;
          font-weight: 900;
          line-height: 1;
          display: inline-block;
        }
        
        .card {
          border-radius: 15px;
          overflow: hidden;
        }
        
        .filter-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          padding: 1.5rem;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      {/* En-tête avec informations de l'employé */}
      <Row className="mb-4 align-items-start fade-in">
        <Col>
          <div className="d-flex align-items-center gap-3 mb-3">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/dashboard-RH/employees/${id}/personnel`)}
              className="d-flex align-items-center rounded-pill"
            >
              <FaArrowLeft className="me-2" />
              Retour à la fiche
            </Button>
            <div>
              <h1 className="h3 mb-0 fw-bold">Historique des Mouvements</h1>
              <p className="text-muted mb-0 mt-1">
                <FaHistory className="me-1" size={12} />
                Suivi des changements de poste, département et salaire
              </p>
            </div>
          </div>
          
          <div className="d-flex justify-content-end mb-2">
            <Button
              variant="outline-secondary"
              onClick={() => setShowFilters((prev) => !prev)}
              className="rounded-pill shadow-sm"
            >
              <FaFilter className="me-2" />
              Filtres
            </Button>
          </div>

          {employe && (() => {
            const infosArray = Array.isArray(employe.infosProfessionnelles)
              ? employe.infosProfessionnelles
              : [];
            const currentInfo =
              infosArray.find((info) => info?.statut === 0) ||
              infosArray[infosArray.length - 1] ||
              null;
            const posteNom = currentInfo?.poste?.nom || 'Poste non défini';
            const departementNom =
              currentInfo?.departement?.nom ||
              currentInfo?.poste?.departement?.nom ||
              'Département non défini';

            return (
              <Card className="border-0 shadow-lg rounded-4 mt-3 w-100" style={{ width: "100%" }}>
                <Card.Body className="py-3">
                  <Row className="align-items-center">
                    <Col md="auto" className="text-center mb-3 mb-md-0">
                      <div className="bg-gradient-primary text-white rounded-circle p-3 d-inline-block shadow">
                        <FaUserCircle size={32} />
                      </div>
                    </Col>
                    <Col>
                      <h5 className="mb-1 fw-bold">
                        {employe.nom} {employe.prenom}
                        {employe.matricule && (
                          <Badge bg="secondary" className="ms-2">
                            <FaIdCard className="me-1" size={10} />
                            {employe.matricule}
                          </Badge>
                        )}
                      </h5>
                      <p className="text-muted mb-0">
                        <FaBriefcase className="me-1" size={12} />
                        {posteNom} | 
                        <FaBuilding className="ms-2 me-1" size={12} />
                        {departementNom}
                      </p>
                    </Col>
                    <Col md="auto">
                      <Button
                        variant="primary"
                        onClick={() => setShowAddModal(true)}
                        className="btn-new-mouvement rounded-pill"
                      >
                        <span className="icon-plus">+</span>
                        Nouveau Mouvement
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })()}
        </Col>
      </Row>

      {/* Messages d'alerte */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4 rounded-3 fade-in">
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')} className="mb-4 rounded-3 fade-in">
          <FaCheck className="me-2" />
          {successMessage}
        </Alert>
      )}

      {/* Onglets améliorés */}
      <Card className="mb-4 border-0 shadow-sm rounded-4 fade-in">
        <Card.Body className="py-3">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              resetFilters();
            }}
            className="mb-0"
          >
            <Tab eventKey="all" title={
              <span className="d-flex align-items-center">
                <FaList className="me-2" />
                Tous
                <Badge bg="primary" className="ms-2 rounded-pill">{stats.total}</Badge>
              </span>
            } />
            <Tab eventKey="pending" title={
              <span className="d-flex align-items-center">
                <FaHistory className="me-2" />
                En attente
                <Badge bg="warning" className="ms-2 rounded-pill">{stats.enAttente}</Badge>
              </span>
            } />
            <Tab eventKey="validated" title={
              <span className="d-flex align-items-center">
                <FaCheck className="me-2" />
                Validés
                <Badge bg="success" className="ms-2 rounded-pill">{stats.valides}</Badge>
              </span>
            } />
            <Tab eventKey="applied" title={
              <span className="d-flex align-items-center">
                <FaCheckCircle className="me-2" />
                Appliqués
                <Badge bg="info" className="ms-2 rounded-pill">{stats.appliques}</Badge>
              </span>
            } />
            <Tab eventKey="rejected" title={
              <span className="d-flex align-items-center">
                <FaTimes className="me-2" />
                Rejetés
                <Badge bg="danger" className="ms-2 rounded-pill">{stats.rejetes}</Badge>
              </span>
            } />
          </Tabs>
        </Card.Body>
      </Card>

      {/* Filtres et recherche améliorés */}
      {showFilters && (
      <Card className="mb-4 border-0 shadow-sm rounded-4 fade-in">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                <InputGroup.Text className="bg-white border-0">
                  <FaSearch className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par motif, commentaire ou type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0"
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="rounded-pill shadow-sm"
                disabled={activeTab !== 'all'}
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
                className="rounded-pill shadow-sm"
              >
                <option value="all">Tous les types</option>
                {typesMouvement.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label || 'Non nommé'}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={1}>
              <Button
                variant="outline-secondary"
                onClick={resetFilters}
                className="w-100 rounded-pill shadow-sm"
              >
                <FaSync />
              </Button>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <Badge bg="light" text="dark" className="rounded-pill">
                <FaFilter className="me-1" size={10} />
                {filteredMouvements.length} mouvement{filteredMouvements.length !== 1 ? 's' : ''} trouvé{filteredMouvements.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="link"
              onClick={() => fetchMouvementsEmploye()}
              className="text-decoration-none"
              size="sm"
            >
              <FaSync className="me-1" />
              Actualiser
            </Button>
          </div>
        </Card.Body>
      </Card>
      )}

      {/* Table des mouvements améliorée */}
      <Card className="border-0 shadow-sm rounded-4 fade-in overflow-hidden">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th className="py-3 ps-4">ID</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Poste précédent</th>
                  <th className="py-3">Poste proposé</th>
                  <th className="py-3">Date demande</th>
                  <th className="py-3">Statut</th>
                  <th className="py-3 pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaHistory size={48} className="text-muted mb-3 opacity-50" />
                      <p className="text-muted mb-3">Aucun mouvement trouvé pour cet employé</p>
                      <Button
                        variant="primary"
                        onClick={() => setShowAddModal(true)}
                        className="me-2 rounded-pill"
                      >
                        <FaPlus className="me-2" />
                        Créer un premier mouvement
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={resetFilters}
                        className="rounded-pill"
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
                      <tr key={mouvement?.id || Math.random()} className="align-middle">
                        <td className="py-3 ps-4">
                          <code className="fw-bold">#{mouvement?.id || 'N/A'}</code>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            {getTypeIcon(mouvement?.typeMouvement)}
                            <span className="fw-medium">{getTypeLabel(mouvement?.typeMouvement)}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="mb-1">
                              <FaBriefcase className="me-1 text-muted" size={12} />
                              <span className="small">{previousInfo.poste}</span>
                            </div>
                            {previousInfo.salaire !== 'Non spécifié' && (
                              <div>
                                <FaCoins className="me-1 text-muted" size={12} />
                                <span className="small">{formatAmount(previousInfo.salaire)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="mb-1">
                              <FaBriefcase className="me-1 text-success" size={12} />
                              <span className="small fw-medium text-success">{currentInfo.poste}</span>
                            </div>
                            {currentInfo.salaire !== 'Non spécifié' && (
                              <div>
                                <FaCoins className="me-1 text-warning" size={12} />
                                <span className="small">{formatAmount(currentInfo.salaire)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <FaCalendarAlt className="text-muted" size={12} />
                            <span className="small">{formatDate(mouvement?.dateDemande)}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          {getStatutBadge(mouvement?.statut)}
                        </td>
                        <td className="py-3 pe-4">
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(mouvement)}
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', padding: 0 }}
                              title="Voir détails"
                            >
                              <FaEye size={14} />
                            </Button>
                            
                            {mouvement?.statut === 1 && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleOpenValidation(mouvement)}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                  title="Valider"
                                >
                                  <FaCheck size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleValidateMouvement(0, 'Rejeté par le responsable')}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                  title="Rejeter"
                                >
                                  <FaTimes size={14} />
                                </Button>
                              </>
                            )}
                            
                            {mouvement?.statut === 2 && (
                              <>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => handleApplyMouvement(mouvement)}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                  title="Appliquer"
                                >
                                  <FaCheckCircle size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMouvement(mouvement);
                                    setShowDeleteModal(true);
                                  }}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                  title="Supprimer"
                                >
                                  <FaTrash size={14} />
                                </Button>
                              </>
                            )}
                            
                            {mouvement?.statut === 3 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedMouvement(mouvement);
                                  setShowDeleteModal(true);
                                }}
                                className="rounded-circle"
                                style={{ width: '32px', height: '32px', padding: 0 }}
                                title="Supprimer"
                              >
                                <FaTrash size={14} />
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
          
          {/* Pagination améliorée */}
          {filteredMouvements.length > 0 && (
            <div className="border-top px-4 py-3 bg-light">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      style={{ width: 'auto' }}
                      size="sm"
                      className="rounded-pill"
                    >
                      <option value={5}>5 par page</option>
                      <option value={10}>10 par page</option>
                      <option value={20}>20 par page</option>
                      <option value={50}>50 par page</option>
                    </Form.Select>
                    <small className="text-muted">
                      {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMouvements.length)} sur {filteredMouvements.length}
                    </small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-md-end">
                    <Pagination className="mb-0">
                      <Pagination.First 
                        onClick={() => setCurrentPage(1)} 
                        disabled={currentPage === 1}
                        className="rounded-circle mx-1"
                      />
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        className="rounded-circle mx-1"
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
                            className="rounded-circle mx-1"
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                        className="rounded-circle mx-1"
                      />
                      <Pagination.Last 
                        onClick={() => setCurrentPage(totalPages)} 
                        disabled={currentPage === totalPages}
                        className="rounded-circle mx-1"
                      />
                    </Pagination>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Détails du Mouvement - Gardé identique mais avec style amélioré */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-gradient-primary text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Modal.Title>
            <FaEye className="me-2" />
            Détails du Mouvement #{selectedMouvement?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedMouvement ? (
            <Row>
              <Col md={6}>
                <div className="mb-4">
                  <label className="text-muted small text-uppercase fw-bold mb-2">Type de Mouvement</label>
                  <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                    {getTypeIcon(selectedMouvement.typeMouvement)}
                    <span className="fw-bold fs-5">{getTypeLabel(selectedMouvement.typeMouvement)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="text-muted small text-uppercase fw-bold mb-2">Motif</label>
                  <div className="p-3 bg-light rounded-3">
                    {selectedMouvement.motif || 'Non spécifié'}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="text-muted small text-uppercase fw-bold mb-2">Commentaire</label>
                  <div className="p-3 bg-light rounded-3">
                    {selectedMouvement.commentaire || 'Aucun commentaire'}
                  </div>
                </div>
              </Col>
              
              <Col md={6}>
                <div className="mb-4">
                  <label className="text-muted small text-uppercase fw-bold mb-2">Statut</label>
                  <div>{getStatutBadge(selectedMouvement.statut)}</div>
                </div>
                
                <div className="mb-4">
                  <label className="text-muted small text-uppercase fw-bold mb-2">Comparaison</label>
                  <Card className="border-0 shadow-sm rounded-3">
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
                            Proposé
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
                
                <div className="mb-4">
                  <label className="text-muted small text-uppercase fw-bold mb-2">Dates importantes</label>
                  <div className="p-3 bg-light rounded-3">
                    <div className="mb-2">
                      <FaCalendarAlt className="me-2 text-muted" size={12} />
                      <strong>Demande:</strong> {formatDate(selectedMouvement.dateDemande, true)}
                    </div>
                    <div className="mb-2">
                      <FaCalendarAlt className="me-2 text-muted" size={12} />
                      <strong>Validation:</strong> {formatDate(selectedMouvement.dateValidation, true) || 'Non validé'}
                    </div>
                    <div>
                      <FaCalendarAlt className="me-2 text-muted" size={12} />
                      <strong>Création:</strong> {formatDate(selectedMouvement.createdAt, true)}
                    </div>
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
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)} className="rounded-pill">
            Fermer
          </Button>
          {selectedMouvement?.statut === 1 && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowDetailsModal(false);
                handleOpenValidation(selectedMouvement);
              }}
              className="rounded-pill"
            >
              <FaCheck className="me-2" />
              Valider ce mouvement
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Validation - Gardé identique */}
      <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)} centered>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>
            <FaClipboardCheck className="me-2" />
            Validation du Mouvement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMouvement ? (
            <>
              <Alert variant="info" className="mb-3 rounded-3">
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" size={20} />
                  <div>
                    <strong>Mouvement à valider:</strong> {getTypeLabel(selectedMouvement.typeMouvement)}
                    <br />
                    <small>Employé concerné: {employe?.nom || ''} {employe?.prenom || ''}</small>
                  </div>
                </div>
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Commentaire (optionnel)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ajouter un commentaire pour la validation..."
                  id="validationComment"
                  className="rounded-3"
                />
              </Form.Group>
              
              <div className="alert alert-warning rounded-3">
                <FaHistory className="me-2" />
                <small>Cette action est définitive. Une fois validé, le mouvement pourra être appliqué.</small>
              </div>
            </>
          ) : (
            <p className="text-muted">Aucun mouvement sélectionné</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowValidationModal(false)} className="rounded-pill">
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
                className="rounded-pill"
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
                className="rounded-pill"
              >
                <FaCheck className="me-2" />
                Valider
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Suppression - Gardé identique */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaTrash className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMouvement ? (
            <>
              <Alert variant="danger" className="mb-3 rounded-3">
                <strong>Attention:</strong> Cette action est irréversible.
              </Alert>
              
              <p className="mb-0">
                Êtes-vous sûr de vouloir supprimer le mouvement <strong>#{selectedMouvement.id}</strong> ?
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
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="rounded-pill">
            Annuler
          </Button>
          {selectedMouvement && (
            <Button variant="danger" onClick={handleDeleteMouvement} className="rounded-pill">
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
        onSuccess={async (nouveauMouvement) => {
          setSuccessMessage('Mouvement créé avec succès!');
          await fetchMouvementsEmploye();
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />
    </Container>
  );
};

export default MouvementsEmploye;
