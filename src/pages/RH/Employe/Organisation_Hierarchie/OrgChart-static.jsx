// src/pages/RH/Organisation/OrgChart.jsx
import React, { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Badge, Avatar, Tooltip } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import "../../../../assets/css/OrgChart.css";

const OrgChart = () => {
  const [employees] = useState([
    { id: 1, nom: 'Dupont Jean', departement: 'IT', manager: 'Sophie Laurent', poste: 'Développeur Senior' },
    { id: 2, nom: 'Martin Marie', departement: 'IT', manager: 'Sophie Laurent', poste: 'Développeuse Frontend' },
    { id: 3, nom: 'Bernard Pierre', departement: 'Finance', manager: 'Paul Durand', poste: 'Analyste Financier' },
    { id: 4, nom: 'Sophie Laurent', departement: 'IT', manager: '', poste: 'Directrice IT' },
    { id: 5, nom: 'Paul Durand', departement: 'Finance', manager: '', poste: 'Directeur Finance' },
    { id: 6, nom: 'Thomas Legrand', departement: 'IT', manager: 'Sophie Laurent', poste: 'DevOps Engineer' }
  ]);

  // Fonction pour construire la structure hiérarchique
  const buildHierarchy = () => {
    const managerMap = new Map();
    
    // Créer les nœuds managers
    employees.forEach(emp => {
      if (!emp.manager) {
        managerMap.set(emp.nom, {
          ...emp,
          children: []
        });
      }
    });

    // Ajouter les employés sous leurs managers
    employees.forEach(emp => {
      if (emp.manager && managerMap.has(emp.manager)) {
        managerMap.get(emp.manager).children.push({
          ...emp,
          children: []
        });
      }
    });

    return Array.from(managerMap.values());
  };

  const hierarchy = buildHierarchy();

  // Composant pour un nœud d'employé
  const EmployeeNode = ({ employee }) => (
    <Tooltip 
      title={`${employee.poste} - ${employee.departement}`}
      placement="top"
    >
      <Card 
        className={`employee-card ${!employee.manager ? 'manager-card' : ''}`}
        size="small"
      >
        <div className="employee-content">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            className="employee-avatar"
            style={{ backgroundColor: !employee.manager ? '#b053ad' : '#52c41a' }}
          />
          <div className="employee-info">
            <div className="employee-name">{employee.nom}</div>
            <div className="employee-position">{employee.poste}</div>
            <Badge 
              count={employee.departement} 
              style={{ 
                backgroundColor: employee.departement === 'IT' ? '#b053ad' : '#52c41a',
                marginTop: '4px'
              }} 
            />
            {employee.children && employee.children.length > 0 && (
              <div className="team-size">
                <TeamOutlined /> {employee.children.length} collaborateurs
              </div>
            )}
          </div>
        </div>
      </Card>
    </Tooltip>
  );

  // Fonction récursive pour rendre l'arbre
  const renderTree = (data) => {
    return data.map((employee) => (
      <TreeNode 
        key={employee.id} 
        label={<EmployeeNode employee={employee} />}
      >
        {employee.children && employee.children.length > 0 && renderTree(employee.children)}
      </TreeNode>
    ));
  };

  return (
    <div className="org-chart-container">
      <div className="org-chart-header">
        <h1>Organigramme de l'Entreprise</h1>
        <p>Structure hiérarchique et organisationnelle</p>
      </div>
      
      <div className="org-chart-content">
        {hierarchy.map((rootEmployee, index) => (
          <div key={rootEmployee.id} className="department-tree">
            <div className="department-header">
              <h2>Département {rootEmployee.departement}</h2>
            </div>
            <Tree
              lineWidth="2px"
              lineColor="#e1b2db"
              lineBorderRadius="10px"
              label={<EmployeeNode employee={rootEmployee} />}
            >
              {rootEmployee.children && renderTree(rootEmployee.children)}
            </Tree>
          </div>
        ))}
      </div>

      <div className="org-chart-legend">
        <div className="legend-item">
          <Avatar size={20} style={{ backgroundColor: '#b053ad' }} />
          <span>Direction</span>
        </div>
        <div className="legend-item">
          <Avatar size={20} style={{ backgroundColor: '#52c41a' }} />
          <span>Collaborateurs</span>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
