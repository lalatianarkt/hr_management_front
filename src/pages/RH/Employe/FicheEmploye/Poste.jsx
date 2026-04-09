import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Container, 
  Row, 
  Col, 
  Form, 
  Badge, 
  Spinner,
  Modal,
  Alert,
  Pagination,
  InputGroup,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddPosteModal from './AddPoste';
import EditPosteModal from './EditPosteModal';

const PostesList = () => {
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  const [departements, setDepartements] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsPoste, setDetailsPoste] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPosteId, setSelectedPosteId] = useState(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPostes();
    fetchDepartements();
  }, []);

  const fetchPostes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/postes');
      setPostes(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des postes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartements = async () => {
    try {
      const response = await axiosInstance.get('/api/departements');
      setDepartements(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err);
    }
  };

  const refreshPostes = () => {
    fetchPostes();
    setCurrentPage(1); // Réinitialiser à la première page
  };

  const handlePosteAdded = (newPoste) => {
    console.log('Poste ajouté avec succès:', newPoste);
    refreshPostes(); // Rafraîchir la liste
  };

  const handlePosteUpdated = (updatedPoste) => {
    console.log('Poste mis à jour avec succès:', updatedPoste);
    refreshPostes(); // Rafraîchir la liste
  };

  const handleEditClick = (poste) => {
    setSelectedPosteId(poste.id);
    setShowEditModal(true);
  };

  // Filtrer les postes
  const filteredPostes = postes.filter(poste => {
    const matchesSearch = poste.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poste.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poste.departement?.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartement = !filterDepartement || 
                              (poste.departement && poste.departement.id === filterDepartement);
    
    return matchesSearch && matchesDepartement;
  });

  // Calculer la pagination
  useEffect(() => {
    const total = filteredPostes.length;
    const pages = Math.ceil(total / itemsPerPage);
    setTotalPages(pages);
    
    // Si la page actuelle n'existe plus (après filtrage), revenir à la première page
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [filteredPostes, itemsPerPage, currentPage]);

  // Obtenir les postes pour la page actuelle
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPostes.slice(startIndex, endIndex);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer le changement d'éléments par page
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Retourner à la première page
  };

  // Générer les numéros de page pour la pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const handleDeleteClick = (poste) => {
    setSelectedPoste(poste);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/postes/${selectedPoste.id}`);
      setPostes(postes.filter(p => p.id !== selectedPoste.id));
      setShowDeleteModal(false);
      setSelectedPoste(null);
    } catch (err) {
      setError('Erreur lors de la suppression du poste');
      console.error(err);
    }
  };

  const handleViewDetails = (poste) => {
    setDetailsPoste(poste);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 15, 20, 50, 100];

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-3">Chargement des postes...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h4 mb-0">Gestion des Postes</h1>
            <Badge bg="light" text="dark" className="ms-2">
              {filteredPostes.length}
            </Badge>
          </div>
          <p className="text-muted mb-0">Liste de tous les postes dans l'entreprise</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center gap-1"
          >
            <Plus size={14} />
            <span className="d-none d-sm-inline">Nouveau Poste</span>
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" size="sm" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="mb-3 border">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={6}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <Search size={14} />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par nom, description ou département..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Retour à la première page lors de la recherche
                  }}
                  size="sm"
                />
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <Filter size={14} />
                </span>
                <Form.Select
                  value={filterDepartement}
                  onChange={(e) => {
                    setFilterDepartement(e.target.value);
                    setCurrentPage(1); // Retour à la première page lors du filtrage
                  }}
                  size="sm"
                >
                  <option value="">Tous les départements</option>
                  {departements.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nom}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col xs={12} md={2}>
              <div className="d-flex align-items-center gap-1 px-2 py-1 bg-light rounded justify-content-end">
                <small className="fw-medium">{filteredPostes.length}</small>
                <small className="text-muted ms-1">poste{filteredPostes.length !== 1 ? 's' : ''}</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-2 ps-3">ID</th>
                  <th className="py-2">Nom du Poste</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Département</th>
                  <th className="py-2">Niveau Hiérarchique</th>
                  <th className="py-2">Créé le</th>
                  <th className="py-2 pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageItems().length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <p className="text-muted mb-0">
                        {searchTerm || filterDepartement 
                          ? "Aucun poste ne correspond aux critères" 
                          : "Aucun poste disponible"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  getCurrentPageItems().map(poste => (
                    <tr key={poste.id}>
                      <td className="py-2 ps-3">
                        <div>
                          <small className="fw-medium">{poste.id}</small>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="fw-medium">{poste.nom}</div>
                      </td>
                      <td className="py-2">
                        <small className="text-muted">
                          {poste.description ? 
                            (poste.description.length > 30 ? `${poste.description.substring(0, 30)}...` : poste.description) 
                            : 'Aucune description'}
                        </small>
                      </td>
                      <td className="py-2">
                        {poste.departement ? (
                          <div className="d-flex align-items-center gap-1">
                            <Briefcase size={12} className="text-info" />
                            <small className="fw-medium">{poste.departement.nom}</small>
                          </div>
                        ) : (
                          <small className="text-muted">Non assigné</small>
                        )}
                      </td>
                      <td className="py-2">
                        {poste.niveauHierarchique ? (
                          <Badge bg="primary" className="fw-normal">
                            {poste.niveauHierarchique.nom}
                          </Badge>
                        ) : (
                          <small className="text-muted">Non défini</small>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="d-flex align-items-center gap-1">
                          <Calendar size={12} className="text-muted" />
                          <small className="text-muted">
                            {formatDate(poste.createdAt).split(' ')[0]}
                          </small>
                        </div>
                      </td>
                      <td className="py-2 pe-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleViewDetails(poste)}
                            aria-label="Voir détails"
                            className="px-2"
                          >
                            <Eye size={12} />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditClick(poste)}
                            aria-label="Modifier"
                            className="px-2"
                          >
                            <Edit size={12} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(poste)}
                            aria-label="Supprimer"
                            className="px-2"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination et contrôles */}
          {filteredPostes.length > 0 && (
            <div className="border-top px-3 py-2 bg-light">
              <Row className="align-items-center">
                <Col md={6} className="mb-2 mb-md-0">
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">Affichage de</small>
                    <DropdownButton
                      title={itemsPerPage}
                      size="sm"
                      variant="outline-secondary"
                      align="end"
                    >
                      {itemsPerPageOptions.map(option => (
                        <Dropdown.Item 
                          key={option} 
                          onClick={() => handleItemsPerPageChange(option)}
                          active={itemsPerPage === option}
                        >
                          {option} par page
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                    <small className="text-muted">
                      {Math.min((currentPage - 1) * itemsPerPage + 1, filteredPostes.length)}-
                      {Math.min(currentPage * itemsPerPage, filteredPostes.length)} sur {filteredPostes.length} postes
                    </small>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="d-flex justify-content-md-end">
                    <Pagination className="mb-0" size="sm">
                      {/* Premier page */}
                      <Pagination.First 
                        onClick={() => handlePageChange(1)} 
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft size={14} />
                      </Pagination.First>
                      
                      {/* Page précédente */}
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={14} />
                      </Pagination.Prev>
                      
                      {/* Numéros de page */}
                      {getPageNumbers().map(page => (
                        <Pagination.Item 
                          key={page} 
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}
                      
                      {/* Page suivante */}
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={14} />
                      </Pagination.Next>
                      
                      {/* Dernière page */}
                      <Pagination.Last 
                        onClick={() => handlePageChange(totalPages)} 
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight size={14} />
                      </Pagination.Last>
                    </Pagination>
                  </div>
                </Col>
              </Row>
              
              {/* Sélecteur de page rapide pour mobile */}
              <div className="d-block d-md-none mt-2">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Form.Select 
                    size="sm" 
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    style={{ width: 'auto' }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <option key={page} value={page}>
                        Page {page}
                      </option>
                    ))}
                  </Form.Select>
                  <small className="text-muted">sur {totalPages}</small>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal d'ajout de poste */}
      <AddPosteModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handlePosteAdded}
        refreshPostes={refreshPostes}
      />

      {/* Modal d'édition de poste */}
      <EditPosteModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        posteId={selectedPosteId}
        onSuccess={handlePosteUpdated}
        refreshPostes={refreshPostes}
      />

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} size="sm">
        <Modal.Header closeButton closeLabel="Fermer" className="border-0 pb-0">
          <Modal.Title className="h6">Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Êtes-vous sûr de vouloir supprimer le poste <strong>{selectedPoste?.nom}</strong> ?
          </p>
          {selectedPoste?.description && (
            <p className="mt-2 text-muted small">{selectedPoste.description}</p>
          )}
          <Alert variant="warning" className="mt-3 small py-2">
            <small>Cette action est irréversible.</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de détails */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton closeLabel="Fermer" className="border-0 pb-0">
          <Modal.Title className="h5">Détails du Poste</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsPoste && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">ID</label>
                  <p className="fw-medium mb-0">{detailsPoste.id}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">Nom</label>
                  <p className="fw-medium mb-0">{detailsPoste.nom}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">Description</label>
                  <p className="mb-0">{detailsPoste.description || 'Aucune description'}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">Département</label>
                  <p className="mb-0">
                    {detailsPoste.departement ? (
                      <div className="d-flex align-items-center gap-1">
                        <Briefcase size={14} className="text-info" />
                        <span className="fw-medium">{detailsPoste.departement.nom}</span>
                      </div>
                    ) : (
                      <span className="text-muted">Non assigné</span>
                    )}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">Niveau Hiérarchique</label>
                  <p className="mb-0">
                    {detailsPoste.niveauHierarchique ? (
                      <Badge bg="primary" className="fw-normal">
                        {detailsPoste.niveauHierarchique.nom}
                      </Badge>
                    ) : (
                      <span className="text-muted">Non défini</span>
                    )}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">Date de création</label>
                  <div className="d-flex align-items-center gap-1">
                    <Calendar size={14} className="text-muted" />
                    <span className="small">{formatDate(detailsPoste.createdAt)}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted mb-1">Dernière modification</label>
                  <div className="d-flex align-items-center gap-1">
                    <Calendar size={14} className="text-muted" />
                    <span className="small">{formatDate(detailsPoste.modifiedAt)}</span>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => {
              setShowDetailsModal(false);
              handleEditClick(detailsPoste);
            }}
            className="d-flex align-items-center gap-1"
          >
            <Edit size={14} />
            Modifier
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowDetailsModal(false)}
          >
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PostesList;

