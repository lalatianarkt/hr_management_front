import React, { useState, useEffect } from "react";
import axios from "axios";

const AddManager = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeInfosProfessionnelles, setEmployeeInfosProfessionnelles] = useState({});
  const [newManager, setNewManager] = useState({
    employeId: "",
    departementId: "",
    dateDebut: "",
    dateFin: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [debugInfo, setDebugInfo] = useState(""); // Pour le débogage

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, empRes] = await Promise.all([
          axios.get("http://localhost:8080/api/departements"),
          axios.get("http://localhost:8080/api/employes"),
        ]);
        setDepartments(depRes.data);
        setEmployees(empRes.data);
        setDebugInfo("Données chargées avec succès");
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
  }, []);

  // Fonction pour récupérer les infos professionnelles
  const fetchEmployeeInfosProfessionnelles = async (employeId) => {
    if (!employeId) {
      setEmployeeInfosProfessionnelles({});
      setNewManager(prev => ({ ...prev, departementId: "" }));
      setDebugInfo("Aucun employé sélectionné");
      return;
    }

    try {
      setDebugInfo(`Chargement infos pour employé: ${employeId}`);
      const response = await axios.get(`http://localhost:8080/api/infosPro/emp/${employeId}`);
      console.log("Réponse API infosPro:", response);
      
      if (response.data && response.data.id) {
        const infoData = response.data;
        console.log("Données reçues:", infoData);
        setEmployeeInfosProfessionnelles(infoData);
        
        // DEBUG: Vérifier la structure des données
        console.log("Poste:", infoData.poste);
        console.log("Département:", infoData.poste?.departement);
        
        if (infoData.poste && infoData.poste.departement && infoData.poste.departement.id) {
          const deptId = infoData.poste.departement.id;
          setNewManager(prev => ({ 
            ...prev, 
            departementId: deptId 
          }));
          setDebugInfo(`Département trouvé: ${deptId}`);
          setMessage({ 
            type: "success", 
            text: `Département automatiquement détecté: ${infoData.poste.departement.nom}` 
          });
        } else {
          setNewManager(prev => ({ ...prev, departementId: "" }));
          setDebugInfo("Aucun département trouvé dans les infos");
          setMessage({ 
            type: "warning", 
            text: "Cet employé n'a pas de département associé à son poste." 
          });
        }
      } else {
        setDebugInfo("Aucune donnée reçue de l'API");
        setMessage({ 
          type: "warning", 
          text: "Aucune information professionnelle trouvée." 
        });
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setDebugInfo(`Erreur API: ${error.message}`);
      setMessage({ 
        type: "error", 
        text: `Erreur: ${error.response?.data?.message || error.message}` 
      });
    }
  };

  const handleChange = async (field, value) => {
    console.log(`Changement ${field}: ${value}`);
    setDebugInfo(`Champ ${field} modifié: ${value}`);
    
    if (field === "employeId") {
      setNewManager(prev => ({ ...prev, [field]: value }));
      setMessage({ type: "", text: "" });
      await fetchEmployeeInfosProfessionnelles(value);
    } else {
      setNewManager(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("=== DÉBUT DE LA SOUMISSION ===");
    console.log("État actuel de newManager:", newManager);
    console.log("DateDebut:", newManager.dateDebut);
    console.log("DepartementId:", newManager.departementId);
    console.log("EmployeId:", newManager.employeId);
    
    // VALIDATION DÉTAILLÉE
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

      console.log("Payload envoyé:", JSON.stringify(payload, null, 2));

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
        
        // Réinitialisation
        setNewManager({ 
          employeId: "", 
          departementId: "", 
          dateDebut: "", 
          dateFin: "" 
        });
        setEmployeeInfosProfessionnelles({});
      }

    } catch (error) {
      console.error("Erreur complète:", error);
      console.error("Response error:", error.response);
      
      let errorMessage = "Erreur lors de l'ajout du manager !";
      
      if (error.response?.data) {
        console.error("Données d'erreur:", error.response.data);
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      JSON.stringify(error.response.data);
      }
      
      setMessage({ type: "error", text: errorMessage });
      setDebugInfo(`Erreur: ${errorMessage}`);
    } finally {
      setSaving(false);
      console.log("=== FIN DE LA SOUMISSION ===");
    }
  };

  // RÉINITIALISER LE MESSAGE
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  if (loading) return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="ms-2">Chargement des employés et départements...</span>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Ajouter un nouveau Manager</h2>
          <button 
            type="button" 
            className="btn btn-sm btn-light"
            onClick={() => {
              console.log("=== ÉTAT ACTUEL ===");
              console.log("newManager:", newManager);
              console.log("employeeInfosProfessionnelles:", employeeInfosProfessionnelles);
              console.log("debugInfo:", debugInfo);
            }}
          >
            Debug
          </button>
        </div>
        
        <div className="card-body">
          {/* AFFICHAGE DES MESSAGES */}
          {message.text && (
            <div className={`alert ${
              message.type === "success" ? "alert-success" : 
              message.type === "warning" ? "alert-warning" : "alert-danger"
            } alert-dismissible fade show`} role="alert">
              <strong>{message.type === "success" ? "Succès!" : 
                      message.type === "warning" ? "Attention!" : "Erreur!"}</strong>
              <div className="mt-1">{message.text}</div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setMessage({ type: "", text: "" })}
              ></button>
            </div>
          )}

          {/* INFO DÉBOGAGE */}
          <div className="alert alert-secondary small">
            <strong>État actuel:</strong>
            <div className="mt-1">
              Employé: {newManager.employeId || "Non sélectionné"} | 
              Département: {newManager.departementId || "Non détecté"} | 
              Date début: {newManager.dateDebut || "Non définie"}
            </div>
            <div className="mt-1">
              <small>Bouton actif: {(!newManager.departementId || !newManager.dateDebut) ? "NON" : "OUI"}</small>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Employé *</label>
                <select
                  className="form-select"
                  value={newManager.employeId}
                  onChange={e => handleChange("employeId", e.target.value)}
                  required
                >
                  <option value="">-- Sélectionner un employé --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nom} {emp.prenom} ({emp.id})
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  {newManager.employeId ? `Employé sélectionné: ${newManager.employeId}` : "Sélectionnez un employé"}
                </div>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Département *</label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${newManager.departementId ? "border-success" : "border-warning"}`}
                    value={
                      newManager.departementId 
                        ? departments.find(d => d.id === newManager.departementId)?.nom || 
                          employeeInfosProfessionnelles.poste?.departement?.nom || 
                          "Département inconnu"
                        : "Sélectionnez un employé pour voir son département"
                    }
                    readOnly
                  />
                  {newManager.departementId && (
                    <span className="input-group-text text-success">
                      OK
                    </span>
                  )}
                </div>
                <div className="form-text">
                  {newManager.departementId 
                    ? `ID du département: ${newManager.departementId}`
                    : "En attente de sélection d'un employé"
                  }
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Date début d'assignation *</label>
                <div className="input-group">
                  <input
                    type="date"
                    className={`form-control ${newManager.dateDebut ? "border-success" : ""}`}
                    value={newManager.dateDebut}
                    onChange={(e) => handleChange("dateDebut", e.target.value)}
                    required
                  />
                  {newManager.dateDebut && (
                    <span className="input-group-text text-success">
                      OK
                    </span>
                  )}
                </div>
                <div className="form-text">
                  {newManager.dateDebut 
                    ? `Date sélectionnée: ${newManager.dateDebut}`
                    : "Sélectionnez une date de début"
                  }
                </div>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Date fin d'assignation (optionnel)</label>
                <input
                  type="date"
                  className="form-control"
                  value={newManager.dateFin}
                  onChange={(e) => handleChange("dateFin", e.target.value)}
                  min={newManager.dateDebut || undefined}
                />
                <div className="form-text">
                  {newManager.dateFin 
                    ? `Date de fin: ${newManager.dateFin}`
                    : "Laisser vide si l'assignation est permanente"
                  }
                </div>
              </div>
            </div>

            {/* RÉSUMÉ */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <strong>Résumé de l'opération</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${newManager.employeId ? "bg-success bg-opacity-10" : "bg-light"}`}>
                      <strong>Employé:</strong><br/>
                      {newManager.employeId ? "Sélectionné" : "Non sélectionné"}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${newManager.departementId ? "bg-success bg-opacity-10" : "bg-light"}`}>
                      <strong>Département:</strong><br/>
                      {newManager.departementId ? "Détecté" : "Non détecté"}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${newManager.dateDebut ? "bg-success bg-opacity-10" : "bg-light"}`}>
                      <strong>Date début:</strong><br/>
                      {newManager.dateDebut ? "Définie" : "Non définie"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <button 
                type="submit" 
                className="btn btn-success px-4 py-2" 
                disabled={saving || !newManager.departementId || !newManager.dateDebut}
                title={!newManager.departementId ? "Sélectionnez d'abord un employé" : 
                       !newManager.dateDebut ? "Définissez une date de début" : 
                       "Cliquez pour ajouter le manager"}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Ajouter le Manager
                  </>
                )}
              </button>
              
              <div>
                <div className="text-muted small">
                  {!newManager.departementId && "Sélectionnez un employé pour détecter son département"}
                  {!newManager.dateDebut && newManager.departementId && "Définissez une date de début"}
                  {newManager.departementId && newManager.dateDebut && "Prêt à envoyer"}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddManager;
