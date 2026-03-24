// ManagerInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Table,
  Breadcrumb,
} from 'react-bootstrap';
import {
  PersonFill,
  BuildingFill,
  CalendarFill,
  ClockHistory,
  PersonLinesFill,
  XCircleFill,
  CheckCircleFill,
  ExclamationTriangleFill,
  EnvelopeFill,
  TelephoneFill,
  Award,
  BriefcaseFill,
  FileTextFill,
  Hash,
  ExclamationCircleFill,
  ChevronLeft,
  Download,
} from 'react-bootstrap-icons';

const ManagerInfoPage = () => {
  const { idManager } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manager, setManager] = useState(null);
  const [employeInfo, setEmployeInfo] = useState(null);

  // Charger les détails du manager
  const fetchManagerDetails = async () => {
    if (!idManager) {
      setError('ID manager manquant');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Récupérer les détails du manager
      const response = await axios.get(`http://localhost:8080/api/managers/${idManager}`);
      setManager(response.data);
      
      // Si le manager a un employé associé, récupérer ses infos
      if (response.data.employe?.id) {
        try {
          const employeResponse = await axios.get(`http://localhost:8080/api/employes/${response.data.employe.id}`);
          setEmployeInfo(employeResponse.data);
        } catch (error) {
          console.warn("Impossible de récupérer les détails de l'employé:", error);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du manager:", error);
      setError('Erreur lors du chargement des informations du manager');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerDetails();
  }, [idManager]);

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Obtenir le badge de statut
  const StatusBadge = ({ statut }) => {
    const getStatusConfig = () => {
      switch(statut) {
        case 0: // ACTIF
          return { label: 'Actif', variant: 'success', icon: CheckCircleFill };
        case 1: // INACTIF
          return { label: 'Inactif', variant: 'secondary', icon: XCircleFill };
        case 2: // EN_COURS_NOMINATION
          return { label: 'En cours de nomination', variant: 'info', icon: ClockHistory };
        case 3: // SUSPENDU
          return { label: 'Suspendu', variant: 'warning', icon: ExclamationTriangleFill };
        default:
          return { label: 'Inconnu', variant: 'secondary', icon: ExclamationTriangleFill };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <Badge bg={config.variant} className="d-inline-flex align-items-center gap-1 px-3 py-2">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  // Calculer la durée en jours
  const calculateDuree = (dateDebut, dateFin) => {
    if (!dateDebut) return 0;
    const fin = dateFin ? new Date(dateFin) : new Date();
    const debut = new Date(dateDebut);
    const diffTime = Math.abs(fin - debut);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Formater la durée
  const formatDuree = (jours) => {
    if (jours < 30) return `${jours} jour${jours > 1 ? 's' : ''}`;
    
    const mois = Math.floor(jours / 30);
    const joursRestants = jours % 30;
    
    if (mois < 12) {
      return `${mois} mois${joursRestants > 0 ? ` et ${joursRestants} jour${joursRestants > 1 ? 's' : ''}` : ''}`;
    }
    
    const annees = Math.floor(mois / 12);
    const moisRestants = mois % 12;
    
    return `${annees} an${annees > 1 ? 's' : ''}${moisRestants > 0 ? ` et ${moisRestants} mois` : ''}`;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Chargement des informations du manager...</p>
        </div>
      </Container>
    );
  }

  if (error || !manager) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error || 'Manager non trouvé'}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={() => navigate(-1)}>
              <ChevronLeft /> Retour
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb et navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/dashboard-RH">Tableau de bord</Breadcrumb.Item>
        <Breadcrumb.Item href="/dashboard-RH/employees">Employés</Breadcrumb.Item>
        <Breadcrumb.Item active>Manager {idManager}</Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            {/* <Button 
              variant="outline-secondary" 
              onClick={() => navigate(-1)}
              className="d-flex align-items-center gap-2"
            >
              <ChevronLeft /> Retour
            </Button> */}
            <div>
              <h1 className="h2 mb-2 fw-bold">Fiche du Manager</h1>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <StatusBadge statut={manager.statut} />
                {manager.departement && (
                  <Badge bg="light" text="dark" className="fw-semibold px-3 py-2">
                    <BuildingFill className="me-2" />
                    {manager.departement.nom}
                    {manager.departement.code && ` (${manager.departement.code})`}
                  </Badge>
                )}
                {employeInfo?.employe?.matricule && (
                  <Badge bg="info" className="fw-semibold px-3 py-2">
                    <Hash className="me-2" />
                    {employeInfo.employe.matricule}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-primary" 
            className="d-flex align-items-center gap-2"
            onClick={() => window.open(`http://localhost:8080/api/export/manager/${idManager}`)}
          >
            <Download /> Exporter en PDF
          </Button>
        </Col>
      </Row>

      {/* Messages d'erreur */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError('')} 
          className="mb-4"
        >
          <ExclamationTriangleFill className="me-2" />
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* Informations principales du manager */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <BriefcaseFill />
                Rôle de Management
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-4">
                    <small className="text-muted d-flex align-items-center gap-1 mb-2">
                      <Hash size={12} />
                      Statut
                    </small>
                    <div>
                      <StatusBadge statut={manager.statut} />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <small className="text-muted d-flex align-items-center gap-1 mb-2">
                      <CalendarFill size={12} />
                      Date début
                    </small>
                    <p className="fw-semibold mb-0 fs-5">{formatDate(manager.dateDebut)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <small className="text-muted d-flex align-items-center gap-1 mb-2">
                      <CalendarFill size={12} />
                      Date fin
                    </small>
                    <p className="fw-semibold mb-0 fs-5">
                      {manager.dateFin ? formatDate(manager.dateFin) : 'En cours'}
                    </p>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-4">
                    <small className="text-muted d-flex align-items-center gap-1 mb-2">
                      <ClockHistory size={12} />
                      Durée
                    </small>
                    <p className="fw-semibold mb-0 fs-5">
                      {formatDuree(calculateDuree(manager.dateDebut, manager.dateFin))}
                    </p>
                  </div>
                  
                  {manager.departement && (
                    <div className="mb-4">
                      <small className="text-muted d-flex align-items-center gap-1 mb-2">
                        <BuildingFill size={12} />
                        Département
                      </small>
                      <p className="fw-semibold mb-0 fs-5">
                        {manager.departement.nom}
                        {manager.departement.code && ` (${manager.departement.code})`}
                      </p>
                    </div>
                  )}
                  
                  {manager.commentaire && (
                    <div className="mb-4">
                      <small className="text-muted d-flex align-items-center gap-1 mb-2">
                        <FileTextFill size={12} />
                        Commentaire
                      </small>
                      <p className="mb-0">{manager.commentaire}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Informations de l'employé manager */}
        <Col lg={6}>
          {employeInfo?.employe ? (
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-info text-white py-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <PersonFill />
                  Informations de l'Employé
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="align-items-center mb-4">
                  <Col xs="auto" className="text-center">
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #b053ad 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <PersonFill size={40} className="text-white" />
                    </div>
                  </Col>
                  <Col>
                    <h4 className="mb-1">
                      {employeInfo.employe.prenom} {employeInfo.employe.nom}
                    </h4>
                    {/* <Badge bg="light" text="dark" className="fw-normal px-3 py-2">
                      {employeInfo.employe.matricule || 'Sans matricule'}
                    </Badge> */}
                  </Col>
                </Row>

                <h6 className="fw-semibold mb-3">Coordonnées</h6>
                <Table borderless size="sm" className="mb-4">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="30%">Email:</td>
                      <td>
                        <a href={`mailto:${employeInfo.employe.email}`} className="text-decoration-none">
                          <EnvelopeFill className="me-2" />
                          {employeInfo.employe.email || 'Non spécifié'}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Téléphone:</td>
                      <td>
                        <a href={`tel:${employeInfo.employe.telephone}`} className="text-decoration-none">
                          <TelephoneFill className="me-2" />
                          {employeInfo.employe.telephone || 'Non spécifié'}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Adresse:</td>
                      <td>{employeInfo.employe.adresse || 'Non spécifié'}</td>
                    </tr>
                  </tbody>
                </Table>

                <h6 className="fw-semibold mb-3">Informations Professionnelles</h6>
                <Table borderless size="sm">
                  <tbody>
                    {employeInfo.infosProfessionnelles?.[0]?.poste && (
                      <tr>
                        <td className="text-muted" width="30%">Poste:</td>
                        <td>
                          <Badge bg="info" className="fw-normal">
                            {employeInfo.infosProfessionnelles[0].poste.nom}
                          </Badge>
                        </td>
                      </tr>
                    )}
                    {employeInfo.infosProfessionnelles?.[0]?.departement && (
                      <tr>
                        <td className="text-muted">Département:</td>
                        <td>
                          <Badge bg="light" text="dark" className="fw-normal">
                            {employeInfo.infosProfessionnelles[0].departement.nom}
                          </Badge>
                        </td>
                      </tr>
                    )}
                    {employeInfo.infosProfessionnelles?.[0]?.classification && (
                      <tr>
                        <td className="text-muted">Classification:</td>
                        <td>
                          <Badge bg="light" text="dark" className="fw-normal">
                            {employeInfo.infosProfessionnelles[0].classification}
                          </Badge>
                        </td>
                      </tr>
                    )}
                    {employeInfo.infosProfessionnelles?.[0]?.salaireBase && (
                      <tr>
                        <td className="text-muted">Salaire:</td>
                        <td className="fw-semibold">
                          {new Intl.NumberFormat('fr-MG', { 
                            style: 'currency', 
                            currency: 'MGA',
                            minimumFractionDigits: 0 
                          }).format(employeInfo.infosProfessionnelles[0].salaireBase)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-warning text-white py-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <ExclamationCircleFill />
                  Avertissement
                </h5>
              </Card.Header>
              <Card.Body className="d-flex flex-column justify-content-center">
                <div className="text-center">
                  <ExclamationCircleFill size={48} className="text-warning mb-3" />
                  <h5 className="fw-bold mb-3">Aucun employé associé à ce manager</h5>
                  <p className="text-muted mb-4">
                    Ce manager existe dans le système mais n'a pas d'employé associé. 
                    Cela peut arriver si :
                  </p>
                  <ul className="text-start text-muted mb-4">
                    <li>L'employé a été supprimé</li>
                    <li>Le manager a été créé sans employé associé</li>
                    <li>Il y a une incohérence dans les données</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Informations système */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light py-3">
              <h5 className="mb-0">Informations Système</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">ID Manager:</small>
                    <p className="mb-0">
                      <code className="bg-light p-2 rounded d-inline-block">{manager.id}</code>
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">Créé le:</small>
                    <p className="fw-semibold mb-0">{formatDate(manager.createdAt)}</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">Modifié le:</small>
                    <p className="fw-semibold mb-0">{formatDate(manager.modifiedAt)}</p>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <div className="mb-3">
                    <small className="text-muted">ID Employé:</small>
                    <p className="mb-0">
                      <code className="bg-light p-2 rounded d-inline-block">
                        {manager.employe?.id || 'Non spécifié'}
                      </code>
                    </p>
                  </div>
                </Col>
                <Col md={8}>
                  <div className="mb-3">
                    <small className="text-muted">Statut:</small>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge statut={manager.statut} />
                      <span className="text-muted ms-2">
                        • Durée: {formatDuree(calculateDuree(manager.dateDebut, manager.dateFin))}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer className="bg-light border-0 py-3">
              <div className="d-flex justify-content-between">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate(-1)}
                  className="d-flex align-items-center gap-2"
                >
                  <ChevronLeft /> Retour
                </Button>
                
                {manager.employe?.id && (
                  <Button 
                    variant="primary"
                    onClick={() => navigate(`/dashboard-RH/manager/employe/${manager.employe.id}`)}
                    className="d-flex align-items-center gap-2"
                  >
                    <PersonFill size={16} />
                    Voir la fiche complète de l'employé
                  </Button>
                )}
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagerInfoPage;
