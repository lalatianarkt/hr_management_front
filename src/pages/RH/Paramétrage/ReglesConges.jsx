// src/pages/Parametrage/ReglesCongesCRUD.jsx
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
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'react-feather';
import ParametrageApi from './../../utils/parametrageApi';

const ReglesConges = ({ showNotification }) => {
  const [regles, setRegles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegle, setEditingRegle] = useState(null);
  const [formData, setFormData] = useState({
    ancienneteRequis: 12,
    soldeMensuel: 2.5,
    isWeekEndInclus: true,
    limiteReportAnnuel: 90,
    primeAnciennete: 1000,
    ancienneteRequisPrime: 5,
    allocationFamiliale: 10000,
    weekEndInclus: true,
    statut: 0
  });

  // Charger les données
  const fetchRegles = async () => {
    setLoading(true);
    try {
      const response = await ParametrageApi.reglesConges.getAll();
      setRegles(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des règles', 'danger');
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
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setEditingRegle(null);
    setFormData({
      ancienneteRequis: 12,
      soldeMensuel: 2.5,
      isWeekEndInclus: true,
      limiteReportAnnuel: 90,
      primeAnciennete: 1000,
      ancienneteRequisPrime: 5,
      allocationFamiliale: 10000,
      weekEndInclus: true,
      statut: 0
    });
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (regle) => {
    setEditingRegle(regle);
    setFormData({
      ancienneteRequis: regle.ancienneteRequis,
      soldeMensuel: regle.soldeMensuel,
      isWeekEndInclus: regle.isWeekEndInclus,
      limiteReportAnnuel: regle.limiteReportAnnuel,
      primeAnciennete: regle.primeAnciennete,
      ancienneteRequisPrime: regle.ancienneteRequisPrime,
      allocationFamiliale: regle.allocationFamiliale,
      weekEndInclus: regle.weekEndInclus,
      statut: regle.statut
    });
    setShowModal(true);
  };

  // Sauvegarder (ajout ou modification)
  const handleSave = async () => {
    try {

        // Afficher les données qui vont être envoyées
        console.log('🚀 Données à sauvegarder:', {
        action: editingRegle ? 'MODIFICATION' : 'CRÉATION',
        id: editingRegle?.id,
        données: formData
        });


      if (editingRegle) {
        await ParametrageApi.reglesConges.update(editingRegle.id, formData);
        showNotification('Règle modifiée avec succès', 'success');
      } else {
        await ParametrageApi.reglesConges.create(formData);
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
        await ParametrageApi.reglesConges.delete(id);
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
        <p className="mt-2">Chargement des règles...</p>
      </div>
    );
  }

  return (
    <>
      {/* Barre d'outils */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Liste des règles de congés</h5>
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
            <Plus size={14} color="white" />
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
                <th>Ancienneté requise</th>
                <th>Solde mensuel</th>
                <th>Limite report</th>
                <th>Prime ancienneté</th>
                <th>Allocation familiale</th>
                <th>Week-end inclus</th>
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
                        {regle.ancienneteRequis} mois
                      </div>
                      {regle.ancienneteRequisPrime > 0 && (
                        <small className="text-muted d-block">
                          Prime à {regle.ancienneteRequisPrime} ans
                        </small>
                      )}
                    </td>
                    <td>
                      <Badge bg="info">
                        {regle.soldeMensuel} jours/mois
                      </Badge>
                    </td>
                    <td>{regle.limiteReportAnnuel} jours</td>
                    <td>
                      <DollarSign size={14} className="text-muted me-1" />
                      {regle.primeAnciennete?.toLocaleString()} Ar
                    </td>
                    <td>
                      <DollarSign size={14} className="text-muted me-1" />
                      {regle.allocationFamiliale?.toLocaleString()} Ar
                    </td>
                    <td>
                      {regle.weekEndInclus ? (
                        <Badge bg="success">Inclus</Badge>
                      ) : (
                        <Badge bg="secondary">Exclus</Badge>
                      )}
                    </td>
                    <td>
                      {regle.statut === 0 ? (
                        <Badge bg="success">Actif</Badge>
                      ) : (
                        <Badge bg="secondary">Inactif</Badge>
                      )}
                    </td>

                    <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(regle)}
                        className="me-2"
                        style={{ display: 'inline-flex', alignItems: 'center' }}  
                    >
                        <Edit2 size={14} /> 
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(regle.id)}
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                        <Trash2 size={14} /> 
                    </Button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <p className="text-muted mb-0">Aucune règle trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRegle ? 'Modifier' : 'Ajouter'} une règle de congés
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ancienneté requise (mois) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Clock size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="ancienneteRequis"
                      value={formData.ancienneteRequis}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Solde mensuel (jours) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="soldeMensuel"
                      value={formData.soldeMensuel}
                      onChange={handleChange}
                      step="0.5"
                      min="0"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Limite report annuel (jours) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Calendar size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="limiteReportAnnuel"
                      value={formData.limiteReportAnnuel}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prime d'ancienneté (Ar) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <DollarSign size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="primeAnciennete"
                      value={formData.primeAnciennete}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ancienneté requise pour prime (ans) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Clock size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="ancienneteRequisPrime"
                      value={formData.ancienneteRequisPrime}
                      onChange={handleChange}
                      step="0.5"
                      min="0"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allocation familiale (Ar) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <DollarSign size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="allocationFamiliale"
                      value={formData.allocationFamiliale}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="weekEndInclus"
                    label="Week-end inclus"
                    checked={formData.weekEndInclus}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                  >
                    <option value={0}>Actif</option>
                    <option value={1}>Inactif</option>
                  </Form.Select>
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

export default ReglesConges;