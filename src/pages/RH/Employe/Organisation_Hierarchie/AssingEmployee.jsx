// src/pages/RH/Organisation/AssignEmployee.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charger les employés (non-managers) et managers depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, manRes] = await Promise.all([
          axios.get("http://localhost:8080/api/employes"),
          axios.get("http://localhost:8080/api/managers"),
        ]);

        // Filtrer les employés qui ne sont pas managers
        const nonManagers = empRes.data.filter(
          (emp) => !manRes.data.some((m) => m.employe.id === emp.id)
        );

        console.log("employes:", empRes.data);
        console.log("managers:", manRes.data);

        setEmployees(nonManagers); 
        // setEmployees(empRes.data);
        setManagers(manRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        alert("Impossible de charger les données !");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sauvegarder l'affectation
  const handleAssign = async () => {
    if (!selectedManager || !selectedEmployee || !dateDebut) {
      alert("Veuillez remplir le manager, l'employé et la date de début !");
      return;
    }

    setSaving(true);
    try {
        console.log("date début : ", dateDebut);
        const payload = {
        employe: {id : selectedEmployee},
        manager: {id: selectedManager},
        dateDebut: dateDebut,
        dateFin: dateFin || null
      }; 
        
        await axios.post("http://localhost:8080/api/manager-employe", 
            payload
        );

      alert("Employé affecté au manager avec succès !");
      // Réinitialiser les sélections
      setSelectedEmployee("");
      setSelectedManager("");
      setDateDebut("");
      setDateFin("");
      // Optionnel : retirer l'employé affecté de la liste
      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== selectedEmployee)
      );
    } catch (error) {
      console.error("Erreur lors de l'affectation :", error);
      alert("Erreur lors de l'affectation !");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-4">Chargement des données...</p>;

  return (
    <div className="container mt-4">
      <h2>Organisation & Hiérarchie</h2>

      <div className="card mt-4 p-3">
        <h4>Affecter un employé à un manager</h4>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Manager :</label>
            <select
              className="form-select"
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
            >
              <option value="">-- Sélectionner le manager --</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {/* {m.id} */}
                   {m.employe.nom} {m.employe.prenom} 
                   {/* ({m.}) */}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label>Employé :</label>
            <select
              className="form-select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">-- Sélectionner l'employé --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {/* {emp.id} */}
                  {emp.nom} {emp.prenom}
                </option> 
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Date de début :</label>
            <input
              type="date"
              className="form-control"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label>Date de fin (facultatif) :</label>
            <input
              type="date"
              className="form-control"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAssign}
          disabled={saving}
        >
          {saving ? "Enregistrement..." : "Affecter l'employé"}
        </button>
      </div>
    </div>
  );
};

export default AssignEmployee;
