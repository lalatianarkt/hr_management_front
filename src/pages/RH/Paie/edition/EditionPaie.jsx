// src/pages/RH/Paie/EditionPaie.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LockFill, FileEarmarkExcelFill, Calendar2Month } from 'react-bootstrap-icons';
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
  Pagination,
  Dropdown
} from 'react-bootstrap';
import {
  Download,
  Search,
  User,
  Briefcase,
  Award,
  FileText,
  X,
  Filter,
  CheckCircle,
  BarChart2,
  Plus,
  XCircle,
  Hash,
  Calendar,
  Settings
} from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance'; 

import RubriqueModal from '../rubrique/RubriqueList';
import ClotureModal from '../cloture/ClotureModal';
import AddPeriodePaieModal from '../periode/AddPeriodeModal'; 

function EditionPaie() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showClotureModal, setShowClotureModal] = useState(false);
  const [showAddPeriodeModal, setShowAddPeriodeModal] = useState(false);
  
  // États pour la période active
  const [periodeActive, setPeriodeActive] = useState(null);
  const [loadingPeriode, setLoadingPeriode] = useState(false);
  const [periodeError, setPeriodeError] = useState('');
  
  // Récupérer les paramètres depuis l'URL (page commence à 1 pour l'utilisateur)
  const urlPageUser = parseInt(searchParams.get('page')) || 1;
  const urlPageApi = Math.max(0, urlPageUser - 1);
  const urlSize = parseInt(searchParams.get('size')) || 10;
  const urlNom = searchParams.get('nom') || '';
  const urlPrenom = searchParams.get('prenom') || '';
  const urlMatricule = searchParams.get('matricule') || '';
  const urlDepartement = searchParams.get('departement') || '';
  const urlPoste = searchParams.get('poste') || '';
  const urlTypeContrat = searchParams.get('typeContrat') || '';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour la pagination
  const [currentPageUser, setCurrentPageUser] = useState(urlPageUser);
  const [currentPageApi, setCurrentPageApi] = useState(urlPageApi);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(urlSize);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // États pour les modals
  const [showRubriquesModal, setShowRubriquesModal] = useState(false);
  const [selectedEmployeForRubriques, setSelectedEmployeForRubriques] = useState(null);

  // États de recherche
  const [searchTerm, setSearchTerm] = useState({
    matricule: urlMatricule,
    nom: urlNom,
    prenom: urlPrenom,
    departement: urlDepartement,
    poste: urlPoste,
    typeContrat: urlTypeContrat
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaieModal, setShowPaieModal] = useState(false);

  // Fonction pour naviguer vers la page de gestion des périodes
  const goToPeriodesPaie = () => {
    navigate('/dashboard-RH/paie/periodes');
  };

  // Fonction pour récupérer la période active
  const fetchPeriodeActive = async () => {
    setLoadingPeriode(true);
    setPeriodeError('');
    try {
      const response = await axiosInstance.get('/api/periodes-paie/actif');
      if (response.data) {
        setPeriodeActive(response.data);
      } else {
        setPeriodeActive(null);
        setPeriodeError('Aucune période active trouvée');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la période active:', err);
      setPeriodeError('Impossible de charger la période active');
      setPeriodeActive(null);
    } finally {
      setLoadingPeriode(false);
    }
  };

  // Mettre à jour l'URL avec les paramètres actuels
  const updateURL = (pageUser, size, search) => {
    const params = new URLSearchParams();
    
    params.set('page', pageUser.toString());
    params.set('size', size.toString());
    
    if (search.nom) params.set('nom', search.nom);
    if (search.prenom) params.set('prenom', search.prenom);
    if (search.matricule) params.set('matricule', search.matricule);
    if (search.departement) params.set('departement', search.departement);
    if (search.poste) params.set('poste', search.poste);
    if (search.typeContrat) params.set('typeContrat', search.typeContrat);
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Charger les données initiales
  useEffect(() => {
    fetchEmployees(urlPageApi, urlSize);
  }, []);

  // Mettre à jour selectAll
  useEffect(() => {
    if (employees.length > 0) {
      const allEmployeeIds = employees
        .map(empDto => empDto.employe?.id)
        .filter(id => id != null);
      
      const allSelected = allEmployeeIds.length > 0 && 
                         allEmployeeIds.every(id => selectedIds.includes(id));
      setSelectAll(allSelected);
    }
  }, [selectedIds, employees]);

  const ouvrirModalCloture = () => {
    setShowClotureModal(true);
  };

  // Fonction pour ouvrir le modal d'ajout de période
  const handleOpenAddPeriodeModal = () => {
    setShowAddPeriodeModal(true);
  };

  // Fetch avec pagination
  const fetchEmployees = async (pageApi, size) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/employes/allEmpWithInfos', {
        params: {
          page: pageApi, 
          size: size,
          sortBy: 'nom',
          direction: 'asc'
        }
      });
      
      if (response.data.employes) {
        setEmployees(response.data.employes);
        
        const apiPage = response.data.currentPage || 0;
        const userPage = apiPage + 1;
        
        setCurrentPageApi(apiPage);
        setCurrentPageUser(userPage);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
        setPageSize(response.data.pageSize || size);
        setHasNext(response.data.hasNext || false);
        setHasPrevious(response.data.hasPrevious || false);
        
        updateURL(userPage, response.data.pageSize || size, searchTerm);
      }
    } catch (error) {
      console.error(error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le clic sur une ligne
  const handleRowClick = (empDto) => {
    const employe = empDto.employe || {};
    setSelectedEmployeForRubriques({
      id: employe.id,
      nom: employe.nom,
      prenom: employe.prenom
    });
    setShowRubriquesModal(true);
  };

  // Changement de page
  const handlePageChange = (newPageUser) => {
    if (newPageUser >= 1 && newPageUser <= totalPages) {
      const newPageApi = newPageUser - 1;
      
      setCurrentPageUser(newPageUser);
      setCurrentPageApi(newPageApi);
      fetchEmployees(newPageApi, pageSize);
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  // Changement de taille de page
  const handlePageSizeChange = (newSize) => {
    const newPageSize = parseInt(newSize);
    setPageSize(newPageSize);
    setCurrentPageUser(1);
    setCurrentPageApi(0);
    fetchEmployees(0, newPageSize);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Fonctions utilitaires
  const getContratPrincipal = (infosArray) => {
    if (!infosArray || !Array.isArray(infosArray)) return null;
    const sortedInfos = [...infosArray].sort((a, b) => 
      new Date(a.dateDebutAssignationPoste || a.dateEmbauche || '') - 
      new Date(b.dateDebutAssignationPoste || b.dateEmbauche || '')
    );
    return sortedInfos.find(info => info.typeContrat?.id === "CONT001") || 
           sortedInfos.find(info => info.typeContrat?.id !== "CONT002") || 
           sortedInfos[sortedInfos.length - 1];
  };

  // Filtrer les employés côté client
  const filteredEmployees = useMemo(() => {
    return employees.filter(empDto => {
      const employe = empDto.employe || {};
      const infosPro = getContratPrincipal(empDto.infosProfessionnelles || []) || {};
      
      const matricule = infosPro.matricule || '';
      const poste = infosPro.poste?.nom || '';
      const typeContrat = infosPro.typeContrat?.intitule || '';
      
      let departement = '';
      if (infosPro.departement?.nom) {
        departement = infosPro.departement.nom;
      } else if (infosPro.poste?.departement?.nom) {
        departement = infosPro.poste.departement.nom;
      }

      return (
        matricule.toLowerCase().includes(searchTerm.matricule.toLowerCase()) &&
        employe.nom?.toLowerCase().includes(searchTerm.nom.toLowerCase()) &&
        employe.prenom?.toLowerCase().includes(searchTerm.prenom.toLowerCase()) &&
        departement.toLowerCase().includes(searchTerm.departement.toLowerCase()) &&
        poste.toLowerCase().includes(searchTerm.poste.toLowerCase()) &&
        typeContrat.toLowerCase().includes(searchTerm.typeContrat.toLowerCase())
      );
    });
  }, [employees, searchTerm]);

  // Mettre à jour l'URL quand les termes de recherche changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPageUser === 1) {
        updateURL(1, pageSize, searchTerm);
      } else {
        setCurrentPageUser(1);
        setCurrentPageApi(0);
        fetchEmployees(0, pageSize);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = (field, value) => {
    setSearchTerm(prev => ({ ...prev, [field]: value }));
  };

  const resetSearch = () => {
    const resetSearchTerm = {
      matricule: '',
      nom: '',
      prenom: '',
      departement: '',
      poste: '',
      typeContrat: ''
    };
    
    setSearchTerm(resetSearchTerm);
    setCurrentPageUser(1);
    setCurrentPageApi(0);
    fetchEmployees(0, pageSize);
    updateURL(1, pageSize, resetSearchTerm);
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      const allEmployeeIds = filteredEmployees
        .map(empDto => empDto.employe?.id)
        .filter(id => id != null);
      setSelectedIds(allEmployeeIds);
    } else {
      setSelectedIds([]);
    }
  };

  // Fonction pour ouvrir le modal de génération de paie
  const openPaieModal = async () => {
    // Recharger la période active avant d'ouvrir le modal
    await fetchPeriodeActive();
    setShowPaieModal(true);
  };

  // Fonction pour générer la paie
  const handleGeneratePaie = async () => {
    if (!periodeActive) {
      alert('Aucune période active disponible');
      return;
    }

    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins un employé');
      return;
    }

    try {
      // Utiliser la période active récupérée
      const periode = {
        id: periodeActive.id,
        dateDebut: periodeActive.dateDebut,
        dateFin: periodeActive.dateFin,
        statut: periodeActive.statut
      };

      // Créer la liste des paies
      const les_paies = selectedIds.map(employeId => ({
          datePaiement: new Date().toISOString().split('T')[0],
          modePaiement: "Virement bancaire",
          classification: "Normale",
          matricule: "",
          nom: "",
          prenom: "",
          fonction: "",
          salaireBase: null,
          numCnaps: null,
          ancienneteAnMoisJour: "",
          departement: "",
          congesPris: 0,
          soldeConges: 0,
          statutCloture: 0,
          informationSociete: { id: 1 },
          employe: { id: employeId }
      }));

      // Créer l'objet de requête combiné
      const requestData = {
          periode: periode,
          les_paies: les_paies
      };

      console.log("Données envoyées à l'API:", requestData);
      
      const response = await axiosInstance.post(
        '/api/paies/generer-multiples', 
        requestData,
        { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );

      if (response.status === 201) {
        const createdPaies = response.data;
        
        // Afficher le nom de la période dans le message de succès
        const nomPeriode = periodeActive.mois?.nom 
          ? `${periodeActive.mois.nom} ${periodeActive.annee}`
          : `du ${formatDate(periodeActive.dateDebut)} au ${formatDate(periodeActive.dateFin)}`;
        
        alert(`${createdPaies.length} paie(s) générée(s) avec succès pour la période ${nomPeriode} !`);
        
        setShowPaieModal(false);
        setSelectedIds([]);
        setSelectAll(false);
        setPeriodeActive(null);
        
        fetchEmployees(currentPageApi, pageSize);
      }

    } catch (error) {
      console.error('Erreur détaillée:', error);
      
      if (error.response) {
        console.log("erreur : ", error.response.data);
        alert(`Erreur ${error.response.status}: ${error.response.data.message || 'Erreur lors de la génération des paies'}`);
      } else if (error.request) {
        alert('Erreur: Aucune réponse du serveur. Vérifiez votre connexion.');
      } else {
        alert('Erreur: ' + error.message);
      }
    }
  };

  const getContratBadge = (typeContrat) => {
    switch(typeContrat) {
      case 'CDI': return <Badge bg="success">CDI</Badge>;
      case 'CDD': return <Badge bg="info">CDD</Badge>;
      case 'Stage': return <Badge bg="secondary">Stage</Badge>;
      default: return <Badge bg="light" text="dark">{typeContrat || '-'}</Badge>;
    }
  };

  // Générer les éléments de pagination
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= 1) return items;
    
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPageUser - 1)}
        disabled={!hasPrevious}
      />
    );
    
    let startPage = Math.max(1, currentPageUser - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      items.push(
        <Pagination.Item 
          key={1} 
          active={1 === currentPageUser}
          onClick={() => handlePageChange(1)}
        >
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPageUser}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          active={totalPages === currentPageUser}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPageUser + 1)}
        disabled={!hasNext}
      />
    );
    
    return items;
  };

  if (loading && currentPageUser === 1) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* En-tête avec les boutons */}
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <div className="d-flex gap-2 flex-wrap">
            {/* NOUVEAU : Bouton Gestion des périodes */}
            <Button
              variant="outline-info"
              size="sm"
              onClick={goToPeriodesPaie}
              className="d-flex align-items-center gap-1"
              title="Gérer les périodes de paie"
            >
              <Calendar2Month size={16} />
              <span className="d-none d-sm-inline">Périodes</span>
            </Button>

            {/* Bouton Clôture */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={ouvrirModalCloture}
              className="d-flex align-items-center gap-1"
            >
              <LockFill size={14} />
              <span className="d-none d-sm-inline">Clôture</span>
            </Button>
          </div>
        </Col>
        
        {/* Affichage de la période active en cours */}
        <Col xs="auto" className="ms-auto">
          {loadingPeriode ? (
            <Spinner size="sm" animation="border" variant="primary" />
          ) : periodeActive ? (
            <div className="d-flex align-items-center gap-2">
              <Badge bg="success" className="p-2">
                <CheckCircle size={12} className="me-1" />
                Période active
              </Badge>
              <small className="text-muted">
                {periodeActive.mois?.nom 
                  ? `${periodeActive.mois.nom} ${periodeActive.annee}`
                  : `${formatDate(periodeActive.dateDebut)} - ${formatDate(periodeActive.dateFin)}`}
              </small>
            </div>
          ) : periodeError ? (
            <div className="d-flex align-items-center gap-2">
              <Badge bg="warning" className="p-2">
                ⚠️ Aucune période active
              </Badge>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleOpenAddPeriodeModal}
              >
                <Plus size={12} className="me-1" />
                Créer
              </Button>
            </div>
          ) : null}
        </Col>
      </Row>

      {/* Barre d'actions pour les employés sélectionnés */}
      {selectedIds.length > 0 && (
        <Card className="mb-3 border-primary">
          <Card.Body className="py-2">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={18} className="text-primary" />
                  <span className="fw-medium">{selectedIds.length} employé(s) sélectionné(s)</span>
                  <Badge bg="primary">{selectedIds.length}</Badge>
                </div>
              </Col>
              <Col xs="auto">
                <Button
                  variant="success"
                  size="sm"
                  onClick={openPaieModal}
                  disabled={loadingPeriode || !periodeActive}
                  className="d-flex align-items-center gap-1"
                >
                  {loadingPeriode ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <BarChart2 size={14} />
                      <span>Générer Paie</span>
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" size="sm" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtres de recherche */}
      <Card className="mb-3 border">
        <Card.Body className="py-2">
          <Row className="g-2">
            {[
              { field: 'matricule', placeholder: 'Matricule', icon: Hash },
              { field: 'nom', placeholder: 'Nom', icon: User },
              { field: 'prenom', placeholder: 'Prénom', icon: User },
              { field: 'departement', placeholder: 'Département', icon: Briefcase },
              { field: 'poste', placeholder: 'Poste', icon: Award },
              { field: 'typeContrat', placeholder: 'Type Contrat', icon: FileText }
            ].map(({ field, placeholder, icon: Icon }) => (
              <Col xs={6} md={4} lg={2} key={field}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-light">
                    <Icon size={12} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm[field]}
                    onChange={(e) => handleSearchChange(field, e.target.value)}
                    size="sm"
                  />
                </InputGroup>
              </Col>
            ))}
            <Col xs={6} md={4} lg={2}>
              <div className="d-flex gap-1">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={resetSearch} 
                  className="flex-grow-1"
                >
                  <X size={12} className="me-1" />
                  Réinitialiser
                </Button>
              </div>
            </Col>
          </Row>
          
          {Object.values(searchTerm).some(term => term.trim() !== '') && (
            <small className="text-muted d-block mt-2">
              <Filter size={10} className="me-1" />
              {filteredEmployees.length} résultat{filteredEmployees.length > 1 ? 's' : ''} trouvé(s) sur cette page
            </small>
          )}
        </Card.Body>
      </Card>

      {/* Tableau */}
      <Card className="border">
        <Card.Body className="p-0">
          {loading && currentPageUser > 1 ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" variant="primary" />
              <span className="ms-2">Chargement de la page {currentPageUser}...</span>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover size="sm" className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: '50px' }}>
                        <div className="form-check">
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            ref={el => {
                              if (el) {
                                el.indeterminate = 
                                  selectedIds.length > 0 && 
                                  selectedIds.length < filteredEmployees.filter(e => e.employe?.id).length;
                              }
                            }}
                          />
                        </div>
                      </th>
                      <th className="py-2 ps-3">Matricule</th>
                      <th className="py-2 ps-3">Nom</th>
                      <th className="py-2 ps-3">Prénom(s)</th>
                      <th className="py-2">Département</th>
                      <th className="py-2">Poste</th>
                      <th className="py-2 text-center">Etat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(empDto => {
                        const employe = empDto.employe || {};
                        const infosPro = getContratPrincipal(empDto.infosProfessionnelles || []) || {};
                        
                        const departement = infosPro.departement?.nom || infosPro.poste?.departement?.nom || '-';
                        const poste = infosPro.poste?.nom || '-';
                        const typeContrat = infosPro.typeContrat?.intitule || '';
                        const employeeId = employe.id;
                        
                        return (
                          <tr 
                            key={employeeId}
                            onClick={(e) => {
                              if (e.target.type !== 'checkbox' && e.target.className !== 'form-check-input') {
                                handleRowClick(empDto);
                              }
                            }}
                          >
                            <td>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={employeeId ? selectedIds.includes(employeeId) : false}
                                  onChange={() => handleSelectOne(employeeId)}
                                  disabled={!employeeId}
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <div>
                                <div className="text-muted small">{infosPro.matricule || '-'}</div>
                              </div>
                            </td>
                            <td className="py-2">
                              <small>{employe.nom}</small>
                            </td>
                            <td className="py-2">
                              <small>{employe.prenom}</small>
                            </td>
                            <td className="py-2">
                              <small>{departement}</small>
                            </td>
                            <td className="py-2">
                              <small>{poste}</small>
                            </td>
                            <td className='py-2 text-center'>
                              {!employe.actif && (
                                <XCircle 
                                  className="text-danger" 
                                  title="Employé inactif"
                                  style={{ fontSize: '1.1rem', cursor: 'help' }}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="d-flex flex-column align-items-center">
                            <Search size={24} className="text-muted mb-2" />
                            <small className="text-muted">
                              {Object.values(searchTerm).some(term => term.trim() !== '') 
                                ? "Aucun employé ne correspond aux critères de recherche" 
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
              {totalPages > 0 && (
                <div className="border-top px-3 py-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <small className="text-muted">
                        Page <strong>{currentPageUser}</strong> sur <strong>{totalPages}</strong> • 
                        Affichage de <strong>{filteredEmployees.length}</strong> employé(s) sur <strong>{totalItems}</strong> 
                      </small>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted">Afficher :</small>
                      <select 
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                      <small className="text-muted">par page</small>
                    </div>
                    
                    <div>
                      <Pagination className="mb-0" size="sm">
                        {renderPaginationItems()}
                      </Pagination>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* MODAL pour générer la paie */}
      {showPaieModal && (
        <div className="modal_perso">
          <div className="modal-dialog-custom">
            <div className="modal-content-custom">
              <div className="modal-header-custom">
                <h5 className="modal-title m-0">
                  <BarChart2 className="me-2" size={20} />
                  Générer la Paie
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowPaieModal(false);
                    setPeriodeActive(null);
                  }}
                  aria-label="Fermer"
                ></button>
              </div>
              
              <div className="modal-body-custom">
                {loadingPeriode ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Chargement de la période active...</p>
                  </div>
                ) : periodeError ? (
                  <Alert variant="warning">
                    <Alert.Heading>⚠️ Période active non trouvée</Alert.Heading>
                    <p>
                      {periodeError}. Veuillez d'abord créer une période active 
                      avant de générer les paies.
                    </p>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setShowPaieModal(false);
                          handleOpenAddPeriodeModal();
                        }}
                      >
                        <Calendar size={14} className="me-2" />
                        Créer une période
                      </Button>
                    </div>
                  </Alert>
                ) : periodeActive && (
                  <>
                    <div className="mb-4">
                      <h6 className="fw-bold">Employés sélectionnés : {selectedIds.length}</h6>
                      <div className="border rounded p-2 bg-light">
                        <small className="text-muted">
                          <strong>IDs des employés :</strong> {selectedIds.join(', ')}
                        </small>
                      </div>
                    </div>

                    {/* Informations de la période active */}
                    <div className="alert alert-success">
                      <div className="d-flex align-items-center mb-2">
                        <CheckCircle size={18} className="text-success me-2" />
                        <strong>Période active sélectionnée</strong>
                      </div>
                      <ul className="mb-0">
                        <li>
                          <strong>Période :</strong> {
                            periodeActive.mois?.nom 
                              ? `${periodeActive.mois.nom} ${periodeActive.annee}`
                              : `${formatDate(periodeActive.dateDebut)} - ${formatDate(periodeActive.dateFin)}`
                          }
                        </li>
                        <li>
                          <strong>Du :</strong> {formatDate(periodeActive.dateDebut)}
                        </li>
                        <li>
                          <strong>Au :</strong> {formatDate(periodeActive.dateFin)}
                        </li>
                        <li>
                          <strong>Durée :</strong> {calculateDuration(periodeActive.dateDebut, periodeActive.dateFin)} jour(s)
                        </li>
                        <li>
                          <strong>Statut :</strong>{' '}
                          <Badge bg={periodeActive.statut === 1 ? 'success' : 'warning'}>
                            {periodeActive.statut === 1 ? 'Actif' : 'En attente'}
                          </Badge>
                        </li>
                      </ul>
                    </div>

                    {/* Validation */}
                    {periodeActive.statut !== 1 && (
                      <Alert variant="warning">
                        <small>
                          <strong>⚠️ Attention :</strong> Cette période n'est pas active.
                          Vous ne pourrez pas générer de paies.
                        </small>
                      </Alert>
                    )}
                  </>
                )}
              </div>
              
              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPaieModal(false);
                    setPeriodeActive(null);
                  }}
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGeneratePaie}
                  disabled={!periodeActive || periodeActive.statut !== 1 || loadingPeriode}
                >
                  {loadingPeriode ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="me-2" size={16} />
                      Générer la Paie
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rubriques */}
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

      {/* MODAL DE CLÔTURE */}
      <ClotureModal
        show={showClotureModal}
        onHide={() => setShowClotureModal(false)}
      />

      {/* Bouton flottant pour mobile */}
      <div className="d-block d-sm-none position-fixed bottom-3 end-3">
        <Button
          variant="primary"
          size="lg"
          className="rounded-circle p-2 shadow"
          onClick={handleOpenAddPeriodeModal}
        >
          <Calendar size={20} />
        </Button>
      </div>
    </Container>
  );
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function calculateDuration(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return 0;
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const diffTime = Math.abs(fin - debut);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export default EditionPaie;