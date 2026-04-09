import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { Plus, Briefcase, Building2, UserCircle } from 'lucide-react';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import axiosInstance from './../../utils/AxiosInstance';
import AddMouvementModalEmploye from './AddMouvementModalEmploye';

const DemandeMouvement = () => {
  const [infosPro, setInfosPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mouvements, setMouvements] = useState([]);
  const [loadingMouvements, setLoadingMouvements] = useState(false);
  const [errorMouvements, setErrorMouvements] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    typeMouvementId: '',
    typeMouvementLabel: '',
    dateDemande: '',
    nouveauPosteId: '',
    dateDebutAssignationPoste: '',
    motif: ''
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [postesByDepartement, setPostesByDepartement] = useState([]);

  useEffect(() => {
    const fetchInfosPro = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosInstance.get('/api/infosPro/infosEmp');
        const data = response?.data?.data || response?.data || null;
        setInfosPro(data);
      } catch (err) {
        console.error('Erreur chargement infos pro:', err);
        setError("Impossible de charger vos informations professionnelles.");
      } finally {
        setLoading(false);
      }
    };

    fetchInfosPro();
  }, []);

  const employe = infosPro?.employe || infosPro?.employeData || {};
  const employeId = employe?.id || infosPro?.employeId || infosPro?.idEmploye || '';
  const employeNom = employe?.nom || '';
  const employePrenom = employe?.prenom || '';
  const departement = infosPro?.departement?.nom || infosPro?.poste?.departement?.nom || 'Non defini';
  const poste = infosPro?.poste?.nom || infosPro?.poste?.libelle || 'Non defini';

  const fetchMouvements = async (id) => {
    if (!id) return;
    try {
      setLoadingMouvements(true);
      setErrorMouvements('');
      const response = await axiosInstance.get(`/api/mouvements/employe/${id}`);
      console.log('Mouvements response:', response.data);
      const data = response?.data?.data || response?.data || [];
      setMouvements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement mouvements:', err);
      setErrorMouvements("Impossible de charger la liste des mouvements.");
    } finally {
      setLoadingMouvements(false);
    }
  };

  useEffect(() => {
    if (employeId) {
      fetchMouvements(employeId);
    }
  }, [employeId]);
  useEffect(() => {
    const fetchPostesByDepartement = async () => {
      const deptId = infosPro?.departement?.id || infosPro?.poste?.departement?.id;
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
  }, [infosPro]);


  const formatDate = (dateString) => {
    if (!dateString) return 'Non specifiee';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const getTypeLabel = (mouvement) => {
    return mouvement?.typeMouvement?.type ||
      mouvement?.typeMouvement?.libelle ||
      mouvement?.typeMouvement?.nom ||
      mouvement?.type ||
      'Non specifie';
  };

  const getStatutBadge = (statut) => {
    if (statut === undefined || statut === null) {
      return <Badge bg="secondary">Inconnu</Badge>;
    }
    switch (statut) {
      case 1:
        return <Badge bg="warning">En attente</Badge>;
      case 2:
        return <Badge bg="info">Validé par Manager</Badge>;
      case 3:
        return <Badge bg="danger">Refusé par Manager</Badge>;
      case 4:
        return <Badge bg="success">Validé par RH</Badge>;
      case 5:
        return <Badge bg="danger">Refusé par RH</Badge>;
      case 6:
        return <Badge bg="secondary">Annulé par le demandeur</Badge>;
      default:
        return <Badge bg="secondary">Inconnu ({statut})</Badge>;
    }
  };

  const getPosteDemande = (mouvement) => {
    return mouvement?.infosProPropose?.poste?.nom ||
      mouvement?.infosProPropose?.poste?.libelle ||
      'Non specifie';
  };

  const getDepartementDemande = (mouvement) => {
    return mouvement?.infosProPropose?.departement?.nom ||
      mouvement?.infosProPropose?.departement?.libelle ||
      'Non specifie';
  };

  const getTypeMouvementDemande = (mouvement) => {
    return mouvement?.typeMouvement?.type ||
      mouvement?.typeMouvement?.libelle ||
      mouvement?.typeMouvement?.nom ||
      mouvement?.type ||
      mouvement?.motif ||
      mouvement?.infosProPropose?.typeMouvement?.type ||
      mouvement?.infosProPropose?.typeMouvement?.nom ||
      'Non specifie';
  };

  const getPosteActuel = (mouvement) => {
    return mouvement?.infosProActuel?.poste?.nom ||
      mouvement?.infosProActuel?.poste?.libelle ||
      'Non specifie';
  };

  const getDepartementActuel = (mouvement) => {
    return mouvement?.infosProActuel?.departement?.nom ||
      mouvement?.infosProActuel?.departement?.libelle ||
      'Non specifie';
  };

  const openEditModal = (mouvement) => {
    setEditError('');
    setEditForm({
      id: mouvement?.id || '',
      typeMouvementId: mouvement?.typeMouvement?.id || '',
      typeMouvementLabel: getTypeLabel(mouvement),
      dateDemande: mouvement?.dateDemande || '',
      nouveauPosteId: mouvement?.infosProPropose?.poste?.id || '',
      dateDebutAssignationPoste: mouvement?.infosProPropose?.dateDebutAssignationPoste || '',
      motif: mouvement?.motif || ''
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!editForm.id) return;
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        motif: editForm.motif,
        dateDemande: editForm.dateDemande,
        typeMouvement: { id: editForm.typeMouvementId },
        infosProActuel: infosPro?.id ? { id: infosPro.id } : null,
        infosProPropose: {
          employe: { id: employeId },
          statut: 3,
          dateDebutAssignationPoste: editForm.dateDebutAssignationPoste,
          poste: { id: editForm.nouveauPosteId },
          salaireBase: editForm.salaireBase || null
        }
      };

      const deptId = infosPro?.departement?.id || infosPro?.poste?.departement?.id;
      if (deptId) payload.infosProPropose.departement = { id: deptId };
      if (infosPro?.typeContrat?.id) payload.infosProPropose.typeContrat = { id: infosPro.typeContrat.id };

      await axiosInstance.put(`/api/mouvements/${editForm.id}`, payload);
      setEditModalOpen(false);
      fetchMouvements(employeId);
    } catch (err) {
      console.error('Erreur modification mouvement:', err);
      setEditError('Impossible de modifier la demande.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAnnuler = async (mouvement) => {
    if (!mouvement?.id) return;
    const ok = window.confirm('Annuler cette demande ?');
    if (!ok) return;
    try {
      await axiosInstance.patch(`/api/mouvements/${mouvement.id}/annuler`);
      fetchMouvements(employeId);
    } catch (err) {
      console.error('Erreur annulation mouvement:', err);
      setErrorMouvements('Impossible d\'annuler la demande.');
    }
  };

  const handleSupprimer = async (mouvement) => {
    if (!mouvement?.id) return;
    const ok = window.confirm('Supprimer cette demande ?');
    if (!ok) return;
    try {
      await axiosInstance.delete(`/api/mouvements/${mouvement.id}`);
      fetchMouvements(employeId);
    } catch (err) {
      console.error('Erreur suppression mouvement:', err);
      setErrorMouvements('Impossible de supprimer la demande.');
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h3 className="fw-bold mb-1">Demande de mouvement</h3>
          <p className="text-muted mb-0">
            Soumettez une demande de promotion ou de changement de poste.
          </p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card className="border">
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner size="sm" animation="border" />
              Chargement des informations...
            </div>
          ) : (
            <Row className="g-3 align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-light border">
                    <UserCircle size={28} className="text-primary" />
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {employePrenom || 'Prenom'} {employeNom || 'Nom'}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <Badge bg="light" text="dark" className="border">
                        <Building2 size={12} className="me-1" /> {departement}
                      </Badge>
                      <Badge bg="light" text="dark" className="border">
                        <Briefcase size={12} className="me-1" /> {poste}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4} className="text-lg-end">
                <Button
                  variant="primary"
                  className="d-inline-flex align-items-center gap-2"
                  onClick={() => setShowModal(true)}
                  disabled={!employeId}
                >
                  <span className="fw-bold">+</span>
                  Nouvelle demande
                </Button>
                {!employeId && (
                  <div className="small text-muted mt-2">ID employe introuvable.</div>
                )}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <Card className="border mt-4">
        <Card.Header className="bg-white">
          <div className="fw-semibold">Historique des demandes de mouvement</div>
        </Card.Header>
        <Card.Body>
          {errorMouvements && <Alert variant="danger">{errorMouvements}</Alert>}
          {loadingMouvements ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner size="sm" animation="border" />
              Chargement des mouvements...
            </div>
          ) : mouvements.length === 0 ? (
            <div className="text-muted">Aucun mouvement trouvé.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {mouvements.map((mouvement) => (
                <Card key={mouvement.id || `${mouvement.typeMouvement?.id}-${mouvement.dateDemande}`} className="border">
                  <Card.Body className="py-3">
                    {(() => {
                      const canModify = mouvement?.statut === 1;
                      return (
                    <div>
                      <Row className="g-3 align-items-center">
                        <Col md={4}>
                          <div className="fw-semibold">{getTypeLabel(mouvement)}</div>
                          <div className="text-muted small">Demandé le: {formatDate(mouvement.dateDemande)}</div>
                          <div className="mt-2">{getStatutBadge(mouvement.statut)}</div>
                        </Col>
                        <Col md={4}>
                          <div className="text-muted small">Poste demandé</div>
                          <div className="small fw-semibold">{getPosteDemande(mouvement)}</div>
                        </Col>
                      </Row>

                    <Row className="g-3 mt-2">
                      <Col md={4}>
                        <div className="text-muted small">Département demandé</div>
                        <div className="small">{getDepartementDemande(mouvement)}</div>
                      </Col>
                      <Col md={4}>
                        <div className="text-muted small">Type mouvement</div>
                        <div className="small">{getTypeMouvementDemande(mouvement)}</div>
                      </Col>
                      <Col md={4}>
                        <div className="text-muted small">Date début souhaitée</div>
                        <div className="small">{formatDate(mouvement?.infosProPropose?.dateDebutAssignationPoste)}</div>
                      </Col>
                    </Row>

                      <Row className="g-3 mt-2">
                      {/* <Col md={4}>
                        <div className="text-muted small">Poste actuel</div>
                        <div className="small">{getPosteActuel(mouvement)}</div>
                      </Col>
                      <Col md={4}>
                        <div className="text-muted small">Département actuel</div>
                        <div className="small">{getDepartementActuel(mouvement)}</div>
                      </Col> */}
                      <Col md={4}>
                        <div className="text-muted small">Motif</div>
                        <div className="small">{mouvement.motif || 'Non specifie'}</div>
                      </Col>
                      </Row>

                      <Row className="g-3 mt-3">
                      <Col className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-2"
                          onClick={() => canModify && openEditModal(mouvement)}
                          disabled={!canModify}
                        >
                          <FaEdit />
                          Modifier
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="d-inline-flex align-items-center gap-2"
                          onClick={() => canModify && handleAnnuler(mouvement)}
                          disabled={!canModify}
                        >
                          <FaTimes />
                          Annuler
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="d-inline-flex align-items-center gap-2"
                          onClick={() => canModify && handleSupprimer(mouvement)}
                          disabled={!canModify}
                        >
                          <FaTrash />
                          Supprimer
                        </Button>
                      </Col>
                      </Row>
                    </div>
                      );
                    })()}

                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} centered>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>Modifier la demande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Type de mouvement</Form.Label>
              <Form.Control type="text" value={editForm.typeMouvementLabel} disabled readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date de demande</Form.Label>
              <Form.Control type="date" name="dateDemande" value={editForm.dateDemande} onChange={handleEditChange} disabled readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nouveau poste</Form.Label>
              <Form.Select name="nouveauPosteId" value={editForm.nouveauPosteId} onChange={handleEditChange} required>
                <option value="">Selectionnez un poste</option>
                {postesByDepartement.map(poste => (
                  <option key={poste.id} value={poste.id}>{poste.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date debut assignation poste</Form.Label>
              <Form.Control type="date" name="dateDebutAssignationPoste" value={editForm.dateDebutAssignationPoste} onChange={handleEditChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motif</Form.Label>
              <Form.Control as="textarea" rows={3} name="motif" value={editForm.motif} onChange={handleEditChange} required />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setEditModalOpen(false)} disabled={editLoading}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={editLoading}>
            {editLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Modal.Footer>
      </Modal>

      <AddMouvementModalEmploye
        show={showModal}
        onHide={() => setShowModal(false)}
        employeId={employeId}
        employeNom={employeNom}
        employePrenom={employePrenom}
        onSuccess={() => {
          setSuccess('Votre demande a ete envoyee avec succes.');
          setShowModal(false);
          fetchMouvements(employeId);
        }}
      />
    </Container>
  );
};

export default DemandeMouvement;

