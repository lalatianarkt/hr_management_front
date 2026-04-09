// src/components/AddInfoProfessionnelleModal.jsx
import React, { useState, useEffect } from "react";
import { 
  Button, 
  Form, 
  Row, 
  Col, 
  Alert, 
  Spinner,
  Modal 
} from "react-bootstrap";
import {
  BriefcaseFill,
  CalendarFill,
  BuildingFill,
  PeopleFill,
  CheckCircleFill,
  PersonBadgeFill,
  CashStack,
  ClockFill,
  ArchiveFill,
  FileTextFill
} from "react-bootstrap-icons";
import { MdRestoreFromTrash } from "react-icons/md";
import { FaCommentAlt, FaInfoCircle } from "react-icons/fa";
import axiosInstance from "../../../utils/AxiosInstance";

function AddInfoProfessionnelleModal({ 
  show, 
  onHide, 
  onSuccess, 
  idEmploye, 
  employeNom,
  isRestore = false // Nouvelle prop optionnelle
}) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingPostes, setLoadingPostes] = useState(false);
  const [loadingManager, setLoadingManager] = useState(false);
  const [error, setError] = useState('');
  
  // Données des listes déroulantes
  const [typeContrats, setTypeContrats] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [postes, setPostes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeTempsTravails, setTypeTempsTravails] = useState([]);
  const [typeEntrees, setTypeEntrees] = useState([]);
  
  // État du formulaire
  const [infoPro, setInfoPro] = useState({
    // Informations de base
    salaireBase: "",
    typeContratId: "",
    
    // Poste et département
    departementId: "",
    posteId: "",
    
    // Classification
    classification: "",
    idCategorie: "",
    idTempsTravail: "",
    idTypeEntree: "",
    
    // Désarchivage
    motifDesarchivage: ""
  });

  const [assignedManager, setAssignedManager] = useState(null);

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      if (!show) return;
      
      try {
        setDataLoading(true);
        setError('');

        const [
          contratsResponse,
          departementsResponse,
          categoriesResponse,
          typeTempsTravailsResponse,
          typeEntreesResponse
        ] = await Promise.all([
          axiosInstance.get("/api/type-contrats"),
          axiosInstance.get("/api/departements"),
          axiosInstance.get("/api/categories-professionnelles"),
          axiosInstance.get("/api/types-temps-travail"),
          axiosInstance.get("/api/types-entree")
        ]);

        setTypeContrats(contratsResponse.data);
        setDepartements(departementsResponse.data);
        setCategories(categoriesResponse.data);
        setTypeTempsTravails(typeTempsTravailsResponse.data);
        setTypeEntrees(typeEntreesResponse.data);
        
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError('Erreur lors du chargement des données initiales');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [show]);

  // Réinitialiser le formulaire
  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        setInfoPro({
          salaireBase: "",
          typeContratId: "",
          departementId: "",
          posteId: "",
          classification: "",
          idCategorie: "",
          idTempsTravail: "",
          idTypeEntree: "",
          motifDesarchivage: ""
        });
        setPostes([]);
        setAssignedManager(null);
        setError('');
      }, 300);
    }
  }, [show]);

  // Charger les postes d'un département
  const fetchPostesByDepartement = async (departementId) => {
    if (!departementId) {
      setPostes([]);
      return;
    }

    try {
      setLoadingPostes(true);
      const response = await axiosInstance.get(`/api/departements/${departementId}/postes`);
      setPostes(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des postes:", error);
      setPostes([]);
    } finally {
      setLoadingPostes(false);
    }
  };

  // Charger le manager du département
  const fetchManagerByDepartement = async (departementId) => {
    if (!departementId) {
      setAssignedManager(null);
      return;
    }

    try {
      setLoadingManager(true);
      const response = await axiosInstance.get(`/api/managers/by-departement/${departementId}`);
      
      if (response.data) {
        const manager = response.data;
        setAssignedManager(manager);
      } else {
        setAssignedManager(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setAssignedManager(null);
      } else {
        console.error("Erreur lors du chargement du manager:", error);
        setAssignedManager(null);
      }
    } finally {
      setLoadingManager(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === "departementId") {
      const newInfoPro = { 
        ...infoPro, 
        [name]: value,
        posteId: ""
      };
      
      setInfoPro(newInfoPro);
      await fetchPostesByDepartement(value);
      await fetchManagerByDepartement(value);
    } 
    else {
      setInfoPro({ ...infoPro, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!infoPro.typeContratId || !infoPro.posteId || !infoPro.departementId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!infoPro.salaireBase) {
      setError("Veuillez saisir le salaire de base.");
      return;
    }

    // Validation du motif de restauration si c'est une restauration
    if (isRestore && !infoPro.motifDesarchivage?.trim()) {
      setError("Veuillez saisir le motif de restauration.");
      return;
    }

    try {
      setLoading(true);

      // Utiliser la date du jour pour la date d'embauche
      const today = new Date().toISOString().split('T')[0];

      const payload = {
        matricule: `EMP-${Date.now()}`, // Générer un matricule temporaire
        dateEmbauche: today,
        dateDebutAssignationPoste: today,
        dateFinAssignationPoste: null,
        salaireBase: parseFloat(infoPro.salaireBase),
        statut: 0, // Actif par défaut
        classification: infoPro.classification || null,
        categorieProfessionnelle: infoPro.idCategorie ? { id: infoPro.idCategorie } : null,
        typeTempsTravail: infoPro.idTempsTravail ? { id: infoPro.idTempsTravail } : null,
        typeEntree: infoPro.idTypeEntree ? { id: infoPro.idTypeEntree } : null,
        typeContrat: { id: infoPro.typeContratId },
        poste: { id: infoPro.posteId },
        departement: { id: infoPro.departementId },
        manager: assignedManager ? { id: assignedManager.id } : null,
        employe: { id: idEmploye },
        motifDesarchivage: infoPro.motifDesarchivage || null
      };

      console.log("Payload info professionnelle:", payload);

      const response = await axiosInstance.post("/api/infosPro", payload);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      onHide();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'information professionnelle:", error);
      
      if (error.response) {
        setError(`Erreur: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        setError("Erreur inattendue: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton closeLabel="Fermer" className="border-bottom bg-light">
        <Modal.Title className="d-flex align-items-center gap-2">
          {isRestore ? (
            <MdRestoreFromTrash className="text-success" size={24} />
          ) : (
            <BriefcaseFill className="text-primary" size={24} />
          )}
          <div>
            <span>
              {isRestore ? 'Restaurer un employé' : 'Nouvelle information professionnelle'}
            </span>
            {employeNom && (
              <small className="d-block text-muted" style={{ fontSize: '0.8rem' }}>
                pour {employeNom}
              </small>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        )}

        {isRestore && (
          <Alert variant="info" className="mb-4">
            <FaInfoCircle className="me-2" />
            Vous êtes en train de restaurer cet employé. Veuillez remplir ses nouvelles informations professionnelles.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Section: Informations de base */}
            <Col xs={12} className="mb-3">
              <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                <PersonBadgeFill className="text-primary" />
                <h6 className="mb-0">Informations professionnelles actuelles</h6>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Salaire de base (Ariary) *</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">Ar</span>
                  <Form.Control
                    type="number"
                    name="salaireBase"
                    value={infoPro.salaireBase}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min="0"
                    step="1000"
                    placeholder="Saisir le salaire"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Classification</Form.Label>
                <Form.Control
                  type="text"
                  name="classification"
                  value={infoPro.classification}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ex: Cadre, Agent de maîtrise..."
                />
              </Form.Group>
            </Col>

            {/* Section: Contrat */}
            <Col xs={12} className="mb-3 mt-2">
              <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                <BriefcaseFill className="text-primary" />
                <h6 className="mb-0">Contrat</h6>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type de contrat *</Form.Label>
                <Form.Select
                  name="typeContratId"
                  value={infoPro.typeContratId}
                  onChange={handleChange}
                  required
                  disabled={dataLoading || loading}
                >
                  <option value="">-- Choisir un type --</option>
                  {typeContrats.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.intitule}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type de temps de travail</Form.Label>
                <Form.Select
                  name="idTempsTravail"
                  value={infoPro.idTempsTravail}
                  onChange={handleChange}
                  disabled={dataLoading || loading}
                >
                  <option value="">-- Choisir un type --</option>
                  {typeTempsTravails.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.tempsTravail}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Section: Poste et département */}
            <Col xs={12} className="mb-3 mt-2">
              <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                <BuildingFill className="text-primary" />
                <h6 className="mb-0">Poste et département</h6>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Département *</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <BuildingFill size={14} />
                  </span>
                  <Form.Select
                    name="departementId"
                    value={infoPro.departementId}
                    onChange={handleChange}
                    required
                    disabled={dataLoading || loading}
                  >
                    <option value="">-- Choisir un département --</option>
                    {departements.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nom}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Poste *</Form.Label>
                <Form.Select
                  name="posteId"
                  value={infoPro.posteId}
                  onChange={handleChange}
                  required
                  disabled={!infoPro.departementId || loadingPostes || loading}
                >
                  <option value="">-- Choisir un poste --</option>
                  {postes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </Form.Select>
                {loadingPostes && (
                  <small className="text-muted">Chargement des postes...</small>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Manager assigné</Form.Label>
                <Form.Control
                  value={
                    loadingManager 
                      ? "Chargement du manager..." 
                      : assignedManager 
                        ? `${assignedManager.employe?.prenom || ''} ${assignedManager.employe?.nom || ''}`.trim()
                        : "Aucun manager assigné à ce département"
                  }
                  readOnly
                  disabled
                  className="bg-light"
                />
                {assignedManager && (
                  <Form.Text className="text-success">
                    ✓ Manager automatiquement assigné
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* Section: Catégorisation */}
            <Col xs={12} className="mb-3 mt-2">
              <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                <PeopleFill className="text-primary" />
                <h6 className="mb-0">Catégorisation</h6>
              </div>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Catégorie professionnelle</Form.Label>
                <Form.Select
                  name="idCategorie"
                  value={infoPro.idCategorie}
                  onChange={handleChange}
                  disabled={dataLoading || loading}
                >
                  <option value="">-- Choisir une catégorie --</option>
                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.libelle} ({categorie.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type d'entrée</Form.Label>
                <Form.Select
                  name="idTypeEntree"
                  value={infoPro.idTypeEntree}
                  onChange={handleChange}
                  disabled={dataLoading || loading}
                >
                  <option value="">-- Choisir un type d'entrée --</option>
                  {typeEntrees.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nom || type.libelle || type.typeEntree}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Section: Motif de restauration - Visible uniquement si isRestore = true */}
            {isRestore && (
              <>
                <Col xs={12} className="mb-3 mt-3">
                  <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                    <MdRestoreFromTrash className="text-success" />
                    <h6 className="mb-0">Restauration</h6>
                  </div>
                </Col>

                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <div className="d-flex align-items-center gap-2">
                        <FaCommentAlt className="text-secondary" size={16} />
                        <span>Motif de restauration <span className="text-danger">*</span></span>
                      </div>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="motifDesarchivage"
                      value={infoPro.motifDesarchivage}
                      onChange={handleChange}
                      required={isRestore}
                      placeholder="Indiquez la raison de la restauration de l'employé (ex: retour de congé, réintégration, nouvelle affectation, etc.)"
                      style={{ resize: 'vertical' }}
                    />
                    <Form.Text className="text-muted">
                      Ce motif sera enregistré dans l'historique de l'employé.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} className="mt-2">
                  <Alert variant="info" className="py-2 small">
                    <ArchiveFill className="me-2" size={14} />
                    En restaurant cet employé, une nouvelle information professionnelle sera créée avec la date du jour et l'employé repassera en statut actif.
                  </Alert>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="border-top bg-light">
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button 
            variant={isRestore ? "success" : "primary"} 
            onClick={handleSubmit} 
            disabled={loading || dataLoading || (isRestore && !infoPro.motifDesarchivage?.trim())}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                {isRestore ? 'Restauration...' : 'Enregistrement...'}
              </>
            ) : (
              <>
                {isRestore ? (
                  <MdRestoreFromTrash className="me-2" />
                ) : (
                  <CheckCircleFill className="me-2" />
                )}
                {isRestore ? 'Restaurer l\'employé' : 'Enregistrer'}
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AddInfoProfessionnelleModal;
