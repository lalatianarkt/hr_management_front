import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { ArrowLeft, Briefcase, Calendar, Clock, RefreshCw, User, Users } from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance';
import dayjs from 'dayjs';

const DerniereInfoProfessionnelle = () => {
  const { idEmploye } = useParams();
  const navigate = useNavigate();

  const [infosPro, setInfosPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDerniereInfoProfessionnelle();
  }, [idEmploye]);

  const fetchDerniereInfoProfessionnelle = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/api/infosPro/dernierInfo/${idEmploye}`);
      setInfosPro(response.data || null);
    } catch (err) {
      console.error('Erreur lors du chargement des informations:', err);
      setError('Impossible de charger la derniere information professionnelle.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-');
  const formatDateTime = (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-');

  const formatSalaire = (salaire) => {
    if (!salaire) return '-';
    return `${new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salaire)} Ar`;
  };

  const getStatutBadge = (statut) => {
    const statutMap = {
      0: { variant: 'success', label: 'Actif' },
      1: { variant: 'secondary', label: 'Inactif' },
      2: { variant: 'warning', label: 'En conge' },
      3: { variant: 'info', label: 'En formation' },
    };

    const config = statutMap[statut] || { variant: 'dark', label: 'Inconnu' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="warning" />
        <span className="ms-3">Chargement des informations...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-3">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p className="mb-3">{error}</p>
          <div className="d-flex gap-2">
            <Button variant="warning" size="sm" onClick={fetchDerniereInfoProfessionnelle} className="d-flex align-items-center gap-1">
              <RefreshCw size={14} />
              Reessayer
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard-RH/archives')} className="d-flex align-items-center gap-1">
              <ArrowLeft size={14} />
              Retour
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!infosPro) {
    return (
      <Container fluid className="py-3">
        <Alert variant="info">
          <Alert.Heading>Information non trouvee</Alert.Heading>
          <p>Aucune information professionnelle n'a ete trouvee pour cet employe.</p>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard-RH/archives')} className="d-flex align-items-center gap-1">
            <ArrowLeft size={14} />
            Retour aux archives
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-info bg-opacity-25 p-2 rounded me-2">
              <Briefcase size={20} className="text-info" />
            </div>
            <h1 className="h4 mb-0">Derniere Information Professionnelle</h1>
            <Badge bg="light" text="dark" className="ms-2">
              ID: {infosPro.id}
            </Badge>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="outline-warning"
              size="sm"
              onClick={fetchDerniereInfoProfessionnelle}
              className="d-flex align-items-center gap-1"
            >
              <RefreshCw size={14} />
              Actualiser
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/dashboard-RH/archives')}
              className="d-flex align-items-center gap-1"
            >
              <ArrowLeft size={14} />
              Retour
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12}>
          <Card className="border shadow-sm">
            <Card.Header className="py-2 bg-light">
              <div className="d-flex align-items-center gap-2">
                <User size={16} className="text-info" />
                <span className="fw-medium">Informations de l'employe</span>
              </div>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" width="25%">Employe</td>
                    <td className="fw-semibold">{infosPro.employe?.prenom} {infosPro.employe?.nom}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Matricule</td>
                    <td>
                      <Badge bg="info">{infosPro.matricule || '-'}</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Statut</td>
                    <td>{getStatutBadge(infosPro.statut)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="py-2 bg-light">
              <div className="d-flex align-items-center gap-2">
                <Users size={16} className="text-info" />
                <span className="fw-medium">Details du poste</span>
              </div>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" width="35%">Poste</td>
                    <td className="fw-semibold">{infosPro.poste?.nom || '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Departement</td>
                    <td>{infosPro.departement?.nom || '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Manager</td>
                    <td>{infosPro.manager ? `${infosPro.manager.prenom} ${infosPro.manager.nom}` : '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Type de contrat</td>
                    <td><Badge bg="primary">{infosPro.typeContrat?.intitule || '-'}</Badge></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Temps de travail</td>
                    <td><Badge bg="warning" text="dark">{infosPro.typeTempsTravail?.tempsTravail || '-'}</Badge></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Classification</td>
                    <td>{infosPro.classification || '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Categorie professionnelle</td>
                    <td>{infosPro.categorieProfessionnelle?.libelle || '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Salaire de base</td>
                    <td className="fw-semibold">{formatSalaire(infosPro.salaireBase)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Type d'entree</td>
                    <td>{infosPro.typeEntree?.nom || '-'}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="py-2 bg-light">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={16} className="text-info" />
                <span className="fw-medium">Dates importantes</span>
              </div>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" width="55%">Date d'embauche</td>
                    <td>{formatDate(infosPro.dateEmbauche)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Début d'assignation de poste</td>
                    <td>{formatDate(infosPro.dateDebutAssignationPoste)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Fin d'assignation de poste</td>
                    <td>{formatDate(infosPro.dateFinAssignationPoste)}</td>
                  </tr>
                  {infosPro.dateDebauche && (
                    <tr>
                      <td className="text-muted">Date débauche</td>
                      <td><span className="text-danger">{formatDate(infosPro.dateDebauche)}</span></td>
                    </tr>
                  )}
                  {infosPro.motifDepart && (
                    <tr>
                      <td className="text-muted">Motif depart</td>
                      <td>{infosPro.motifDepart}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
          <Card className="border shadow-sm">
            <Card.Header className="py-2 bg-light">
              <div className="d-flex align-items-center gap-2">
                <Clock size={16} className="text-info" />
                <span className="fw-medium">Metadonnees</span>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <small className="text-muted d-block mb-1">Cree le</small>
                  <span className="fw-semibold">{formatDateTime(infosPro.createdAt)}</span>
                </Col>
                <Col md={4}>
                  <small className="text-muted d-block mb-1">Modifie le</small>
                  <span className="fw-semibold">{formatDateTime(infosPro.modifiedAt)}</span>
                </Col>
                <Col md={4}>
                  <small className="text-muted d-block mb-1">Reference</small>
                  <Badge bg="light" text="dark">{infosPro.id}</Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DerniereInfoProfessionnelle;
