// src/pages/EmployesArchives.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Pagination
} from 'react-bootstrap';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Briefcase,
  User,
  Calendar,
  Eye
} from 'react-feather';
import {
  FaArchive,
  FaCalendarAlt,
  FaCalendar,
  FaCommentAlt,
  FaInfoCircle,
  FaTimes,
  FaUser,
  FaHistory,
  FaUserClock,
  FaPlusCircle
} from 'react-icons/fa';
import { MdRestoreFromTrash } from 'react-icons/md';

import axiosInstance from '../../../utils/AxiosInstance';
import AddInfoProfessionnelleModal from './AddInfoProfessionnelleModal';

function EmployesArchives() {
  const navigate = useNavigate();

  // États
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // États de pagination
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    sortBy: 'modifiedAt',
    direction: 'desc'
  });

  // États pour les filtres (uniquement ceux gérés par l'API)
  const [filters, setFilters] = useState({
    nom: '',
    prenom: '',
    dateDebut: '',
    dateFin: ''
  });

  // État pour la modal d'ajout d'info professionnelle
  const [showInfoProModal, setShowInfoProModal] = useState(false);
  const [employeeForInfoPro, setEmployeeForInfoPro] = useState(null);
  const [restoring, setRestoring] = useState(false);

  // Charger les employés archivés via API
  const fetchArchivedEmployees = useCallback(async (
    page = pagination.currentPage,
    size = pagination.pageSize,
    sortBy = pagination.sortBy,
    direction = pagination.direction,
    searchFilters = {}
  ) => {
    try {
      setLoading(true);
      setError('');

      // Préparer les paramètres pour l'API
      const params = {
        page,
        size,
        sortBy,
        direction,
        ...searchFilters
      };

      // Enlever les paramètres vides
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get('/api/employes/archived', { params });
      
      if (response.data) {
        // Adapter selon le format de réponse de votre API
        const data = response.data.content || response.data;
        const totalElements = response.data.totalElements || response.data.length || 0;
        const totalPages = response.data.totalPages || Math.ceil(totalElements / size) || 0;

        setEmployes(Array.isArray(data) ? data : []);
        
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          pageSize: size,
          totalItems: totalElements,
          totalPages: totalPages,
          hasNext: page < totalPages - 1,
          hasPrevious: page > 0,
          sortBy,
          direction
        }));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des employés archivés');
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchArchivedEmployees();
  }, []);

  // Gestion du changement des filtres
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Réinitialisation des filtres (appel API)
  const resetFilters = () => {
    setFilters({
      nom: '',
      prenom: '',
      dateDebut: '',
      dateFin: ''
    });
    // Appel API sans filtres
    fetchArchivedEmployees(0, pagination.pageSize, pagination.sortBy, pagination.direction);
  };

  // Soumission des filtres (appel API)
  const handleSearchSubmit = () => {
    const searchParams = {};
    
    // Ajouter uniquement les filtres non vides
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        searchParams[key] = filters[key];
      }
    });
    
    // Appel API avec les filtres
    fetchArchivedEmployees(0, pagination.pageSize, pagination.sortBy, pagination.direction, searchParams);
  };

  // Changer la taille de la page (appel API)
  const handleSizeChange = (newSize) => {
    const searchParams = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        searchParams[key] = filters[key];
      }
    });
    fetchArchivedEmployees(0, newSize, pagination.sortBy, pagination.direction, searchParams);
  };

  // Changer de page (appel API)
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const searchParams = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key].trim() !== '') {
          searchParams[key] = filters[key];
        }
      });
      fetchArchivedEmployees(newPage, pagination.pageSize, pagination.sortBy, pagination.direction, searchParams);
    }
  };

  // Trier (appel API)
  const handleSort = (column) => {
    const newDirection = pagination.sortBy === column && pagination.direction === 'asc' ? 'desc' : 'asc';
    const searchParams = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        searchParams[key] = filters[key];
      }
    });
    fetchArchivedEmployees(0, pagination.pageSize, column, newDirection, searchParams);
  };

  // Ouvrir modal d'ajout d'info pro pour restaurer
  const handleOpenRestoreModal = (employee) => {
    setEmployeeForInfoPro(employee);
    setShowInfoProModal(true);
  };

  // Fonction appelée après l'ajout réussi d'une info professionnelle
  const handleInfoProSuccess = async (newInfoPro) => {
    console.log('Info professionnelle ajoutée avec succès:', newInfoPro);
    
    // L'employé est maintenant restauré (car une nouvelle info pro a été créée)
    // Rafraîchir la liste des employés archivés
    await fetchArchivedEmployees();
    
    // Optionnel: Afficher une notification de succès
    alert('Employé restauré avec succès !');
  };

  // Fermer la modal d'info professionnelle
  const handleCloseInfoProModal = () => {
    setShowInfoProModal(false);
    setEmployeeForInfoPro(null);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Options de pagination
  const pageSizeOptions = [5, 10, 25, 50, 100];

  // Générer les pages pour la pagination
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

  if (loading && employes.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="warning" />
        <span className="ms-3">Chargement des archives...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* En-tête */}
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-warning bg-opacity-25 p-2 rounded me-2">
              <FaArchive size={20} className="text-warning" />
            </div>
            <h1 className="h4 mb-0">Employés Archivés</h1>
            <Badge bg="warning" text="dark" className="ms-2">
              {pagination.totalItems || 0}
            </Badge>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="d-flex align-items-center gap-1"
            >
              <Filter size={14} />
              <span className="d-none d-sm-inline">Filtres</span>
            </Button>
            
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/dashboard-RH/employees')}
              className="d-flex align-items-center gap-1"
            >
              <Users size={14} />
              <span className="d-none d-sm-inline">Employés actifs</span>
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtres - Uniquement ceux gérés par l'API */}
      {showSearch && (
        <Card className="mb-4 border shadow-sm">
          <Card.Header className="py-2 bg-light">
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2 text-warning" />
              <span className="fw-medium">Recherche</span>
            </div>
          </Card.Header>
          <Card.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Nom</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <User size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Nom"
                      value={filters.nom || ''}
                      onChange={(e) => handleFilterChange('nom', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3}>
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
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Date début</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={filters.dateDebut || ''}
                      onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Date fin</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={filters.dateFin || ''}
                      onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={resetFilters}
                className="d-flex align-items-center gap-1"
              >
                <FaTimes size={14} />
                Réinitialiser
              </Button>
              
              <Button 
                variant="warning" 
                size="sm" 
                onClick={handleSearchSubmit}
                className="d-flex align-items-center gap-1"
              >
                <Search size={14} />
                Rechercher
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Contrôles de pagination */}
      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">Afficher :</small>
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
          </div>
        </Col>
        <Col md={6} className="text-md-end">
          <small className="text-muted">
            Page {pagination.currentPage + 1} / {pagination.totalPages || 1}
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
                  <th 
                    className="py-2 ps-3" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('nom')}
                  >
                    Employé
                    {pagination.sortBy === 'nom' && (
                      <span className="ms-1">{pagination.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="py-2" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('modifiedAt')}
                  >
                    Date d'archivage
                    {pagination.sortBy === 'modifiedAt' && (
                      <span className="ms-1">{pagination.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="py-2">Motif</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2 pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.length > 0 ? (
                  employes.map((emp) => (
                    <tr key={emp.id}>
                      <td className="py-2 ps-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning bg-opacity-25 p-1 rounded me-2">
                            <FaUserClock size={14} className="text-warning" />
                          </div>
                          <div>
                            <div className="fw-medium">{emp.nom} {emp.prenom}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="d-flex align-items-center">
                          <FaCalendar size={10} className="text-muted me-1" />
                          <small>{formatDate(emp.modifiedAt)}</small>
                        </div>
                      </td>
                      <td className="py-2">
                        <small>{emp.commentaire || '-'}</small>
                      </td>
                      <td className="py-2">
                        <Badge bg="warning" text="dark" className="py-1 px-2">
                          <FaArchive className="me-1" size={10} />
                          Archivé
                        </Badge>
                      </td>
                      <td className="py-2 pe-3 text-end">
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleOpenRestoreModal(emp)}
                          className="px-2 me-1"
                          title="Restaurer"
                        >
                          <MdRestoreFromTrash size={14} className="text-success" />
                        </Button>
                        
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => navigate(`/dashboard-RH/employees/${emp.id}/archived`)}
                          className="px-2"
                          title="Détails"
                        >
                          <Eye size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <FaArchive size={32} className="text-muted mb-2" />
                      <h6 className="fw-normal">Aucun employé archivé</h6>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="border">
          <Card.Body className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  {pagination.totalItems} employé(s) au total
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

      {/* Modal d'ajout d'information professionnelle pour restauration */}
      {employeeForInfoPro && (
        <AddInfoProfessionnelleModal
          show={showInfoProModal}
          onHide={handleCloseInfoProModal}
          onSuccess={handleInfoProSuccess}
          idEmploye={employeeForInfoPro.id}
          employeNom={`${employeeForInfoPro.nom} ${employeeForInfoPro.prenom}`}
          isRestore={true} // On passe un prop pour indiquer que c'est une restauration
        />
      )}

      <style jsx>{`
        .modal_perso {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .modal-content-custom {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </Container>
  );
}

export default EmployesArchives;