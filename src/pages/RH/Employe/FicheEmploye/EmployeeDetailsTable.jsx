// src/pages/EmployeeDetailsTable.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Accordion,
} from 'react-bootstrap';
import {
  PersonFill,
  BriefcaseFill,
  FileEarmarkTextFill,
  TelephoneFill,
  EnvelopeFill,
  GeoAltFill,
  CalendarFill,
  BuildingFill,
  ClockFill,
  Download,
  ChevronLeft,
  CheckCircleFill,
  XCircleFill,
  PersonBadgeFill,
  PersonLinesFill,
  PeopleFill,
  CardText,
  ExclamationTriangleFill,
  CurrencyDollar,
  Award,
  ClockHistory,
  Hash,
  Building,
  FileText,
  Bank,
  Home,
  Globe,
  Heart,
  Baby,
  Person,
  Phone,
  Mailbox,
  Map,
  FilePerson,
  FileEarmarkCheck,
  CalendarEvent,
  CalendarWeek,
  CalendarMonth,
  CalendarDate,
  Cash,
  GraphUp,
  PersonWorkspace,
  PersonGear,
  PersonVcard,
  PersonSquare,
  FileEarmarkPdf,
  FileEarmarkWord,
  Printer,
  Share,
  ClipboardData,
} from 'react-bootstrap-icons';

