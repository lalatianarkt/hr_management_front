// src/pages/Parametrage/ReglesAnnulationCRUD.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Badge,
  Card,
  InputGroup
} from 'react-bootstrap';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Users
} from 'react-feather';
import ParametrageApi from './../../utils/parametrageApi';

const ReglesAnnulation = ({ showNotification }) => {
  const [regles, setRegles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegle, setEditingRegle] = useState(null);
  const [formData, setFormData] = useState({
    delaiMinJours: 2,
    dureeMaxJours: 30,
    besoinValidationManager: false,
    besoinValidationRH: false,
    actif: true
  });

  // Charger les données
  const fetchRegles = async () => {
    setLoading(true);
    try {
      const response = await ParametrageApi.reglesAnnulation.getAll();
      setRegles(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des règles d\'annulation', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegles();
  }, []);

  // Gérer les changements du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setEditingRegle(null);
    setFormData({
      delaiMinJours: 2,
      dureeMaxJours: 30,
      besoinValidationManager: false,
      besoinValidationRH: false,
      actif: true
    });
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (regle) => {
    setEditingRegle(regle);
    setFormData({
      delaiMinJours: regle.delaiMinJours,
      dureeMaxJours: regle.dureeMaxJours,
      besoinValidationManager: regle.besoinValidationManager,
      besoinValidationRH: regle.besoinValidationRH,
      actif: regle.actif
    });
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    try {
      if (editingRegle) {
        await ParametrageApi.reglesAnnulation.update(editingRegle.id, formData);
        showNotification('Règle modifiée avec succès', 'success');
      } else {
        await ParametrageApi.reglesAnnulation.create(formData);
        showNotification('Règle ajoutée avec succès', 'success');
      }
      fetchRegles();
      setShowModal(false);
    } catch (error) {
      showNotification('Erreur lors de la sauvegarde', 'danger');
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) {
      try {
        await ParametrageApi.reglesAnnulation.delete(id);
        showNotification('Règle supprimée avec succès', 'success');
        fetchRegles();
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'danger');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des règles d'annulation...</p>
      </div>
    );
  }

  return (
    <>
      {/* Barre d'outils */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Règles d'annulation des congés</h5>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={fetchRegles}
            className="d-flex align-items-center gap-1"
          >
            <RefreshCw size={14} />
            Actualiser
          </Button>


           <Button
                variant="primary"
                size="sm"
                onClick={handleAdd}
                className="d-flex align-items-center gap-1 btn-unified"
                >
                <Plus size={14} color="white"/>
                <span className="d-none d-sm-inline">Nouvelle règle</span>
            </Button>





        </div>
      </div>

      {/* Tableau */}
      <Card className="border">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Délai minimum</th>
                <th>Durée maximum</th>
                <th>Validation Manager</th>
                <th>Validation RH</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regles.length > 0 ? (
                regles.map(regle => (
                  <tr key={regle.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={14} className="text-muted" />
                        {regle.delaiMinJours} jour(s)
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={14} className="text-muted" />
                        {regle.dureeMaxJours} jour(s)
                      </div>
                    </td>
                    <td>
                      {regle.besoinValidationManager ? (
                        <Badge bg="warning" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <User size={12} />
                          Requis
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <XCircle size={12} />
                          Non requis
                        </Badge>
                      )}
                    </td>
                    <td>
                      {regle.besoinValidationRH ? (
                        <Badge bg="danger" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <Users size={12} />
                          Requis
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <XCircle size={12} />
                          Non requis
                        </Badge>
                      )}
                    </td>
                    <td>
                      {regle.actif ? (
                        <Badge bg="success">Actif</Badge>
                      ) : (
                        <Badge bg="secondary">Inactif</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(regle)}
                        className="me-2"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(regle.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <p className="text-muted mb-0">Aucune règle trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>
            {editingRegle ? 'Modifier' : 'Ajouter'} une règle d'annulation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Délai minimum (jours) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Clock size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="delaiMinJours"
                      value={formData.delaiMinJours}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Nombre de jours minimum avant la date de début pour annuler
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée maximum (jours) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="dureeMaxJours"
                      value={formData.dureeMaxJours}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Durée maximum d'un congé pouvant être annulé
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="besoinValidationManager"
                    label="Validation manager requise"
                    checked={formData.besoinValidationManager}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="besoinValidationRH"
                    label="Validation RH requise"
                    checked={formData.besoinValidationRH}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="actif"
                    label="Règle active"
                    checked={formData.actif}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingRegle ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReglesAnnulation;
