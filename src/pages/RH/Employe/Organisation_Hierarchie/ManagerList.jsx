import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Users, UserPlus, Archive, RefreshCw, Eye, Filter,
  Building, Calendar, Mail, Phone, CheckCircle, XCircle,
  AlertCircle, UserCheck, BarChart3, Search, Download
} from 'lucide-react';
import { Badge, Spinner, Modal, Button, Form } from 'react-bootstrap';

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [actionType, setActionType] = useState('');
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    archived: 0,
    pending: 0,
    suspended: 0
  });

  useEffect(() => {
    fetchManagers();
    extractDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [managers, searchTerm, statusFilter, departmentFilter]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/managers');
      setManagers(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Erreur chargement managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractDepartments = () => {
    const uniqueDepts = [...new Set(managers
      .filter(m => m.departement?.nom)
      .map(m => m.departement.nom)
    )];
    setDepartments(uniqueDepts);
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter(m => m.statut === 0).length,
      archived: data.filter(m => m.statut === 1).length,
      pending: data.filter(m => m.statut === 2).length,
      suspended: data.filter(m => m.statut === 3).length
    });
  };

  const applyFilters = () => {
    let filtered = managers;

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(manager =>
        manager.employe.nom.toLowerCase().includes(term) ||
        manager.employe.prenom.toLowerCase().includes(term) ||
        manager.employe.matricule.toLowerCase().includes(term) ||
        manager.employe.email.toLowerCase().includes(term) ||
        manager.departement?.nom?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(manager => manager.statut === parseInt(statusFilter));
    }

    // Filtre par département
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(manager => 
        manager.departement?.nom === departmentFilter
      );
    }

    setFilteredManagers(filtered);
  };

  const handleActionClick = (manager, type) => {
    setSelectedManager(manager);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedManager) return;

    setActionLoading(selectedManager.id);
    try {
      const url = `http://localhost:8080/api/managers/${selectedManager.id}/${
        actionType === 'archive' ? 'archiver' : 'reactiver'
      }`;
      
      const response = await axios.post(url);
      
      if (response.data.success) {
        fetchManagers();
        showToast(
          actionType === 'archive' ? 'Manager archivé' : 'Manager réactivé',
          'success'
        );
      }
    } catch (error) {
      console.error('Erreur action:', error);
      showToast('Erreur lors de l\'opération', 'error');
    } finally {
      setActionLoading(null);
      setShowConfirmModal(false);
    }
  };

  const showToast = (message, type) => {
    // Implémentez votre système de toast ici
    alert(message);
  };

  const getStatusConfig = (status) => {
    const configs = {
      0: { label: 'Actif', color: 'success', icon: <CheckCircle size={14} /> },
      1: { label: 'Archivé', color: 'secondary', icon: <Archive size={14} /> },
      2: { label: 'En nomination', color: 'warning', icon: <AlertCircle size={14} /> },
      3: { label: 'Suspendu', color: 'danger', icon: <XCircle size={14} /> }
    };
    return configs[status] || { label: 'Inconnu', color: 'dark', icon: null };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleExport = () => {
    const csvContent = [
      ['Matricule', 'Nom', 'Prénom', 'Email', 'Département', 'Date Début', 'Date Fin', 'Statut'],
      ...filteredManagers.map(m => [
        m.employe.matricule,
        m.employe.nom,
        m.employe.prenom,
        m.employe.email,
        m.departement?.nom || 'Non assigné',
        formatDate(m.dateDebut),
        formatDate(m.dateFin),
        getStatusConfig(m.statut).label
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `managers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Gestion des Managers</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="container-fluid">
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Chargement des managers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">
                <Users className="me-2" size={24} />
                Gestion des Managers
              </h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><Link to="/dashboard-RH">Accueil</Link></li>
                <li className="breadcrumb-item"><Link to="/dashboard-RH/organisation">Organisation</Link></li>
                <li className="breadcrumb-item active">Managers</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container-fluid">
          {/* Cartes de statistiques */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{stats.total}</h3>
                  <p>Total Managers</p>
                </div>
                <div className="icon">
                  <Users size={40} />
                </div>
                <Link to="#" className="small-box-footer">
                  Plus d'info <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{stats.active}</h3>
                  <p>Managers Actifs</p>
                </div>
                <div className="icon">
                  <UserCheck size={40} />
                </div>
                <Link to="#" className="small-box-footer">
                  Plus d'info <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{stats.archived}</h3>
                  <p>Managers Archivés</p>
                </div>
                <div className="icon">
                  <Archive size={40} />
                </div>
                <Link to="/dashboard-RH/organisation/managers/archives" className="small-box-footer">
                  Voir archives <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-secondary">
                <div className="inner">
                  <h3>{stats.pending}</h3>
                  <p>En nomination</p>
                </div>
                <div className="icon">
                  <AlertCircle size={40} />
                </div>
                <Link to="#" className="small-box-footer">
                  Plus d'info <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Barre d'actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Liste des Managers</h3>
              <div className="card-tools">
                <Link to="/dashboard-RH/organisation/addManager" className="btn btn-success btn-sm">
                  <UserPlus size={16} className="me-1" />
                  Nouveau Manager
                </Link>
              </div>
            </div>
            <div className="card-body">
              {/* Barre de recherche et filtres */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <Search size={16} />
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un manager..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="0">Actif</option>
                    <option value="1">Archivé</option>
                    <option value="2">En nomination</option>
                    <option value="3">Suspendu</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-control"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="all">Tous les départements</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <Button variant="outline-primary" onClick={handleExport} className="w-100">
                    <Download size={16} className="me-1" />
                    Exporter
                  </Button>
                </div>
              </div>

              {/* Table des managers */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom & Prénom</th>
                      <th>Matricule</th>
                      <th>Département</th>
                      <th>Période</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManagers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="text-muted">
                            <Filter size={48} className="mb-2" />
                            <p>Aucun manager trouvé</p>
                            {searchTerm && (
                              <Button 
                                variant="link" 
                                onClick={() => setSearchTerm('')}
                              >
                                Effacer la recherche
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredManagers.map(manager => {
                        const statusConfig = getStatusConfig(manager.statut);
                        return (
                          <tr key={manager.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-3">
                                  <Users size={16} />
                                </div>
                                <div>
                                  <div className="font-weight-bold">
                                    {manager.employe.prenom} {manager.employe.nom}
                                  </div>
                                  <small className="text-muted">
                                    <Mail size={12} className="me-1" />
                                    {manager.employe.email}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {manager.employe.matricule}
                              </span>
                            </td>
                            <td>
                              {manager.departement ? (
                                <span className="badge bg-info">
                                  <Building size={12} className="me-1" />
                                  {manager.departement.nom}
                                </span>
                              ) : (
                                <span className="badge bg-warning">Non assigné</span>
                              )}
                            </td>
                            <td>
                              <div>
                                <small className="text-muted d-block">
                                  <Calendar size={12} className="me-1" />
                                  Début: {formatDate(manager.dateDebut)}
                                </small>
                                {manager.dateFin && (
                                  <small className="text-muted">
                                    Fin: {formatDate(manager.dateFin)}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <Badge bg={statusConfig.color} className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                                {statusConfig.icon}
                                <span className="ms-1">{statusConfig.label}</span>
                              </Badge>
                            </td>
                            <td>
                              <div className="btn-group">
                                <Link
                                  to={`/dashboard-RH/organisation/managerDetails/${manager.id}`}
                                  className="btn btn-sm btn-info"
                                  title="Voir détails"
                                >
                                  <Eye size={16} />
                                </Link>
                                {manager.statut === 0 && (
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleActionClick(manager, 'archive')}
                                    disabled={actionLoading === manager.id}
                                    title="Archiver"
                                  >
                                    {actionLoading === manager.id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <Archive size={16} />
                                    )}
                                  </button>
                                )}
                                {manager.statut === 1 && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleActionClick(manager, 'activate')}
                                    disabled={actionLoading === manager.id}
                                    title="Réactiver"
                                  >
                                    {actionLoading === manager.id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <RefreshCw size={16} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Affichage {filteredManagers.length} sur {managers.length} managers
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item disabled">
                      <span className="page-link">Précédent</span>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">1</span>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">2</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">Suivant</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'archive' ? 'Archiver le manager' : 'Réactiver le manager'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir {actionType === 'archive' ? 'archiver' : 'réactiver'} le manager{' '}
          <strong>{selectedManager?.employe?.prenom} {selectedManager?.employe?.nom}</strong> ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button 
            variant={actionType === 'archive' ? 'warning' : 'success'} 
            onClick={confirmAction}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : actionType === 'archive' ? (
              'Confirmer l\'archivage'
            ) : (
              'Confirmer la réactivation'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagerList;
