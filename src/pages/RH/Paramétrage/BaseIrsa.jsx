// src/pages/Parametrage/BaseIrsaCRUD.jsx
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
  InputGroup,
  Alert
} from 'react-bootstrap';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  DollarSign,
  Hash,
  Percent,
  ChevronsUp,
} from 'react-feather';
import ParametrageApi from './../../utils/parametrageApi';

const BaseIrsa = ({ showNotification }) => {
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [editingTranche, setEditingTranche] = useState(null);
  const [calculData, setCalculData] = useState({ revenu: '', resultat: null });
  const [formData, setFormData] = useState({
    trancheMin: '',
    trancheMax: '',
    taux: '',
    numTranche: ''
  });

  // Charger les données
  const fetchTranches = async () => {
    setLoading(true);
    try {
      const response = await ParametrageApi.baseIrsa.getAll();
      setTranches(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement du barème IRSA', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranches();
  }, []);

  // Initialiser avec le barème par défaut
  const handleInitialize = async () => {
    if (window.confirm('Voulez-vous initialiser le barème IRSA par défaut ? Cette action supprimera toutes les tranches existantes.')) {
      try {
        await ParametrageApi.baseIrsa.initialize();
        showNotification('Barème IRSA initialisé avec succès', 'success');
        fetchTranches();
      } catch (error) {
        showNotification('Erreur lors de l\'initialisation', 'danger');
      }
    }
  };

  // Réordonner les tranches
  const handleReorder = async () => {
    try {
      await ParametrageApi.baseIrsa.reorder();
      showNotification('Tranches réordonnées avec succès', 'success');
      fetchTranches();
    } catch (error) {
      showNotification('Erreur lors du réordonnancement', 'danger');
    }
  };

  // Valider les tranches
  const handleValidate = async () => {
    try {
      const response = await ParametrageApi.baseIrsa.validate();
      showNotification(response.data, 'success');
    } catch (error) {
      showNotification(error.response?.data || 'Erreur de validation', 'danger');
    }
  };

  // Calculer IRSA
  const handleCalculate = async () => {
    if (!calculData.revenu || calculData.revenu <= 0) {
      showNotification('Veuillez saisir un revenu valide', 'warning');
      return;
    }

    try {
      const response = await ParametrageApi.baseIrsa.calculate(calculData.revenu);
      setCalculData(prev => ({ ...prev, resultat: response.data }));
    } catch (error) {
      showNotification('Erreur lors du calcul', 'danger');
    }
  };

  // Gérer les changements du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setEditingTranche(null);
    setFormData({
      trancheMin: '',
      trancheMax: '',
      taux: '',
      numTranche: tranches.length + 1
    });
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (tranche) => {
    setEditingTranche(tranche);
    setFormData({
      trancheMin: tranche.trancheMin,
      trancheMax: tranche.trancheMax,
      taux: tranche.taux,
      numTranche: tranche.numTranche
    });
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    try {
      if (editingTranche) {
        await ParametrageApi.baseIrsa.update(editingTranche.id, formData);
        showNotification('Tranche modifiée avec succès', 'success');
      } else {
        await ParametrageApi.baseIrsa.create(formData);
        showNotification('Tranche ajoutée avec succès', 'success');
      }
      fetchTranches();
      setShowModal(false);
    } catch (error) {
      showNotification('Erreur lors de la sauvegarde', 'danger');
    }
  };

  // Supprimer
  const handleDelete = async (id, numTranche) => {
    if (window.confirm(`Supprimer la tranche n°${numTranche} ?`)) {
      try {
        await ParametrageApi.baseIrsa.delete(id);
        showNotification('Tranche supprimée avec succès', 'success');
        fetchTranches();
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'danger');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement du barème IRSA...</p>
      </div>
    );
  }

  return (
    <>
      {/* Barre d'outils */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Barème IRSA</h5>
        <div className="d-flex gap-2 flex-wrap">
          <Button 
            variant="outline-info" 
            size="sm"
            onClick={() => setShowCalculateModal(true)}
            className="d-flex align-items-center gap-1"
          >
            <DollarSign size={14} />
            Calculer IRSA
          </Button>



          {/* <Button 
            variant="outline-success" 
            size="sm"
            onClick={handleValidate}
            className="d-flex align-items-center gap-1"
          >
            <ChevronsUp size={14} />
            Valider
          </Button>


          <Button 
            variant="outline-warning" 
            size="sm"
            onClick={handleReorder}
            className="d-flex align-items-center gap-1"
            >
            <ChevronsUp size={14} />
            Réordonner
          </Button> */}



          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={handleInitialize}
            className="d-flex align-items-center gap-1"
            >
            <RefreshCw size={14} color="white" />
            Initialiser
          </Button>


          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={fetchTranches}
            className="d-flex align-items-center gap-1"
          >
            <RefreshCw size={14}/>
            Actualiser
          </Button>


        <Button
                variant="primary"
                size="sm"
                onClick={handleAdd}
                className="d-flex align-items-center gap-1 btn-unified"
            >
                <Plus size={14} color="white"  />
                <span className="d-none d-sm-inline"> Ajouter</span>
        </Button>



        </div>
      </div>

      {/* Tableau */}
      <Card className="border">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>N°</th>
                <th>Tranche minimale (Ar)</th>
                <th>Tranche maximale (Ar)</th>
                <th>Taux (%)</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tranches.length > 0 ? (
                tranches.map(tranche => (
                  <tr key={tranche.id}>
                    <td>
                      <Badge bg="secondary">Tranche {tranche.numTranche}</Badge>
                    </td>

                    <td>
                    {tranche.trancheMin?.toLocaleString()}
                     <span className="text-muted me-1"> Ar</span>
                    </td>
                    <td>
                    {tranche.trancheMax ? (
                        <>
                       
                        {tranche.trancheMax?.toLocaleString()}

                         <span className="text-muted me-1"> Ar</span>
                        </>
                    ) : (
                        <Badge bg="info">∞</Badge>
                    )}
                    </td>




                    <td>
                      <Badge bg="primary">
                        {tranche.taux}%
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(tranche)}
                        className="me-2"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(tranche.id, tranche.numTranche)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <p className="text-muted mb-0">Aucune tranche trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal d'ajout/modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTranche ? 'Modifier' : 'Ajouter'} une tranche IRSA
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Numéro de tranche</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Hash size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  name="numTranche"
                  value={formData.numTranche}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tranche minimale (Ar) *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DollarSign size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  name="trancheMin"
                  value={formData.trancheMin}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tranche maximale (Ar) (laisser vide pour ∞)</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DollarSign size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  name="trancheMax"
                  value={formData.trancheMax}
                  onChange={handleChange}
                  min="0"
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Taux (%) *</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Percent size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  name="taux"
                  value={formData.taux}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  required
                />
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingTranche ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de calcul IRSA */}
      <Modal show={showCalculateModal} onHide={() => setShowCalculateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Calculer l'IRSA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Revenu imposable (Ar)</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DollarSign size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  value={calculData.revenu}
                  onChange={(e) => setCalculData({ revenu: e.target.value, resultat: null })}
                  placeholder="Saisissez le revenu"
                  min="0"
                />
                <Button variant="primary" onClick={handleCalculate}>
                  Calculer
                </Button>
              </InputGroup>
            </Form.Group>

            {calculData.resultat !== null && (
              <Alert variant="info" className="mt-3">
                <h6 className="mb-2">Résultat :</h6>
                <p className="mb-0 fs-5 fw-bold">
                  IRSA à payer : {calculData.resultat.toLocaleString()} Ar
                </p>
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCalculateModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BaseIrsa;