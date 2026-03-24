// src/pages/EmployeeDocuments.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../../../utils/AxiosInstance";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Breadcrumb, ButtonGroup } from 'react-bootstrap';
import { ArrowLeft, Download, FileText, Folder, Filter, X, Plus, Trash2 } from 'react-feather'; // Remplacé Printer par Trash2

import AddDocumentModal from './AddDocumentModal';

function EmployeeDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Récupérer les documents depuis l'API
  const fetchEmployeeDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/documents/employe/${id}`);
      const documentsData = response.data;

      if (documentsData.length > 0) {
        const firstDocument = documentsData[0];
        setEmployee({
          id: firstDocument.employe.id,
          nom: firstDocument.employe.nom,
          prenom: firstDocument.employe.prenom,
          matricule: firstDocument.employe.infosProfessionnelles?.matricule || 'N/A'
        }); 
      } else {
        try {
          const empResponse = await axiosInstance.get(`/api/employes/${id}`);
          const empData = empResponse.data;
          setEmployee({
            id: empData.id,
            nom: empData.nom,
            prenom: empData.prenom,
            matricule: empData.infosProfessionnelles?.matricule || 'N/A'
          });
        } catch (empError) {
          console.error('Erreur lors de la récupération des infos employé:', empError);
        }
      }

      setDocuments(documentsData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des documents:', err);
      setError('Erreur lors du chargement des documents');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDocuments();
  }, [id]);

  // Télécharger un document
  const handleDownload = async (document) => {
    try {
      const response = await axiosInstance.get(`/api/documents/download/${document.id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.nomFichier);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handleDelete = async (documentId) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
    try {
      const documentToDelete = documents.find(doc => doc.id === documentId);
      
      if (!documentToDelete) {
        alert('Document non trouvé');
        return;
      }
      
      const data = {
        ...documentToDelete,
        statut: 1
      };
      
      await axiosInstance.put(`/api/documents/${documentId}`, data);
      fetchEmployeeDocuments();
      alert('Document supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression du document');
    }
  }
};

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Filtrer les documents par catégorie
  const getFilteredDocuments = () => {
    if (selectedCategory === 'all') {
      return documents;
    }
    
    return documents.filter(doc => {
      const typeIntitule = doc.typeDocument?.intitule?.toLowerCase() || '';
      
      switch (selectedCategory) {
        case 'cv':
          return typeIntitule.includes('cv');
        case 'contrat':
          return typeIntitule.includes('contrat');
        case 'diplome':
          return typeIntitule.includes('diplôme') || typeIntitule.includes('diplome');
        case 'attestation':
          return typeIntitule.includes('attestation');
        default:
          return true;
      }
    });
  };

  const filteredDocuments = getFilteredDocuments();

  // Fonction pour obtenir la couleur du badge selon le type de document
  const getBadgeColor = (typeIntitule) => {
    if (!typeIntitule) return 'secondary';
    
    const type = typeIntitule.toLowerCase();
    if (type.includes('cv')) return 'primary';
    if (type.includes('contrat')) return 'warning';
    if (type.includes('diplôme') || type.includes('diplome')) return 'success';
    if (type.includes('attestation')) return 'info';
    return 'secondary';
  };

  // Fonction appelée après l'ajout réussi d'un document
  const handleAddSuccess = () => {
    fetchEmployeeDocuments();
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-3">Chargement des documents...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!employee) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <i className="bi bi-person-x me-2"></i>
          Employé non trouvé
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Navigation avec breadcrumb */}
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/dashboard-RH/employees')} style={{ cursor: 'pointer' }}>
              Employés
            </Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate(`/dashboard-RH/employees/${id}/personnel`)} style={{ cursor: 'pointer' }}>
              {employee.prenom} {employee.nom}
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Documents</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* En-tête avec bouton d'ajout */}
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/dashboard-RH/employees')}
              className="me-3"
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="h3 mb-1">Documents</h1>
              <p className="text-muted mb-0">
                {employee.prenom} {employee.nom} • Matricule: {employee.matricule}
              </p>
            </div>
          </div>
        </Col>
        <Col md={4} className="text-md-end">
          <div className="d-flex justify-content-end align-items-center gap-2">
            <small className="text-muted">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </small>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center gap-1"
            >
              <Plus size={14} />
              Ajouter
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filtres */}
      <Row className="mb-4">
        <Col>
          <Card className="border">
            <Card.Body className="py-2">
              <div className="d-flex align-items-center">
                <Filter size={16} className="me-2 text-muted" />
                <span className="me-3 small fw-medium">Filtrer par :</span>
                <ButtonGroup size="sm">
                  <Button 
                    variant={selectedCategory === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedCategory('all')}
                  >
                    Tous
                  </Button>
                  <Button 
                    variant={selectedCategory === 'cv' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedCategory('cv')}
                  >
                    CV
                  </Button>
                  <Button 
                    variant={selectedCategory === 'contrat' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedCategory('contrat')}
                  >
                    Contrats
                  </Button>
                  <Button 
                    variant={selectedCategory === 'diplome' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedCategory('diplome')}
                  >
                    Diplômes
                  </Button>
                  <Button 
                    variant={selectedCategory === 'attestation' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedCategory('attestation')}
                  >
                    Attestations
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des documents */}
      <Row>
        <Col>
          <Card className="border">
            <Card.Body className="p-0">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <Folder size={48} className="text-muted" />
                    <X size={24} className="text-danger position-absolute" style={{ marginLeft: '-40px' }} />
                  </div>
                  <h5 className="text-muted">Aucun document trouvé</h5>
                  <p className="text-muted small">
                    {selectedCategory !== 'all' 
                      ? `Aucun document de type "${selectedCategory}"` 
                      : "Cet employé n'a pas encore de documents"}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3 ps-4">Document</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Taille</th>
                        <th className="py-3 pe-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((document) => (
                        <tr key={document.id}>
                          <td className="py-3 ps-4">
                            <div className="d-flex align-items-center">
                              <FileText size={18} className="text-primary me-3" />
                              <div>
                                <div className="fw-medium">{document.nomFichier}</div>
                                {document.description && (
                                  <small className="text-muted">{document.description}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge bg={getBadgeColor(document.typeDocument?.intitule)}>
                              {document.typeDocument?.intitule || 'Non classé'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div>
                              <small className="d-block">
                                {new Date(document.dateUpload).toLocaleDateString('fr-FR')}
                              </small>
                              <small className="text-muted">
                                {new Date(document.dateUpload).toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </small>
                            </div>
                          </td>
                          <td className="py-3">
                            <small>{formatFileSize(document.fileSize)}</small>
                          </td>
                          <td className="py-3 pe-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleDownload(document)}
                                title="Télécharger"
                              >
                                <Download size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(document.id)}
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </Button>
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
        </Col>
      </Row>

      {/* Pied de page avec informations */}
      <Row className="mt-4">
        <Col>
          <Card className="border bg-light">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <Folder size={14} className="me-1" />
                  Espace de stockage des documents
                </small>
                <small className="text-muted">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal d'ajout de document */}
      <AddDocumentModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        employeeId={id}
        onSuccess={handleAddSuccess}
      />
    </Container>
  );
}

export default EmployeeDocuments;