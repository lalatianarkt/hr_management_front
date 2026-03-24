import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Building, Mail, Phone, Briefcase,
  Clock, Edit, ArrowLeft, CheckCircle, XCircle,
  AlertCircle, Archive, RefreshCw, UserCheck, 
  Award, MapPin, Shield, Download
} from 'lucide-react';
import { Badge, Spinner, Alert, ProgressBar, Card, Button } from 'react-bootstrap';

const ManagerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editData, setEditData] = useState({ dateDebut: '', dateFin: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchManager();
  }, [id]);

  const fetchManager = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/managers/${id}`);
      const managerData = response.data;
      setManager(managerData);
      
      setEditData({
        dateDebut: managerData.dateDebut || '',
        dateFin: managerData.dateFin || ''
      });

    } catch (error) {
      console.error('Erreur chargement manager:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors du chargement du manager' 
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setShowEditModal(true);
    setMessage({ type: '', text: '' });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditLoading(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!editData.dateDebut) {
        setMessage({ type: 'error', text: 'La date de début est obligatoire' });
        setEditLoading(false);
        return;
      }

      if (editData.dateFin && editData.dateFin < editData.dateDebut) {
        setMessage({ type: 'error', text: 'La date de fin ne peut pas être antérieure à la date de début' });
        setEditLoading(false);
        return;
      }

      const payload = {
        dateDebut: editData.dateDebut,
        dateFin: editData.dateFin || null,
        employe: { id: manager.employe.id },
        departement: manager.departement ? { id: manager.departement.id } : null,
        statut: manager.statut
      };

      const response = await axios.put(`http://localhost:8080/api/managers/update/${id}`, payload);

      if (response.data) {
        setMessage({ type: 'success', text: 'Dates modifiées avec succès !' });
        
        setManager(prev => ({
          ...prev,
          dateDebut: editData.dateDebut,
          dateFin: editData.dateFin,
          modifiedAt: new Date().toISOString()
        }));
        
        setTimeout(() => {
          closeEditModal();
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur modification manager:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Erreur: ${errorMessage}` });
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      0: { label: 'Actif', color: 'success', icon: <CheckCircle size={16} />, variant: 'success' },
      1: { label: 'Archivé', color: 'secondary', icon: <Archive size={16} />, variant: 'secondary' },
      2: { label: 'En nomination', color: 'warning', icon: <AlertCircle size={16} />, variant: 'warning' },
      3: { label: 'Suspendu', color: 'danger', icon: <XCircle size={16} />, variant: 'danger' }
    };
    return configs[status] || { label: 'Inconnu', color: 'dark', icon: null, variant: 'dark' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Jamais modifié';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateManagementDuration = () => {
    if (!manager?.dateDebut) return 0;
    const start = new Date(manager.dateDebut);
    const end = manager.dateFin ? new Date(manager.dateFin) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleActionClick = (type) => {
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    setActionLoading(true);
    try {
      const url = `http://localhost:8080/api/managers/${id}/${
        actionType === 'archive' ? 'archiver' : 'reactiver'
      }`;
      
      const response = await axios.post(url);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: `Manager ${actionType === 'archive' ? 'archivé' : 'réactivé'} avec succès` });
        fetchManager();
        setShowActionModal(false);
      }
    } catch (error) {
      console.error('Erreur action:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'opération' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Détails du Manager</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container-fluid">
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Chargement des détails...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Manager non trouvé</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container-fluid">
            <Alert variant="danger">
              Le manager demandé n'existe pas ou a été supprimé.
            </Alert>
            <Button variant="primary" onClick={() => navigate('/dashboard-RH/organisation/listManager')}>
              <ArrowLeft size={16} className="me-2" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(manager.statut);
  const duration = calculateManagementDuration();

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">
                <Users className="me-2" size={24} />
                Détails du Manager
              </h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/dashboard-RH">Accueil</Link></li>
                <li className="breadcrumb-item"><Link to="/dashboard-RH/organisation">Organisation</Link></li>
                <li className="breadcrumb-item"><Link to="/dashboard-RH/organisation/listManager">Managers</Link></li>
                <li className="breadcrumb-item active">Détails</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container-fluid">
          {/* Messages d'alerte */}
          {message.text && (
            <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="mb-3">
              {message.text}
            </Alert>
          )}

          {/* En-tête avec actions */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Button variant="outline-secondary" onClick={() => navigate('/dashboard-RH/organisation/listManager')}>
                    <ArrowLeft size={16} className="me-1" />
                    Retour
                  </Button>
                  <div className="ms-4">
                    <h3 className="mb-0">
                      {manager.employe.prenom} {manager.employe.nom}
                    </h3>
                    <small className="text-muted">
                      Manager ID: {manager.id}
                    </small>
                  </div>
                </div>
                <div className="btn-group">
                  <Button variant="warning" onClick={openEditModal}>
                    <Edit size={16} className="me-2" />
                    Modifier les dates
                  </Button>
                  
                  {manager.statut === 0 && (
                    <Button variant="secondary" onClick={() => handleActionClick('archive')}>
                      <Archive size={16} className="me-2" />
                      Archiver
                    </Button>
                  )}
                  
                  {manager.statut === 1 && (
                    <Button variant="success" onClick={() => handleActionClick('activate')}>
                      <RefreshCw size={16} className="me-2" />
                      Réactiver
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Carte principale - Manager */}
            <div className="col-md-4">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title">Information Manager</h3>
                  <div className="card-tools">
                    <Badge bg={statusConfig.variant} className="px-3 py-2">
                      {statusConfig.icon}
                      <span className="ms-1">{statusConfig.label}</span>
                    </Badge>
                  </div>
                </div>
                <div className="card-body">
                  <div className="text-center mb-4">
                    <div className="avatar-lg bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                      <Users size={48} className="text-white" />
                    </div>
                    <h4>{manager.employe.prenom} {manager.employe.nom}</h4>
                    <p className="text-muted mb-0">Manager Principal</p>
                  </div>
                  
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <Calendar size={16} className="me-2 text-primary" />
                        Date début
                      </span>
                      <strong>{formatDate(manager.dateDebut)}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <Clock size={16} className="me-2 text-primary" />
                        Date fin
                      </span>
                      <strong>{manager.dateFin ? formatDate(manager.dateFin) : 'En cours'}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <Shield size={16} className="me-2 text-primary" />
                        Durée
                      </span>
                      <strong>{duration} jours</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte département */}
              <div className="card card-info card-outline mt-3">
                <div className="card-header">
                  <h3 className="card-title">Département</h3>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm bg-info rounded-circle d-flex align-items-center justify-content-center me-3">
                      <Building size={20} className="text-white" />
                    </div>
                    <div>
                      <h5 className="mb-0">{manager.departement?.nom || 'Non assigné'}</h5>
                      {manager.departement?.id && (
                        <small className="text-muted">ID: {manager.departement.id}</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte employé */}
            <div className="col-md-4">
              <div className="card card-success card-outline">
                <div className="card-header">
                  <h3 className="card-title">Information Employé</h3>
                  <div className="card-tools">
                    <Badge bg="light" text="dark">
                      {manager.employe.matricule}
                    </Badge>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <div className="info-box mb-3">
                        <span className="info-box-icon bg-success">
                          <UserCheck size={24} />
                        </span>
                        <div className="info-box-content">
                          <span className="info-box-text">Nom complet</span>
                          <span className="info-box-number">
                            {manager.employe.nom} {manager.employe.prenom}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group list-group-flush">
                    <div className="list-group-item">
                      <div className="d-flex align-items-center mb-2">
                        <Mail size={16} className="me-3 text-muted" />
                        <div>
                          <small className="text-muted">Email</small>
                          <p className="mb-0">{manager.employe.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="list-group-item">
                      <div className="d-flex align-items-center mb-2">
                        <Phone size={16} className="me-3 text-muted" />
                        <div>
                          <small className="text-muted">Téléphone</small>
                          <p className="mb-0">{manager.employe.telephone || 'Non renseigné'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="list-group-item">
                      <div className="d-flex align-items-center">
                        <Award size={16} className="me-3 text-muted" />
                        <div>
                          <small className="text-muted">Statut</small>
                          <p className="mb-0">Employé Manager</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte métadonnées */}
            <div className="col-md-4">
              <div className="card card-secondary card-outline">
                <div className="card-header">
                  <h3 className="card-title">Métadonnées</h3>
                </div>
                <div className="card-body">
                  <div className="info-box bg-light">
                    <span className="info-box-icon">
                      <Clock size={24} className="text-secondary" />
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Management en cours</span>
                      <span className="info-box-number">{duration} jours</span>
                      <div className="progress">
                        <ProgressBar 
                          now={Math.min(duration, 100)} 
                          max={100}
                          variant="secondary"
                          style={{ height: '6px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="list-group list-group-flush mt-3">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-muted">Créé le</span>
                      <strong>{formatDateTime(manager.createdAt)}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-muted">Dernière modification</span>
                      <strong>{formatDateTime(manager.modifiedAt)}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-muted">ID Manager</span>
                      <code>{manager.id}</code>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <Button variant="outline-secondary" size="sm" className="w-100">
                    <Download size={16} className="me-2" />
                    Télécharger la fiche
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section équipe */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Équipe sous sa responsabilité</h3>
                  <div className="card-tools">
                    <Badge bg="info" className="px-3">
                      {manager.managedEmployees?.length || 0} employés
                    </Badge>
                  </div>
                </div>
                <div className="card-body">
                  <div className="text-center py-4">
                    <Briefcase size={48} className="text-muted mb-3" />
                    <h5>Gestion d'équipe</h5>
                    <p className="text-muted mb-0">
                      Cette fonctionnalité affichera les employés sous la responsabilité de ce manager.
                    </p>
                    <Button variant="outline-primary" size="sm" className="mt-3">
                      Voir l'équipe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title text-white">
                  <Edit size={20} className="me-2" />
                  Modifier les dates de management
                </h5>
                <button 
                  type="button" 
                  className="close text-white" 
                  onClick={closeEditModal}
                  disabled={editLoading}
                >
                  <span>&times;</span>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {message.text && (
                    <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                      {message.text}
                    </Alert>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <Calendar size={16} className="me-2 text-warning" />
                          Date de début *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editData.dateDebut}
                          onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                          required
                        />
                        <small className="form-text text-muted">
                          Date de prise de fonction du manager
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          <Clock size={16} className="me-2 text-warning" />
                          Date de fin
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editData.dateFin || ''}
                          onChange={(e) => handleInputChange('dateFin', e.target.value)}
                        />
                        <small className="form-text text-muted">
                          Laisser vide si le management est toujours en cours
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-3">
                    <div className="d-flex">
                      <AlertCircle size={20} className="me-2 flex-shrink-0" />
                      <div>
                        <strong>Note:</strong> La modification des dates ne change pas le statut du manager.
                        Seules ces informations seront mises à jour.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <Button 
                    variant="secondary" 
                    onClick={closeEditModal}
                    disabled={editLoading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="warning" 
                    type="submit"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="me-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDetails;
