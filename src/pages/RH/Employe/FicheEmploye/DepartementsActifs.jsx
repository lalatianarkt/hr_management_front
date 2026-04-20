// src/pages/RH/Departements/DepartementsActifs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/AxiosInstance';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  InputGroup,
  Dropdown,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Activity,
  Briefcase
} from 'react-feather';

function DepartementsActifs() {
  const navigate = useNavigate();
  
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });

  // Charger les départements actifs
  useEffect(() => {
    fetchDepartementsActifs();
  }, []);

  const fetchDepartementsActifs = async () => {
    try {
      const response = await axiosInstance.get('/api/departements/actif');
      setDepartements(response.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les départements
  const filteredDepartements = departements.filter(dept =>
    dept.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Ouvrir modal d'ajout
  const openAddModal = () => {
    setFormData({ nom: '', description: '' });
    setShowAddModal(true);
  };

  // Ouvrir modal d'édition
  const openEditModal = (dept) => {
    setSelectedDepartement(dept);
    setFormData({
      nom: dept.nom,
      description: dept.description || ''
    });
    setShowAddModal(true);
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (dept) => {
    setSelectedDepartement(dept);
    setShowDeleteModal(true);
  };

  // Gérer l'ajout/édition
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      if (selectedDepartement) {
        // Édition
        const payload = { 
          id: selectedDepartement.id,
          nom: formData.nom,
          description: formData.description,
          statut: 0
        };
        const response = await axiosInstance.put(`/api/departements/${selectedDepartement.id}`, payload);
        const updated = response?.data && typeof response.data === 'object' ? response.data : payload;
        setDepartements(prev => prev.map(d => (d.id === selectedDepartement.id ? { ...d, ...updated } : d)));
        setSuccessMessage('Département modifié avec succès');
      } else {
        // Ajout
        const payload = { 
          nom: formData.nom,
          description: formData.description,
          statut: 0
        };
        const response = await axiosInstance.post('/api/departements', payload);
        const created = response?.data && typeof response.data === 'object' ? response.data : payload;
        if (created?.id) {
          setDepartements(prev => [created, ...prev]);
        } else {
          fetchDepartementsActifs();
        }
        setSuccessMessage('Département créé avec succès');
      }
      
      setShowAddModal(false);
      setSelectedDepartement(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Gérer la suppression
  const handleDelete = async () => {
    try {
      await axiosInstance.put(`/api/departements/${selectedDepartement.id}`, { 
        id: selectedDepartement.id,
        nom: selectedDepartement.nom,
        description: selectedDepartement.description,
        statut: 1
      });
      
      setShowDeleteModal(false);
      setSelectedDepartement(null);
      fetchDepartementsActifs();
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    }
  };

  // Formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des départements...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded">
              <Briefcase size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="h4 mb-1">Départements Actifs</h1>
              <p className="text-muted mb-0">
                {departements.length} département{departements.length > 1 ? 's' : ''} actif{departements.length > 1 ? 's' : ''} dans l'établissement
              </p>
            </div>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              className="d-flex align-items-center gap-1"
            >
              <Plus size={14} />
              <span className="d-none d-md-inline">Nouveau département</span>
            </Button>
          </div>
        </Col>
      </Row>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Row className="mb-3">
        <Col xs={6} md={4}>
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={16} /></div>
            <div className="stat-content">
              <div className="stat-value">{departements.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={4}>
          <div className="stat-card">
            <div className="stat-icon"><Filter size={16} /></div>
            <div className="stat-content">
              <div className="stat-value">{filteredDepartements.length}</div>
              <div className="stat-label">Affichés</div>
            </div>
          </div>
        </Col>
        <Col xs={6} md={4}>
          <button
            type="button"
            className="stat-card stat-card-action"
            onClick={openAddModal}
          >
            <div className="stat-icon"><Plus size={16} /></div>
            <div className="stat-content">
              <div className="stat-value">Ajouter</div>
              <div className="stat-label">Actions</div>
            </div>
          </button>
        </Col>
      </Row>

      {/* Recherche */}
      <Card className="mb-3 border">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col md={6}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-white">
                  <Search size={14} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher un département par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    <XCircle size={14} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <small className="text-muted">
                {filteredDepartements.length} résultat{filteredDepartements.length > 1 ? 's' : ''}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Liste des départements */}
      <Card className="border">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 departements-table">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 ps-3">Nom du Département</th>
                  <th className="py-3">Description</th>
                  {/* <th className="py-3">Date création</th> */}
                  {/* <th className="py-3">Statut</th> */}
                  <th className="py-3 pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartements.length > 0 ? (
                  filteredDepartements.map((dept) => (
                    <tr key={dept.id}>
                      <td className="py-3 ps-3 text-start">
                        <div className="d-flex align-items-center justify-content-start gap-2">
                          <div className="dept-icon">
                            <Home size={16} />
                          </div>
                          <div>
                            <div className="fw-medium">{dept.nom}</div>
                            {/* <small className="text-muted">ID: {dept.id}</small> */}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {dept.description || <span className="text-muted fst-italic">Aucune description</span>}
                        </div>
                      </td>
                      {/* <td className="py-3">
                        <div className="fw-medium">{formatDate(dept.createdAt)}</div>
                        {dept.modifiedAt && dept.modifiedAt !== dept.createdAt && (
                          <div>
                            <small className="text-muted">Modifié le {formatDate(dept.modifiedAt)}</small>
                          </div>
                        )}
                      </td> */}
                      {/* <td className="py-3">
                        <Badge bg="success" className="fw-normal">
                          <CheckCircle size={12} className="me-1" />
                          Actif
                        </Badge>
                      </td> */}
                      <td className="py-3 pe-3 text-end actions-cell">
                        <div className="d-flex justify-content-end gap-2 action-buttons">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-edit-dept-${dept.id}`}>Modifier</Tooltip>}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openEditModal(dept)}
                              className="action-btn"
                            >
                              <Edit2 size={12} />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-delete-dept-${dept.id}`}>Supprimer</Tooltip>}
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(dept)}
                              className="action-btn"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </OverlayTrigger>
                          {/* Menu déroulant supprimé car plus d'options */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <Briefcase size={48} className="text-muted mb-3" />
                        <h6 className="text-muted mb-2">Aucun département trouvé</h6>
                        <p className="text-muted">
                          {searchTerm ? 'Modifiez vos critères de recherche' : 'Commencez par créer un département'}
                        </p>
                        <Button
                          variant="primary"
                          onClick={openAddModal}
                          className="d-flex align-items-center gap-2"
                        >
                          <Plus size={16} />
                          Ajouter un département
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal d'ajout/édition */}
      <Modal show={showAddModal} onHide={() => {
        setShowAddModal(false);
        setSelectedDepartement(null);
      }}>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>
            {selectedDepartement ? 'Modifier le département' : 'Nouveau département'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom du département *</Form.Label>
              <Form.Control
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Développement, RH, Finance..."
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez les responsabilités de ce département..."
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDepartement(null);
                }}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Enregistrement...' : (selectedDepartement ? 'Enregistrer les modifications' : 'Créer le département')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>Confirmer la désactivation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr de vouloir supprimer le département <strong>{selectedDepartement?.nom}</strong> ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer le département
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS inline */}
      <style>{`
        .stat-card {
          background: white;
          border: 1px solid #e1b2db;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .stat-card-action {
          width: 100%;
          border: 1px dashed #e1b2db;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .stat-card-action:hover {
          background: #f9f1f8;
          border-color: #b053ad;
        }
        
        .stat-icon {
          width: 32px;
          height: 32px;
          background: #f9f1f8;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b053ad;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-weight: 600;
          font-size: 1rem;
          color: #3a1438;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #5c2458;
        }
        
        .bg-primary.bg-opacity-10 {
          background-color: rgba(176, 83, 173, 0.1) !important;
        }
        
        .text-primary {
          color: #b053ad !important;
        }
        
        .btn-outline-primary {
          color: #b053ad;
          border-color: #e1b2db;
        }
        
        .btn-outline-primary:hover {
          background-color: #b053ad;
          border-color: #b053ad;
          color: white;
        }
        
        .btn-primary {
          background-color: #b053ad;
          border-color: #b053ad;
        }
        
        .btn-primary:hover {
          background-color: #8f94fb;
          border-color: #8f94fb;
        }
        
        .bg-primary.text-white {
          background-color: #b053ad !important;
          color: white !important;
        }

        .dept-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f3e9f7;
          color: #b053ad;
          border: 1px solid #e1b2db;
        }

        .actions-cell {
          white-space: nowrap;
          vertical-align: middle;
        }

        .action-buttons {
          flex-wrap: nowrap;
          align-items: center;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.25rem 0.6rem;
          border-radius: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .departements-table td,
        .departements-table th {
          vertical-align: middle;
        }

        @media (max-width: 768px) {
          .actions-cell {
            width: 1%;
          }

          .action-buttons {
            flex-direction: column;
            align-items: flex-end;
          }

          .action-btn {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </Container>
  );
}

export default DepartementsActifs;

