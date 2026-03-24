// src/pages/RH/Organisation/AssignEmployee.jsx
import React, { useState } from 'react';

const AssignEmployee = () => {
  const [employees, setEmployees] = useState([
    { id: 1, nom: 'Dupont Jean', departement: '', manager: '' },
    { id: 2, nom: 'Martin Marie', departement: '', manager: '' },
    { id: 3, nom: 'Bernard Pierre', departement: '', manager: '' }
  ]);

  const departments = ['IT', 'RH', 'Finance', 'Marketing'];
  const managers = ['Sophie Laurent', 'Paul Durand', 'Claire Martin'];

  const handleChange = (id, field, value) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const handleSave = () => {
    console.log('Données à sauvegarder:', employees);
    alert('Affectations sauvegardées (console log)');
  };

  return (
    <div className="container">
      <h2>Assignation des employés</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Employé</th>
            <th>Département</th>
            <th>Manager</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.nom}</td>
              <td>
                <select 
                  value={emp.departement} 
                  onChange={(e) => handleChange(emp.id, 'departement', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </td>
              <td>
                <select 
                  value={emp.manager} 
                  onChange={(e) => handleChange(emp.id, 'manager', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {managers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
    </div>
  );
};

export default AssignEmployee;
