// src/pages/RH/Paie/NouvelleEditionPaie.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockFill, Calendar2Month, PiggyBank, CreditCard2Front, Receipt, ArrowLeft } from 'react-bootstrap-icons';
import { 
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Badge,
  Form,
  InputGroup,
  Pagination,
  Modal,
  Breadcrumb
} from 'react-bootstrap';
import {
  Search,
  User,
  Briefcase,
  Award,
  FileText,
  CheckCircle,
  BarChart2,
  Plus,
  XCircle,
  Hash,
  Calendar,
  Filter,
  X,
  Home,
  Users,
  DollarSign,
  Clock
} from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance';

// Modals
import RubriqueModal from '../rubrique/RubriqueList';
import ClotureModal from '../cloture/ClotureModal';
import AddPeriodePaieModal from '../periode/AddPeriodeModal';

function NouvelleEditionPaie() {
  const navigate = useNavigate();
  
  // États pour les données
  const [employesPaie, setEmployesPaie] = useState([]);
  const [stats, setStats] = useState({ inactif: 0, enAttente: 0, actif: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // État pour la Période active
  const [periodeActive, setPeriodeActive] = useState(null);
  const [loadingPeriode, setLoadingPeriode] = useState(false);
  
  // États pour les modals
  const [showClotureModal, setShowClotureModal] = useState(false);
  const [showAddPeriodeModal, setShowAddPeriodeModal] = useState(false);
  const [showRubriquesModal, setShowRubriquesModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState(null);
  const [selectedEmployeForRubriques, setSelectedEmployeForRubriques] = useState(null);
  
  // États pour la sélection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // État pour le filtre par état
  const [etatFiltre, setEtatFiltre] = useState(null);
  
  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  
  // États pour la pagination côté client
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [3, 5, 10, 25, 50];
  
  // Navigation
  const goToPeriodesPaie = () => {
    navigate('/dashboard-RH/paie/periodes');
  };

  const goBack = () => {
    navigate(-1);
  };

  // Charger les données au montage
  useEffect(() => {
    fetchDonnees();
    fetchPeriodeActive();
  }, []);

  // Mettre à jour les employés filtrés
  useEffect(() => {
    filterEmployes();
  }, [employesPaie, searchTerm, etatFiltre]);

  // Mettre à jour selectAll
  useEffect(() => {
    if (filteredEmployes.length > 0) {
      const allIds = filteredEmployes
        .map(emp => emp.employeAvecInfosDTO?.employe?.id)
        .filter(id => id);
      
      const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedIds, filteredEmployes]);

  const fetchDonnees = async () => {
    setLoading(true);
    setError('');
    
    try {
      const employesResponse = await axiosInstance.get('/api/employes-paie');
      setEmployesPaie(employesResponse.data || []);
      
      const statsResponse = await axiosInstance.get('/api/employes-paie/employes-paie/stats');
      setStats(statsResponse.data || { inactif: 0, enAttente: 0, actif: 0 });
      
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodeActive = async () => {
    setLoadingPeriode(true);
    try {
      const response = await axiosInstance.get('/api/periodes-paie/actif');
      console.log("periode actif : ", response.data);
      setPeriodeActive(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de la Période active:', err);
      setPeriodeActive(null);
    } finally {
      setLoadingPeriode(false);
    }
  };

  const filterEmployes = () => {
    let filtered = [...employesPaie];
    
    if (etatFiltre !== null) {
      filtered = filtered.filter(emp => emp.etat === etatFiltre);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => {
        const employe = emp.employeAvecInfosDTO?.employe || {};
        const infos = emp.employeAvecInfosDTO?.infosProfessionnelles?.[0] || {};
        
        return (
          (infos.matricule && infos.matricule.toLowerCase().includes(term)) ||
          (employe.nom && employe.nom.toLowerCase().includes(term)) ||
          (employe.prenom && employe.prenom.toLowerCase().includes(term)) ||
          (infos.poste?.nom && infos.poste.nom.toLowerCase().includes(term)) ||
          (infos.departement?.nom && infos.departement.nom.toLowerCase().includes(term))
        );
      });
    }
    
    setFilteredEmployes(filtered);
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setEtatFiltre(null);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      const allIds = filteredEmployes
        .map(emp => emp.employeAvecInfosDTO?.employe?.id)
        .filter(id => id);
      
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleRowClick = (emp) => {
    const employe = emp.employeAvecInfosDTO?.employe || {};
    setSelectedEmployeForRubriques({
      id: employe.id,
      nom: employe.nom,
      prenom: employe.prenom
    });
    setShowRubriquesModal(true);
  };

  const openGenerateModal = () => {
    if (!periodeActive) {
      alert('Aucune Période active trouvée. Veuillez d\'abord créer une Période.');
      return;
    }
    
    const eligibleIds = selectedIds.filter(id => {
      const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
      return emp && emp.etat !== 2;
    });
    
    if (eligibleIds.length === 0) {
      alert('Aucun employé éligible sélectionné (les employés avec paie déjà généré ne peuvent pas avoir de nouvelle génération).');
      return;
    }
    
    if (eligibleIds.length < selectedIds.length) {
      const actifsCount = selectedIds.length - eligibleIds.length;
      alert(`${actifsCount} employé(s) avec paie déjà généré ont été retirés de la sélection pour la génération.`);
      setSelectedIds(eligibleIds);
    }
    
    setGenerateResult(null);
    setShowGenerateModal(true);
  };

  const handleCloseGenerateModal = (shouldDeselect = false) => {
    setShowGenerateModal(false);
    setGenerateResult(null);
    
    if (shouldDeselect) {
      setSelectedIds([]);
    }
  };

  const handleGeneratePaie = async () => {
    if (!periodeActive) {
      alert('Aucune Période active disponible');
      return;
    }

    setGenerating(true);
    setGenerateResult(null);
    
    try {
      const les_paies = selectedIds.map(employeId => {
        const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === employeId);
        const infos = emp?.employeAvecInfosDTO?.infosProfessionnelles?.[0] || {};
        const employe = emp?.employeAvecInfosDTO?.employe || {};
        
          return {
            modePaiement: "Virement bancaire",
            datePaiement: new Date().toISOString().split('T')[0],
            classification: infos.classification || "Normale",
            matricule: infos.matricule ? parseInt(infos.matricule) : null,
            nom: employe.nom || '',
            prenom: employe.prenom || '',
            fonction: infos.poste?.nom || '',
          salaireBase: null,
          numCnaps: null,
          ancienneteAnMoisJour: '',
          departement: infos.departement?.nom || infos.poste?.departement?.nom || '',
          congesPris: 0,
          soldeConges: 0,
          statutCloture: 0,
          employe: { id: employeId }
        };
      });

      const requestData = {
        periode: {
          id: periodeActive.id,
          dateDebut: periodeActive.dateDebut,
          dateFin: periodeActive.dateFin,
          statut: periodeActive.statut,
          mois: periodeActive.mois,
          annee: periodeActive.annee,
          createdAt: periodeActive.createdAt
        },
        les_paies: les_paies
      };

      console.log("Données envoyées:", requestData);
      
      const response = await axiosInstance.post('/api/paies/generer-multiples', requestData);

      if (response.data) {
        setGenerateResult(response.data);
        
        if (response.data.success) {
          setTimeout(() => {
            handleCloseGenerateModal(true);
            fetchDonnees();
            fetchPeriodeActive();
          }, 3000);
        }
      }
    } catch (err) {
      console.error(err);
      
      let errorMessage = 'Erreur lors de la génération des paies.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      }
      
      setGenerateResult({
        success: false,
        message: errorMessage,
        error: err
      });
    } finally {
      setGenerating(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployes.length / itemsPerPage);
  const totalEmployesStat = stats.inactif + stats.enAttente + stats.actif;
  const generatedCount = stats.actif;
  const remainingCount = Math.max(totalEmployesStat - generatedCount, 0);
  const progressPercent = totalEmployesStat > 0
    ? Math.round((generatedCount / totalEmployesStat) * 100)
    : 0;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getEtatBadge = (etat) => {
    const map = {
      0: { label: 'Période inactive', color: '#dc3545', bg: 'rgba(220, 53, 69, 0.12)', border: 'rgba(220, 53, 69, 0.25)' },
      1: { label: 'En attente', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.12)', border: 'rgba(255, 152, 0, 0.28)' },
      2: { label: 'Paie générée', color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.12)', border: 'rgba(46, 125, 50, 0.28)' }
    };

    const current = map[etat] || { label: 'Inconnu', color: '#6c757d', bg: 'rgba(108, 117, 125, 0.12)', border: 'rgba(108, 117, 125, 0.28)' };

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: current.color,
          background: current.bg,
          border: `1px solid ${current.border}`,
          whiteSpace: 'nowrap'
        }}
        title={current.label}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: current.color,
            display: 'inline-block'
          }}
        />
        {current.label}
      </span>
    );
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= 1) return items;
    
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) items.push(<Pagination.Ellipsis key="ellipsis-start" />);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      items.push(
        <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    return items;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des données de paie...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Styles CSS */}
      <style>
        {`
          .stat-card-hover {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .stat-card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          }
        `}
      </style>

      {/* En-tête principal (style demandé) */}
      <Card
        className="mb-4 border-0"
        style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          boxShadow: '0 12px 28px rgba(92, 36, 88, 0.12)'
        }}
      >
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col xs={12} md={8}>
              <h2 className="mb-1" style={{ fontWeight: 800, color: '#3a1438' }}>
                Édition de la paie – {periodeActive?.mois?.nom || 'Période'} {periodeActive?.annee || ''}
              </h2>
              <div style={{ color: '#5c2458' }}>
                Suivi de la génération et validation des <strong>fiches de paie</strong>
              </div>
            </Col>

            <Col xs={12} md={4} className="text-md-end">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <Button
                  variant="primary"
                  onClick={goToPeriodesPaie}
                  className="d-flex align-items-center gap-2 rounded-pill px-3"
                  style={{ fontWeight: 600, background: '#b053ad', borderColor: '#b053ad', color: '#ffffff' }}
                >
                  <Calendar2Month size={16} color="#ffffff" />
                  Périodes
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowClotureModal(true)}
                  className="d-flex align-items-center gap-2 rounded-pill px-3"
                  style={{ fontWeight: 600 }}
                >
                  <LockFill size={14} />
                  Clôture
                </Button>
              </div>
            </Col>
          </Row>

          <div
            className="mt-3 p-3"
            style={{
              background: '#faf5fa',
              borderRadius: '14px',
              border: '1px solid #f0d9ef'
            }}
          >
            <Row className="align-items-center g-3">
              <Col xs={12} md={7}>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#b053ad' }} />
                    <strong style={{ color: '#3a1438' }}>Période :</strong>
                    <span style={{ color: '#5c2458' }}>
                      {periodeActive?.mois?.nom || '—'} {periodeActive?.annee || ''}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2e7d32' }} />
                    <strong style={{ color: '#3a1438' }}>Statut :</strong>
                    <span style={{ color: '#5c2458' }}>
                      En cours ({generatedCount} / {totalEmployesStat} employés)
                    </span>
                  </div>
                </div>

                <div className="mt-2" style={{ background: '#ead7e7', height: 8, borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)'
                    }}
                  />
                </div>
              </Col>

              <Col xs={12} md={5} className="text-md-end">
                {remainingCount > 0 ? (
                  <div
                    className="d-inline-flex align-items-center gap-2"
                    style={{
                      background: 'rgba(92, 36, 88, 0.08)',
                      border: '1px solid rgba(92, 36, 88, 0.15)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      color: '#5c2458',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5c2458' }} />
                    Impossible de clôturer : {remainingCount} paie(s) non générée(s)
                  </div>
                ) : (
                  <Badge bg="success" pill className="px-3 py-2">
                    Clôture possible
                  </Badge>
                )}
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Cartes de statistiques */}
      <Row className="mb-4 g-3">
        <Col xs={12} md={3}>
          <Card 
            className="border-0 shadow-sm h-100 stat-card-hover"
            style={{ borderRadius: '15px', cursor: 'pointer' }}
            onClick={() => setEtatFiltre(0)}
          >
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="rounded-circle bg-danger bg-opacity-10 p-2">
                  <XCircle size={24} className="text-danger" />
                </div>
                <Badge bg="danger" pill className="px-2 py-1">
                  {stats.inactif}
                </Badge>
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                PÉRIODE INACTIVE
              </h6>
              <h3 className="mb-0 fw-bold" style={{ color: '#dc3545' }}>
                {stats.inactif}
              </h3>
              <small className="text-muted">employé(s) sans paie générée</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={3}>
          <Card 
            className="border-0 shadow-sm h-100 stat-card-hover"
            style={{ borderRadius: '15px', cursor: 'pointer' }}
            onClick={() => setEtatFiltre(1)}
          >
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                  <Clock size={24} className="text-warning" />
                </div>
                <Badge bg="warning" pill className="px-2 py-1">
                  {stats.enAttente}
                </Badge>
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                EN ATTENTE
              </h6>
              <h3 className="mb-0 fw-bold" style={{ color: '#ff9800' }}>
                {stats.enAttente}
              </h3>
              <small className="text-muted">employé(s) prêt(s) pour génération</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={3}>
          <Card 
            className="border-0 shadow-sm h-100 stat-card-hover"
            style={{ borderRadius: '15px', cursor: 'pointer' }}
            onClick={() => setEtatFiltre(2)}
          >
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="rounded-circle bg-success bg-opacity-10 p-2">
                  <CheckCircle size={24} className="text-success" />
                </div>
                <Badge bg="success" pill className="px-2 py-1">
                  {stats.actif}
                </Badge>
              </div>
              <h6 className="text-muted mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                PAIE GÉNÉRÉE
              </h6>
              <h3 className="mb-0 fw-bold" style={{ color: '#2e7d32' }}>
                {stats.actif}
              </h3>
              <small className="text-muted">employé(s) avec paie générée</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={3}>
          <Card 
            className="border-0 shadow-sm h-100"
            style={{ 
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="rounded-circle bg-white bg-opacity-25 p-2">
                  <Receipt size={24} className="text-white" />
                </div>
                {periodeActive && (
                  <Badge bg="light" text="primary" pill className="px-2 py-1">
                    Actif
                  </Badge>
                )}
              </div>
              <h6 className="text-white-50 mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                PÉRIODE ACTIVE
              </h6>
              {periodeActive ? (
                <>
                  <h5 className="text-white mb-0 fw-bold">
                    {periodeActive.mois?.nom || 'Mois'} {periodeActive.annee || 'Année'}
                  </h5>
                  <small className="text-white-50">
                    {periodeActive.dateDebut && new Date(periodeActive.dateDebut).toLocaleDateString('fr-FR')} - {periodeActive.dateFin && new Date(periodeActive.dateFin).toLocaleDateString('fr-FR')}
                  </small>
                </>
              ) : (
                <>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.85rem' }}>
                    Aucune période active
                  </p>
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="mt-2 rounded-pill"
                    onClick={() => setShowAddPeriodeModal(true)}
                  >
                    <Plus size={14} className="me-1" />
                    Créer une période
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres et recherche */}
      <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <Card.Body className="py-2 px-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} lg={5}>
              <InputGroup className="rounded-pill shadow-sm" style={{ minHeight: '42px' }}>
                <InputGroup.Text className="bg-white border-0" style={{ minWidth: '44px', borderTopLeftRadius: '999px', borderBottomLeftRadius: '999px' }}>
                  <Search size={16} className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par matricule, nom, poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0"
                  style={{ minHeight: '42px' }}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="border-0"
                    style={{ minHeight: '42px' }}
                  >
                    <X size={16} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            
            <Col xs={12} sm={6} lg={2}>
              <Form.Select 
                size="sm"
                value={etatFiltre === null ? '' : etatFiltre}
                onChange={(e) => setEtatFiltre(e.target.value === '' ? null : parseInt(e.target.value))}
                className="rounded-pill shadow-sm"
              >
                <option value="">Tous les états</option>
                <option value="0">Période inactive</option>
                <option value="1">En attente</option>
                <option value="2">Paie générée</option>
              </Form.Select>
            </Col>

            <Col xs={6} sm={3} lg={2}>
              <Form.Select
                size="sm"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value, 10))}
                className="rounded-pill shadow-sm"
                style={{ minHeight: '42px' }}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} / page
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col xs={6} sm={3} lg={2}>
              <Button 
                variant="primary" 
                size="sm"
                onClick={resetSearch}
                className="w-100 rounded-pill"
                style={{ background: '#b053ad', borderColor: '#b053ad', color: '#ffffff' }}
              >
                <Filter size={14} className="me-1" color="#ffffff" />
                Réinitialiser
              </Button>
            </Col>
            
            <Col xs={12} lg={2} className="text-lg-end">
              <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                <Users size={14} className="me-1" />
                {filteredEmployes.length} employé(s)
                {filteredEmployes.filter(emp => emp.etat === 2).length > 0 && (
                  <span className="ms-2 text-success">
                    ({filteredEmployes.filter(emp => emp.etat === 2).length} générés)
                  </span>
                )}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Barre d'actions pour la sélection */}
      {selectedIds.length > 0 && (
        <Card className="mb-4 border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: '15px' }}>
          <Card.Body className="p-3">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                    <CheckCircle size={20} className="text-primary" />
                  </div>
                  <div>
                    <span className="fw-bold fs-6">{selectedIds.length} employé(s) sélectionné(s)</span>
                    <Badge bg="primary" className="ms-2 rounded-pill">{selectedIds.length}</Badge>
                    {selectedIds.filter(id => {
                      const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
                      return emp && emp.etat === 2;
                    }).length > 0 && (
                      <div className="text-warning small mt-1">
                        ⚠️ {selectedIds.filter(id => {
                          const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
                          return emp && emp.etat === 2;
                        }).length} employé(s) avec paie existante - ne seront pas générés
                      </div>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    className="rounded-pill px-3"
                  >
                    <X size={14} className="me-1" />
                    Tout désélectionner
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={openGenerateModal}
                    disabled={!periodeActive || loadingPeriode}
                    className="rounded-pill px-3"
                    style={{ fontWeight: 600 }}
                  >
                    {loadingPeriode ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <>
                        <BarChart2 size={14} className="me-1" />
                        Générer la paie
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tableau des employés */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '50px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={filteredEmployes.length === 0}
                    />
                  </th>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom(s)</th>
                  <th>Département</th>
                  <th>Poste</th>
                  <th>Classification</th>
                  <th className="text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((emp) => {
                    const employe = emp.employeAvecInfosDTO?.employe || {};
                    const infos = emp.employeAvecInfosDTO?.infosProfessionnelles?.[0] || {};
                    const employeeId = employe.id;
                    
                    const departement = infos.departement?.nom || infos.poste?.departement?.nom || '-';
                    const poste = infos.poste?.nom || '-';
                    
                    return (
                      <tr 
                        key={employeeId}
                        onClick={(e) => {
                          if (e.target.type !== 'checkbox' && !e.target.className.includes('form-check')) {
                            handleRowClick(emp);
                          }
                        }}
                        style={{ 
                          cursor: 'pointer',
                          opacity: emp.etat === 2 ? 0.8 : 1
                        }}
                      >
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedIds.includes(employeeId)}
                            onChange={() => handleSelectOne(employeeId)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          <small className={emp.etat === 2 ? 'text-muted' : ''}>
                            {infos.matricule || '-'}
                          </small>
                        </td>
                        <td>
                          <small className={emp.etat === 2 ? 'text-muted' : ''}>
                            {employe.nom || '-'}
                          </small>
                        </td>
                        <td>
                          <small className={emp.etat === 2 ? 'text-muted' : ''}>
                            {employe.prenom || '-'}
                          </small>
                        </td>
                        <td>
                          <small className={emp.etat === 2 ? 'text-muted' : ''}>
                            {departement}
                          </small>
                        </td>
                        <td>
                          <small className={emp.etat === 2 ? 'text-muted' : ''}>
                            {poste}
                          </small>
                        </td>
                        <td>
                          <small className={emp.etat === 2 ? 'text-muted' : ''}>
                            {infos.classification || '-'}
                          </small>
                        </td>
                        <td className="text-center">
                          {getEtatBadge(emp.etat)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <Search size={24} className="text-muted mb-2" />
                        <small className="text-muted">
                          {searchTerm || etatFiltre !== null 
                            ? "Aucun employé ne correspond aux critères" 
                            : "Aucun employé trouvé"}
                        </small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-top px-3 py-3 bg-light">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <small className="text-muted">
                    Page {currentPage} sur {totalPages} - {filteredEmployes.length} employé(s) au total
                  </small>
                </div>
                <Pagination size="sm">
                  {renderPaginationItems()}
                </Pagination>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de génération de paie */}
      <Modal show={showGenerateModal} onHide={() => handleCloseGenerateModal(false)} size="lg" centered>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>
            <BarChart2 size={20} className="me-2" />
            Générer la paie
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!generateResult ? (
            <>
              <p>Vous allez générer la paie pour <strong>{selectedIds.length} employé(s)</strong>.</p>
              {periodeActive && (
                <Alert variant="info">
                  <Row>
                    <Col xs={6}>
                      <small>
                        <strong>Période :</strong> {periodeActive.mois?.nom} {periodeActive.annee}
                      </small>
                    </Col>
                    <Col xs={6}>
                      <small>
                        <strong>Du :</strong> {new Date(periodeActive.dateDebut).toLocaleDateString('fr-FR')}
                      </small>
                    </Col>
                    <Col xs={6}>
                      <small>
                        <strong>Au :</strong> {new Date(periodeActive.dateFin).toLocaleDateString('fr-FR')}
                      </small>
                    </Col>
                    <Col xs={6}>
                      <small>
                        <strong>Statut :</strong>{' '}
                        <Badge bg={periodeActive.statut === 1 ? 'success' : 'warning'}>
                          {periodeActive.statut === 1 ? 'Actif' : 'En attente'}
                        </Badge>
                      </small>
                    </Col>
                  </Row>
                </Alert>
              )}
              
              <div className="border rounded p-2 bg-light mb-3">
                <small className="text-muted">
                  <strong>Employés sélectionnés :</strong>
                </small>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedIds.map(id => {
                    const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
                    const employe = emp?.employeAvecInfosDTO?.employe || {};
                    const estActif = emp?.etat === 2;
                    return (
                      <div key={id} className="small" style={{ color: estActif ? '#dc3545' : 'inherit' }}>
                        • {employe.nom} {employe.prenom} {estActif && <span className="text-danger">(déjà généré)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <p className="text-muted small mb-0">
                Cette action va créer les bulletins de paie pour la Période active.
              </p>
            </>
          ) : (
            <div className="text-center py-3">
              {generateResult.success ? (
                <>
                  <div className="text-success mb-3">
                    <CheckCircle size={48} />
                  </div>
                  <h5 className="text-success">Génération réussie !</h5>
                  <p className="mb-2">{generateResult.message}</p>
                  
                  {generateResult.resume && (
                    <div className="d-flex justify-content-center gap-4 mt-3">
                      <div>
                        <Badge bg="success" pill className="px-3 py-2">
                          ✓ {generateResult.resume.generes} généré(s)
                        </Badge>
                      </div>
                      {generateResult.resume.doublons > 0 && (
                        <div>
                          <Badge bg="warning" pill className="px-3 py-2">
                            ⚠️ {generateResult.resume.doublons} doublon(s)
                          </Badge>
                        </div>
                      )}
                      {generateResult.resume.erreurs > 0 && (
                        <div>
                          <Badge bg="danger" pill className="px-3 py-2">
                            ❌ {generateResult.resume.erreurs} erreur(s)
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {generateResult.doublons && generateResult.doublons.length > 0 && (
                    <div className="mt-3 text-start">
                      <small className="text-warning">Doublons ignorés :</small>
                      <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        {generateResult.doublons.map((d, i) => (
                          <div key={i} className="small text-muted">⚠️ {d}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generateResult.erreurs && generateResult.erreurs.length > 0 && (
                    <div className="mt-3 text-start">
                      <small className="text-danger">Erreurs :</small>
                      <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        {generateResult.erreurs.map((e, i) => (
                          <div key={i} className="small text-danger">❌ {e}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-danger mb-3">
                    <XCircle size={48} />
                  </div>
                  <h5 className="text-danger">Échec de la génération</h5>
                  <p className="text-danger">{generateResult.message}</p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!generateResult ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => handleCloseGenerateModal(false)}>
                Annuler
              </Button>
              <Button 
                variant="success" 
                size="sm" 
                onClick={handleGeneratePaie}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Génération en cours...
                  </>
                ) : (
                  'Confirmer la génération'
                )}
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => handleCloseGenerateModal(generateResult.success)}
            >
              Fermer
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modals */}
      <RubriqueModal
        show={showRubriquesModal}
        onHide={() => {
          setShowRubriquesModal(false);
          setSelectedEmployeForRubriques(null);
        }}
        title={selectedEmployeForRubriques ? 
          `Rubriques - ${selectedEmployeForRubriques.prenom} ${selectedEmployeForRubriques.nom?.toUpperCase()}` : 
          "Rubriques de Paie"}
        employeId={selectedEmployeForRubriques?.id}
      />

      <ClotureModal
        show={showClotureModal}
        onHide={() => setShowClotureModal(false)}
      />

      <AddPeriodePaieModal
        show={showAddPeriodeModal}
        onHide={() => setShowAddPeriodeModal(false)}
        onSuccess={() => {
          setShowAddPeriodeModal(false);
          fetchDonnees();
          fetchPeriodeActive();
        }}
      />
    </Container>
  );
}

export default NouvelleEditionPaie;
