import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { CheckCircle, XCircle, RefreshCw, ListChecks } from 'lucide-react';
import axiosInstance from './../../utils/AxiosInstance';

const ValidationMouvement = () => {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingMouvement, setPendingMouvement] = useState(null);
  const [commentaireManager, setCommentaireManager] = useState('');
  const [commentError, setCommentError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [pendingReject, setPendingReject] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState('');

  const fetchMouvements = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/mouvements/manager');
      const data = response?.data?.data || response?.data || [];
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(b?.dateDemande || 0) - new Date(a?.dateDemande || 0));
      setMouvements(list);
    } catch (err) {
      console.error('Erreur chargement mouvements manager:', err);
      const message = err?.response?.data?.message || err?.message || 'Impossible de charger les mouvements.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

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
      mouvement?.motif ||
      'Non specifie';
  };

  const getEmployeName = (mouvement) => {
    const emp = mouvement?.employe || mouvement?.employeDemandeur || mouvement?.employeConcerne || mouvement?.infosProPropose?.employe;
    const nom = emp?.nom || emp?.employe?.nom || '';
    const prenom = emp?.prenom || emp?.employe?.prenom || '';
    const matricule = emp?.matricule || emp?.employe?.matricule || '';
    const label = `${prenom} ${nom}`.trim();
    return label || matricule || 'Employe';
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

  const statusConfig = (statut) => {
    const s = Number(statut);
    switch (s) {
      case 1:
        return { label: 'En attente manager', variant: 'warning' };
      case 2:
        return { label: 'Valide par Manager', variant: 'success' };
      case 3:
        return { label: 'Refuse par Manager', variant: 'danger' };
      case 4:
        return { label: 'Valide par RH', variant: 'success' };
      case 5:
        return { label: 'Refuse par RH', variant: 'danger' };
      case 7:
        return { label: 'Annule par un responsable', variant: 'secondary' };
      default:
        return { label: `Statut ${statut ?? 'inconnu'}`, variant: 'secondary' };
    }
  };

  // NOTE: Adaptez ces endpoints si votre backend expose d'autres routes.
  const validateEndpoint = (id) => `/api/mouvements/manager/validate/${id}`;
  const rejectEndpoint = (id) => `/api/mouvements/manager/refuse/${id}`;

  const handleDecision = async (mouvement, decision, commentaire) => {
    if (!mouvement?.id) return;
    const id = mouvement.id;
    setActionLoading(prev => ({ ...prev, [id]: decision }));
    setError('');
    try {
      if (decision === 'validate') {
        await axiosInstance.put(validateEndpoint(id), {
          commentaireManager: commentaire
        });
      } else {
        await axiosInstance.put(rejectEndpoint(id), {
          commentaireManager: commentaire
        });
      }
      await fetchMouvements();
    } catch (err) {
      console.error('Erreur decision mouvement:', err);
      const message = err?.response?.data?.message || err?.message || 'Erreur lors de la mise a jour.';
      setError(message);
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const stats = useMemo(() => {
    return {
      total: mouvements.length,
      enAttente: mouvements.filter(m => Number(m?.statut) === 1).length,
      valides: mouvements.filter(m => Number(m?.statut) === 2 || Number(m?.statut) === 4).length,
      refuses: mouvements.filter(m => Number(m?.statut) === 3 || Number(m?.statut) === 5).length,
    };
  }, [mouvements]);

  const openValidateConfirm = (mouvement) => {
    setPendingMouvement(mouvement || null);
    setCommentaireManager('');
    setCommentError('');
    setConfirmOpen(true);
  };

  const closeValidateConfirm = () => {
    setConfirmOpen(false);
    setPendingMouvement(null);
    setCommentaireManager('');
    setCommentError('');
  };

  const confirmValidate = async () => {
    if (!pendingMouvement) return;
    if (!commentaireManager.trim()) {
      setCommentError('Veuillez saisir une description.');
      return;
    }
    await handleDecision(pendingMouvement, 'validate', commentaireManager.trim());
    closeValidateConfirm();
  };

  const openRejectConfirm = (mouvement) => {
    setPendingReject(mouvement || null);
    setRejectComment('');
    setRejectError('');
    setRejectOpen(true);
  };

  const closeRejectConfirm = () => {
    setRejectOpen(false);
    setPendingReject(null);
    setRejectComment('');
    setRejectError('');
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    if (!rejectComment.trim()) {
      setRejectError('Veuillez saisir une description.');
      return;
    }
    await handleDecision(pendingReject, 'reject', rejectComment.trim());
    closeRejectConfirm();
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 d-flex align-items-center">
                <ListChecks size={22} className="me-2" />
                Validation des mouvements
              </h1>
              <p className="text-muted mb-0">
                Liste des mouvements en attente de validation manager.
              </p>
            </div>
            <Button variant="outline-primary" onClick={fetchMouvements} disabled={loading}>
              <span className="d-flex align-items-center">
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <RefreshCw size={16} className="me-2" />
                )}
                Actualiser
              </span>
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-primary shadow-sm">
            <Card.Body className="py-3">
              <div className="text-muted small">Total</div>
              <div className="h4 mb-0 text-primary">{stats.total}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-warning shadow-sm">
            <Card.Body className="py-3">
              <div className="text-muted small">En attente</div>
              <div className="h4 mb-0 text-warning">{stats.enAttente}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-success shadow-sm">
            <Card.Body className="py-3">
              <div className="text-muted small">Valides</div>
              <div className="h4 mb-0 text-success">{stats.valides}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-danger shadow-sm">
            <Card.Body className="py-3">
              <div className="text-muted small">Refuses</div>
              <div className="h4 mb-0 text-danger">{stats.refuses}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Mouvements</h5>
            <span className="text-muted small">
              {mouvements.length} mouvement{mouvements.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-4 d-flex align-items-center gap-2 text-muted">
              <Spinner size="sm" animation="border" />
              Chargement des mouvements...
            </div>
          ) : mouvements.length === 0 ? (
            <div className="p-4 text-muted">Aucun mouvement trouve.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Employe</th>
                    <th>Type</th>
                    <th>Poste demande</th>
                    <th>Departement</th>
                    <th>Date demande</th>
                    <th>Statut</th>
                    <th style={{ width: '220px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mouvements.map((mouvement) => {
                    const status = statusConfig(mouvement?.statut);
                    const isPending = Number(mouvement?.statut) === 1;
                    const isValidating = actionLoading[mouvement?.id] === 'validate';
                    const isRejecting = actionLoading[mouvement?.id] === 'reject';

                    return (
                      <tr key={mouvement?.id || `${mouvement?.typeMouvement?.id}-${mouvement?.dateDemande}`}>
                        <td>{getEmployeName(mouvement)}</td>
                        <td>{getTypeLabel(mouvement)}</td>
                        <td>{getPosteDemande(mouvement)}</td>
                        <td>{getDepartementDemande(mouvement)}</td>
                        <td>{formatDate(mouvement?.dateDemande)}</td>
                        <td>
                          <Badge bg={status.variant}>{status.label}</Badge>
                        </td>
                        <td>
                          {isPending ? (
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => openValidateConfirm(mouvement)}
                                disabled={isValidating || isRejecting}
                                className="d-inline-flex align-items-center gap-1"
                              >
                                {isValidating ? (
                                  <Spinner size="sm" animation="border" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => openRejectConfirm(mouvement)}
                                disabled={isValidating || isRejecting}
                                className="d-inline-flex align-items-center gap-1"
                              >
                                {isRejecting ? (
                                  <Spinner size="sm" animation="border" />
                                ) : (
                                  <XCircle size={16} />
                                )}
                                Refuser
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={confirmOpen} onHide={closeValidateConfirm} centered>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>Confirmer la validation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Voulez-vous vraiment valider ce mouvement ?
          </p>
          {pendingMouvement && (
            <div className="small text-muted">
              <div><strong>Employe:</strong> {getEmployeName(pendingMouvement)}</div>
              <div><strong>Type:</strong> {getTypeLabel(pendingMouvement)}</div>
              <div><strong>Date demande:</strong> {formatDate(pendingMouvement?.dateDemande)}</div>
            </div>
          )}
          <div className="mt-3">
            <label className="form-label fw-semibold">
              Description (obligatoire)
            </label>
            <textarea
              className={`form-control ${commentError ? 'is-invalid' : ''}`}
              rows={3}
              value={commentaireManager}
              onChange={(e) => {
                setCommentaireManager(e.target.value);
                if (commentError) setCommentError('');
              }}
              placeholder="Saisissez le commentaire de validation..."
              required
            />
            {commentError && (
              <div className="invalid-feedback">{commentError}</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeValidateConfirm}>
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={confirmValidate}
            disabled={actionLoading[pendingMouvement?.id] === 'validate'}
          >
            {actionLoading[pendingMouvement?.id] === 'validate' ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Validation...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={rejectOpen} onHide={closeRejectConfirm} centered>
        <Modal.Header closeButton closeLabel="Fermer">
          <Modal.Title>Confirmer le refus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Voulez-vous vraiment refuser ce mouvement ?
          </p>
          {pendingReject && (
            <div className="small text-muted">
              <div><strong>Employe:</strong> {getEmployeName(pendingReject)}</div>
              <div><strong>Type:</strong> {getTypeLabel(pendingReject)}</div>
              <div><strong>Date demande:</strong> {formatDate(pendingReject?.dateDemande)}</div>
            </div>
          )}
          <div className="mt-3">
            <label className="form-label fw-semibold">
              Description (obligatoire)
            </label>
            <textarea
              className={`form-control ${rejectError ? 'is-invalid' : ''}`}
              rows={3}
              value={rejectComment}
              onChange={(e) => {
                setRejectComment(e.target.value);
                if (rejectError) setRejectError('');
              }}
              placeholder="Saisissez le commentaire de refus..."
              required
            />
            {rejectError && (
              <div className="invalid-feedback">{rejectError}</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeRejectConfirm}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={confirmReject}
            disabled={actionLoading[pendingReject?.id] === 'reject'}
          >
            {actionLoading[pendingReject?.id] === 'reject' ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Refus...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ValidationMouvement;
