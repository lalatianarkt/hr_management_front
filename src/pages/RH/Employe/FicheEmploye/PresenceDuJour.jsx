// src/pages/Pointages.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  X,
  Calendar,
  Hash,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye
} from 'react-feather';
import {
  FaUser,
  FaClock,
  FaInfoCircle
} from 'react-icons/fa';
import axiosInstance from '../../../utils/AxiosInstance'; // Import d'axiosInstance

function Pointages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // États initiaux basés sur l'URL
  const initialPage = parseInt(searchParams.get('page') || '0');
  const initialSize = parseInt(searchParams.get('size') || '10');

  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // États de pagination
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    pageSize: initialSize,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  // États pour les filtres
  const [filters, setFilters] = useState({
    matricule: '',
    startDate: '',
    endDate: '',
    idDepartement: ''
  });

  // États pour les données des listes déroulantes
  const [departements, setDepartements] = useState([]);

  // Mettre à jour l'URL quand la pagination change
  const updateURL = useCallback((newPage, newSize) => {
    const params = new URLSearchParams(searchParams);
    
    if (newPage !== 0) params.set('page', newPage);
    else params.delete('page');
    
    if (newSize !== 10) params.set('size', newSize);
    else params.delete('size');
    
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Charger les pointages avec filtres
  const fetchPointages = useCallback(async (
    page = pagination.currentPage,
    size = pagination.pageSize,
    searchFilters = {}
  ) => {
    try {
      setLoading(true);
      setError('');

      // Préparer les paramètres
      const params = new URLSearchParams();
      
      // Ajouter les paramètres de pagination
      params.append('page', page);
      params.append('size', size);
      
      // Ajouter les filtres non vides
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key] && searchFilters[key].trim() !== '') {
          params.append(key, searchFilters[key]);
        }
      });

      console.log("params : ", params.toString());
      const response = await axiosInstance.get(`/api/v2/pointages/filtre?${params.toString()}`);
      if (response.data) {
        setPointages(response.data.pointages || []);
        
        // Mettre à jour la pagination
        setPagination({
          currentPage: response.data.currentPage || page,
          pageSize: response.data.pageSize || size,
          totalItems: response.data.totalItems || 0,
          totalPages: response.data.totalPages || 0,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false
        });

        // Mettre à jour l'URL
        updateURL(page, size);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des pointages');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, updateURL]);

  // Charger les départements pour le filtre
  const fetchDepartements = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/departements');
      setDepartements(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchPointages();
    fetchDepartements();
  }, []);

  // Fonction pour changer de page
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchPointages(newPage, pagination.pageSize, filters);
    }
  };

  // Gestion du changement des filtres
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      matricule: '',
      startDate: '',
      endDate: '',
      idDepartement: ''
    });
    fetchPointages(0, pagination.pageSize, {});
  };

  // Soumission des filtres
  const handleSearchSubmit = () => {
    // Préparer les filtres en enlevant les valeurs vides
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        activeFilters[key] = filters[key];
      }
    });
    
    fetchPointages(0, pagination.pageSize, activeFilters);
  };

  // Fonction pour changer la taille de la page
  const handleSizeChange = (newSize) => {
    fetchPointages(0, newSize, filters);
  };

  // Options pour le nombre d'éléments par page
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
    
    // Bouton Première page
    if (startPage > 0) {
      items.push(
        <Pagination.Item key="first" onClick={() => handlePageChange(0)}>
          <ChevronsLeft size={14} />
        </Pagination.Item>
      );
    }
    
    // Bouton Page précédente
    if (pagination.hasPrevious) {
      items.push(
        <Pagination.Item key="prev" onClick={() => handlePageChange(pagination.currentPage - 1)}>
          <ChevronLeft size={14} />
        </Pagination.Item>
      );
    }
    
    // Pages numérotées
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
    
    // Bouton Page suivante
    if (pagination.hasNext) {
      items.push(
        <Pagination.Item key="next" onClick={() => handlePageChange(pagination.currentPage + 1)}>
          <ChevronRight size={14} />
        </Pagination.Item>
      );
    }
    
    // Bouton Dernière page
    if (endPage < pagination.totalPages - 1) {
      items.push(
        <Pagination.Item key="last" onClick={() => handlePageChange(pagination.totalPages - 1)}>
          <ChevronsRight size={14} />
        </Pagination.Item>
      );
    }
    
    return items;
  };

  // Formater l'heure
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater la date
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculer la durée travaillée
  const calculateWorkDuration = (heureArrivee, heureDepart) => {
    if (!heureArrivee || !heureDepart) return '-';
    
    const start = new Date(heureArrivee);
    const end = new Date(heureDepart);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}min`;
  };

  if (loading && pointages.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des pointages...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* En-tête */}
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h4 mb-0">Pointages</h1>
            <Badge bg="light" text="dark" className="ms-2">
              {pagination.totalItems}
            </Badge>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="d-flex align-items-center gap-1 btn-unified"
            >
              <Filter size={14} />
              <span className="d-none d-sm-inline">Filtres</span>
            </Button>
            
            <Dropdown>
              <Dropdown.Toggle variant="primary" size="sm" className="d-flex align-items-center gap-1 btn-unified">
                <Download size={14} />
                <span className="d-none d-sm-inline">Exporter</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => window.open('/api/v2/pointages/export')}>
                  Exporter les pointages
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" size="sm" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      {showFilters && (
        <Card className="mb-4 border shadow-sm">
          <Card.Header className="py-2 bg-light">
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2 text-primary" />
              <span className="fw-medium">Filtres de recherche</span>
            </div>
          </Card.Header>
          <Card.Body className="py-3">
            <Row className="g-3">
              {/* Champ Matricule */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Matricule</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Hash size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Ex: EMP001"
                      value={filters.matricule}
                      onChange={(e) => handleFilterChange('matricule', e.target.value)}
                      size="sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Date début */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Date début</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      size="sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Date fin */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Date fin</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      size="sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Département */}
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="small fw-medium mb-1">Département</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light">
                      <Briefcase size={14} />
                    </InputGroup.Text>
                    <Form.Select
                      value={filters.idDepartement}
                      onChange={(e) => handleFilterChange('idDepartement', e.target.value)}
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
            </Row>

            {/* Boutons d'action */}
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <div className="small text-muted">
                <Filter size={12} className="me-1" />
                {pointages.length} pointage{pointages.length > 1 ? 's' : ''} trouvé{pointages.length > 1 ? 's' : ''}
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

      {/* Contrôles de pagination en haut */}
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
            {pagination.totalItems} pointage{pagination.totalItems > 1 ? 's' : ''} au total
          </small>
        </Col>
      </Row>

      {/* Tableau des pointages */}
      <Card className="border mb-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-2 ps-3">Employé</th>
                  <th className="py-2">Matricule</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Durée</th>
                  <th className="py-2">Retard</th>
                  <th className="py-2">Heures sup.</th>
                </tr>
              </thead>
              <tbody>
                {pointages.length > 0 ? (
                  pointages.map((pointage, index) => (
                    <tr key={pointage.id || index}>
                      <td className="py-2 ps-3">
                        <div className="d-flex align-items-center">
                          <FaUser size={14} className="text-muted me-2" />
                          <div>
                            <div className="fw-medium">{pointage.nomComplet}</div>
                            <small className="text-muted">{pointage.departementNom || '-'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-2">
                        <small>{pointage.matricule || '-'}</small>
                      </td>
                      <td className="py-2">
                        <small>{formatDate(pointage.datePointage)}</small>
                      </td>
                      <td className="py-2">
                        <div>
                          <Badge bg="success" className="mb-1">{pointage.dureeHeureTravailleeEnHeures?.toFixed(2)} h</Badge>
                          <br />
                          <small className="text-muted">{pointage.dureeHeureTravaillee} min</small>
                        </div>
                      </td>
                      <td className="py-2">
                        {pointage.dureeRetard > 0 ? (
                          <div>
                            <Badge bg="danger" className="mb-1">{pointage.dureeRetard} min</Badge>
                            <br />
                            <small className="text-muted">{pointage.dureeRetardEnHeures?.toFixed(2)} h</small>
                          </div>
                        ) : (
                          <Badge bg="success">0 min</Badge>
                        )}
                      </td>
                      <td className="py-2">
                        {pointage.dureeHeureSup > 0 ? (
                          <div>
                            <Badge bg="success" className="mb-1">{pointage.dureeHeureSup} min</Badge>
                            <br />
                            <small className="text-muted">{pointage.dureeHeureSupEnHeures?.toFixed(2)} h</small>
                          </div>
                        ) : (
                          <Badge bg="secondary">0 min</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <FaInfoCircle size={24} className="text-muted mb-2" />
                        <small className="text-muted">Aucun pointage trouvé</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

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

      <style jsx>{`
        .pagination {
          margin-bottom: 0;
        }
        .pagination .page-item {
          margin: 0 2px;
        }
        .pagination .page-link {
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </Container>
  );
}

export default Pointages;