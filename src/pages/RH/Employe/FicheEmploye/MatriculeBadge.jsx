// src/pages/EmployeeInfo.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Badge,
} from 'react-bootstrap';
import { 
  Hash
} from 'react-bootstrap-icons';

// Ajoutez ce composant juste après les autres composants réutilisables, avant la fonction EmployeeInfo
export const MatriculeBadge = ({ matricule, type = 'badge' }) => {
  if (!matricule) {
    return (
      <Badge bg="warning" text="dark" className="fw-semibold px-3 py-2">
        <Hash size={12} className="me-2" />
        Matricule non attribué
      </Badge>
    );
  }

  if (type === 'text') {
    return (
      <div className="d-flex align-items-center gap-2">
        <Hash size={14} className="text-primary" />
        <span className="fw-semibold">{matricule}</span>
      </div>
    );
  }

  return (
    <Badge bg="primary" className="fw-semibold px-3 py-2 d-flex align-items-center gap-2">
      <Hash size={14} />
      <span>{matricule}</span>
    </Badge>
  );
};
