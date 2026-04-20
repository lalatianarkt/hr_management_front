// src/components/AddPosteModal.jsx
import React, { useState, useEffect } from "react";
import { 
  Button, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Alert, 
  Spinner,
  Modal
} from "react-bootstrap";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircleFill
} from "react-bootstrap-icons";
import axiosInstance from "../../../utils/AxiosInstance";

function AddPosteModal({ show, onHide, onSuccess, refreshPostes }) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [departements, setDepartements] = useState([]);
  const [niveauxHierarchiques, setNiveauxHierarchiques] = useState([]);

  const [poste, setPoste] = useState({
    nom: "",
    description: "",
    departementId: "",
    niveauHierarchiqueId: ""
  });

  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      if (!show) return;
      
      try {
        setDataLoading(true);
        setError('');

        const [
          departementsResponse,
          niveauxResponse
        ] = await Promise.all([
          axiosInstance.get("/api/departements"),
          axiosInstance.get("/api/niveaux")
        ]);

        setDepartements(departementsResponse.data);
        setNiveauxHierarchiques(niveauxResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError('Erreur lors du chargement des données initiales');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [show]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        setPoste({
          nom: "",
          description: "",
          departementId: "",
          niveauHierarchiqueId: ""
        });
        setError('');
      }, 300);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPoste({ ...poste, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!poste.nom || !poste.departementId || !poste.niveauHierarchiqueId) {
      setError("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    try {
      setLoading(true);

      // Générer un ID unique pour le poste
      const posteId = `POSTE${Date.now()}`;

      const payload = {
        id: posteId,
        nom: poste.nom,
        description: poste.description || null,
        departement: { id: poste.departementId },
        niveauHierarchique: { id: poste.niveauHierarchiqueId }
      };

      console.log("Payload d'ajout de poste:", payload);

      const response = await axiosInstance.post("/api/postes", payload);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (refreshPostes) {
        refreshPostes();
      }
      
      onHide();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout du poste:", error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setError("Un poste avec ce nom existe déjà dans ce département.");
        } else {
          setError(`Erreur: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        }
      } else if (error.request) {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        setError("Erreur inattendue: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Si le modal n'est pas visible, ne rien afficher
  if (!show) return null;

  return (
    <div className="modal_perso">
      <div className="modal-dialog-custom" style={{ maxWidth: '800px', width: '95%' }}>
        <div className="modal-content-custom" style={{ 
          background: 'white', 
          border: '1px solid #e1b2db',
          color: '#3a1438',
          borderRadius: '8px'
        }}>
          {/* Header du modal */}
          <div className="modal-header-custom" style={{ 
            background: 'linear-gradient(135deg, #b053ad 0%, #764ba2 100%)',
            borderBottom: '1px solid #e1b2db',
            padding: '1.2rem 1.5rem',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <h5 className="modal-title m-0" style={{ 
              fontSize: '1.3rem', 
              fontWeight: 600,
              color: 'white'
            }}>
              <Briefcase size={20} className="me-2" />
              Ajouter un nouveau poste
            </h5>
            <button type="button" aria-label="Fermer"
              onClick={onHide}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                width: '44px',
                height: '44px',
                padding: 0,
                borderRadius: '12px'
              }}
            >
              <span style={{ fontSize: '1.8rem', lineHeight: '1' }}>×</span>
            </button>
          </div>
          
          {/* Body du modal */}
          <div className="modal-body-custom" style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto', 
            padding: '1.5rem',
            background: 'white'
          }}>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
                {error}
              </Alert>
            )}

            <div className="d-flex align-items-center mb-4">
              <Badge bg="primary" className="me-2">
                <Briefcase size={16} />
              </Badge>
              <h5 className="mb-0">Informations du poste</h5>
            </div>

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom du poste *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={poste.nom}
                      onChange={handleChange}
                      placeholder="Ex: Développeur Frontend, Chef de projet, Analyste financier..."
                      required
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Donnez un nom clair et descriptif au poste
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={poste.description}
                      onChange={handleChange}
                      placeholder="Décrivez les principales responsabilités, missions et compétences requises..."
                      rows={3}
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Optionnel - Vous pourrez modifier cette description plus tard
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Département *</Form.Label>
                    <Form.Select
                      name="departementId"
                      value={poste.departementId}
                      onChange={handleChange}
                      required
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Sélectionner un département --</option>
                      {departements.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nom}
                        </option>
                      ))}
                    </Form.Select>
                    {dataLoading && (
                      <small className="text-muted">Chargement des départements...</small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Niveau hiérarchique *</Form.Label>
                    <Form.Select
                      name="niveauHierarchiqueId"
                      value={poste.niveauHierarchiqueId}
                      onChange={handleChange}
                      required
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Sélectionner un niveau --</option>
                      {niveauxHierarchiques.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nom}
                        </option>
                      ))}
                    </Form.Select>
                    {dataLoading && (
                      <small className="text-muted">Chargement des niveaux...</small>
                    )}
                  </Form.Group>
                </Col>

                {/* Informations supplémentaires */}
                <Col md={12}>
                  <Alert variant="info" className="mt-3">
                    <strong>Note :</strong> Le poste sera automatiquement créé avec :
                    <ul className="mb-0 mt-2">
                      <li>Un identifiant unique généré automatiquement</li>
                      <li>Une date de création automatique</li>
                      <li>Possibilité d'ajouter des employés à ce poste ultérieurement</li>
                    </ul>
                  </Alert>
                </Col>
              </Row>
            </Form>
          </div>
          
          {/* Footer du modal avec bouton de sauvegarde */}
          <div className="modal-footer-custom" style={{ 
            background: 'white', 
            borderTop: '1px solid #e1b2db',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '10px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px'
          }}>
            <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
              Annuler
            </Button>
            
            <Button 
              variant="success" 
              onClick={handleSubmit} 
              disabled={loading || dataLoading}
              className="d-flex align-items-center"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircleFill className="me-2" />
                  Créer le poste
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPosteModal;
