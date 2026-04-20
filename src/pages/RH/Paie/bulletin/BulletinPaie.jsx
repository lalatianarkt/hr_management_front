import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Form,
  Spinner,
  Alert,
  Badge,
  Button,
  Row,
  Col,
  InputGroup,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap';
import {
  Home,
  Users,
  DollarSign,
  Calendar,
  Search,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  List,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  PieChart,
  Printer,
  Download
} from 'react-feather';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/AxiosInstance';

function BulletinDepartementPage() {
  const navigate = useNavigate();
  // États
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les données
  useEffect(() => {
    fetchBulletins();
  }, []);

  const fetchBulletins = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.get('/api/paie/bulletin');
      console.log("data : ", response.data);
      setDepartements(response.data);

    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      
      if (err.response) {
        setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur lors du chargement des bulletins'}`);
      } else if (err.request) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError('Erreur lors du chargement des bulletins par département');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartements = departements.filter(dept =>
    dept.departement?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.departement?.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer les statistiques
  const calculateStats = () => {
    const totalPaiesGenerees = filteredDepartements.reduce((total, dept) => total + (dept.nbPaieGenere || 0), 0);
    
    const stats = {
      totalDepartements: filteredDepartements.length,
      enCours: filteredDepartements.filter(dept => dept.statut === 0).length,
      enAttente: filteredDepartements.filter(dept => dept.statut === 1).length,
      autres: filteredDepartements.filter(dept => dept.statut !== 0 && dept.statut !== 1).length,
      totalPaiesGenerees: totalPaiesGenerees,
      departementsAvecPaie: filteredDepartements.filter(dept => (dept.nbPaieGenere || 0) > 0).length
    };

    return stats;
  };

  const stats = calculateStats();

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Obtenir le statut avec badge et icône
  const getStatusInfo = (statut) => {
    switch (statut) {
      case 0:
        return {
          text: 'En cours',
          variant: 'success',
          icon: <CheckCircle size={14} className="me-1" />
        };
      case 1:
        return {
          text: 'En attente',
          variant: 'warning',
          icon: <Clock size={14} className="me-1" />
        };
      default:
        return {
          text: `Statut ${statut}`,
          variant: 'secondary',
          icon: <XCircle size={14} className="me-1" />
        };
    }
  };

  // Obtenir la couleur du badge pour le nombre de paies
  const getPaieCountColor = (count) => {
    if (count === 0) return 'secondary';
    if (count < 5) return 'info';
    if (count < 10) return 'primary';
    if (count < 20) return 'success';
    return 'warning';
  };

  // Fonction pour naviguer vers la page des détails
  const goToBulletinDetails = (departementId, departementName) => {
    navigate(`/dashboard-RH/paie/bulletin/departement/${departementId}`, {
      state: { departementName }
    });
  };

  const handleExportDepartementExcel = async (dept) => {
    const departementName = dept?.departement?.nom;
    if (!departementName) {
      alert("Nom du département introuvable.");
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/api/export/bulletin/departement/${encodeURIComponent(departementName)}/excel`,
        { responseType: "blob" }
      );

      const excelBlob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const excelUrl = window.URL.createObjectURL(excelBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = excelUrl;
      downloadLink.download = `bulletins_${departementName.replace(/[^a-zA-Z0-9-_]/g, "_")}.xlsx`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(excelUrl);
    } catch (err) {
      console.error("Erreur export Excel département:", err);
      alert("Erreur lors de l'export Excel du département.");
    }
  };

  // Tooltip pour le nombre de paies
  const renderPaieTooltip = (count, deptName) => (
    <Tooltip id={`tooltip-${deptName}`}>
      {count} bulletin{count > 1 ? 's' : ''} de paie généré{count > 1 ? 's' : ''} pour {deptName}
    </Tooltip>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des bulletins par département...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Styles CSS personnalisés */}
      <style>
        {`
          :root {
            --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --bg-gradient-hover: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
          }
          
          .stat-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 1rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            border: none;
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .stat-card .stat-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          
          .stat-card .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            line-height: 1;
          }
          
          .stat-card .stat-label {
            font-size: 0.85rem;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .table-row-hover {
            transition: all 0.3s ease;
          }
          
          .table-row-hover:hover {
            background-color: #f8f9fa;
            transform: scale(1.01);
          }
          
          .transition-all {
            transition: all 0.3s ease;
          }
          
          .badge-paie-count {
            font-size: 0.75rem;
            padding: 0.35rem 0.65rem;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in {
            animation: fadeIn 0.5s ease-out;
          }

          .bulletin-hero-card h1 {
            line-height: 1.2;
          }

          @media (max-width: 768px) {
            .bulletin-hero-card h1 {
              font-size: 1.5rem !important;
            }
          }
        `}
      </style>

      {/* En-tête amélioré */}
      <Card
        className="mb-4 border-0 shadow-sm bulletin-hero-card"
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fff 0%, #fdf7fc 100%)',
          border: '1px solid rgba(176, 83, 173, 0.12)'
        }}
      >
        <Card.Body className="px-4 py-4 px-lg-5">
          <Row className="align-items-center g-3">
            <Col lg={8}>
              <div className="d-flex align-items-start gap-3">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #f3e2f1 0%, #e1b2db 100%)',
                    boxShadow: '0 8px 20px rgba(176, 83, 173, 0.15)'
                  }}
                >
                  <FileText size={28} color="#8e3a8b" />
                </div>

                <div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <h1
                      className="mb-0 fw-bold"
                      style={{
                        fontSize: '2rem',
                        color: '#5c2458',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      Bulletins de paie
                    </h1>

                    <Badge
                      pill
                      style={{
                        backgroundColor: '#f3e2f1',
                        color: '#8e3a8b',
                        fontWeight: 600,
                        padding: '8px 12px',
                        border: '1px solid #e1b2db'
                      }}
                    >
                      {stats.totalDepartements} départements
                    </Badge>
                  </div>

                  <p
                    className="mb-2"
                    style={{
                      color: '#6b5a68',
                      fontSize: '1rem'
                    }}
                  >
                    Suivi des bulletins de paie par département, avec consultation de l’état
                    d’avancement et accès rapide aux détails.
                  </p>
                </div>
              </div>
            </Col>

            <Col lg={4}>
              <div className="d-flex justify-content-lg-end justify-content-start">
                <Button
                  onClick={fetchBulletins}
                  className="rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #b053ad 0%, #8e3a8b 100%)',
                    border: 'none',
                    color: '#fff', // 🔥 important
                    boxShadow: '0 8px 18px rgba(176, 83, 173, 0.25)'
                  }}
                >
                  <RefreshCw size={16} color="#fff" /> {/* 🔥 forcer la couleur */}
                  Actualiser
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Alertes */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Cartes de statistiques améliorées */}
      <Row className="mb-4 g-3 fade-in">
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-icon"><Home size={24} className="text-primary" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalDepartements}</div>
              <div className="stat-label">Départements</div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-icon"><CheckCircle size={24} className="text-success" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.enCours}</div>
              <div className="stat-label">En cours</div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-icon"><Clock size={24} className="text-warning" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.enAttente}</div>
              <div className="stat-label">En attente</div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={24} className="text-info" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalPaiesGenerees}</div>
              <div className="stat-label">Total paies générées</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Deuxième ligne de statistiques */}
      <Row className="mb-4 g-3 fade-in">
        <Col md={6}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-icon"><PieChart size={24} className="text-primary" /></div>
                <div className="stat-label">Départements avec paie</div>
                <div className="stat-value">{stats.departementsAvecPaie}</div>
              </div>
              <div className="text-end">
                <div className="stat-label">Taux de génération</div>
                <div className="stat-value">
                  {Math.round((stats.departementsAvecPaie / stats.totalDepartements) * 100) || 0}%
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Barre de recherche */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-3">
          <InputGroup className="border-0 bg-light" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <InputGroup.Text className="bg-transparent border-0 ps-3">
              <Search size={20} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Rechercher un département par nom ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 py-3"
              style={{ fontSize: '1rem', boxShadow: 'none' }}
            />
            {searchTerm && (
              <Button
                variant="link"
                className="text-muted text-decoration-none pe-3"
                onClick={() => setSearchTerm('')}
              >
                <Badge bg="secondary" pill className="p-2 px-3">Effacer</Badge>
              </Button>
            )}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Tableau principal */}
      <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <Card.Header className="bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 fw-bold me-2">Liste des départements</h5>
            {/* <Badge bg="primary" style={{ background: 'var(--bg-gradient)', fontSize: '0.8rem', padding: '6px 12px' }}>
              {filteredDepartements.length}
            </Badge> */}
          </div>
          {/* <div className="text-muted small fw-medium">
            {searchTerm ? `Filtre actif : ${searchTerm}` : 'Afficher tous'}
          </div> */}
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light text-uppercase small" style={{ letterSpacing: '1px' }}>
                <tr>
                  <th className="py-3 ps-4" style={{ width: '5%', color: '#5c2458' }}>#</th>
                  <th className="py-3" style={{ width: '25%', color: '#5c2458' }}>Département</th>
                  <th className="py-3 text-center" style={{ width: '12%', color: '#5c2458' }}>Période</th>
                  <th className="py-3 text-center" style={{ width: '12%', color: '#5c2458' }}>Paies générées</th>
                  <th className="py-3" style={{ width: '12%', color: '#5c2458' }}>Statut</th>
                  <th className="py-3 text-end pe-4" style={{ width: '10%', color: '#5c2458' }}>Action</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: 'none' }}>
                {filteredDepartements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <Home size={60} className="mb-3 text-muted opacity-25" />
                        <h5 className="text-muted">Aucun résultat trouvé</h5>
                        <p className="text-muted small">Modifiez votre recherche ou actualisez la page</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDepartements.map((dept, index) => {
                    const statusInfo = getStatusInfo(dept.statut);
                    const nbPaieGenere = dept.nbPaieGenere || 0;
                    const paieColor = getPaieCountColor(nbPaieGenere);

                    return (
                      <tr key={index} className="table-row-hover transition-all">
                        <td className="ps-4">
                          <span className="text-muted fw-medium">{index + 1}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {/* <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                              <Home size={20} className="text-primary" />
                            </div> */}
                            <div className="stat-icon">
                              <Home size={20} className="text-primary" />
                            </div>
                            <div>
                              <div className="fw-bold fs-6 text-dark">{dept.departement?.nom || 'Nom inconnu'}</div>
                              <div className="text-muted small">{dept.departement?.description || 'Sans description'}</div>
                            </div>
                          </div>
                        </td>
                        {/* <td>
                          <code className="px-2 py-1 bg-light text-primary rounded small fw-bold">
                            {dept.departement?.id || 'N/A'}
                          </code>
                        </td> */}
                        <td className="text-center">
                          <div className="d-inline-flex align-items-center px-3 py-1 bg-light rounded-pill small fw-bold">
                            <Calendar size={14} className="me-2 text-primary" />
                            {formatDate(dept.date_debut_periode)}
                          </div>
                        </td>
                        
                        {/* Colonne du nombre de paies générées */}
                        <td className="text-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={renderPaieTooltip(nbPaieGenere, dept.departement?.nom)}
                          >
                            <div className="d-flex flex-column align-items-center">
                              <Badge
                                bg={paieColor}
                                className="rounded-pill px-3 py-2 fs-6 fw-bold"
                                style={{ fontSize: '1rem', minWidth: '50px' }}
                              >
                                {nbPaieGenere}
                              </Badge>
                              {nbPaieGenere > 0 && (
                                <small className="text-muted mt-1">
                                  bulletin(s)
                                </small>
                              )}
                            </div>
                          </OverlayTrigger>
                        </td>
                        
                        <td>
                          <Badge
                            bg={statusInfo.variant}
                            className={`px-3 py-2 rounded-pill fw-bold border border-${statusInfo.variant} bg-opacity-10 text-${statusInfo.variant} d-inline-flex align-items-center`}
                          >
                            <span className="me-2" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                            {statusInfo.text}
                          </Badge>
                        </td>
                        
                        <td className="text-end pe-4">
                          <div className="d-inline-flex align-items-center gap-2">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Exporter Excel</Tooltip>}
                            >
                              <Button
                                variant="light"
                                size="md"
                                className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  background: '#f6edf5',
                                  border: '1px solid rgba(176, 83, 173, 0.25)',
                                  color: '#8e3a8b',
                                  padding: 0
                                }}
                                onClick={() => handleExportDepartementExcel(dept)}
                              >
                                <Download size={18} />
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Voir les bulletins</Tooltip>}
                            >
                              <Button
                                variant="primary"
                                size="md"
                                className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  background: 'linear-gradient(135deg, #b053ad 0%, #8e3a8b 100%)',
                                  border: 'none',
                                  color: '#fff',
                                  padding: 0
                                }}
                                onClick={() =>
                                  goToBulletinDetails(
                                    dept.departement?.id,
                                    dept.departement?.nom
                                  )
                                }
                              >
                                <ArrowRight size={18} color="#fff" />
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        <Card.Footer className="bg-light">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <small className="text-muted">
                Affichage de {filteredDepartements.length} département(s)
              </small>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Badge bg="success" className="px-3 py-2">
                <CheckCircle size={12} className="me-1" />
                En cours: {stats.enCours}
              </Badge>
              <Badge bg="warning" className="px-3 py-2">
                <Clock size={12} className="me-1" />
                En attente: {stats.enAttente}
              </Badge>
              <Badge bg="info" className="px-3 py-2">
                <TrendingUp size={12} className="me-1" />
                Total paies: {stats.totalPaiesGenerees}
              </Badge>
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Légende des statuts */}
      <Card className="mt-4 border-0 shadow-sm fade-in">
        <Card.Header className="bg-light">
          <h6 className="mb-0">
            <FileText className="me-2" size={18} />
            Légende des statuts et indicateurs
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="d-flex align-items-center mb-3">
                <Badge bg="success" className="me-3 px-3 py-2">
                  <CheckCircle size={14} className="me-1" />
                  En cours
                </Badge>
                <small className="text-muted">
                  Paie en cours de traitement
                </small>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-3">
                <Badge bg="warning" className="me-3 px-3 py-2">
                  <Clock size={14} className="me-1" />
                  En attente
                </Badge>
                <small className="text-muted">
                  En attente de traitement
                </small>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-3">
                <Badge bg="info" className="me-3 px-3 py-2">
                  <TrendingUp size={14} className="me-1" />
                  Paies générées
                </Badge>
                <small className="text-muted">
                  Nombre de bulletins générés
                </small>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  {/* <ArrowRight size={16} className="text-primary" /> */}
                  <ArrowRight size={16} color="#fff" />
                </div>
                <small className="text-muted">
                  Cliquez pour voir les détails
                </small>
              </div>
            </Col>
          </Row>

          {/* Barre de progression des paies */}
          <Row className="mt-3 pt-3 border-top">
            <Col>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <small className="text-muted fw-bold">Taux de génération par département</small>
                <small className="text-muted">
                  {stats.departementsAvecPaie} / {stats.totalDepartements} départements
                </small>
              </div>
              <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ 
                    width: `${(stats.departementsAvecPaie / stats.totalDepartements) * 100}%`,
                    borderRadius: '10px',
                    background: 'var(--bg-gradient)'
                  }}
                />
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                  {Math.round((stats.departementsAvecPaie / stats.totalDepartements) * 100) || 0}% des départements ont généré des paies
                </small>
                <small className="text-muted">
                  Moyenne: {Math.round(stats.totalPaiesGenerees / stats.totalDepartements) || 0} paies/département
                </small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default BulletinDepartementPage;
