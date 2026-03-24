import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, 
  Badge, Button, Form, InputGroup,
  Spinner, Alert, Modal, Dropdown
} from 'react-bootstrap';
import { 
  Search, Filter, Download, 
  Eye, Mail, Phone, MoreVertical,
  User, Briefcase, Calendar, Building,
  FileText, Target, Award,
  Clock, Hash, CheckCircle, XCircle,
  UserCheck, Users, Home, MapPin
} from 'lucide-react';
import axiosInstance from '../../utils/AxiosInstance';
import { Link } from 'react-router-dom';

const EmployeesManager = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0
  });

  // États pour les données de référence
  const [departements, setDepartements] = useState([]);
  const [statusOptions, setStatusOptions] = useState([
    { value: '0', label: 'Actif' },
    { value: '1', label: 'Inactif' },
    { value: '2', label: 'En congé' }
  ]);

  // Chargement des employés sous la responsabilité du manager
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Appel à l'API pour récupérer les employés du manager
      const response = await axiosInstance.get('/api/infosPro/manager/emp');

      console.log("Données reçues:", response);

      // Vérifier la structure de la réponse
      let employeesData = [];
      if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (response.data && response.data.content) {
        employeesData = response.data.content;
      } else {
        console.warn("Structure de données inattendue:", response.data);
        employeesData = [];
      }

      setEmployees(employeesData);
      calculateStats(employeesData);
      
      // Extraire les départements uniques pour les filtres
      const uniqueDepts = [...new Map(employeesData
        .filter(emp => emp.departement?.nom)
        .map(emp => [emp.departement?.id, {
          id: emp.departement?.id,
          nom: emp.departement?.nom
        }])
      ).values()];
      
      setDepartements(uniqueDepts);
    } 
    catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Erreur lors du chargement des employés';
      setError(errorMessage);
    } 
    finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques
  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(emp => emp.statut === 0 || emp.statut === 'ACTIF').length;
    const onLeave = data.filter(emp => {
      const status = emp.statut?.toString();
      return status === '2' || status === 'EN_CONGE' || status === 'INACTIF';
    }).length;
    
    setStats({ total, active, onLeave });
  };

  // Filtrage des employés
  const filteredEmployees = employees.filter(employee => {
    // Recherche par nom, prénom, matricule, poste
    const matchesSearch = searchTerm === '' || 
      (employee.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employee.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employee.employe?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employee.poste?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employee.departement?.nom?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre par département
    const matchesDepartment = 
      !filterDepartment || 
      employee.departement?.id === filterDepartment ||
      employee.departement?.nom === filterDepartment;
    
    // Filtre par statut
    let matchesStatus = !filterStatus;
    if (filterStatus) {
      const empStatus = employee.statut?.toString();
      if (filterStatus === '0') {
        matchesStatus = empStatus === '0' || empStatus === 'ACTIF';
      } else if (filterStatus === '1') {
        matchesStatus = empStatus === '1' || empStatus === 'INACTIF';
      } else if (filterStatus === '2') {
        matchesStatus = empStatus === '2' || empStatus === 'EN_CONGE';
      }
    }
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Initialisation
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Export CSV
  const handleExport = () => {
    const csvContent = [
      ['Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Poste', 'Département', 'Type Contrat', 'Date Embauche', 'Statut'],
      ...filteredEmployees.map(emp => [
        emp.employe?.matricule || emp.matricule || '',
        emp.employe?.nom || '',
        emp.employe?.prenom || '',
        emp.employe?.email || '',
        emp.employe?.telephone || '',
        emp.poste?.nom || '',
        emp.departement?.nom || '',
        emp.typeContrat?.intitule || emp.typeContrat?.nom || '',
        emp.dateEmbauche || '',
        getStatusLabel(emp.statut)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employes_manager_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Affichage des détails
  const showEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Libellé du statut
  const getStatusLabel = (status) => {
    if (status === undefined || status === null) return 'Inconnu';
    
    const statusStr = status.toString();
    switch(statusStr) {
      case '0':
      case 'ACTIF':
        return 'Actif';
      case '1':
      case 'INACTIF':
        return 'Inactif';
      case '2':
      case 'EN_CONGE':
        return 'En congé';
      default:
        return statusStr;
    }
  };

  // Badge de statut
  const renderStatusBadge = (status) => {
    const statusStr = status?.toString();
    
    let bgColor = 'secondary';
    let text = getStatusLabel(status);
    
    if (statusStr === '0' || statusStr === 'ACTIF') {
      bgColor = 'success';
    } else if (statusStr === '1' || statusStr === 'INACTIF') {
      bgColor = 'secondary';
    } else if (statusStr === '2' || statusStr === 'EN_CONGE') {
      bgColor = 'warning';
    }
    
    return <Badge bg={bgColor}>{text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des employés...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête avec statistiques */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-0">
                <Users className="me-2" size={24} />
                Gestion des Employés - Mon Équipe
              </h1>
              <p className="text-muted mb-0">
                Liste des employés sous votre responsabilité managériale
              </p>
            </div>
            <Button
              variant="outline-primary"
              onClick={fetchEmployees}
              disabled={loading}
            >
              <span className="d-flex align-items-center">
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <RefreshCw size={16} className="me-2" />
                )}
                Actualiser
              </span>
            </Button>
          </div>
        </Col>
      </Row>

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-primary shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded-circle p-3 me-3">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="mb-0 text-primary">{stats.total}</h3>
                  <small className="text-muted">Employés totaux</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-success shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-success text-white rounded-circle p-3 me-3">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="mb-0 text-success">{stats.active}</h3>
                  <small className="text-muted">Employés actifs</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-warning shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-warning text-white rounded-circle p-3 me-3">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="mb-0 text-warning">{stats.onLeave}</h3>
                  <small className="text-muted">En congé/absence</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Barre de recherche et filtres */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher par nom, prénom, matricule, poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </Button>
                )}
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={handleExport}
                  className="d-flex align-items-center"
                >
                  <Download size={18} className="me-2" />
                  Exporter
                </Button>
              </div>
            </Col>
          </Row>
          
          {searchTerm || filterDepartment || filterStatus ? (
            <div className="mt-3">
              <small className="text-muted">
                {filteredEmployees.length} résultat{filteredEmployees.length !== 1 ? 's' : ''} trouvé{filteredEmployees.length !== 1 ? 's' : ''}
                {(searchTerm || filterDepartment || filterStatus) && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="ms-2"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDepartment('');
                      setFilterStatus('');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </small>
            </div>
          ) : null}
        </Card.Body>
      </Card>

      {/* Tableau des employés */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <Users className="me-2" size={20} />
              Liste des Employés ({filteredEmployees.length})
            </h5>
            <span className="text-muted small">
              Affichage de {filteredEmployees.length} sur {employees.length} employés
            </span>
          </div>
        </Card.Header>
        
        <Card.Body className="p-0">
          {error ? (
            <Alert variant="danger" className="m-3">
              <div className="d-flex align-items-center">
                <XCircle className="me-2" size={20} />
                <div>
                  <strong>Erreur :</strong> {error}
                  {error.includes('Network') && (
                    <div className="mt-2">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => window.location.href = '/'}
                      >
                        Se reconnecter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-5">
              <Search size={48} className="text-muted mb-3" />
              <h5 className="mb-2">Aucun employé trouvé</h5>
              <p className="text-muted mb-4">
                {searchTerm || filterStatus || filterDepartment 
                  ? "Aucun résultat pour vos critères de recherche"
                  : "Aucun employé n'est actuellement sous votre responsabilité"}
              </p>
              {(searchTerm || filterStatus || filterDepartment) && (
                <Button 
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDepartment('');
                    setFilterStatus('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '120px' }}>Matricule</th>
                    <th>Employé</th>
                    <th>Poste</th>
                    <th>Début</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="fw-bold text-primary">
                          <Hash size={14} className="me-1" />
                          {employee.employe?.matricule || employee.matricule || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <User size={18} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">
                              {employee.employe?.prenom} {employee.employe?.nom}
                            </div>
                            <small className="text-muted d-block">
                              {employee.employe?.email || 'Email non disponible'}
                            </small>
                            {employee.employe?.telephone && (
                              <small className="text-muted">
                                <Phone size={12} className="me-1" />
                                {employee.employe.telephone}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">
                          <Briefcase size={14} className="me-1 text-muted" />
                          {employee.poste?.nom || 'Non spécifié'}
                        </div>
                        {employee.classification && (
                          <small className="text-muted">
                            {employee.classification}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Calendar size={14} className="me-1 text-muted" />
                          {employee.dateDebutAssignationPoste && (
                          <small className="text-muted d-block mt-1">
                            Depuis {formatDate(employee.dateDebutAssignationPoste)}
                          </small>
                        )}
                        </div>
                        {employee.typeContrat?.intitule && (
                          <small className="text-muted d-block">
                            {employee.typeContrat.intitule}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => showEmployeeDetails(employee)}
                            aria-label="Voir détails"
                            className="d-flex align-items-center"
                          >
                            <Eye size={16} />
                          </Button>
                          
                          <Button
                            variant="outline-success"
                            size="sm"
                            href={`mailto:${employee.employe?.email}`}
                            aria-label="Envoyer un email"
                            className="d-flex align-items-center"
                            disabled={!employee.employe?.email}
                          >
                            <Mail size={16} />
                          </Button>
                          
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-secondary"
                              size="sm"
                              id="dropdown-actions"
                            >
                              <MoreVertical size={16} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item 
                                as={Link}
                                to={`/dashboard-manager/employees/${employee.employe?.id || employee.idEmploye}/mouvements`}
                              >
                                <Target size={16} className="me-2" />
                                Historique mouvements
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                href={`tel:${employee.employe?.telephone}`}
                                disabled={!employee.employe?.telephone}
                              >
                                <Phone size={16} className="me-2" />
                                Appeler
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal des détails */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <User className="me-2" size={24} />
            Détails de l'Employé
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <Row>
              {/* Colonne de gauche - Photo et info basique */}
              <Col md={4} className="text-center mb-4 mb-md-0">
                <div className="bg-primary text-white rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3">
                  <User size={48} />
                </div>
                <h4 className="mb-1">
                  {selectedEmployee.employe?.prenom} {selectedEmployee.employe?.nom}
                </h4>
                <p className="text-muted mb-2">
                  <Hash size={16} className="me-1" />
                  {selectedEmployee.employe?.matricule || selectedEmployee.matricule || 'Non spécifié'}
                </p>
                {renderStatusBadge(selectedEmployee.statut)}
                
                <div className="mt-4">
                  <Button
                    variant="outline-primary"
                    href={`mailto:${selectedEmployee.employe?.email}`}
                    className="w-100 mb-2 d-flex align-items-center justify-content-center"
                    disabled={!selectedEmployee.employe?.email}
                  >
                    <Mail size={16} className="me-2" />
                    Contacter par email
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    href={`tel:${selectedEmployee.employe?.telephone}`}
                    className="w-100 d-flex align-items-center justify-content-center"
                    disabled={!selectedEmployee.employe?.telephone}
                  >
                    <Phone size={16} className="me-2" />
                    Appeler
                  </Button>
                </div>
              </Col>

              {/* Colonne de droite - Détails */}
              <Col md={8}>
                {/* Informations personnelles */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3 d-flex align-items-center">
                    <User className="me-2" size={20} />
                    Informations Personnelles
                  </h5>
                  <Row>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Email :</strong><br />
                        {selectedEmployee.employe?.email || 'Non spécifié'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Téléphone :</strong><br />
                        {selectedEmployee.employe?.telephone || 'Non spécifié'}
                      </p>
                    </Col>
                  </Row>
                </div>

                {/* Informations professionnelles */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3 d-flex align-items-center">
                    <Briefcase className="me-2" size={20} />
                    Informations Professionnelles
                  </h5>
                  <Row> 
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Poste :</strong><br />
                        {selectedEmployee.poste?.nom || 'Non spécifié'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Type de Contrat :</strong><br />
                        {selectedEmployee.typeContrat?.intitule || selectedEmployee.typeContrat?.nom || 'Non spécifié'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Classification :</strong><br />
                        {selectedEmployee.classification || 'Non spécifié'}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Catégorie :</strong><br />
                        {selectedEmployee.categorieProfessionnelle?.libelle || 'Non spécifié'}
                      </p>
                    </Col>
                  </Row>
                </div>

                {/* Dates importantes */}
                <div>
                  <h5 className="border-bottom pb-2 mb-3 d-flex align-items-center">
                    <Calendar className="me-2" size={20} />
                    Dates Importantes
                  </h5>
                  <Row>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Date d'embauche :</strong><br />
                        {formatDate(selectedEmployee.dateEmbauche)}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-2">
                        <strong>Date début assignation :</strong><br />
                        {formatDate(selectedEmployee.dateDebutAssignationPoste)}
                      </p>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Composant RefreshCw manquant dans lucide-react, ajoutons-le
const RefreshCw = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

export default EmployeesManager;