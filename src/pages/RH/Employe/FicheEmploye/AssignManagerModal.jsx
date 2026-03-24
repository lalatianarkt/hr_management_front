// AssignManagerModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  Card,
  Row,
  Col,
  InputGroup,
  Badge
} from "react-bootstrap";
import {
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaHistory
} from "react-icons/fa";

const AssignManagerModal = ({ show, onHide, onSuccess }) => {
  // États
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeInfosProfessionnellesList, setEmployeeInfosProfessionnellesList] = useState([]);
  const [activeInfoPro, setActiveInfoPro] = useState(null);
  const [newManager, setNewManager] = useState({
    employeId: "",
    departementId: "",
    dateDebut: "",
    dateFin: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [debugInfo, setDebugInfo] = useState("");
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (show) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setMessage({ type: "", text: "" });

          const [depRes, empRes] = await Promise.all([
            axios.get("http://localhost:8080/api/departements/allEmpNotAssignedToManager"),
            axios.get("http://localhost:8080/api/employes"),
          ]);

          setDepartments(depRes.data || []);
          setEmployees(empRes.data || []);
          setDebugInfo("Données chargées avec succès");

          // Réinitialiser le formulaire
          setNewManager({
            employeId: "",
            departementId: "",
            dateDebut: "",
            dateFin: ""
          });
          setEmployeeInfosProfessionnellesList([]);
          setActiveInfoPro(null);
          setEmployeeHistory([]);

        } catch (error) {
          console.error("Erreur lors du chargement :", error);
          setMessage({
            type: "error",
            text: "Impossible de charger les données !"
          });
          setDebugInfo(`Erreur chargement: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [show]);

  // Trouver l'information professionnelle active
  const findActiveInfoPro = useCallback((infosProList) => {
    if (!infosProList || infosProList.length === 0) return null;

    // 1. Chercher celles sans date de fin (actives)
    const activeInfos = infosProList.filter(info =>
      !info.dateFinAssignationPoste &&
      info.dateDebutAssignationPoste &&
      info.dateDebutAssignationPoste <= new Date().toISOString().split('T')[0]
    );

    if (activeInfos.length === 1) return activeInfos[0];
    if (activeInfos.length > 1) {
      // Prendre la plus récente
      return activeInfos.sort((a, b) =>
        new Date(b.dateDebutAssignationPoste) - new Date(a.dateDebutAssignationPoste)
      )[0];
    }

    // 2. Si aucune active, prendre la plus récente
    const sortedInfos = [...infosProList].sort((a, b) => {
      if (!a.dateDebutAssignationPoste) return 1;
      if (!b.dateDebutAssignationPoste) return -1;
      return new Date(b.dateDebutAssignationPoste) - new Date(a.dateDebutAssignationPoste);
    });

    return sortedInfos[0] || null;
  }, []);

  // Récupérer les infos professionnelles de l'employé
  const fetchEmployeeInfosProfessionnelles = async (employeId) => {
    if (!employeId) {
      setEmployeeInfosProfessionnellesList([]);
      setActiveInfoPro(null);
      setNewManager(prev => ({ ...prev, departementId: "" }));
      setEmployeeHistory([]);
      setDebugInfo("Aucun employé sélectionné");
      return;
    }

    try {
      setDebugInfo(`Chargement infos pour employé: ${employeId}`);

      // Appel API pour récupérer TOUTES les infos pro de l'employé
      const response = await axios.get(`http://localhost:8080/api/infosPro/emp/${employeId}`);

      if (response.data && Array.isArray(response.data)) {
        const infosProList = response.data;
        setEmployeeInfosProfessionnellesList(infosProList);

        // Trouver l'info pro active
        const activeInfo = findActiveInfoPro(infosProList);
        setActiveInfoPro(activeInfo);

        // Préparer l'historique pour l'affichage
        const history = infosProList.map(info => ({
          id: info.id,
          dateDebut: info.dateDebutAssignationPoste,
          dateFin: info.dateFinAssignationPoste,
          poste: info.poste?.nom || "Non spécifié",
          departement: info.poste?.departement?.nom || info.departement?.nom || "Non spécifié",
          typeContrat: info.typeContrat?.intitule || "Non spécifié",
          statut: info.statut,
          isActive: !info.dateFinAssignationPoste
        })).sort((a, b) => new Date(b.dateDebut || 0) - new Date(a.dateDebut || 0));

        setEmployeeHistory(history);

        // Déterminer le département
        let deptId = "";
        if (activeInfo) {
          // Priorité 1: département du poste
          if (activeInfo.poste?.departement?.id) {
            deptId = activeInfo.poste.departement.id;
          }
          // Priorité 2: département direct dans l'info pro
          else if (activeInfo.departement?.id) {
            deptId = activeInfo.departement.id;
          }

          if (deptId) {
            setNewManager(prev => ({
              ...prev,
              departementId: deptId
            }));
            setDebugInfo(`Département trouvé: ${deptId} (${activeInfo.poste?.departement?.nom || activeInfo.departement?.nom})`);
            setMessage({
              type: "success",
              text: `Département détecté: ${activeInfo.poste?.departement?.nom || activeInfo.departement?.nom}`
            });
          } else {
            setNewManager(prev => ({ ...prev, departementId: "" }));
            setDebugInfo("Aucun département trouvé dans les infos");
            setMessage({
              type: "warning",
              text: "Cet employé n'a pas de département associé."
            });
          }
        } else {
          setNewManager(prev => ({ ...prev, departementId: "" }));
          setDebugInfo("Aucune info pro active trouvée");
          setMessage({
            type: "warning",
            text: "Aucune affectation active trouvée pour cet employé."
          });
        }
      } else {
        setDebugInfo("Format de données inattendu");
        setMessage({
          type: "warning",
          text: "Format des données professionnelles inattendu."
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setDebugInfo(`Erreur API: ${error.message}`);
      setMessage({
        type: "error",
        text: `Erreur: ${error.response?.data?.message || error.message}`
      });
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = async (field, value) => {
    setDebugInfo(`Champ ${field} modifié: ${value}`);

    if (field === "employeId") {
      setNewManager(prev => ({ ...prev, [field]: value }));
      setMessage({ type: "", text: "" });
      await fetchEmployeeInfosProfessionnelles(value);
    } else {
      setNewManager(prev => ({ ...prev, [field]: value }));
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Données à envoyer:", newManager);

    // Validation
    const errors = [];
    if (!newManager.employeId) errors.push("Veuillez sélectionner un employé");
    if (!newManager.departementId) errors.push("Aucun département détecté");
    if (!newManager.dateDebut) errors.push("Veuillez sélectionner une date de début");

    if (errors.length > 0) {
      setMessage({
        type: "error",
        text: errors.join(" | ")
      });
      setDebugInfo(`Erreurs de validation: ${errors.join(", ")}`);
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Construction du payload
      const payload = {
        dateDebut: newManager.dateDebut,
        dateFin: newManager.dateFin || null,
        employe: { id: newManager.employeId },
        departement: { id: newManager.departementId }
      };

      console.log("Payload envoyé:", payload);

      // Appel API
      const response = await axios.post(
        "http://localhost:8080/api/managers/insertManagerDepartment",
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Réponse API:", response);

      if (response.status === 200 || response.status === 201) {
        const successMessage = response.data?.message || "Manager ajouté avec succès !";
        setMessage({ type: "success", text: successMessage });
        setDebugInfo(`Succès: ${successMessage}`);

        // Réinitialiser le formulaire
        setNewManager({
          employeId: "",
          departementId: "",
          dateDebut: "",
          dateFin: ""
        });
        setEmployeeInfosProfessionnellesList([]);
        setActiveInfoPro(null);

        // Appeler le callback de succès
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onHide();
          }, 1500);
        }
      }

    } catch (error) {
      console.error("Erreur:", error);

      let errorMessage = "Erreur lors de l'ajout du manager !";

      if (error.response?.data) {
        errorMessage = error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      }

      setMessage({ type: "error", text: errorMessage });
      setDebugInfo(`Erreur: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Obtenir l'employé sélectionné
  const getSelectedEmployee = () => {
    return employees.find(emp => emp.id === newManager.employeId);
  };

  // Obtenir le département sélectionné
  const getSelectedDepartment = () => {
    return departments.find(dept => dept.id === newManager.departementId);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "En cours";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Vérifier si l'employé a un historique
  const hasHistory = employeeHistory.length > 0;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ background: 'var(--bg-gradient)', color: 'white', borderBottom: 'none' }}>
        <Modal.Title>
          <FaUser className="me-2" />
          Affecter un Manager
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* Messages d'alerte */}
            {message.text && (
              <Alert
                variant={
                  message.type === "success" ? "success" :
                    message.type === "warning" ? "warning" : "danger"
                }
                dismissible
                onClose={() => setMessage({ type: "", text: "" })}
              >
                <FaInfoCircle className="me-2" />
                {message.text}
              </Alert>
            )}

            {/* Formulaire */}
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaUser className="me-2" />
                      Employé *
                    </Form.Label>
                    <Form.Select
                      value={newManager.employeId}
                      onChange={e => handleChange("employeId", e.target.value)}
                      required
                      disabled={saving}
                    >
                      <option value="">-- Sélectionner un employé --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nomComplet || `${emp.nom} ${emp.prenom}`}
                          {emp.matricule ? ` - ${emp.matricule}` : ` - ${emp.id.substring(0, 8)}`}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {newManager.employeId
                        ? `ID: ${newManager.employeId}`
                        : "Choisissez un employé à promouvoir manager"
                      }
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaBuilding className="me-2" />
                      Département *
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={
                          newManager.departementId
                            ? getSelectedDepartment()?.nom ||
                            activeInfoPro?.poste?.departement?.nom ||
                            activeInfoPro?.departement?.nom ||
                            "Département inconnu"
                            : "Sélectionnez un employé d'abord"
                        }
                        readOnly
                        className={newManager.departementId ? "border-success" : "border-warning"}
                      />
                      {newManager.departementId && (
                        <InputGroup.Text className="bg-success text-white">
                          <FaCheckCircle />
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                    <Form.Text className="text-muted">
                      {newManager.departementId
                        ? `ID: ${newManager.departementId}`
                        : "Sera détecté automatiquement"
                      }
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Informations sur l'affectation actuelle */}
              {activeInfoPro && (
                <Card className="mb-3 border-info">
                  <Card.Header className="bg-info bg-opacity-10">
                    <strong>Affectation actuelle détectée</strong>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <small className="text-muted">Poste:</small>
                        <div className="fw-medium">{activeInfoPro.poste?.nom || "Non spécifié"}</div>
                      </Col>
                      <Col md={6}>
                        <small className="text-muted">Contrat:</small>
                        <div className="fw-medium">{activeInfoPro.typeContrat?.intitule || "Non spécifié"}</div>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col md={6}>
                        <small className="text-muted">Date début:</small>
                        <div className="fw-medium">{formatDate(activeInfoPro.dateDebutAssignationPoste)}</div>
                      </Col>
                      <Col md={6}>
                        <small className="text-muted">Statut:</small>
                        <div>
                          <Badge bg={activeInfoPro.dateFinAssignationPoste ? "secondary" : "success"}>
                            {activeInfoPro.dateFinAssignationPoste ? "Terminée" : "Active"}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Bouton pour voir l'historique */}
              {hasHistory && (
                <div className="mb-3">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <FaHistory className="me-1" />
                    {showHistory ? "Masquer l'historique" : "Voir l'historique des affectations"}
                    <Badge bg="secondary" className="ms-2">{employeeHistory.length}</Badge>
                  </Button>

                  {showHistory && (
                    <Card className="mt-2 border-info">
                      <Card.Body className="p-2">
                        <small className="text-muted d-block mb-2">Historique des affectations :</small>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {employeeHistory.map((item, index) => (
                            <div
                              key={item.id}
                              className={`p-2 mb-1 rounded ${item.isActive ? 'bg-success bg-opacity-10' : 'bg-light'}`}
                            >
                              <div className="d-flex justify-content-between">
                                <span>
                                  <strong>{item.poste}</strong> - {item.departement}
                                </span>
                                <Badge bg={item.isActive ? "success" : "secondary"} size="sm">
                                  {item.isActive ? "Actif" : "Inactif"}
                                </Badge>
                              </div>
                              <small className="text-muted">
                                {formatDate(item.dateDebut)} → {formatDate(item.dateFin)}
                              </small>
                            </div>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      Date de début *
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="date"
                        value={newManager.dateDebut}
                        onChange={e => handleChange("dateDebut", e.target.value)}
                        required
                        disabled={saving}
                        min={getSelectedEmployee()?.dateEmbauche}
                      />
                      {newManager.dateDebut && (
                        <InputGroup.Text className="bg-success text-white">
                          <FaCheckCircle />
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Date à partir de laquelle l'employé devient manager
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      <FaCalendarAlt className="me-2" />
                      Date de fin (optionnel)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={newManager.dateFin}
                      onChange={e => handleChange("dateFin", e.target.value)}
                      disabled={saving}
                      min={newManager.dateDebut || undefined}
                    />
                    <Form.Text className="text-muted">
                      Laisser vide si l'affectation est permanente
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* État de validation */}
              <div className="mb-4">
                <div className={`alert ${newManager.employeId && newManager.departementId && newManager.dateDebut
                    ? "alert-success"
                    : "alert-warning"
                  }`}>
                  <div className="d-flex align-items-center">
                    {newManager.employeId && newManager.departementId && newManager.dateDebut ? (
                      <>
                        <FaCheckCircle className="me-2" />
                        <span>Tous les champs sont valides. Prêt à créer le manager.</span>
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="me-2" />
                        <span>
                          {!newManager.employeId && "Sélectionnez un employé • "}
                          {!newManager.departementId && "Attendez la détection du département • "}
                          {!newManager.dateDebut && "Définissez une date de début"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between pt-3 border-top">
                <Button
                  variant="secondary"
                  onClick={onHide}
                  disabled={saving}
                >
                  <FaTimes className="me-1" />
                  Annuler
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    saving ||
                    !newManager.employeId ||
                    !newManager.departementId ||
                    !newManager.dateDebut
                  }
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-1" />
                      Affecter comme Manager
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AssignManagerModal;
