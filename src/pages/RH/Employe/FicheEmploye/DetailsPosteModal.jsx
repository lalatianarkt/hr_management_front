// src/components/DetailsPosteModal.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Modal
} from "react-bootstrap";
import {
  InfoCircle,
  Calendar,
  Briefcase,
  Pencil, // Remplacé Edit par Pencil
  XCircle
} from "react-bootstrap-icons";
import axiosInstance from "../../../utils/AxiosInstance";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function DetailsPosteModal({ show, onHide, posteId, onEditRequest }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [poste, setPoste] = useState(null);

  // Récupérer les données du poste
  useEffect(() => {
    const fetchPoste = async () => {
      if (!show || !posteId) return;

      try {
        setLoading(true);
        setError('');
        setPoste(null);

        const response = await axiosInstance.get(`/api/postes/${posteId}`);
        setPoste(response.data);

      } catch (error) {
        console.error("Erreur lors du chargement du poste:", error);

        if (error.response && error.response.status === 404) {
          setError('Poste non trouvé. Il a peut-être été supprimé.');
        } else {
          setError('Erreur lors du chargement des données du poste');
        }
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchPoste();
    }
  }, [show, posteId]);

  // Réinitialiser quand le modal se ferme
  const handleClose = () => {
    if (onHide) {
      onHide();
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  // Gérer la demande de modification
  const handleEditRequest = () => {
    if (poste && onEditRequest) {
      // D'abord fermer le modal de détails
      handleClose();
      // Puis déclencher la modification avec un léger délai
      setTimeout(() => {
        onEditRequest(poste.id);
      }, 300);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
    >
      <Modal.Header closeButton closeLabel="Fermer" style={{
        background: 'var(--bg-gradient)',
        color: 'white'
      }}>
        <Modal.Title className="d-flex align-items-center">
          <InfoCircle size={20} className="me-2" />
          Détails du Poste
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            <strong>Erreur:</strong> {error}
          </Alert>
        )}

        <div className="d-flex align-items-center mb-4">
          <Badge bg="info" className="me-2 d-flex align-items-center">
            <InfoCircle size={16} className="me-1" />
            Informations
          </Badge>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
            <p className="mt-3 text-muted">Chargement des données du poste...</p>
          </div>
        ) : poste ? (
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>ID</small>
                </label>
                <p className="fw-bold" style={{
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  background: '#f9f1f8',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}>
                  {poste.id}
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>Nom du poste</small>
                </label>
                <p className="fw-bold" style={{ fontSize: '1.1rem', color: '#000' }}>{poste.nom}</p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>Description</small>
                </label>
                <div className="p-3 bg-light rounded" style={{ minHeight: '100px' }}>
                  {poste.description ? (
                    <p className="mb-0" style={{ lineHeight: '1.6' }}>{poste.description}</p>
                  ) : (
                    <p className="mb-0 text-muted">Aucune description disponible</p>
                  )}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>Département</small>
                </label>
                <div>
                  {poste.departement ? (
                    <Badge bg="info" className="d-inline-flex align-items-center gap-2 p-2 px-3">
                      <Briefcase size={14} />
                      <span>{poste.departement.nom}</span>
                    </Badge>
                  ) : (
                    <span className="text-muted">Non assigné</span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>Niveau Hiérarchique</small>
                </label>
                <div>
                  {poste.niveauHierarchique ? (
                    <Badge bg="primary" className="p-2 px-3">
                      {poste.niveauHierarchique.nom}
                    </Badge>
                  ) : (
                    <span className="text-muted">Non défini</span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>Date de création</small>
                </label>
                <p className="d-flex align-items-center">
                  <Calendar size={16} className="me-2 text-muted" />
                  <span>{formatDate(poste.createdAt)}</span>
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted d-block mb-1">
                  <small>Dernière modification</small>
                </label>
                <p className="d-flex align-items-center">
                  <Calendar size={16} className="me-2 text-muted" />
                  <span>{formatDate(poste.modifiedAt)}</span>
                </p>
              </div>
            </Col>
          </Row>
        ) : (
          <div className="text-center py-4">
            <XCircle size={48} className="text-muted mb-3" />
            <p className="text-muted">Aucune donnée disponible</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="w-100 d-flex justify-content-between align-items-center">
          <div>
            {poste && (
              <small className="text-muted">
                <Calendar size={12} className="me-1" />
                Poste créé le {formatDate(poste.createdAt).split(' ')[0]}
              </small>
            )}
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              style={{ minWidth: '80px' }}
            >
              Fermer
            </Button>

            {poste && onEditRequest && (
              <Button
                variant="primary"
                onClick={handleEditRequest}
                className="d-flex align-items-center justify-content-center"
                style={{ minWidth: '150px' }}
              >
                <Pencil className="me-2" />
                Modifier ce poste
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default DetailsPosteModal;

