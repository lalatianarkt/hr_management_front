// ManagerList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/AxiosInstance';
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
  Modal
} from 'react-bootstrap';
import {
  FaUserTie,
  FaBuilding,
  FaCalendarAlt,
  FaSearch,
  FaSync,
  FaEye,
  FaFilter,
  FaChartBar,
  FaIdCard,
  FaUser,
  FaClock,
  FaInfoCircle,
  FaTimes,
  FaArchive,
  FaDownload,
  FaFileExcel,
  FaEdit,
  FaTrash,
  FaEllipsisV
} from 'react-icons/fa';

// Plus besoin de l'import AssignManagerModal
// import AssignManagerModal from './AssignManagerModal';

const ManagerList = () => {
  const navigate = useNavigate();
  
  // États
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState({
    nom: '',
    prenom: '',
    departement: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedManager, setSelectedManager] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    departments: 0
  });

  // États pour le modal d'archivage
  const [archiveData, setArchiveData] = useState({
    reason: '',
    endDate: ''
  });

  // Supprimé l'état showAssignModal

  // Supprimé le callback handleAssignSuccess

  // Charger les données
  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get('/api/manager-departements');
      console.log("data : ", response.data);
      setManagers(response.data);
      setFilteredManagers(response.data);
      updateStats(response.data);
    } catch (err) {
      setError('Erreur de chargement des données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  // Mettre à jour les statistiques
  const updateStats = (data) => {
    const total = data.length;
    const active = data.filter(m => m.statutManager === 0).length;
    const departments = [...new Set(data.map(m => m.nomDepartement).filter(d => d))].length;
    
    setStats({ total, active, departments });
  };

  // Filtrer les managers
  useEffect(() => {
    let result = managers;
    
    // Filtrer par statut
    if (statusFilter === 'active') {
      result = result.filter(m => m.statutManager === 0);
    } else if (statusFilter === 'inactive') {
      result = result.filter(m => m.statutManager === 1);
    }
    
    // Filtrer par recherche
    const term = searchTerm;
    if (term.nom || term.prenom || term.departement) {
      result = result.filter(m => {
        const matchesNom = term.nom ? (m.nomManager && m.nomManager.toLowerCase().includes(term.nom.toLowerCase())) : true;
        const matchesPrenom = term.prenom ? (m.prenomManager && m.prenomManager.toLowerCase().includes(term.prenom.toLowerCase())) : true;
        const matchesDepartement = term.departement ? (m.nomDepartement && m.nomDepartement.toLowerCase().includes(term.departement.toLowerCase())) : true;
        
        return matchesNom && matchesPrenom && matchesDepartement;
      });
    }
    
    setFilteredManagers(result);
    updateStats(result);
  }, [searchTerm, statusFilter, managers]);

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Formater la date pour l'input date
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Vérifier si c'est actuel
  const isCurrent = (dateFin) => {
    if (!dateFin) return true;
    return new Date(dateFin) > new Date();
  };

  // Afficher les détails d'un manager
  const handleViewDetails = (manager) => {
    setSelectedManager(manager);
    setShowDetailsModal(true);
  };

  // Ouvrir le modal d'archivage
  const handleOpenArchive = (manager) => {
    setSelectedManager(manager);
    // Initialiser les données d'archivage
    setArchiveData({
      reason: '',
      endDate: formatDateForInput(manager.dateFin) || formatDateForInput(new Date())
    });
    setShowArchiveModal(true);
  };

  // Gérer les changements dans le formulaire d'archivage
  const handleArchiveChange = (e) => {
    const { name, value } = e.target;
    setArchiveData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Archiver un manager
  const handleArchiveManager = async () => {
    if (!selectedManager || !archiveData.reason.trim()) {
      setError('Veuillez saisir un motif d\'archivage');
      return;
    }
    
    try {
      const dataToSend = {
        statut: 1,
        commentaire: archiveData.reason,
        dateFin: archiveData.endDate || formatDateForInput(new Date())
      };
      
      const response = await axiosInstance.put(
        `/api/managers/update/${selectedManager.idManager}`,
        dataToSend
      );
      
      setSuccessMessage('Manager archivé avec succès!');
      
      // Mettre à jour la liste
      const updatedManagers = managers.map(manager =>
        manager.idManager === selectedManager.idManager ? response.data : manager
      );
      
      setManagers(updatedManagers);
      setShowArchiveModal(false);
      
      // Cacher le message après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError('Erreur lors de l\'archivage du manager');
      console.error('Erreur:', err);
    }
  };

  // Gérer les changements de recherche
  const handleSearchChange = (field, value) => {
    setSearchTerm(prev => ({ ...prev, [field]: value }));
  };

  // Réinitialiser la recherche
  const resetSearch = () => {
    setSearchTerm({
      nom: '',
      prenom: '',
      departement: ''
    });
  };

  // Modal d'archivage
  const ArchiveManagerModal = () => {
    const [localArchiveData, setLocalArchiveData] = useState({
      reason: '',
      endDate: ''
    });

    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
      if (showArchiveModal && selectedManager) {
        setLocalArchiveData({
          reason: '',
          endDate: formatDateForInput(selectedManager.dateFin) || formatDateForInput(new Date())
        });
      }
    }, [showArchiveModal, selectedManager]);

    const handleLocalArchiveChange = (e) => {
      const { name, value } = e.target;
      setLocalArchiveData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleConfirmArchive = async () => {
      if (!selectedManager || !localArchiveData.reason.trim()) {
        setError('Veuillez saisir un motif d\'archivage');
        return;
      }
      
      try {
        const dataToSend = {
          statut: 1,
          commentaire: localArchiveData.reason,
          dateFin: localArchiveData.endDate || formatDateForInput(new Date())
        };
        
        const response = await axiosInstance.put(
          `/api/managers/update/${selectedManager.idManager}`,
          dataToSend
        );
        
        setSuccessMessage('Manager archivé avec succès!');
        
        const updatedManagers = managers.map(manager =>
          manager.idManager === selectedManager.idManager ? response.data : manager
        );
        
        setManagers(updatedManagers);
        setShowArchiveModal(false);
        
        setTimeout(() => setSuccessMessage(''), 3000);
        
      } catch (err) {
        setError('Erreur lors de l\'archivage du manager');
        console.error('Erreur:', err);
      }
    };

    if (!selectedManager || !showArchiveModal) return null;

    return (
      <Modal show={showArchiveModal} onHide={() => setShowArchiveModal(false)}>
        <Modal.Header closeButton closeLabel="Fermer" className="bg-warning text-dark">
          <Modal.Title>
            <FaArchive className="me-2" />
            Archiver le Manager
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-3">
            <FaInfoCircle className="me-2" />
            Vous êtes sur le point d'archiver le manager :<br />
            <strong>{selectedManager.nomManager} {selectedManager.prenomManager}</strong>
          </Alert>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date de fin de fonction*</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={localArchiveData.endDate}
                onChange={handleLocalArchiveChange}
                max={currentDate}
                required
              />
              <Form.Text className="text-muted">
                Date à laquelle le manager a cessé ses fonctions
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Motif d'archivage*</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="reason"
                value={localArchiveData.reason}
                onChange={handleLocalArchiveChange}
                placeholder="Veuillez saisir le motif de l'archivage (démission, mutation, fin de contrat, etc.)"
                required
              />
              <Form.Text className="text-muted">
                Ce commentaire sera enregistré dans l'historique
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowArchiveModal(false)}>
            <FaTimes className="me-1" />
            Annuler
          </Button>
          <Button variant="warning" onClick={handleConfirmArchive}>
            <FaArchive className="me-1" />
            Confirmer l'archivage
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Modal de détails
  const ManagerDetailsModal = () => {
    if (!selectedManager) return null;

    const statusClass = selectedManager.statutManager === 0 ? 'status-active' : 'status-inactive';
    const statusText = selectedManager.statutManager === 0 ? 'Actif' : 'Archivé';
    const current = isCurrent(selectedManager.dateFin);

    return (
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton closeLabel="Fermer" className="modal-header">
          <Modal.Title>
            <FaUserTie className="me-2" />
            Détails du Manager
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4}>
              <div className="text-center mb-4">
                <div className="avatar-circle-lg mx-auto mb-3">
                  {selectedManager.nomManager?.charAt(0)}{selectedManager.prenomManager?.charAt(0)}
                </div>
                <h4>{selectedManager.nomManager} {selectedManager.prenomManager}</h4>
                <Badge className={`${statusClass} fs-6`}>{statusText}</Badge>
              </div>
            </Col>
            
            <Col md={8}>
              <h5 className="mb-3">Informations Générales</h5>
              
              <div className="info-section mb-3">
                <label>ID Manager</label>
                <p className="info-value">{selectedManager.idManager}</p>
              </div>
              
              <div className="info-section mb-3">
                <label>ID Employé</label>
                <p className="info-value">{selectedManager.idEmploye}</p>
              </div>
              
              <h5 className="mt-4 mb-3">Département</h5>
              
              <div className="info-section mb-3">
                <label>Nom du Département</label>
                <p className="info-value">{selectedManager.nomDepartement || 'Non assigné'}</p>
              </div>
              
              <div className="info-section mb-3">
                <label>Description</label>
                <p className="info-value">{selectedManager.descriptionDepartement || 'Aucune description'}</p>
              </div>
              
              <h5 className="mt-4 mb-3">Période de Gestion</h5>
              
              <Row>
                <Col md={6}>
                  <div className="info-section mb-3">
                    <label>Date de Début</label>
                    <p className="info-value">{formatDate(selectedManager.dateDebut)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-section mb-3">
                    <label>Date de Fin</label>
                    <p className="info-value">
                      {selectedManager.dateFin ? formatDate(selectedManager.dateFin) : 'En cours'}
                      {current && !selectedManager.dateFin && (
                        <Badge bg="success" className="ms-2">Actuel</Badge>
                      )}
                    </p>
                  </div>
                </Col>
              </Row>
              
              {selectedManager.commentaire && (
                <>
                  <h5 className="mt-4 mb-3">Commentaire</h5>
                  <div className="info-section mb-3">
                    <label>Motif d'archivage</label>
                    <p className="info-value text-muted">{selectedManager.commentaire}</p>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
          {selectedManager.statutManager === 0 && (
            <Button
              variant="warning"
              onClick={() => {
                setShowDetailsModal(false);
                handleOpenArchive(selectedManager);
              }}
            >
              <FaArchive className="me-1" />
              Archiver
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  };

  // Rendu d'une ligne de tableau
  const ManagerTableRow = ({ manager }) => {
    const statusClass = manager.statutManager === 0 ? 'status-active' : 'status-inactive';
    const statusText = manager.statutManager === 0 ? 'Actif' : 'Archivé';
    const current = isCurrent(manager.dateFin);

    return (
      <tr key={manager.idManager}>
        <td className="py-2 ps-3">
          <div>
            <div className="fw-medium">{manager.nomManager} {manager.prenomManager}</div>
            <small className="text-muted">{manager.idManager}</small>
          </div>
        </td>
        <td className="py-2">
          <div>
            <small>{manager.nomDepartement || 'Non assigné'}</small>
            <br />
            <small className="text-muted">{manager.idDepartement}</small>
          </div>
        </td>
        <td className="py-2">
          <small>{formatDate(manager.dateDebut)}</small>
        </td>
        <td className="py-2">
          {manager.dateFin ? (
            <small>{formatDate(manager.dateFin)}</small>
          ) : (
            <span className="text-success">
              <FaClock size={12} className="me-1" />
              <small>En cours</small>
            </span>
          )}
        </td>
        <td className="py-2">
          <Badge className={statusClass}>{statusText}</Badge>
        </td>
        <td className="py-2 pe-3 text-end">
          <div className="d-flex justify-content-end gap-1">
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => handleViewDetails(manager)}
              className="px-2"
              aria-label="Voir détails"
            >
              <FaEye size={12} />
            </Button>
            {manager.statutManager === 0 && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => handleOpenArchive(manager)}
                className="px-2"
                aria-label="Archiver"
              >
                <FaArchive size={12} />
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
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
      {/* En-tête compact */}
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h4 mb-0">Managers</h1>
            <Badge bg="light" text="dark" className="ms-2">
              {stats.total || 0}
            </Badge>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="d-flex align-items-center gap-1"
            >
              <FaFilter size={14} />
              <span className="d-none d-sm-inline">Filtre</span>
            </Button>

            {/* Bouton Affecter supprimé */}

            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                <FaChartBar size={14} />
                <span className="d-none d-sm-inline">Vue</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setViewMode('table')}>
                  <FaEye className="me-2" />
                  Tableau
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setViewMode('cards')}>
                  <FaUserTie className="me-2" />
                  Cartes
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={fetchManagers}
              className="d-flex align-items-center gap-1"
            >
              <FaSync size={14} />
              <span className="d-none d-sm-inline">Actualiser</span>
            </Button>
          </div>
        </Col>
      </Row>

      {/* Messages d'alerte */}
      {error && (
        <Alert variant="danger" size="sm" dismissible onClose={() => setError('')}>
          <FaInfoCircle className="me-2" />
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" size="sm" dismissible onClose={() => setSuccessMessage('')}>
          <FaInfoCircle className="me-2" />
          {successMessage}
        </Alert>
      )}

      {/* Statistiques compactes */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex flex-wrap gap-2">
            <div className="d-flex align-items-center gap-1 px-2 py-1 bg-primary bg-opacity-10 rounded">
              <FaUserTie size={12} className="text-primary" />
              <small className="fw-medium">{stats.total || 0}</small>
              <small className="text-muted ms-1">Total</small>
            </div>
            
            <div 
              className="d-flex align-items-center gap-1 px-2 py-1 bg-success bg-opacity-10 rounded"
              style={{ cursor: 'pointer' }}
              onClick={() => setStatusFilter('active')}
            >
              <FaUser size={12} className="text-success" />
              <small className="fw-medium">{stats.active || 0}</small>
              <small className="text-muted ms-1">Actifs</small>
            </div>
            
            <div 
              className="d-flex align-items-center gap-1 px-2 py-1 bg-secondary bg-opacity-10 rounded"
              style={{ cursor: 'pointer' }}
              onClick={() => setStatusFilter('inactive')}
            >
              <FaArchive size={12} className="text-secondary" />
              <small className="fw-medium">{stats.total - stats.active || 0}</small>
              <small className="text-muted ms-1">Archivés</small>
            </div>
            
            <div className="d-flex align-items-center gap-1 px-2 py-1 bg-info bg-opacity-10 rounded">
              <FaBuilding size={12} className="text-info" />
              <small className="fw-medium">{stats.departments || 0}</small>
              <small className="text-muted ms-1">Départements</small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filtres (affichés conditionnellement) */}
      {showSearch && (
        <Card className="mb-3 border">
          <Card.Body className="py-2">
            <Row className="g-2">
              <Col xs={12} sm={4}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <FaUser size={12} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nom"
                    value={searchTerm.nom}
                    onChange={(e) => handleSearchChange('nom', e.target.value)}
                    size="sm"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={4}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <FaUser size={12} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Prénom"
                    value={searchTerm.prenom}
                    onChange={(e) => handleSearchChange('prenom', e.target.value)}
                    size="sm"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={4}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white">
                    <FaBuilding size={12} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Département"
                    value={searchTerm.departement}
                    onChange={(e) => handleSearchChange('departement', e.target.value)}
                    size="sm"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Select 
                  size="sm" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs seulement</option>
                  <option value="inactive">Archivés seulement</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={6}>
                <div className="d-flex gap-1">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={resetSearch} 
                    className="flex-grow-1"
                  >
                    <FaTimes size={12} />
                    Réinitialiser
                  </Button>
                </div>
              </Col>
            </Row>
            {Object.values(searchTerm).some(term => term.trim() !== '') && (
              <small className="text-muted d-block mt-2">
                <FaFilter size={10} className="me-1" />
                {filteredManagers.length} résultat{filteredManagers.length > 1 ? 's' : ''}
              </small>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Tableau compact (vue par défaut) */}
      {viewMode === 'table' ? (
        <Card className="border">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover size="sm" className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-2 ps-3">Manager</th>
                    <th className="py-2">Département</th>
                    <th className="py-2">Date Début</th>
                    <th className="py-2">Date Fin</th>
                    <th className="py-2">Statut</th>
                    <th className="py-2 pe-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.length > 0 ? (
                    filteredManagers.slice(0, 15).map(manager => (
                      <ManagerTableRow key={manager.idManager} manager={manager} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="d-flex flex-column align-items-center">
                          <FaSearch size={24} className="text-muted mb-2" />
                          <small className="text-muted">Aucun manager trouvé</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            
            {/* Pagination/Info */}
            {filteredManagers.length > 0 && (
              <div className="border-top px-3 py-2 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Affichage de {Math.min(filteredManagers.length, 15)} sur {filteredManagers.length}
                  </small>
                  {filteredManagers.length > 15 && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {/* Logique pour voir plus */}}
                      className="d-flex align-items-center gap-1"
                    >
                      Voir plus
                      <FaEye size={12} />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : (
        /* Vue Cartes */
        <Row>
          {filteredManagers.length > 0 ? (
            filteredManagers.slice(0, 8).map(manager => {
              const statusClass = manager.statutManager === 0 ? 'status-active' : 'status-inactive';
              const statusText = manager.statutManager === 0 ? 'Actif' : 'Archivé';
              const current = isCurrent(manager.dateFin);

              return (
                <Col md={6} lg={4} xl={3} key={manager.idManager} className="mb-3">
                  <Card className="h-100 border">
                    <Card.Header className="py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle-sm bg-primary text-white me-2">
                            {manager.nomManager?.charAt(0)}{manager.prenomManager?.charAt(0)}
                          </div>
                          <div>
                            <small className="fw-medium d-block">
                              {manager.nomManager} {manager.prenomManager}
                            </small>
                            <small className="text-muted">{manager.idEmploye}</small>
                          </div>
                        </div>
                        <Badge className={statusClass}>{statusText}</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body className="py-2">
                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">
                          <FaBuilding size={10} className="me-1" />
                          Département
                        </small>
                        <small className="fw-medium">{manager.nomDepartement || 'Non assigné'}</small>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">
                          <FaCalendarAlt size={10} className="me-1" />
                          Période
                        </small>
                        <div className="d-flex justify-content-between">
                          <small>{formatDate(manager.dateDebut)}</small>
                          <small className={current ? 'text-success' : 'text-muted'}>
                            {manager.dateFin ? formatDate(manager.dateFin) : 'En cours'}
                          </small>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="py-2 bg-white">
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(manager)}
                          className="flex-grow-1"
                        >
                          <FaEye size={12} />
                        </Button>
                        {manager.statutManager === 0 && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleOpenArchive(manager)}
                            className="flex-grow-1"
                          >
                            <FaArchive size={12} />
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col>
              <Card className="text-center py-5 border">
                <FaSearch size={32} className="text-muted mb-3" />
                <p className="text-muted mb-0">Aucun manager trouvé</p>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Bouton flottant pour mobile */}
      <div className="d-block d-sm-none position-fixed bottom-3 end-3">
        <Button
          variant="primary"
          size="lg"
          className="rounded-circle p-2 shadow"
          onClick={() => setShowSearch(!showSearch)}
        >
          <FaSearch size={20} />
        </Button>
      </div>

      {/* Modals */}
      <ManagerDetailsModal />
      <ArchiveManagerModal />
      
      {/* Modal AssignManagerModal supprimé */}

      {/* Styles CSS inline */}
      <style>{`
        .avatar-circle-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .avatar-circle-lg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          background-color: #f9f1f8;
          border: 3px solid #e1b2db;
        }
        
        .status-active {
          background-color: #28a745;
          color: white;
        }
        
        .status-inactive {
          background-color: #5c2458;
          color: white;
        }
        
        div[style*="cursor: pointer"]:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .info-section label {
          font-size: 0.875rem;
          color: #5c2458;
          margin-bottom: 0.25rem;
        }
        
        .info-section .info-value {
          font-size: 1rem;
          color: #3a1438;
          margin-bottom: 1rem;
        }
      `}</style>
    </Container>
  );
};

export default ManagerList;
