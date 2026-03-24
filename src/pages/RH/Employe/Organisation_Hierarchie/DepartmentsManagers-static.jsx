// src/pages/RH/Organisation/DepartmentsManagers.jsx
import React, { useState } from 'react';

const DepartmentsManagers = () => {
  const [departments, setDepartments] = useState(['IT', 'RH', 'Finance']);
  const [managers, setManagers] = useState(['Sophie Laurent', 'Paul Durand']);
  const [newDept, setNewDept] = useState('');
  const [newManager, setNewManager] = useState('');

  const addDepartment = () => {
    if (newDept) {
      setDepartments([...departments, newDept]);
      setNewDept('');
    }
  };

  const addManager = () => {
    if (newManager) {
      setManagers([...managers, newManager]);
      setNewManager('');
    }
  };

  return (
    <div className="container">
      <h2>Gestion des Départements et Managers</h2>

      <div className="mb-4">
        <h4>Départements</h4>
        <ul>
          {departments.map((dep, idx) => <li key={idx}>{dep}</li>)}
        </ul>
        <input 
          type="text" 
          value={newDept} 
          onChange={(e) => setNewDept(e.target.value)} 
          placeholder="Nouveau département" 
        />
        <button className="btn btn-success ms-2" onClick={addDepartment}>Ajouter</button>
      </div>

      <div>
        <h4>Managers</h4>
        <ul>
          {managers.map((m, idx) => <li key={idx}>{m}</li>)}
        </ul>
        <input 
          type="text" 
          value={newManager} 
          onChange={(e) => setNewManager(e.target.value)} 
          placeholder="Nouveau manager" 
        />
        <button className="btn btn-success ms-2" onClick={addManager}>Ajouter</button>
      </div>
    </div>
  );
};

export default DepartmentsManagers;
