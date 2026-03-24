// src/pages/RH/Paie/periodes/PeriodesPaie.jsx
import React, { useState, useEffect } from 'react';
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
  Pagination
} from 'react-bootstrap';
import {
  Calendar,
  Search,
  X,
  Filter,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Info
} from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance';
import AddPeriodePaieModal from './AddPeriodeModal';
import EditPeriodeModal from './EditPeriodeModal'; // Importer le modal d'édition

function PeriodesPaie() {
  const navigate = useNavigate();
  
  // États
  const [periodes, setPeriodes] = useState([]);
  const [filteredPeriodes, setFilteredPeriodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // État pour le modal d'édition
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(null); // ID de la période à modifier
  
  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'passed'
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Charger les périodes
  const fetchPeriodes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/periodes-paie');
      console.log('Périodes chargées:', response.data);
      setPeriodes(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des périodes:', err);
      setError('Impossible de charger les périodes de paie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodes();
  }, []);

  // Fonction pour déterminer le statut d'une période
  const getPeriodeStatus = (periode) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateFin = new Date(periode.dateFin);
    dateFin.setHours(0, 0, 0, 0);
    
    // Si la date de fin est passée (période terminée)
    if (dateFin < today || periode.statut === 1) {
      return {
        type: 'passed',
        label: 'Terminée',
        color: 'warning',
        icon: Clock,
        canGenerate: false,
        canEdit: false
      };
    }
    
    // Sinon période active (statut = 0 et date non passée)
    return {
      type: 'active',
      label: 'Active',
      color: 'success',
      icon: CheckCircle,
      canGenerate: true,
      canEdit: true
    };
  };

  // Filtrer les périodes
  useEffect(() => {
    let filtered = [...periodes];
    
    // Filtre par recherche (mois, année)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(periode => 
        periode.mois?.nom?.toLowerCase().includes(searchLower) ||
        periode.annee?.toString().includes(searchLower) ||
        periode.dateDebut?.includes(searchLower) ||
        periode.dateFin?.includes(searchLower)
      );
    }
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(periode => {
        const status = getPeriodeStatus(periode);
        return status.type === statusFilter;
      });
    }
    
    // Trier par date de début (plus récent en premier)
    filtered.sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));
    
    setFilteredPeriodes(filtered);
    setCurrentPage(1); // Revenir à la page 1 après filtrage
  }, [periodes, searchTerm, statusFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeriodes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeriodes.length / itemsPerPage);

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPeriode = (periode) => {
    if (periode.mois?.nom && periode.annee) {
      return `${periode.mois.nom} ${periode.annee}`;
    }
    return `${formatDate(periode.dateDebut)} - ${formatDate(periode.dateFin)}`;
  };

  const calculateDuration = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
  };

  const handleBack = () => {
    navigate('/dashboard-RH/paie/edition');
  };

  const handleAddPeriode = () => {
    setShowAddModal(true);
  };

  const handleEditPeriode = (periodeId) => {
    setSelectedPeriodeId(periodeId);
    setShowEditModal(true);
  };

  const handlePeriodeAdded = (newPeriode) => {
    fetchPeriodes(); // Recharger la liste
    setShowAddModal(false);
  };

  const handlePeriodeUpdated = (updatedPeriode) => {
    fetchPeriodes(); // Recharger la liste
    setShowEditModal(false);
    setSelectedPeriodeId(null);
  };

  // Statistiques
  const stats = {
    total: periodes.length,
    active: periodes.filter(p => getPeriodeStatus(p).type === 'active').length,
    passed: periodes.filter(p => getPeriodeStatus(p).type === 'passed').length
  };

  return (
    <Container fluid className="py-3">
      {/* En-tête */}
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleBack}
            className="d-flex align-items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Retour</span>
          </Button>
        </Col>
        <Col>
          <h5 className="mb-0 d-flex align-items-center">
            <Calendar size={20} className="me-2" />
            Gestion des périodes de paie
          </h5>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddPeriode}
            className="d-flex align-items-center gap-1"
          >
            <Plus size={16} />
            <span>Nouvelle période</span>
          </Button>
        </Col>
      </Row>

      {/* Cartes de statistiques */}
      <Row className="mb-3 g-2">
        <Col xs={6} md={4}>
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small>Total</small>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <Calendar size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="border-0 bg-success text-white">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small>Actives</small>
                  <h3 className="mb-0">{stats.active}</h3>
                </div>
                <CheckCircle size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="border-0 bg-warning text-white">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small>Terminées</small>
                  <h3 className="mb-0">{stats.passed}</h3>
                </div>
                <Clock size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="mb-3 border">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={4}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-light">
                  <Search size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par mois, année..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="sm"
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
            <Col xs={12} md={8}>
              <div className="d-flex gap-2 justify-content-md-end">
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'success' : 'outline-success'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('active')}
                >
                  <CheckCircle size={14} className="me-1" />
                  Actives
                </Button>
                <Button
                  variant={statusFilter === 'passed' ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('passed')}
                >
                  <Clock size={14} className="me-1" />
                  Terminées
                </Button>
              </div>
            </Col>
          </Row>
          {filteredPeriodes.length > 0 && (
            <small className="text-muted d-block mt-2">
              <Filter size={10} className="me-1" />
              {filteredPeriodes.length} période(s) trouvée(s)
            </small>
          )}
        </Card.Body>
      </Card>

      {/* Tableau */}
      <Card className="border">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Chargement des périodes...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          ) : filteredPeriodes.length === 0 ? (
            <div className="text-center py-5">
              <Calendar size={48} className="text-muted mb-3" />
              <h6>Aucune période trouvée</h6>
              <p className="text-muted">
                {periodes.length === 0 
                  ? "Commencez par créer une nouvelle période"
                  : "Aucune période ne correspond aux filtres sélectionnés"}
              </p>
              {periodes.length === 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddPeriode}
                  className="mt-2"
                >
                  <Plus size={14} className="me-1" />
                  Créer une période
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover size="sm" className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-2">Période</th>
                      <th className="py-2">Date début</th>
                      <th className="py-2">Date fin</th>
                      <th className="py-2">Durée</th>
                      <th className="py-2">Mois</th>
                      <th className="py-2">Année</th>
                      <th className="py-2">Statut</th>
                      <th className="py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((periode) => {
                      const status = getPeriodeStatus(periode);
                      const StatusIcon = status.icon;
                      
                      return (
                        <tr key={periode.id}>
                          <td className="py-2">
                            <strong>{formatPeriode(periode)}</strong>
                          </td>
                          <td className="py-2">
                            <small>{formatDate(periode.dateDebut)}</small>
                          </td>
                          <td className="py-2">
                            <small>{formatDate(periode.dateFin)}</small>
                          </td>
                          <td className="py-2">
                            <Badge bg="light" text="dark">
                              {calculateDuration(periode.dateDebut, periode.dateFin)} jours
                            </Badge>
                          </td>
                          <td className="py-2">
                            {periode.mois?.libelle || '-'}
                          </td>
                          <td className="py-2">
                            {periode.annee || '-'}
                          </td>
                          <td className="py-2">
                            <Badge 
                              bg={status.color} 
                              className="d-flex align-items-center gap-1" 
                              style={{ width: 'fit-content' }}
                            >
                              <StatusIcon size={12} />
                              <span>{status.label}</span>
                            </Badge>
                          </td>
                          <td className="py-2 text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditPeriode(periode.id)}
                              disabled={!status.canEdit}
                            //   title={status.canEdit ? "Modifier cette période" : "Seules les périodes actives sont modifiables"}
                              className="d-inline-flex align-items-center gap-1"
                            >
                              <Edit size={14} />
                              {/* <span>Modifier</span> */}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-top px-3 py-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredPeriodes.length)} sur {filteredPeriodes.length} périodes
                    </small>
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={14} />
                      </Button>
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          size="sm"
                          variant={currentPage === i + 1 ? 'primary' : 'outline-secondary'}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal d'ajout */}
      <AddPeriodePaieModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handlePeriodeAdded}
      />

      {/* Modal d'édition */}
      <EditPeriodeModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPeriodeId(null);
        }}
        onSuccess={handlePeriodeUpdated}
        periodeId={selectedPeriodeId}
      />
    </Container>
  );
}

export default PeriodesPaie;