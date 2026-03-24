import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  User, Briefcase, Building, Calendar, Mail, Phone,
  Award, Clock, MapPin, Shield, Download, Edit, ArrowLeft,
  CheckCircle, XCircle, AlertCircle, FileText, Users,
  TrendingUp, DollarSign, FileCheck
} from 'lucide-react';
import { 
  Container, Row, Col, Card, Badge, Button, 
  Spinner, Alert, ProgressBar
} from 'react-bootstrap';
import axiosInstance from './../../utils/AxiosInstance';

const EmployeeInfosPro = () => {
  const navigate = useNavigate();  
  const [infosPro, setInfosPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
      return;
    }
    
    fetchInfosPro();
  }, [navigate]);

  const fetchInfosPro = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si un ID est fourni dans l'URL, on l'utilise, sinon le backend utilise le token
      const url = `/api/infosPro/infosEmp`;
      const response = await axiosInstance.get(url);
      console.log("Données reçues:", response.data);
      
      if (response.data && response.data.data) {
        setInfosPro(response.data.data);
      } else if (response.data) {
        setInfosPro(response.data);
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (err) {
      console.error('Erreur chargement infos pro:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.clear();
        navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    if (status === undefined || status === null) return { label: 'Inconnu', color: 'dark', icon: null };
    
    const configs = {
      0: { label: 'Actif', color: 'success', icon: <CheckCircle size={16} /> },
      1: { label: 'Inactif', color: 'secondary', icon: <XCircle size={16} /> },
      2: { label: 'En attente', color: 'warning', icon: <AlertCircle size={16} /> }
    };
    return configs[status] || { label: 'Inconnu', color: 'dark', icon: null };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (err) {
      return 'Format invalide';
    }
  };

  const getYearFromDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.getFullYear().toString();
    } catch (err) {
      return 'N/A';
    }
  };

  const getFirstWord = (text) => {
    if (!text || typeof text !== 'string') return 'N/A';
    const words = text.trim().split(' ');
    return words[0] || 'N/A';
  };

  const calculateSeniority = () => {
    if (!infosPro?.dateEmbauche) return 0;
    try {
      const start = new Date(infosPro.dateEmbauche);
      const now = new Date();
      if (isNaN(start.getTime())) return 0;
      const diffTime = Math.abs(now - start);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    } catch (err) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Informations Professionnelles</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container-fluid">
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Chargement des informations professionnelles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Erreur</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container-fluid">
            <Alert variant="danger">
              <h4 className="alert-heading">Erreur de chargement</h4>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-between">
                <Button variant="outline-danger" onClick={fetchInfosPro}>
                  Réessayer
                </Button>
                <Button variant="primary" as={Link} to="/dashboard-RH/employees">
                  Retour à la liste
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!infosPro) {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Non trouvé</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container-fluid">
            <Alert variant="warning">
              <h4 className="alert-heading">Aucune information professionnelle</h4>
              <p>Aucune information professionnelle trouvée pour cet employé.</p>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(infosPro.statut);
  const seniority = calculateSeniority();
  const embaucheYear = getYearFromDate(infosPro.dateEmbauche);
  const posteFirstWord = getFirstWord(infosPro.poste?.nom);

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">
                <Briefcase className="me-2" size={24} />
                Informations Professionnelles
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container-fluid">
          {/* En-tête avec actions */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    as={Link} 
                    to="/dashboard-RH/employees"
                  >
                    <ArrowLeft size={16} className="me-1" />
                    Retour
                  </Button>
                  <div className="ms-4">
                    <h3 className="mb-0">
                      {infosPro.employe?.prenom || 'Prénom'} {infosPro.employe?.nom || 'Nom'}
                    </h3>
                    <div className="d-flex align-items-center">
                      <Badge bg="light" text="dark" className="me-2">
                        {infosPro.matricule || infosPro.employe?.matricule || 'Matricule'}
                      </Badge>
                      <Badge bg={statusConfig.color}>
                        {statusConfig.icon}
                        <span className="ms-1">{statusConfig.label}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cartes de synthèse */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{seniority}</h3>
                  <p>Années d'ancienneté</p>
                </div>
                <div className="icon">
                  <Clock size={40} />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{embaucheYear}</h3>
                  <p>Année d'embauche</p>
                </div>
                <div className="icon">
                  <Calendar size={40} />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{infosPro.typeContrat?.intitule || 'Contrat'}</h3>
                  <p>Type de contrat</p>
                </div>
                <div className="icon">
                  <FileCheck size={40} />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-primary">
                <div className="inner">
                  <h3>{posteFirstWord}</h3>
                  <p>Poste principal</p>
                </div>
                <div className="icon">
                  <Briefcase size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* Détails complets */}
          <div className="row">
            <div className="col-md-6">
              <Card className="mb-3">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <Briefcase className="me-2" />
                    Poste & Contrat
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <Briefcase size={16} className="me-2 text-primary" />
                        Poste
                      </span>
                      <strong>{infosPro.poste?.nom || 'N/A'}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <Building size={16} className="me-2 text-primary" />
                        Département
                      </span>
                      <Badge bg="info">
                        {infosPro.poste?.departement?.nom || 'N/A'}
                      </Badge>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <FileCheck size={16} className="me-2 text-primary" />
                        Type de contrat
                      </span>
                      <strong>{infosPro.typeContrat?.intitule || 'N/A'}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <Calendar size={16} className="me-2 text-primary" />
                        Date d'embauche
                      </span>
                      <strong>{formatDate(infosPro.dateEmbauche)}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <Users className="me-2" />
                    Management
                  </h5>
                </Card.Header>
                <Card.Body>
                  {infosPro.manager ? (
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm bg-info rounded-circle d-flex align-items-center justify-content-center me-3">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <h6 className="mb-0">{infosPro.manager.nom || ''} {infosPro.manager.prenom || ''}</h6>
                        <small className="text-muted">Manager assigné</small>
                      </div>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="ms-auto"
                        as={Link}
                        to={`/dashboard-RH/organisation/managerDetails/${infosPro.manager.id || ''}`}
                      >
                        Voir profil
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <User size={40} className="mb-2" />
                      <p>Aucun manager assigné</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            <div className="col-md-6">
              <Card className="mb-3">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">
                    <Calendar className="me-2" />
                    Période du Contrat
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Date de début</span>
                      <strong>{formatDate(infosPro.dateDebutAssignationPoste || infosPro.dateDebut)}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Date de fin</span>
                      <strong>{infosPro.dateFin ? formatDate(infosPro.dateFin) : 'Indéterminée'}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0">
                    <Shield className="me-2" />
                    Statut & Métadonnées
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Statut professionnel</span>
                        <Badge bg={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ms-1">{statusConfig.label}</span>
                        </Badge>
                      </div>
                      <ProgressBar 
                        now={infosPro.statut === 0 ? 100 : 50} 
                        variant={infosPro.statut === 0 ? 'success' : 'warning'}
                        className="mt-2"
                      />
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-muted">Créé le</span>
                      <strong>{formatDate(infosPro.createdAt)}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-muted">Dernière modification</span>
                      <strong>{infosPro.modifiedAt ? formatDate(infosPro.modifiedAt) : 'Jamais'}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-muted">ID Infos Pro</span>
                      <code>{infosPro.id || 'N/A'}</code>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfosPro;