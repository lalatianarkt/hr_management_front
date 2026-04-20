// src/pages/RH/Employe/FicheEmploye/export/ExportConfiguration.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
  Accordion
} from 'react-bootstrap';
import {
  Save,
  RefreshCw,
  CheckSquare,
  Square,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Award,
  Users,
  Heart,
  Flag,
  AlertCircle,
  FileText,
  Home,
  UserCheck,
  Download
} from 'react-feather';
import {
  FaCrown,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
  FaUserTie,
  FaMoneyBillWave
} from 'react-icons/fa';
import axiosInstance from '../../../../utils/AxiosInstance';

function ExportConfiguration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [config, setConfig] = useState(null);

  // Charger la configuration
  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/api/preparation-export');
      setConfig(response.data);
      console.log('Configuration chargée:', response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field) => {
    setConfig(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await axiosInstance.post('/api/preparation-export', config);
      setSuccess('Configuration sauvegardée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la configuration par défaut ?')) {
      try {
        setSaving(true);
        const response = await axiosInstance.delete('/api/preparation-export/reset');
        setConfig(response.data);
        setSuccess('Configuration réinitialisée avec succès');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        setError('Erreur lors de la réinitialisation');
      } finally {
        setSaving(false);
      }
    }
  };

  const getSelectedCount = () => {
    if (!config) return 0;
    // Liste des champs booléens à compter (sans le préfixe "is")
    const booleanFields = [
      'matricule', 'nom', 'prenom', 'dateNaissance', 'email', 'cin', 
      'lieuNaissance', 'telephone', 'codePostal', 'adresse', 'numCnaps', 
      'numOstie', 'nomCompletMere', 'nomCompletPere', 'nbEnfants', 'nomConjoint',
      'modePaiementNomBanque', 'modePaiementCodeBanque', 'modePaiementCodeGuichet',
      'infoProDateEmbauche', 'infoProSalaireBase', 'infoProClassification',
      'infoProPeriodicitePaiement', 'infoProCategorie', 'infoProPoste',
      'infoProDepartement', 'situationFamiliale', 'nationalite', 'sexe',
      'emergencyContactTelephone', 'emergencyContactNom', 'emergencyContactEmail'
    ];
    return booleanFields.filter(field => config[field] === true).length;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement de la configuration...</span>
      </Container>
    );
  }

  const selectedCount = getSelectedCount();
  const totalFields = 33; // Nombre total de champs booléens

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <Download size={28} className="me-2 text-primary" />
                Configuration d'export des employés
              </h1>
              <p className="text-muted mb-0">
                Sélectionnez les colonnes à inclure lors de l'export des données employés
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleReset}
                disabled={saving}
              >
                <RefreshCw size={16} className="me-2" />
                Réinitialiser
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">
          <FaCheckCircle className="me-2" />
          {success}
        </Alert>
      )}

      {/* Statistiques */}
      <Card className="mb-4 border-0 shadow-sm bg-white">
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary text-white rounded-circle p-3">
                  <FileText size={24} />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">{selectedCount} / {totalFields}</h5>
                  <p className="text-muted mb-0">colonnes sélectionnées</p>
                </div>
              </div>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <Badge bg="success" className="px-3 py-2">
                <CheckSquare size={12} className="me-1" />
                Export personnalisable
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Formulaire de configuration */}
      <Accordion defaultActiveKey={['0', '1', '2', '3', '4']} alwaysOpen>
        {/* Section Informations personnelles */}
        <Accordion.Item eventKey="0" className="mb-3 border rounded">
          <Accordion.Header className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <User size={18} className="text-primary" />
              <strong>Informations personnelles</strong>
              <Badge bg="info" className="ms-2">
                {config ? [
                  'matricule', 'nom', 'prenom', 'dateNaissance', 'email', 
                  'cin', 'lieuNaissance', 'telephone', 'codePostal', 'adresse',
                  'numCnaps', 'numOstie', 'nationalite', 'sexe'
                ].filter(field => config[field] === true).length : 0} sélectionnée(s)
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="matricule"
                  label={
                    <span className="d-flex align-items-center">
                      <Badge bg="secondary" className="me-2">EMP</Badge>
                      Matricule
                    </span>
                  }
                  checked={config?.matricule === true}
                  onChange={() => handleCheckboxChange('matricule')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="nom"
                  label="Nom"
                  checked={config?.nom === true}
                  onChange={() => handleCheckboxChange('nom')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="prenom"
                  label="Prénom"
                  checked={config?.prenom === true}
                  onChange={() => handleCheckboxChange('prenom')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="dateNaissance"
                  label={
                    <span className="d-flex align-items-center">
                      <Calendar size={14} className="me-1" />
                      Date de naissance
                    </span>
                  }
                  checked={config?.dateNaissance === true}
                  onChange={() => handleCheckboxChange('dateNaissance')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="email"
                  label={
                    <span className="d-flex align-items-center">
                      <Mail size={14} className="me-1" />
                      Email
                    </span>
                  }
                  checked={config?.email === true}
                  onChange={() => handleCheckboxChange('email')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="telephone"
                  label={
                    <span className="d-flex align-items-center">
                      <Phone size={14} className="me-1" />
                      Téléphone
                    </span>
                  }
                  checked={config?.telephone === true}
                  onChange={() => handleCheckboxChange('telephone')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="adresse"
                  label={
                    <span className="d-flex align-items-center">
                      <MapPin size={14} className="me-1" />
                      Adresse
                    </span>
                  }
                  checked={config?.adresse === true}
                  onChange={() => handleCheckboxChange('adresse')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="codePostal"
                  label="Code postal"
                  checked={config?.codePostal === true}
                  onChange={() => handleCheckboxChange('codePostal')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="cin"
                  label="CIN"
                  checked={config?.cin === true}
                  onChange={() => handleCheckboxChange('cin')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="lieuNaissance"
                  label="Lieu de naissance"
                  checked={config?.lieuNaissance === true}
                  onChange={() => handleCheckboxChange('lieuNaissance')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="nationalite"
                  label={
                    <span className="d-flex align-items-center">
                      <Flag size={14} className="me-1" />
                      Nationalité
                    </span>
                  }
                  checked={config?.nationalite === true}
                  onChange={() => handleCheckboxChange('nationalite')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="sexe"
                  label="Sexe"
                  checked={config?.sexe === true}
                  onChange={() => handleCheckboxChange('sexe')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="numCnaps"
                  label="Numéro CNAPS"
                  checked={config?.numCnaps === true}
                  onChange={() => handleCheckboxChange('numCnaps')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="numOstie"
                  label="Numéro OSTIE"
                  checked={config?.numOstie === true}
                  onChange={() => handleCheckboxChange('numOstie')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Section Informations familiales */}
        <Accordion.Item eventKey="1" className="mb-3 border rounded">
          <Accordion.Header className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <Heart size={18} className="text-danger" />
              <strong>Informations familiales</strong>
              <Badge bg="info" className="ms-2">
                {config ? [
                  'situationFamiliale', 'nomCompletMere', 'nomCompletPere', 
                  'nbEnfants', 'nomConjoint'
                ].filter(field => config[field] === true).length : 0} sélectionnée(s)
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="situationFamiliale"
                  label="Situation familiale"
                  checked={config?.situationFamiliale === true}
                  onChange={() => handleCheckboxChange('situationFamiliale')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="nomCompletMere"
                  label="Nom complet de la mère"
                  checked={config?.nomCompletMere === true}
                  onChange={() => handleCheckboxChange('nomCompletMere')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="nomCompletPere"
                  label="Nom complet du père"
                  checked={config?.nomCompletPere === true}
                  onChange={() => handleCheckboxChange('nomCompletPere')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="nbEnfants"
                  label="Nombre d'enfants"
                  checked={config?.nbEnfants === true}
                  onChange={() => handleCheckboxChange('nbEnfants')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="nomConjoint"
                  label="Nom du conjoint"
                  checked={config?.nomConjoint === true}
                  onChange={() => handleCheckboxChange('nomConjoint')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Section Informations professionnelles */}
        <Accordion.Item eventKey="2" className="mb-3 border rounded">
          <Accordion.Header className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <Briefcase size={18} className="text-success" />
              <strong>Informations professionnelles</strong>
              <Badge bg="info" className="ms-2">
                {config ? [
                  'infoProDateEmbauche', 'infoProSalaireBase', 'infoProClassification',
                  'infoProPeriodicitePaiement', 'infoProCategorie', 'infoProPoste',
                  'infoProDepartement'
                ].filter(field => config[field] === true).length : 0} sélectionnée(s)
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProDateEmbauche"
                  label={
                    <span className="d-flex align-items-center">
                      <Calendar size={14} className="me-1" />
                      Date d'embauche
                    </span>
                  }
                  checked={config?.infoProDateEmbauche === true}
                  onChange={() => handleCheckboxChange('infoProDateEmbauche')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProSalaireBase"
                  label={
                    <span className="d-flex align-items-center">
                      <FaMoneyBillWave size={14} className="me-1" />
                      Salaire de base
                    </span>
                  }
                  checked={config?.infoProSalaireBase === true}
                  onChange={() => handleCheckboxChange('infoProSalaireBase')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProPoste"
                  label={
                    <span className="d-flex align-items-center">
                      <Award size={14} className="me-1" />
                      Poste
                    </span>
                  }
                  checked={config?.infoProPoste === true}
                  onChange={() => handleCheckboxChange('infoProPoste')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProDepartement"
                  label={
                    <span className="d-flex align-items-center">
                      <Home size={14} className="me-1" />
                      Département
                    </span>
                  }
                  checked={config?.infoProDepartement === true}
                  onChange={() => handleCheckboxChange('infoProDepartement')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProClassification"
                  label={
                    <span className="d-flex align-items-center">
                      <Users size={14} className="me-1" />
                      Classification
                    </span>
                  }
                  checked={config?.infoProClassification === true}
                  onChange={() => handleCheckboxChange('infoProClassification')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProCategorie"
                  label="Catégorie professionnelle"
                  checked={config?.infoProCategorie === true}
                  onChange={() => handleCheckboxChange('infoProCategorie')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="infoProPeriodicitePaiement"
                  label="Périodicité de paiement"
                  checked={config?.infoProPeriodicitePaiement === true}
                  onChange={() => handleCheckboxChange('infoProPeriodicitePaiement')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Section Contacts d'urgence */}
        <Accordion.Item eventKey="3" className="mb-3 border rounded">
          <Accordion.Header className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={18} className="text-warning" />
              <strong>Contacts d'urgence</strong>
              <Badge bg="info" className="ms-2">
                {config ? [
                  'emergencyContactNom', 'emergencyContactTelephone', 'emergencyContactEmail'
                ].filter(field => config[field] === true).length : 0} sélectionnée(s)
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="emergencyContactNom"
                  label="Nom du contact d'urgence"
                  checked={config?.emergencyContactNom === true}
                  onChange={() => handleCheckboxChange('emergencyContactNom')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="emergencyContactTelephone"
                  label={
                    <span className="d-flex align-items-center">
                      <Phone size={14} className="me-1" />
                      Téléphone du contact d'urgence
                    </span>
                  }
                  checked={config?.emergencyContactTelephone === true}
                  onChange={() => handleCheckboxChange('emergencyContactTelephone')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="emergencyContactEmail"
                  label={
                    <span className="d-flex align-items-center">
                      <Mail size={14} className="me-1" />
                      Email du contact d'urgence
                    </span>
                  }
                  checked={config?.emergencyContactEmail === true}
                  onChange={() => handleCheckboxChange('emergencyContactEmail')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Section Modes de paiement */}
        <Accordion.Item eventKey="4" className="mb-3 border rounded">
          <Accordion.Header className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <CreditCard size={18} className="text-info" />
              <strong>Modes de paiement</strong>
              <Badge bg="info" className="ms-2">
                {config ? [
                  'modePaiementNomBanque', 'modePaiementCodeBanque', 'modePaiementCodeGuichet'
                ].filter(field => config[field] === true).length : 0} sélectionnée(s)
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="modePaiementNomBanque"
                  label="Nom de la banque"
                  checked={config?.modePaiementNomBanque === true}
                  onChange={() => handleCheckboxChange('modePaiementNomBanque')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="modePaiementCodeBanque"
                  label="Code banque"
                  checked={config?.modePaiementCodeBanque === true}
                  onChange={() => handleCheckboxChange('modePaiementCodeBanque')}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="modePaiementCodeGuichet"
                  label="Code guichet"
                  checked={config?.modePaiementCodeGuichet === true}
                  onChange={() => handleCheckboxChange('modePaiementCodeGuichet')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Pied de page */}
      <Card className="mt-4 border-0 bg-light">
        <Card.Body className="text-center py-3">
          <div className="d-flex justify-content-center gap-4">
            <div className="d-flex align-items-center">
              <CheckSquare size={16} className="text-success me-2" />
              <small className="text-muted">Colonnes sélectionnées</small>
            </div>
            <div className="d-flex align-items-center">
              <Square size={16} className="text-secondary me-2" />
              <small className="text-muted">Colonnes non sélectionnées</small>
            </div>
            <div className="d-flex align-items-center">
              <Badge bg="primary" className="me-2">Par défaut</Badge>
              <small className="text-muted">Colonnes activées par défaut</small>
            </div>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .accordion-button:not(.collapsed) {
          background-color: #e7f1ff;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: rgba(0,0,0,.125);
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
      `}</style>
    </Container>
  );
}

export default ExportConfiguration;
