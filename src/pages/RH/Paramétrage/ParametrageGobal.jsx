// src/pages/Parametrage/CongesIrsaPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Alert } from 'react-bootstrap';
import { 
  Calendar, 
  DollarSign, 
  XCircle, 
  Settings,
  ArrowLeft 
} from 'react-feather';
import { useNavigate } from 'react-router-dom';
import ReglesCongesCRUD from './ReglesConges';
import BaseIrsaCRUD from './BaseIrsa';
import ReglesAnnulationCRUD from './ReglesAnnulation';

const ParametrageGlobal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('regles-conges');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard-RH')}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            >
              <ArrowLeft size={16} />
              Retour
            </button>
            <h1 className="h3 mb-0">Paramétrage - Congés & IRSA</h1>
          </div>
        </Col>
      </Row>

      {/* Notification */}
      {notification && (
        <Alert 
          variant={notification.type} 
          className="mb-4"
          dismissible
          onClose={() => setNotification(null)}
        >
          {notification.message}
        </Alert>
      )}

      {/* Onglets */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom p-0">
          <Nav variant="tabs" className="px-3 pt-2">
            <Nav.Item>
              <Nav.Link 
                eventKey="regles-conges"
                active={activeTab === 'regles-conges'}
                onClick={() => setActiveTab('regles-conges')}
                className="d-flex align-items-center gap-2"
              >
                <Calendar size={18} />
                <span>Règles de congés</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="base-irsa"
                active={activeTab === 'base-irsa'}
                onClick={() => setActiveTab('base-irsa')}
                className="d-flex align-items-center gap-2"
              >
                
                <span>Barème IRSA</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="regles-annulation"
                active={activeTab === 'regles-annulation'}
                onClick={() => setActiveTab('regles-annulation')}
                className="d-flex align-items-center gap-2"
              >
                <XCircle size={18} />
                <span>Règles d'annulation</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        
        <Card.Body>
          {activeTab === 'regles-conges' && (
            <ReglesCongesCRUD showNotification={showNotification} />
          )}
          {activeTab === 'base-irsa' && (
            <BaseIrsaCRUD showNotification={showNotification} />
          )}
          {activeTab === 'regles-annulation' && (
            <ReglesAnnulationCRUD showNotification={showNotification} />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ParametrageGlobal;