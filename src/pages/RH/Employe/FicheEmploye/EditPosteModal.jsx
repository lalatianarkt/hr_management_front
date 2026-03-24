// src/components/EditPosteModal.jsx (ou EditPosteModal/index.jsx)
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function EditPosteModal({ show, onHide, posteId, onSuccess, refreshPostes }) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    departement: null,
    niveauHierarchique: null
  });

  const [departements, setDepartements] = useState([]);
  const [niveauxHierarchique, setNiveauxHierarchique] = useState([]);

  // Charger les données du poste
  useEffect(() => {
    const fetchData = async () => {
      if (!show || !posteId) return;

      try {
        setLoadingData(true);

        // Charger le poste
        const posteResponse = await axios.get(`http://localhost:8080/api/postes/${posteId}`);
        const poste = posteResponse.data;

        // Charger les départements
        const deptResponse = await axios.get('http://localhost:8080/api/departements');
        setDepartements(deptResponse.data);

        // Charger les niveaux hiérarchiques (si nécessaire)
        const niveauxResponse = await axios.get('http://localhost:8080/api/niveaux');
        setNiveauxHierarchique(niveauxResponse.data);

        // Mettre à jour le formulaire
        setFormData({
          nom: poste.nom || '',
          description: poste.description || '',
          departement: poste.departement?.id || null,
          niveauHierarchique: poste.niveauHierarchique?.id || null
        });

      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [show, posteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Préparer les données
      const dataToSend = {
        nom: formData.nom,
        description: formData.description,
        departementId: formData.departement,
        niveauHierarchiqueId: formData.niveauHierarchique
      };

      // Envoyer la requête PUT
      const response = await axios.put(`http://localhost:8080/api/postes/${posteId}`, dataToSend);

      // Succès
      setSuccess('Poste modifié avec succès!');

      // Appeler la callback de succès
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Rafraîchir la liste
      if (refreshPostes) {
        refreshPostes();
      }

      // Fermer le modal après un délai
      setTimeout(() => {
        onHide();
        setSuccess('');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du poste');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ background: 'var(--bg-gradient)', color: 'white', borderBottom: 'none' }}>
        <Modal.Title>Modifier le Poste</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {loadingData ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Chargement des données...</p>
            </div>
          ) : (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du poste *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Développeur Full Stack"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Département</Form.Label>
                  <Form.Select
                    name="departement"
                    value={formData.departement || ''}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez les responsabilités et missions du poste..."
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Niveau Hiérarchique</Form.Label>
                  <Form.Select
                    name="niveauHierarchique"
                    value={formData.niveauHierarchique || ''}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveauxHierarchique.map(niveau => (
                      <option key={niveau.id} value={niveau.id}>
                        {niveau.nom}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || loadingData}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Modification...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditPosteModal;
