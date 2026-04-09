// src/pages/Employees.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LockFill, FileEarmarkExcelFill } from 'react-bootstrap-icons';
import { 
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Badge,
  Dropdown,
  Pagination,
  Modal,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import {
  Search,
  Download,
  Eye,
  Folder,
  Briefcase,
  User,
  UserCheck,
  X,
  Calendar,
  Hash,
  Filter,
  Award,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical
} from 'react-feather';
import {
  FaArchive,
  FaCalendarAlt,
  FaCalendar,
  FaCommentAlt,
  FaInfoCircle,
  FaTimes,
  FaUser,
  FaCrown,
  FaUserTie,
  FaCheckCircle,
  FaStickyNote,
  FaBuilding
} from 'react-icons/fa';

// Correction: Importer correctement FaCalendarCheck
// Si FaCalendarCheck n'existe pas, on utilise FaCalendarAlt
// ou on importe depuis react-feather
import { Calendar as CalendarIcon } from 'react-feather';

import AddEmployeeModal from './AddEmployee';
import axiosInstance from '../../../utils/AxiosInstance';

function Employees() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // États initiaux basés sur l'URL
  const initialPage = parseInt(searchParams.get('page') || '0');
  const initialSize = parseInt(searchParams.get('size') || '10');
  const initialSortBy = searchParams.get('sortBy') || 'nom';
  const initialDirection = searchParams.get('direction') || 'asc';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États de pagination
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    pageSize: initialSize,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    sortBy: initialSortBy,
    direction: initialDirection
  });

  const [statistiques, setStatistiques] = useState({
    nb_manager: 0,
    nb_departement: 0,
    nb_contrat_cdi: 0,
    nb_contrat_cdd: 0,
    nb_contrat_autre: 0,
    nb_employe: 0,
    nb_employe_inactif: 0,
    nb_poste: 0,
    nb_employes_en_conges: 0,
    nb_competences_employes: 0,
    nb_competences_added_dernier_mois: 0,
    nb_moyenne_competence_par_employe: 0
  });

  // États pour les filtres
  const [filters, setFilters] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    departement: '',
    poste: '',
    typeContrat: '',
    statutId: '0',
    managerFilter: ''
  });

  // États pour la modal d'archivage
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [employeeToArchive, setEmployeeToArchive] = useState(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [archiving, setArchiving] = useState(false);

  // États pour la modal d'affectation manager
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [employeeToPromote, setEmployeeToPromote] = useState(null);
  const [promoting, setPromoting] = useState(false);
  const [managerComment, setManagerComment] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState('');

  // États pour les données des listes déroulantes
  const [departements, setDepartements] = useState([]);
  const [typeContrats, setTypeContrats] = useState([]);
  const [postes, setPostes] = useState([]);
  const [statuts, setStatuts] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Ajouter avec les autres states
  const [managerError, setManagerError] = useState('');

  // Mettre à jour l'URL quand la pagination change
  const updateURL = useCallback((newPage, newSize, newSortBy, newDirection) => {
    const params = new URLSearchParams(searchParams);
    
    if (newPage !== 0) params.set('page', newPage);
    else params.delete('page');
    
    if (newSize !== 10) params.set('size', newSize);
    else params.delete('size');
    
    if (newSortBy !== 'nom') params.set('sortBy', newSortBy);
    else params.delete('sortBy');
    
    if (newDirection !== 'asc') params.set('direction', newDirection);
    else params.delete('direction');
    
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Charger les employés avec pagination ET filtres
  const fetchEmployees = useCallback(async (
    page = pagination.currentPage, 
    size = pagination.pageSize, 
    sortBy = pagination.sortBy, 
    direction = pagination.direction,
    searchFilters = {}
  ) => {
    try {
      setLoading(true);
      setError('');
      
      const employeeFilterDTO = {
        page,
        size,
        sortBy,
        direction,
        ...searchFilters  
      };
      
      Object.keys(employeeFilterDTO).forEach(key => {
        if (employeeFilterDTO[key] === '' || employeeFilterDTO[key] === null || employeeFilterDTO[key] === undefined) {
          delete employeeFilterDTO[key];
        }
      });
      
      const response = await axiosInstance.post(`/api/employes/allEmpWithInfos`, employeeFilterDTO);
      
      console.log("Réponse API:", response.data);
      
      if (response.data.statistiques && response.data.employes) {
        setStatistiques(response.data.statistiques);
        setEmployees(response.data.employes);
        
        setPagination(prev => ({
          ...prev,
          currentPage: response.data.currentPage || page,
          pageSize: response.data.pageSize || size,
          totalItems: response.data.totalItems || response.data.totalEmployes || 0,
          totalPages: response.data.totalPages || 0,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false,
          sortBy,
          direction
        }));
        
        updateURL(page, size, sortBy, direction);
      } else {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error(error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, pagination.sortBy, pagination.direction, updateURL]);

  // Charger initialement
  useEffect(() => {
    // Charger par défaut les employés actifs
    handleSearchSubmit();
    fetchFilterData();
  }, []);

  // Fonction pour changer de page avec filtres
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const searchParams = {};
      
      if (filters.managerFilter === 'manager') {
        searchParams['isManager'] = true;
      } else if (filters.managerFilter === 'employe') {
        searchParams['isManager'] = false;
      }
      
      if (filters.matricule) searchParams['matricule'] = filters.matricule;
      if (filters.nom) searchParams['nom'] = filters.nom;
      if (filters.prenom) searchParams['prenom'] = filters.prenom;
      if (filters.departement) searchParams['departementId'] = filters.departement;
      if (filters.typeContrat) searchParams['typeContratId'] = filters.typeContrat;
      if (filters.statutId) searchParams['statutId'] = filters.statutId;
      
      fetchEmployees(newPage, pagination.pageSize, pagination.sortBy, pagination.direction, searchParams);
    }
  };

  // Fonction pour archiver
  const handleOpenArchive = (employeeId) => {
    const employee = employees.find(emp => {
      const empData = emp.employe || emp;
      return empData.id === employeeId;
    });

    if (employee) {
      setEmployeeToArchive(employee);
      setArchiveReason('');
      setShowArchiveModal(true);
    }
  };

  const handleArchiveEmployee = async () => {
    if (!employeeToArchive || !archiveReason.trim()) {
      alert('Veuillez saisir un motif d\'archivage');
      return;
    }

    try {
      setArchiving(true);
      const employeeId = employeeToArchive.employe?.id || employeeToArchive.id;
      const response = await axiosInstance.post(`/api/employes/${employeeId}/archive`, {
        motif: archiveReason.trim(),
        dateArchivage: new Date().toISOString().split('T')[0]
      });
      
      if (response.status === 200) {
        fetchEmployees();
        setShowArchiveModal(false);
        setEmployeeToArchive(null);
        setArchiveReason('');
        setSuccessMessage('Employé archivé avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error);
      setError("Erreur lors de l'archivage de l'employé");
      setTimeout(() => setError(''), 3000);
    } finally {
      setArchiving(false);
    }
  };

  const handleCancelArchive = () => {
    setShowArchiveModal(false);
    setEmployeeToArchive(null);
    setArchiveReason('');
  };

  // Fonctions pour la promotion manager
  const handleOpenManagerModal = (employee) => {
    const infosPro = employee.infosProfessionnelles?.[0] || {};
    const departementNom = infosPro.departement?.nom || 
                          infosPro.poste?.departement?.nom || 
                          'Non défini';
    const departementId = infosPro.departement?.id || 
                          infosPro.poste?.departement?.id || 
                          null;
    
    setEmployeeToPromote({
      ...employee,
      departementNom,
      departementId
    });
    setManagerComment('');
    setDateDebut(new Date().toISOString().split('T')[0]);
    setDateFin('');
    setManagerError(''); 
    setShowManagerModal(true);
  };

  const handleAssignManager = async () => {
    if (!employeeToPromote) {
      setManagerError('Erreur: aucun employé sélectionné');
      return;
    }
    
    if (!managerComment.trim()) {
      setManagerError('Veuillez saisir un commentaire justifiant la promotion');
      return;
    }
    
    if (!dateDebut) {
      setManagerError('Veuillez saisir une date de début');
      return;
    }

    try {
      setPromoting(true);
      setManagerError(''); // Réinitialiser l'erreur avant l'envoi
      
      const employeeId = employeeToPromote.employe?.id || employeeToPromote.id;
      
      const requestData = {
        employe: { id: employeeId },
        departement: { id: employeeToPromote.departementId },
        commentaire: managerComment.trim(),
        dateDebut: dateDebut,
        dateFin: dateFin || null
      };
      
      console.log('Données envoyées:', requestData);
      
      const response = await axiosInstance.post(`/api/managers`, requestData);
      
      if (response.status === 200 || response.status === 201) {
        fetchEmployees();
        setShowManagerModal(false);
        setEmployeeToPromote(null);
        setManagerComment('');
        setDateDebut('');
        setDateFin('');
        setManagerError('');
        setSuccessMessage(`${employeeToPromote.employe?.nom || employeeToPromote.nom} ${employeeToPromote.employe?.prenom || employeeToPromote.prenom} a été promu manager avec succès !`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation manager:', error);
      
      // Récupérer le message d'erreur détaillé du backend
      let errorMsg = "Erreur lors de l'affectation en tant que manager";
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.log('Données de l\'erreur:', error.response.data);
        console.log('Status code:', error.response.status);
        console.log('Headers:', error.response.headers);
        
        // Extraire le message d'erreur selon la structure de la réponse
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMsg = error.response.data;
          } else if (error.response.data.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.data.error) {
            errorMsg = error.response.data.error;
          } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            // Pour les erreurs de validation Spring Boot
            errorMsg = error.response.data.errors.map(err => err.defaultMessage || err.message).join(', ');
          } else if (error.response.data.detail) {
            errorMsg = error.response.data.detail;
          } else if (error.response.data.title) {
            errorMsg = error.response.data.title;
          } else {
            // Si c'est un objet, essayer de le convertir en string
            try {
              errorMsg = JSON.stringify(error.response.data);
            } catch (e) {
              errorMsg = "Erreur serveur inconnue";
            }
          }
        }
        
        // Gérer les codes d'erreur spécifiques
        if (error.response.status === 400) {
          errorMsg = `Erreur de validation: ${errorMsg}`;
        } else if (error.response.status === 404) {
          errorMsg = "Employé ou département non trouvé";
        } else if (error.response.status === 409) {
          errorMsg = "Conflit: Cet employé est déjà manager";
        } else if (error.response.status === 403) {
          errorMsg = "Vous n'avez pas les droits pour effectuer cette action";
        } else if (error.response.status === 500) {
          errorMsg = "Erreur serveur interne: " + error.response.data;
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMsg = "Impossible de contacter le serveur. Vérifiez votre connexion réseau.";
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMsg = error.message || "Une erreur inattendue s'est produite";
      }
      
      setManagerError(errorMsg);
    } finally {
      setPromoting(false);
    }
  };

  const handleCancelManager = () => {
    setShowManagerModal(false);
    setEmployeeToPromote(null);
    setManagerComment('');
    setDateDebut('');
    setDateFin('');
    setManagerError('');
  };

  // Chargement des données pour les filtres
  const fetchFilterData = useCallback(async () => {
    try {
      const deptResponse = await axiosInstance.get('/api/departements/actif');
      setDepartements(deptResponse.data);
      
      const typeContratsResponse = await axiosInstance.get('/api/type-contrats');
      setTypeContrats(typeContratsResponse.data);
      
      const statutsResponse = await axiosInstance.get('/api/statuts');
      setStatuts(statutsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données de filtres:', error);
    }
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      matricule: '',
      nom: '',
      prenom: '',
      departement: '',
      poste: '',
      typeContrat: '',
      statutId: '0',
      managerFilter: ''
    });
    fetchEmployees(0, pagination.pageSize, pagination.sortBy, pagination.direction);
  };

  const handleSearchSubmit = async () => {
    const searchParams = {};
    
    if (filters.managerFilter === 'manager') {
      searchParams['isManager'] = true;
    } else if (filters.managerFilter === 'employe') {
      searchParams['isManager'] = false;
    }
    
    if (filters.matricule) searchParams['matricule'] = filters.matricule;
    if (filters.nom) searchParams['nom'] = filters.nom;
    if (filters.prenom) searchParams['prenom'] = filters.prenom;
    if (filters.departement) searchParams['departementId'] = filters.departement;
    if (filters.typeContrat) searchParams['typeContratId'] = filters.typeContrat;
    if (filters.statutId) searchParams['statutId'] = filters.statutId;
    
    fetchEmployees(0, pagination.pageSize, pagination.sortBy, pagination.direction, searchParams);
  };

  const handleSizeChange = (newSize) => {
    const searchParams = {};
    
    if (filters.managerFilter === 'manager') {
      searchParams['isManager'] = true;
    } else if (filters.managerFilter === 'employe') {
      searchParams['isManager'] = false;
    }
    
    if (filters.matricule) searchParams['matricule'] = filters.matricule;
    if (filters.nom) searchParams['nom'] = filters.nom;
    if (filters.prenom) searchParams['prenom'] = filters.prenom;
    if (filters.departement) searchParams['departementId'] = filters.departement;
    if (filters.typeContrat) searchParams['typeContratId'] = filters.typeContrat;
    if (filters.statutId) searchParams['statutId'] = filters.statutId;
    
    fetchEmployees(0, newSize, pagination.sortBy, pagination.direction, searchParams);
  };

  const handleSort = (column) => {
    const newDirection = pagination.sortBy === column && pagination.direction === 'asc' ? 'desc' : 'asc';
    
    const searchParams = {};
    
    if (filters.managerFilter === 'manager') {
      searchParams['isManager'] = true;
    } else if (filters.managerFilter === 'employe') {
      searchParams['isManager'] = false;
    }
    
    if (filters.matricule) searchParams['matricule'] = filters.matricule;
    if (filters.nom) searchParams['nom'] = filters.nom;
    if (filters.prenom) searchParams['prenom'] = filters.prenom;
    if (filters.departement) searchParams['departementId'] = filters.departement;
    if (filters.typeContrat) searchParams['typeContratId'] = filters.typeContrat;
    if (filters.statutId) searchParams['statutId'] = filters.statutId;
    
    fetchEmployees(0, pagination.pageSize, column, newDirection, searchParams);
  };

  const getContratPrincipal = (infosArray) => {
    if (!infosArray || !Array.isArray(infosArray) || infosArray.length === 0) return null;
    return infosArray[0];
  };

  const openAddModal = () => setShowAddModal(true);

  const handleExportExcel = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/api/export', {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setError("Erreur lors de l'export Excel");
    }
  };
  const handleAddSuccess = () => fetchEmployees();

  const formatSalaire = (salaire) => {
    if (!salaire) return '-';
    return new Intl.NumberFormat('fr-MG').format(salaire) + ' Ar';
  };

  const getContratBadge = (typeContrat) => {
    switch(typeContrat) {
      case 'CDI': return <Badge bg="success">CDI</Badge>;
      case 'CDD': return <Badge bg="info">CDD</Badge>;
      case 'Stage': return <Badge bg="secondary">Stage</Badge>;
      default: return <Badge bg="light" text="dark">{typeContrat || '-'}</Badge>;
    }
  };

  const pageSizeOptions = [3, 5, 10, 25, 50, 100];

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 0) {
      items.push(
        <Pagination.Item key="first" onClick={() => handlePageChange(0)}>
          <ChevronsLeft size={14} />
        </Pagination.Item>
      );
    }
    
    if (pagination.hasPrevious) {
      items.push(
        <Pagination.Item key="prev" onClick={() => handlePageChange(pagination.currentPage - 1)}>
          <ChevronLeft size={14} />
        </Pagination.Item>
      );
    }
    
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === pagination.currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }
    
    if (pagination.hasNext) {
      items.push(
        <Pagination.Item key="next" onClick={() => handlePageChange(pagination.currentPage + 1)}>
          <ChevronRight size={14} />
        </Pagination.Item>
      );
    }
    
    if (endPage < pagination.totalPages - 1) {
      items.push(
        <Pagination.Item key="last" onClick={() => handlePageChange(pagination.totalPages - 1)}>
          <ChevronsRight size={14} />
        </Pagination.Item>
      );
    }
    
    return items;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* En-tête */}
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h4 mb-0">Employés</h1>
            <Badge bg="light" text="dark" className="ms-2">
              {pagination.totalItems || statistiques.nb_employe || 0}
            </Badge>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="d-flex align-items-center gap-1"
            >
              <Filter size={14} />
              <span className="d-none d-sm-inline">Filtre</span>
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              className="d-flex align-items-center gap-1"
            >
              <Plus size={14} />
              <span className="d-none d-sm-inline">Ajouter</span>
            </Button>
            
            <Dropdown>
              <Dropdown.Toggle variant="primary" size="sm" className="d-flex align-items-center gap-1">
                <Download size={14} />
                <span className="d-none d-sm-inline">Exporter</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleExportExcel}>
                  <LockFill className="me-2" />
                  Export excel 
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/dashboard-RH/conge/soldeAnnuel")}>
                  <LockFill className="me-2" />
                  Clôturer paie
                </Dropdown.Item>
                <Dropdown.Item onClick={() => window.open("http://localhost:3000/dashboard-RH/présence")}>
                  <FileEarmarkExcelFill className="me-2" />
                  Voir pointage
                </Dropdown.Item>
                <Dropdown.Item onClick={() => window.open("/dashboard-RH/archives")}>
                  <FileEarmarkExcelFill className="me-2" />
                  Voir archives 
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/dashboard-RH/organisation/hierarchie")}>
                  <LockFill className="me-2" />
                  Vue hiérarchique
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {/* Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          <FaCheckCircle className="me-2" />
          {successMessage}
        </Alert>
      )}

      {/* Statistiques */}
      <Row className="mb-4">
        <Col>
          <div className="kpi-row">
            <div className="kpi-col">
              <div className="stat-card kpi-card bg-primary bg-opacity-10 border-start border-primary border-3 h-100">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-primary bg-opacity-25 p-2 rounded me-3">
                    <Users size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="stat-value h4 mb-0 fw-bold">{statistiques.nb_employe || 0}</div>
                    <div className="stat-label text-muted small">Employés actifs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kpi-col">
              <div className="stat-card kpi-card bg-danger bg-opacity-10 border-start border-danger border-3 h-100">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-danger bg-opacity-25 p-2 rounded me-3">
                    <X size={20} className="text-danger" />
                  </div>
                  <div>
                    <div className="stat-value h4 mb-0 fw-bold">{statistiques.nb_employe_inactif || 0}</div>
                    <div className="stat-label text-muted small">Employés inactifs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kpi-col">
              <div className="stat-card kpi-card bg-secondary bg-opacity-10 border-start border-secondary border-3 h-100">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-secondary bg-opacity-25 p-2 rounded me-3">
                    <Briefcase size={20} className="text-secondary" />
                  </div>
                  <div>
                    <div className="stat-value h4 mb-0 fw-bold">{statistiques.nb_departement || 0}</div>
                    <div className="stat-label text-muted small">Départements</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kpi-col">
              <div className="stat-card kpi-card bg-primary bg-opacity-10 border-start border-primary border-3 h-100">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-primary bg-opacity-25 p-2 rounded me-3">
                    <UserCheck size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="stat-value h4 mb-0 fw-bold">{statistiques.nb_manager || 0}</div>
                    <div className="stat-label text-muted small">Managers</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kpi-col">
              <div className="stat-card kpi-card bg-warning bg-opacity-10 border-start border-warning border-3 h-100">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-warning bg-opacity-25 p-2 rounded me-3">
                    <Award size={20} className="text-warning" />
                  </div>
                  <div>
                    <div className="stat-value h4 mb-0 fw-bold">{statistiques.nb_poste || 0}</div>
                    <div className="stat-label text-muted small">Postes</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kpi-col">
              <div className="stat-card kpi-card kpi-contracts bg-light border-start border-3 h-100">
                <div className="d-flex align-items-center kpi-contracts-header">
                  <div className="stat-icon bg-light p-2 rounded me-2">
                    <Award size={16} className="text-muted" />
                  </div>
                  <div className="stat-label text-muted small">Contrats</div>
                </div>
                <div className="kpi-contracts-grid">
                  <div className="kpi-contracts-col">
                    <div className="kpi-contracts-label">CDI</div>
                    <div className="kpi-contracts-value">{statistiques.nb_contrat_cdi || 0}</div>
                  </div>
                  <div className="kpi-contracts-col">
                    <div className="kpi-contracts-label">CDD</div>
                    <div className="kpi-contracts-value">{statistiques.nb_contrat_cdd || 0}</div>
                  </div>
                  <div className="kpi-contracts-col">
                    <div className="kpi-contracts-label">Autres</div>
                    <div className="kpi-contracts-value">{statistiques.nb_contrat_autre || 0}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Col>
      </Row>

      {/* Filtres */}
      {showSearch && (
        <Card className="mb-4 border shadow-sm">
          <Card.Header className="py-2 bg-light">
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2 text-primary" />
              <span className="fw-medium">Recherche multicritères</span>
            </div>
          </Card.Header>
          <Card.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Matricule</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Hash size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Ex: EMP001"
                      value={filters.matricule || ''}
                      onChange={(e) => handleFilterChange('matricule', e.target.value)}
                      size="sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Département</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Briefcase size={14} />
                    </InputGroup.Text>
                    <Form.Select
                      value={filters.departement || ''}
                      onChange={(e) => handleFilterChange('departement', e.target.value)}
                      size="sm"
                    >
                      <option value="">Tous les départements</option>
                      {departements.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nom}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Nom</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <User size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Nom de famille"
                      value={filters.nom || ''}
                      onChange={(e) => handleFilterChange('nom', e.target.value)}
                      size="sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Prénom</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <User size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Prénom"
                      value={filters.prenom || ''}
                      onChange={(e) => handleFilterChange('prenom', e.target.value)}
                      size="sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Contrat</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Award size={14} />
                    </InputGroup.Text>
                    <Form.Select
                      value={filters.typeContrat || ''}
                      onChange={(e) => handleFilterChange('typeContrat', e.target.value)}
                      size="sm"
                    >
                      <option value="">Tous les contrats</option>
                      {typeContrats.map((typeContrat)=> (
                        <option key={typeContrat.id} value={typeContrat.id}>
                          {typeContrat.intitule}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Statut</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <FaCheckCircle size={14} />
                    </InputGroup.Text>
                    <Form.Select
                      value={filters.statutId || ''}
                      onChange={(e) => handleFilterChange('statutId', e.target.value)}
                      size="sm"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="0">Actif</option>
                      <option value="2">Inactif</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Fonction</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <UserCheck size={14} />
                    </InputGroup.Text>
                    <Form.Select
                      value={filters.managerFilter || ''}
                      onChange={(e) => handleFilterChange('managerFilter', e.target.value)}
                      size="sm"
                    >
                      <option value="">Tous</option>
                      <option value="manager">Manager</option>
                      <option value="employe">Employé</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <div className="small text-muted">
                <Filter size={12} className="me-1" />
                {pagination.totalItems} employé{pagination.totalItems > 1 ? 's' : ''} trouvé{pagination.totalItems > 1 ? 's' : ''}
                {filters.managerFilter && (
                  <span className="ms-2 text-primary">
                    ({filters.managerFilter === 'manager' ? 'Managers uniquement' : 'Employés uniquement'})
                  </span>
                )}
                {filters.statutId && (
                  <span className="ms-2 text-primary">
                    ({filters.statutId === '0' ? 'Actifs uniquement' : 'Inactifs uniquement'})
                  </span>
                )}
              </div>
              
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={resetFilters}
                  className="d-flex align-items-center gap-1"
                >
                  <X size={14} />
                  Réinitialiser
                </Button>
                
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSearchSubmit}
                  className="d-flex align-items-center gap-1"
                >
                  <Search size={14} />
                  Appliquer
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Contrôles de pagination */}
      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted me-2">Afficher :</small>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                {pagination.pageSize} éléments
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {pageSizeOptions.map(size => (
                  <Dropdown.Item 
                    key={size} 
                    active={pagination.pageSize === size}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size} éléments
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <small className="text-muted ms-2">
              Page {pagination.currentPage + 1} sur {pagination.totalPages || 1}
            </small>
          </div>
        </Col>
        <Col md={6} className="text-md-end">
          <small className="text-muted">
            {pagination.totalItems} employé{pagination.totalItems > 1 ? 's' : ''} au total
          </small>
        </Col>
      </Row>

      {/* Tableau */}
      <Card className="border mb-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-2 ps-3">Matricule</th>
                  <th 
                    className="py-2" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('nom')}
                  >
                    Nom
                    {pagination.sortBy === 'nom' && (
                      <span className="ms-1">{pagination.direction === 'asc' ? '^' : 'v'}</span>
                    )}
                  </th>
                  <th className="py-2">Département</th>
                  <th className="py-2">Poste</th>
                  <th className="py-2">Contrat</th>
                  <th className="py-2">Salaire</th>
                  <th className="py-2 text-center">Fonction</th>
                  <th className="py-2 text-center">Statut</th>
                  <th className="py-2 pe-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map(empDto => {
                    const employe = empDto.employe || {};
                    const infosPro = getContratPrincipal(empDto.infosProfessionnelles || []) || {};
                    
                    const departement = infosPro.departement?.nom || 
                                        infosPro.departement?.libelle || 
                                        infosPro.poste?.departement?.nom || 
                                        infosPro.poste?.departement?.libelle || 
                                        '-';
                    
                    const poste = infosPro.poste?.nom || 
                                  infosPro.poste?.libelle || 
                                  '-';
                    
                    const typeContrat = infosPro.typeContrat?.intitule || 
                                        infosPro.typeContrat?.nom || 
                                        infosPro.typeContrat?.libelle || 
                                        '-';
                    
                    const salaire = infosPro.salaireBase || 0;
                    const isManager = empDto.manager || false;
                    const rawStatutId = employe.statutId ?? employe.statut ?? empDto.statutId ?? empDto.statut ?? infosPro.statutId ?? null;
                    const statutValue = rawStatutId !== null && rawStatutId !== undefined && rawStatutId !== '' ? Number(rawStatutId) : null;
                    const statutBadge = statutValue === 0
                      ? <Badge bg="success">Actif</Badge>
                      : statutValue === 2
                        ? <Badge bg="secondary">Inactif</Badge>
                        : <Badge bg="light" text="dark">-</Badge>;
                    
                    return (
                      <tr key={employe.id}>
                        <td className="py-2 ps-3">
                          <small className="text-muted fw-medium">{infosPro.matricule || '-'}</small>
                        </td>
                        <td className="py-2">
                          <div className="fw-medium">{employe.nom} {employe.prenom}</div>
                        </td>
                        <td className="py-2">
                          <small>{departement}</small>
                        </td>
                        <td className="py-2">
                          <small>{poste}</small>
                        </td>
                        <td className="py-2">
                          {typeContrat !== '-' ? getContratBadge(typeContrat) : <Badge bg="light" text="dark">-</Badge>}
                        </td>
                        <td className="py-2">
                          <small>{formatSalaire(salaire)}</small>
                        </td>
                        <td className="py-2 text-center">
                          {isManager ? (
                            <Badge bg="success" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                              <FaCrown size={12} />
                              <span>Manager</span>
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                              <User size={12} />
                              <span>Employé</span>
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 text-center">
                          {statutBadge}
                        </td>

                        <td className="py-2 pe-3 text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Dropdown align="end">
                              <Dropdown.Toggle
                                variant=""
                                size="sm"
                                className="px-2 d-inline-flex align-items-center gap-1"
                                style={{ borderColor: '#d6b3d3', color: '#5c2458' }}
                              >
                                
                                <MoreVertical size={14} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => navigate(`/dashboard-RH/employees/${employe.id}/personnel`)}>
                                  <Eye size={14} className="me-2" />
                                  Voir details
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate(`/dashboard-RH/employees/${employe.id}/documents`)}>
                                  <Folder size={14} className="me-2" />
                                  Voir documents
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            {!isManager && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`tooltip-manager-${employe.id}`}>Promouvoir en manager</Tooltip>}
                              >
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleOpenManagerModal(empDto)}
                                  className="px-2"
                                >
                                  <FaUserTie size={12} />
                                </Button>
                              </OverlayTrigger>
                            )}
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id={`tooltip-archive-${employe.id}`}>Archiver</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleOpenArchive(employe.id)}
                                className="px-2"
                              >
                                <FaArchive size={12} />
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <Search size={24} className="text-muted mb-2" />
                        <small className="text-muted">Aucun employé trouvé</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal d'archivage */}
      {showArchiveModal && (
        <div className="modal_perso">
          <div className="modal-dialog-custom" style={{ maxWidth: '500px', width: '95%' }}>
            <div className="modal-content-custom" style={{ 
              background: 'white', 
              border: '1px solid #e1b2db',
              color: '#3a1438',
              borderRadius: '8px'
            }}>
              <div className="modal-header-custom" style={{ 
                background: 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)',
                borderBottom: '1px solid #e1b2db',
                padding: '1.2rem 1.5rem',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}>
                <h5 className="modal-title m-0" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>
                  <FaArchive size={20} className="me-2" />
                  Archiver un employé
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCancelArchive}
                  aria-label="Fermer"
                ></button>
              </div>
              
              <div className="modal-body-custom" style={{ padding: '1.5rem', background: 'white' }}>
                {employeeToArchive && (
                  <>
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: '#5c2458' }}>
                        <FaUser className="me-2" />
                        Employé à archiver :
                      </h6>
                      <div className="card border" style={{ background: '#f9f1f8', borderColor: '#e1b2db' }}>
                        <div className="card-body py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong className="d-block">
                                {employeeToArchive.employe?.nom || employeeToArchive.nom} {employeeToArchive.employe?.prenom || employeeToArchive.prenom}
                              </strong>
                              <small className="text-muted">
                                Matricule: {employeeToArchive.infosProfessionnelles?.[0]?.matricule || '-'}
                              </small>
                            </div>
                            <Badge bg="warning" text="dark">Actif</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2" style={{ color: '#5c2458' }}>
                        <FaCalendarAlt className="me-2" />
                        Date d'archivage
                      </h6>
                      <div className="card border bg-light">
                        <div className="card-body py-2">
                          <div className="d-flex align-items-center">
                            <FaCalendar className="text-muted me-3" size={18} />
                            <div>
                              <strong className="d-block">{new Date().toLocaleDateString('fr-FR')}</strong>
                              <small className="text-muted">Aujourd'hui - Date automatique</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2" style={{ color: '#5c2458' }}>
                        <FaCommentAlt className="me-2" />
                        Motif d'archivage <span className="text-danger">*</span>
                      </h6>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Veuillez indiquer la raison de l'archivage..."
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Alert variant="info" className="mb-0">
                      <div className="d-flex">
                        <FaInfoCircle className="me-2 mt-1" />
                        <small>Après archivage, l'employé sera déplacé vers les archives.</small>
                      </div>
                    </Alert>
                  </>
                )}
              </div>
              
              <div className="modal-footer-custom" style={{ 
                background: 'white', 
                borderTop: '1px solid #e1b2db',
                padding: '1.2rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Button variant="outline-secondary" onClick={handleCancelArchive} disabled={archiving}>
                  <FaTimes className="me-2" />
                  Annuler
                </Button>
                <Button variant="warning" onClick={handleArchiveEmployee} disabled={!archiveReason.trim() || archiving}>
                  {archiving ? <Spinner size="sm" animation="border" className="me-2" /> : <FaArchive className="me-2" />}
                  Confirmer l'archivage
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'affectation manager */}
      <Modal show={showManagerModal} onHide={handleCancelManager} centered size="lg">
        <Modal.Header closeButton closeLabel="Fermer" className="bg-success text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaUserTie className="me-2" />
            Promouvoir en Manager
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {employeeToPromote && (
            <>
              {/* Affichage des erreurs */}
              {managerError && (
                <Alert variant="danger" className="mb-4" onClose={() => setManagerError('')} dismissible>
                  <div className="d-flex align-items-start">
                    <FaTimes className="me-2 mt-1" size={16} />
                    <div>
                      <strong>Erreur :</strong>
                      <p className="mb-0 mt-1">{managerError}</p>
                    </div>
                  </div>
                </Alert>
              )}

              <Alert variant="info" className="mb-4">
                <div className="d-flex align-items-start">
                  <FaInfoCircle size={18} className="me-2 mt-1" />
                  <div>
                    <strong className="d-block">Employé à promouvoir :</strong>
                    <span>{employeeToPromote.employe?.nom || employeeToPromote.nom} {employeeToPromote.employe?.prenom || employeeToPromote.prenom}</span>
                    <br />
                    <small className="text-muted">
                      Matricule: {employeeToPromote.infosProfessionnelles?.[0]?.matricule || '-'}
                    </small>
                  </div>
                </div>
              </Alert>

              <div className="mb-4 p-3 bg-light rounded border">
                <h6 className="fw-bold mb-2 text-primary">
                  <Briefcase size={16} className="me-2" />
                  Département actuel
                </h6>
                <div className="d-flex align-items-center">
                  <Badge bg="primary" className="p-2">
                    <FaBuilding size={14} className="me-1" />
                    {employeeToPromote.departementNom || 'Département non défini'}
                  </Badge>
                  <small className="text-muted ms-2">
                    (Ce sera le département que le manager supervisera)
                  </small>
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <FaStickyNote size={14} className="me-1 text-warning" />
                  Commentaire / Motif de la promotion *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Ex: Excellente performance, leadership démontré, compétences managériales, etc."
                  isInvalid={managerError && !managerComment.trim()}
                  required
                />
                <Form.Text className="text-muted">
                  Justifiez la raison pour laquelle cet employé est promu manager
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  Veuillez saisir un commentaire
                </Form.Control.Feedback>
              </Form.Group>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt size={14} className="me-1 text-success" />
                      Date de début d'assignation *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      isInvalid={managerError && !dateDebut}
                      required
                    />
                    <Form.Text className="text-muted">
                      Date à laquelle l'employé commence ses fonctions de manager
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir une date de début
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <CalendarIcon size={14} className="me-1 text-secondary" />
                      Date de fin d'assignation (optionnelle)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      min={dateDebut}
                    />
                    <Form.Text className="text-muted">
                      Si c'est une assignation temporaire, indiquez la date de fin
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="warning" className="mb-0">
                <div className="d-flex">
                  <FaCrown className="me-2 mt-1 text-warning" size={18} />
                  <div>
                    <strong>Responsabilités de manager :</strong>
                    <ul className="mb-0 mt-1 small">
                      <li>Superviser et évaluer les employés de son département</li>
                      <li>Valider les demandes de congés et absences</li>
                      <li>Participer aux évaluations annuelles</li>
                      <li>Assurer le reporting à la direction</li>
                    </ul>
                  </div>
                </div>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelManager} disabled={promoting}>
            <FaTimes className="me-2" />
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={handleAssignManager} 
            disabled={!managerComment.trim() || !dateDebut || promoting}
          >
            {promoting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Promotion en cours...
              </>
            ) : (
              <>
                <FaUserTie className="me-2" />
                Promouvoir en manager
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pagination en bas */}
      {pagination.totalPages > 1 && (
        <Card className="border">
          <Card.Body className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  Affichage de {(pagination.currentPage * pagination.pageSize) + 1} à{' '}
                  {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalItems)}{' '}
                  sur {pagination.totalItems}
                </small>
              </div>
              
              <Pagination className="mb-0">
                {getPaginationItems()}
              </Pagination>
              
              <div>
                <Form.Select 
                  size="sm" 
                  value={pagination.pageSize}
                  onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                      {size} par page
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Bouton flottant pour mobile */}
      <div className="d-block d-sm-none position-fixed bottom-3 end-3">
        <Button variant="primary" size="lg" className="rounded-circle p-2 shadow" onClick={openAddModal}>
          <Plus size={20} />
        </Button>
      </div>

      {/* Modal d'ajout */}
      <AddEmployeeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <style jsx>{`
        .pagination { margin-bottom: 0; }
        .pagination .page-item { margin: 0 2px; }
        .pagination .page-link { border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        .kpi-row { display: flex; gap: 6px; flex-wrap: nowrap; overflow: hidden; align-items: stretch; }
        .kpi-col { flex: 1 1 0; min-width: 90px; }
        .kpi-card { padding: 0.3rem 0.4rem; min-height: 10px; }
        .kpi-card .stat-value { font-size: 0.85rem; line-height: 1.05; }
        .kpi-card .stat-label { font-size: 0.58rem; letter-spacing: 0.2px; }
        .kpi-card .stat-icon { padding: 0.2rem !important; }
        .kpi-card svg { width: 12px; height: 12px; }
        .kpi-contracts { padding-top: 0.2rem; min-width: 120px; }
        .kpi-contracts-header { margin-bottom: 0.15rem; }
        .kpi-contracts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; text-align: center; }
        .kpi-contracts-col { background: #f8f4f8; border-radius: 5px; padding: 3px 3px; border: 1px solid #ead7e7; }
        .kpi-contracts-label { font-size: 0.52rem; color: #6b5a6a; text-transform: uppercase; letter-spacing: 0.3px; }
        .kpi-contracts-value { font-size: 0.72rem; font-weight: 700; color: #3a1438; }
      `}</style>
    </Container>
  );
}

export default Employees;