const EmployeeDetailsTable = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState(null);

  // Charger les données de l'employé
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:8080/api/employes/${id}`);
      setEmployeeData(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setError('Erreur lors du chargement des données de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  // Fonctions utilitaires
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

  const formatSalaire = (salaire) => {
    if (!salaire) return 'Non spécifié';
    return new Intl.NumberFormat('fr-MG', { 
      style: 'currency', 
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(salaire);
  };

  const safeDisplay = (value) => value || 'Non spécifié';

  // Obtenir le contrat actuel
  const getContratActuel = () => {
    if (!employeeData?.infosProfessionnelles) return null;
    const contratsTries = [...employeeData.infosProfessionnelles].sort((a, b) => {
      const dateA = a.dateDebutAssignationPoste || a.dateEmbauche || '';
      const dateB = b.dateDebutAssignationPoste || b.dateEmbauche || '';
      return new Date(dateB) - new Date(dateA);
    });
    const contratActuel = contratsTries.find(contrat => contrat.statut === 0);
    return contratActuel || (contratsTries.length > 0 ? contratsTries[0] : null);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Chargement des informations de l'employé...</p>
        </div>
      </Container>
    );
  }

  if (error || !employeeData?.employe) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error || 'Employé non trouvé'}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={() => navigate('/dashboard-RH/employees')}>
              <ChevronLeft /> Retour à la liste
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const employe = employeeData.employe;
  const contratActuel = getContratActuel();
  const infosPro = contratActuel || {};

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb et navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/dashboard-RH">Tableau de bord</Breadcrumb.Item>
        <Breadcrumb.Item href="/dashboard-RH/employees">Employés</Breadcrumb.Item>
        <Breadcrumb.Item active>{employe.prenom} {employe.nom}</Breadcrumb.Item>
      </Breadcrumb>

      {/* En-tête */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/dashboard-RH/employees')}
              className="d-flex align-items-center gap-2"
            >
              <ChevronLeft /> Retour
            </Button>
            <div>
              <h1 className="h2 mb-2 fw-bold">
                {employe.prenom} {employe.nom}
                {infosPro?.matricule && (
                  <Badge bg="info" className="ms-3">
                    <Hash className="me-1" /> {infosPro.matricule}
                  </Badge>
                )}
              </h1>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                {infosPro?.poste?.departement?.nom && (
                  <Badge bg="light" text="dark" className="fw-semibold px-3 py-2">
                    <BuildingFill className="me-2" />
                    {safeDisplay(infosPro?.poste?.departement?.nom)}
                  </Badge>
                )}
                {infosPro?.poste?.nom && (
                  <Badge bg="primary" className="fw-semibold px-3 py-2">
                    <BriefcaseFill className="me-2" />
                    {safeDisplay(infosPro?.poste?.nom)}
                  </Badge>
                )}
                {infosPro?.typeContrat?.intitule && (
                  <Badge bg="secondary" className="fw-semibold px-3 py-2">
                    {infosPro.typeContrat.intitule}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button 
            variant="outline-primary"
            onClick={() => window.open(`http://localhost:8080/api/export/${employe.id}`)}
            className="d-flex align-items-center gap-2"
          >
            <FileEarmarkPdf /> PDF
          </Button>
          <Button 
            variant="outline-secondary"
            onClick={() => window.print()}
            className="d-flex align-items-center gap-2"
          >
            <Printer /> Imprimer
          </Button>
        </Col>
      </Row>

      {/* Grand tableau unique */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <ClipboardData />
            Fiche Complète de l'Employé
          </h4>
        </Card.Header>
        <Card.Body className="p-0">
          
          {/* Section 1: Informations Personnelles */}
          <div className="p-4 border-bottom">
            <h5 className="mb-3 text-primary">
              <PersonFill className="me-2" />
              INFORMATIONS PERSONNELLES
            </h5>
            
            <Row>
              {/* Colonne 1: Identité */}
              <Col lg={4}>
                <Table bordered size="sm" className="mb-4">
                  <thead className="table-primary">
                    <tr>
                      <th colSpan="2">
                        <PersonFill className="me-2" />
                        Identité
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th width="40%" className="bg-light">Nom</th>
                      <td><strong>{safeDisplay(employe.nom)}</strong></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Prénom</th>
                      <td><strong>{safeDisplay(employe.prenom)}</strong></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Sexe</th>
                      <td>{safeDisplay(employe.sexe?.sexe)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nationalité</th>
                      <td>{safeDisplay(employe.nationalite?.nationalite)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">CIN</th>
                      <td>
                        <code>{safeDisplay(employe.cin)}</code>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Numéro CNAPS</th>
                      <td>
                        <code>{safeDisplay(employe.numCnaps)}</code>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              {/* Colonne 2: Naissance */}
              <Col lg={4}>
                <Table bordered size="sm" className="mb-4">
                  <thead className="table-success">
                    <tr>
                      <th colSpan="2">
                        <CalendarDate className="me-2" />
                        Naissance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th width="40%" className="bg-light">Date de naissance</th>
                      <td>{formatDate(employe.dateNaissance)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Lieu de naissance</th>
                      <td>{safeDisplay(employe.lieuNaissance)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nom du père</th>
                      <td>{safeDisplay(employe.nomPere)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nom de la mère</th>
                      <td>{safeDisplay(employe.nomMere)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              {/* Colonne 3: État Civil et Famille */}
              <Col lg={4}>
                <Table bordered size="sm" className="mb-4">
                  <thead className="table-info">
                    <tr>
                      <th colSpan="2">
                        <PeopleFill className="me-2" />
                        État Civil et Famille
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th width="40%" className="bg-light">État civil</th>
                      <td>
                        <Badge bg="info">{safeDisplay(employe.etatCivil)}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nom du conjoint</th>
                      <td>{safeDisplay(employe.nomConjoint)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nombre d'enfants</th>
                      <td>
                        <Badge bg={employe.nbEnfants > 0 ? 'primary' : 'secondary'} pill>
                          {employe.nbEnfants || 0}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Coordonnées - Pleine largeur */}
            <Row>
              <Col>
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-warning">
                    <tr>
                      <th colSpan="4">
                        <TelephoneFill className="me-2" />
                        Coordonnées
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th width="25%" className="bg-light">Téléphone</th>
                      <td width="25%">
                        {employe.telephone ? (
                          <a href={`tel:${employe.telephone}`} className="text-decoration-none">
                            <Phone className="me-1" /> {employe.telephone}
                          </a>
                        ) : 'Non spécifié'}
                      </td>
                      <th width="25%" className="bg-light">Email</th>
                      <td width="25%">
                        {employe.email ? (
                          <a href={`mailto:${employe.email}`} className="text-decoration-none">
                            <EnvelopeFill className="me-1" /> {employe.email}
                          </a>
                        ) : 'Non spécifié'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Adresse</th>
                      <td colSpan="3">{safeDisplay(employe.adresse)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </div>

          {/* Section 2: Informations Professionnelles */}
          <div className="p-4 border-bottom">
            <h5 className="mb-3 text-success">
              <BriefcaseFill className="me-2" />
              INFORMATIONS PROFESSIONNELLES
            </h5>

            {contratActuel ? (
              <>
                {/* Contrat Actuel */}
                <Row className="mb-4">
                  <Col>
                    <Table bordered size="sm">
                      <thead className="table-success">
                        <tr>
                          <th colSpan="4">
                            <BriefcaseFill className="me-2" />
                            CONTRAT ACTUEL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th width="20%" className="bg-light">Poste</th>
                          <td width="30%">
                            <Badge bg="info">{safeDisplay(infosPro?.poste?.nom)}</Badge>
                          </td>
                          <th width="20%" className="bg-light">Département</th>
                          <td width="30%">
                            <Badge bg="light" text="dark">
                              {safeDisplay(infosPro?.poste?.departement?.nom)}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-light">Type de contrat</th>
                          <td>
                            <Badge bg="secondary">{safeDisplay(infosPro?.typeContrat?.intitule)}</Badge>
                          </td>
                          <th className="bg-light">Matricule</th>
                          <td>
                            <code>{safeDisplay(infosPro?.matricule)}</code>
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-light">Salaire de base</th>
                          <td className="fw-bold">{formatSalaire(infosPro?.salaireBase)}</td>
                          <th className="bg-light">Classification</th>
                          <td>
                            {infosPro?.classification && (
                              <Badge bg="primary">{infosPro.classification}</Badge>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-light">Date d'embauche</th>
                          <td>{formatDate(infosPro?.dateEmbauche)}</td>
                          <th className="bg-light">Catégorie professionnelle</th>
                          <td>{safeDisplay(infosPro?.categorieProfessionnelle?.libelle)}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Début assignation</th>
                          <td>{formatDate(infosPro?.dateDebutAssignationPoste)}</td>
                          <th className="bg-light">Type temps travail</th>
                          <td>{safeDisplay(infosPro?.typeTempsTravail?.tempsTravail)}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Fin assignation</th>
                          <td>{formatDate(infosPro?.dateFinAssignationPoste) || 'Indéterminée'}</td>
                          <th className="bg-light">Type d'entrée</th>
                          <td>{safeDisplay(infosPro?.typeEntree?.nom || infosPro?.typeEntree?.libelle)}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Manager</th>
                          <td colSpan="3">
                            {infosPro?.manager?.employe ? (
                              <Link 
                                to={`/dashboard-RH/employees/${infosPro.manager.employe.id}`}
                                className="text-decoration-none"
                              >
                                <PersonLinesFill className="me-1" />
                                {infosPro.manager.employe.prenom} {infosPro.manager.employe.nom}
                              </Link>
                            ) : 'Non spécifié'}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                {/* Historique des contrats */}
                <div className="mt-4">
                  <h6 className="mb-3 text-primary">
                    <ClockHistory className="me-2" />
                    HISTORIQUE DES CONTRATS
                  </h6>
                  <Accordion>
                    {employeeData.infosProfessionnelles
                      .sort((a, b) => new Date(b.dateDebutAssignationPoste || b.dateEmbauche) - new Date(a.dateDebutAssignationPoste || a.dateEmbauche))
                      .map((contrat, index) => (
                        <Accordion.Item eventKey={index.toString()} key={contrat.id}>
                          <Accordion.Header>
                            <div className="d-flex align-items-center gap-3 w-100">
                              <Badge bg={contrat.statut === 0 ? 'success' : 'secondary'}>
                                {contrat.typeContrat?.intitule || 'Contrat'}
                              </Badge>
                              <div>
                                <span className="fw-semibold">
                                  {contrat.poste?.nom || 'Poste non spécifié'}
                                </span>
                                <small className="text-muted ms-3">
                                  {formatDate(contrat.dateDebutAssignationPoste || contrat.dateEmbauche)}
                                  {contrat.dateFinAssignationPoste && ` → ${formatDate(contrat.dateFinAssignationPoste)}`}
                                </small>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <Row>
                              <Col md={6}>
                                <Table bordered size="sm">
                                  <tbody>
                                    <tr>
                                      <th width="40%" className="bg-light">Poste</th>
                                      <td>{safeDisplay(contrat.poste?.nom)}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Département</th>
                                      <td>{safeDisplay(contrat.poste?.departement?.nom)}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Salaire</th>
                                      <td className="fw-bold">{formatSalaire(contrat.salaireBase)}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Classification</th>
                                      <td>{safeDisplay(contrat.classification)}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Catégorie</th>
                                      <td>{safeDisplay(contrat.categorieProfessionnelle?.libelle)}</td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </Col>
                              <Col md={6}>
                                <Table bordered size="sm">
                                  <tbody>
                                    <tr>
                                      <th width="40%" className="bg-light">Embauche</th>
                                      <td>{formatDate(contrat.dateEmbauche)}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Début assignation</th>
                                      <td>{formatDate(contrat.dateDebutAssignationPoste)}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Fin assignation</th>
                                      <td>{formatDate(contrat.dateFinAssignationPoste) || 'Indéterminée'}</td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Manager</th>
                                      <td>
                                        {contrat.manager?.employe 
                                          ? `${contrat.manager.employe.prenom} ${contrat.manager.employe.nom}`
                                          : '-'
                                        }
                                      </td>
                                    </tr>
                                    <tr>
                                      <th className="bg-light">Statut</th>
                                      <td>
                                        <Badge bg={contrat.statut === 0 ? 'success' : 'secondary'}>
                                          {contrat.statut === 0 ? 'Actif' : 'Inactif'}
                                        </Badge>
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </Col>
                            </Row>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                  </Accordion>
                </div>
              </>
            ) : (
              <Alert variant="info" className="text-center">
                <BriefcaseFill className="me-2" />
                Aucune information professionnelle disponible pour cet employé.
              </Alert>
            )}
          </div>

          {/* Section 3: Contact d'urgence et Documents */}
          <div className="p-4">
            <h5 className="mb-3 text-danger">
              <FileEarmarkTextFill className="me-2" />
              CONTACT D'URGENCE ET DOCUMENTS
            </h5>

            <Row>
              {/* Contact d'urgence */}
              <Col lg={6}>
                <Table bordered size="sm" className="mb-4">
                  <thead className="table-secondary">
                    <tr>
                      <th colSpan="2">
                        <PersonLinesFill className="me-2" />
                        Contact d'Urgence
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th width="40%" className="bg-light">Nom</th>
                      <td>{safeDisplay(employe.emergencyContact?.nom)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Téléphone</th>
                      <td>
                        {employe.emergencyContact?.contact ? (
                          <a href={`tel:${employe.emergencyContact.contact}`} className="text-decoration-none">
                            <Phone className="me-1" /> {employe.emergencyContact.contact}
                          </a>
                        ) : 'Non spécifié'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Email</th>
                      <td>{safeDisplay(employe.emergencyContact?.email)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Adresse</th>
                      <td>{safeDisplay(employe.emergencyContact?.adresse)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              {/* Documents */}
              <Col lg={6}>
                <Table bordered size="sm" className="mb-4">
                  <thead className="table-warning">
                    <tr>
                      <th colSpan="2">
                        <FileText className="me-2" />
                        Documents
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th width="40%" className="bg-light">Contrat de travail</th>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:8080/api/export/${employe.id}/contract`)}
                          className="d-flex align-items-center gap-1"
                        >
                          <Download size={12} /> Télécharger
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Fiche employé (PDF)</th>
                      <td>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:8080/api/export/${employe.id}`)}
                          className="d-flex align-items-center gap-1"
                        >
                          <FileEarmarkPdf size={12} /> Télécharger
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Résumé rapide */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <PersonFill size={32} className="text-primary mb-2" />
              <h3 className="mb-1">{employe.nbEnfants || 0}</h3>
              <small className="text-muted">Enfants</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <BriefcaseFill size={32} className="text-success mb-2" />
              <h3 className="mb-1">{employeeData.infosProfessionnelles?.length || 0}</h3>
              <small className="text-muted">Contrats</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <CalendarFill size={32} className="text-info mb-2" />
              <h3 className="mb-1">
                {employe.dateNaissance 
                  ? new Date().getFullYear() - new Date(employe.dateNaissance).getFullYear()
                  : 'N/A'
                }
              </h3>
              <small className="text-muted">Âge</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <CurrencyDollar size={32} className="text-warning mb-2" />
              <h3 className="mb-1">
                {infosPro?.salaireBase ? formatSalaire(infosPro.salaireBase).split(',')[0] : 'N/A'}
              </h3>
              <small className="text-muted">Salaire</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/dashboard-RH/employees')}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft /> Retour à la liste
          </Button>
          <div className="d-flex gap-2">
            <Button 
              variant="primary"
              onClick={() => window.open(`http://localhost:8080/api/export/${employe.id}`)}
              className="d-flex align-items-center gap-2"
            >
              <FileEarmarkPdf /> Exporter en PDF
            </Button>
            <Button 
              variant="success"
              onClick={() => window.print()}
              className="d-flex align-items-center gap-2"
            >
              <Printer /> Imprimer
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeDetailsTable;
