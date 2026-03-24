import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axiosInstance from './../../utils/AxiosInstance';

const AddMouvementModalEmploye = ({ show, onHide, employeId, employeNom, employePrenom, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const [typesMouvement, setTypesMouvement] = useState([]);
  const [postes, setPostes] = useState([]);
  const [postesByDepartement, setPostesByDepartement] = useState([]);
  const [infosProActuel, setInfosProActuel] = useState(null);

  const [formData, setFormData] = useState({
    typeMouvementId: '',
    motif: '',
    dateDemande: new Date().toISOString().split('T')[0],
    nouveauPosteId: '',
    dateDebutAssignationPoste: ''
  });

  const normalizeTypeValue = (label) => {
    if (!label || typeof label !== 'string') return '';
    return label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  };

  const allowedTypeValues = useMemo(() => [
    'promotion',
    'changement de poste',
    'changement_poste'
  ], []);

  useEffect(() => {
    const fetchPostesByDepartement = async () => {
      const deptId = infosProActuel?.departement?.id;
      if (!deptId) {
        setPostesByDepartement([]);
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/postes/dep/${deptId}`);
        setPostesByDepartement(response.data || []);
      } catch (err) {
        console.error('Erreur chargement postes departement:', err);
        setPostesByDepartement([]);
      }
    };

    fetchPostesByDepartement();
  }, [infosProActuel]);

  useEffect(() => {
    const fetchData = async () => {
      if (!show || !employeId) return;
      try {
        setLoadingData(true);
        setError('');

        const [typesRes, postesRes, infosProRes] = await Promise.all([
          axiosInstance.get('/api/type-mouvements'),
          axiosInstance.get('/api/postes'),
          axiosInstance.get(`/api/infosPro/infosEmp/${employeId}`)
        ]);

        const formattedTypes = (typesRes.data || []).map(type => {
          const typeLabel = type.type || type.libelle || type.nom || '';
          const typeId = type.id || type.value || '';
          return { id: typeId, label: typeLabel, value: normalizeTypeValue(typeLabel) };
        }).filter(t => allowedTypeValues.includes(t.value));

        setTypesMouvement(formattedTypes);
        setPostes(postesRes.data || []);

        const infosProData = infosProRes?.data?.data || infosProRes?.data || null;
        setInfosProActuel(infosProData);
      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [show, employeId, allowedTypeValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'typeMouvementId') {
      setFormData(prev => ({ ...prev, nouveauPosteId: '' }));
    }
  };

  const validateForm = () => {
    if (!formData.typeMouvementId) {
      setError('Veuillez sélectionner un type de mouvement');
      return false;
    }

    if (!formData.motif.trim()) {
      setError('Veuillez saisir un motif');
      return false;
    }

    if (!formData.nouveauPosteId) {
      setError('Veuillez sélectionner un nouveau poste');
      return false;
    }

    return true;
  };

  const buildDemandePayload = () => {
    const demandeMouvementData = {
      motif: formData.motif,
      dateDemande: formData.dateDemande,
      employeDemandeur: { id: employeId },
      employeConcerne: { id: employeId },
      typeMouvement: { id: formData.typeMouvementId },
      infosProActuel: infosProActuel?.id ? { id: infosProActuel.id } : null
    };

    const infosProPropose = {
      employe: { id: employeId },
      statut: 3,
      dateDebutAssignationPoste: formData.dateDebutAssignationPoste
    };

    if (infosProActuel?.departement?.id) {
      infosProPropose.departement = { id: infosProActuel.departement.id };
    }

    if (infosProActuel?.typeContrat?.id) {
      infosProPropose.typeContrat = { id: infosProActuel.typeContrat.id };
    }

    infosProPropose.poste = { id: formData.nouveauPosteId };

    demandeMouvementData.infosProPropose = infosProPropose;
    return demandeMouvementData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;
    setLoading(true);

    try {
      const demandeMouvementData = buildDemandePayload();

      const response = await axiosInstance.post('/api/mouvements/demande', demandeMouvementData);
      if (onSuccess) onSuccess(response.data);
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur lors de la demande';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Nouvelle demande de mouvement</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loadingData ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de mouvement *</Form.Label>
                    <Form.Select name="typeMouvementId" value={formData.typeMouvementId} onChange={handleChange} required>
                      <option value="">Sélectionnez un type</option>
                      {typesMouvement.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de demande *</Form.Label>
                    <Form.Control type="date" name="dateDemande" value={formData.dateDemande} onChange={handleChange} readOnly disabled required />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Nouveau poste *</Form.Label>
                <Form.Select name="nouveauPosteId" value={formData.nouveauPosteId} onChange={handleChange} required>
                  <option value="">Sélectionnez un poste</option>
                  {(postesByDepartement.length > 0 ? postesByDepartement : postes).map(poste => (
                    <option key={poste.id} value={poste.id}>{poste.nom}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date début souhaitée *</Form.Label>
                <Form.Control type="date" name="dateDebutAssignationPoste" value={formData.dateDebutAssignationPoste} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Motif *</Form.Label>
                <Form.Control as="textarea" rows={3} name="motif" value={formData.motif} onChange={handleChange} required />
              </Form.Group>

              {/* <div className="mb-3">
                <div className="text-muted small mb-1">Payload envoye (aperu)</div>
                <pre className="bg-light border rounded p-2 small mb-0">{JSON.stringify(buildDemandePayload(), null, 2)}</pre>
              </div> */}

              <div className="text-muted small">
                Demandeur: {employePrenom} {employeNom}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddMouvementModalEmploye;
