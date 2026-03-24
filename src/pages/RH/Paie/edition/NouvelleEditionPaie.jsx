// src/pages/RH/Paie/NouvelleEditionPaie.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockFill, Calendar2Month } from 'react-bootstrap-icons';
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
  Modal
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
  X
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
  
  // État pour la période active
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
  const [etatFiltre, setEtatFiltre] = useState(null); // null = tous, 0,1,2
  
  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  
  // États pour la pagination côté client
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Navigation
  const goToPeriodesPaie = () => {
    navigate('/dashboard-RH/paie/periodes');
  };

  // Charger les données au montage
  useEffect(() => {
    fetchDonnees();
    fetchPeriodeActive();
  }, []);

  // Mettre à jour les employés filtrés quand les données ou la recherche changent
  useEffect(() => {
    filterEmployes();
  }, [employesPaie, searchTerm, etatFiltre]);

  // Mettre à jour selectAll - Pour TOUS les employés (y compris actifs)
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
      // Récupérer tous les employés avec leur état
      const employesResponse = await axiosInstance.get('/api/employes-paie');
      setEmployesPaie(employesResponse.data || []);
      
      // Récupérer les statistiques
      const statsResponse = await axiosInstance.get('/api/employes-paie/employes-paie/stats');
      setStats(statsResponse.data || { inactif: 0, enAttente: 0, actif: 0 });
      
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer la période active
  const fetchPeriodeActive = async () => {
    setLoadingPeriode(true);
    try {
      const response = await axiosInstance.get('/api/periodes-paie/actif');
      setPeriodeActive(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de la période active:', err);
      setPeriodeActive(null);
    } finally {
      setLoadingPeriode(false);
    }
  };

  const filterEmployes = () => {
    let filtered = [...employesPaie];
    
    // Filtrer par état si sélectionné
    if (etatFiltre !== null) {
      filtered = filtered.filter(emp => emp.etat === etatFiltre);
    }
    
    // Filtrer par recherche textuelle
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

  // Sélectionner/désélectionner un employé (TOUS peuvent être sélectionnés)
  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Sélectionner/désélectionner tous les employés filtrés (y compris actifs)
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Sélectionner TOUS les employés filtrés
      const allIds = filteredEmployes
        .map(emp => emp.employeAvecInfosDTO?.employe?.id)
        .filter(id => id);
      
      setSelectedIds(allIds);
    } else {
      // Désélectionner tout
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

  // Ouvrir le modal de génération - FILTRE les actifs pour la génération
  const openGenerateModal = () => {
    if (!periodeActive) {
      alert('Aucune période active trouvée. Veuillez d\'abord créer une période.');
      return;
    }
    
    // Filtrer pour ne garder que les employés non-actifs pour la génération
    const eligibleIds = selectedIds.filter(id => {
      const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
      return emp && emp.etat !== 2;
    });
    
    if (eligibleIds.length === 0) {
      alert('Aucun employé éligible sélectionné (les employés avec paie déjà générée ne peuvent pas avoir de nouvelle génération).');
      return;
    }
    
    // Si certains employés actifs ont été sélectionnés, on les retire pour la génération
    if (eligibleIds.length < selectedIds.length) {
      const actifsCount = selectedIds.length - eligibleIds.length;
      alert(`${actifsCount} employé(s) avec paie déjà générée ont été retirés de la sélection pour la génération.`);
      setSelectedIds(eligibleIds);
    }
    
    setGenerateResult(null);
    setShowGenerateModal(true);
  };

  // Fonction pour fermer le modal de génération
  const handleCloseGenerateModal = (shouldDeselect = false) => {
    setShowGenerateModal(false);
    setGenerateResult(null);
    
    if (shouldDeselect) {
      setSelectedIds([]);
    }
  };

  // Fonction pour générer la paie
  const handleGeneratePaie = async () => {
    if (!periodeActive) {
      alert('Aucune période active disponible');
      return;
    }

    setGenerating(true);
    setGenerateResult(null);
    
    try {
      // Créer les objets Paie pour chaque employé sélectionné (déjà filtrés non-actifs)
      const les_paies = selectedIds.map(employeId => {
        const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === employeId);
        const infos = emp?.employeAvecInfosDTO?.infosProfessionnelles?.[0] || {};
        const employe = emp?.employeAvecInfosDTO?.employe || {};
        
        return {
          modePaiement: "Virement bancaire",
          datePaiement: new Date().toISOString().split('T')[0],
          classification: "Normale",
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
          // Succès - recharger les données et désélectionner après 3 secondes
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fonction pour obtenir le petit rond de statut
  const getEtatRond = (etat) => {
    switch(etat) {
      case 0:
        return (
          <span 
            style={{ 
              display: 'inline-block',
              width: '16px', 
              height: '16px', 
              borderRadius: '50%',
              backgroundColor: '#dc3545',
              margin: '0 auto'
            }}
            title="Période inactive"
          />
        );
      case 1:
        return (
          <span 
            style={{ 
              display: 'inline-block',
              width: '16px', 
              height: '16px', 
              borderRadius: '50%',
              backgroundColor: '#ffc107',
              margin: '0 auto'
            }}
            title="En attente"
          />
        );
      case 2:
        return (
          <span 
            style={{ 
              display: 'inline-block',
              width: '16px', 
              height: '16px', 
              borderRadius: '50%',
              backgroundColor: '#28a745',
              margin: '0 auto'
            }}
            title="Paie générée"
          />
        );
      default:
        return (
          <span 
            style={{ 
              display: 'inline-block',
              width: '16px', 
              height: '16px', 
              borderRadius: '50%',
              backgroundColor: '#6c757d',
              margin: '0 auto'
            }}
            title="Inconnu"
          />
        );
    }
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
    <Container fluid className="py-3">
      {/* Première ligne : Statistiques à gauche et boutons à droite */}
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={6}>
          <div className="d-flex gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-1">
              <span 
                style={{ 
                  display: 'inline-block',
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%',
                  backgroundColor: '#dc3545'
                }}
              />
              <small className="text-muted">Inactif: <strong>{stats.inactif}</strong></small>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span 
                style={{ 
                  display: 'inline-block',
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%',
                  backgroundColor: '#ffc107'
                }}
              />
              <small className="text-muted">En attente: <strong>{stats.enAttente}</strong></small>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span 
                style={{ 
                  display: 'inline-block',
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%',
                  backgroundColor: '#28a745'
                }}
              />
              <small className="text-muted">Généré: <strong>{stats.actif}</strong></small>
            </div>
            {periodeActive && (
              <Badge bg="success" className="ms-2">
                {periodeActive.mois?.nom || ''} {periodeActive.annee || ''}
              </Badge>
            )}
          </div>
        </Col>
        
        <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
          <div className="d-flex gap-2 justify-content-md-end">
            <Button
              variant="outline-info"
              size="sm"
              onClick={goToPeriodesPaie}
              className="d-flex align-items-center gap-1"
            >
              <Calendar2Month size={16} />
              <span>Périodes</span>
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setShowClotureModal(true)}
              className="d-flex align-items-center gap-1"
            >
              <LockFill size={14} />
              <span>Clôture</span>
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filtres et recherche */}
      <Card className="mb-3">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={4}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light">
                  <Search size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher (matricule, nom, poste...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={14} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            
            <Col xs={6} md={3}>
              <Form.Select 
                size="sm"
                value={etatFiltre === null ? '' : etatFiltre}
                onChange={(e) => setEtatFiltre(e.target.value === '' ? null : parseInt(e.target.value))}
              >
                <option value="">Tous les états</option>
                <option value="0">Période inactive</option>
                <option value="1">En attente</option>
                <option value="2">Paie générée</option>
              </Form.Select>
            </Col>
            
            <Col xs={6} md={2}>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={resetSearch}
                className="w-100"
              >
                <Filter size={14} className="me-1" />
                Réinitialiser
              </Button>
            </Col>
            
            <Col xs={12} md={3} className="text-md-end">
              <small className="text-muted">
                {filteredEmployes.length} employé(s) trouvé(s)
                {filteredEmployes.filter(emp => emp.etat === 2).length > 0 && (
                  <span className="ms-1 text-warning">
                    ({filteredEmployes.filter(emp => emp.etat === 2).length} générés)
                  </span>
                )}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Barre d'actions pour la sélection */}
      {selectedIds.length > 0 && (
        <Card className="mb-3 border-primary">
          <Card.Body className="py-2">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={18} className="text-primary" />
                  <span className="fw-medium">{selectedIds.length} employé(s) sélectionné(s)</span>
                  <Badge bg="primary">{selectedIds.length}</Badge>
                  {selectedIds.filter(id => {
                    const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
                    return emp && emp.etat === 2;
                  }).length > 0 && (
                    <small className="text-warning">
                      ({selectedIds.filter(id => {
                        const emp = employesPaie.find(e => e.employeAvecInfosDTO?.employe?.id === id);
                        return emp && emp.etat === 2;
                      }).length} avec paie existante - ne seront pas générés)
                    </small>
                  )}
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedIds([]);
                    }}
                    className="d-flex align-items-center gap-1"
                  >
                    <X size={14} />
                    <span>Tout désélectionner</span>
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={openGenerateModal}
                    disabled={!periodeActive || loadingPeriode}
                    className="d-flex align-items-center gap-1"
                  >
                    {loadingPeriode ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <>
                        <BarChart2 size={14} />
                        <span>Générer la paie</span>
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
      <Card>
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
                        <td className="text-center">
                          {getEtatRond(emp.etat)}
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
                    Page {currentPage} sur {totalPages} • 
                    {filteredEmployes.length} employé(s) au total
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
        <Modal.Header closeButton>
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
                Cette action va créer les bulletins de paie pour la période active.
              </p>
            </>
          ) : (
            // Affichage du résultat
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
                          ✅ {generateResult.resume.generes} généré(s)
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