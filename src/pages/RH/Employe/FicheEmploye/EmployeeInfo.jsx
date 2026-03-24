// src/pages/EmployeeInfo.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../../../utils/AxiosInstance";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Form,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip,
  Dropdown,
  Table,
  Accordion,
} from 'react-bootstrap';
import { 
  PersonFill, 
  BriefcaseFill, 
  FileEarmarkTextFill, 
  TelephoneFill,
  EnvelopeFill,
  GeoAltFill,
  CalendarFill,
  BuildingFill,
  ClockFill,
  Download,
  ChevronLeft,
  PencilFill,
  CheckCircleFill,
  XCircleFill,
  PeopleFill,
  ExclamationTriangleFill,
  Award,
  ClockHistory,
  FileEarmarkPlus,
  Save,
  CreditCardFill,
  Bank,
  Phone,
  Cash,
  Trash,
  PlusCircle
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ManagerInfoModal from './ManagerInfoPage';
import { MatriculeBadge } from './MatriculeBadge';

// COMPOSANTS RÉUTILISABLES
const LoadingSpinner = ({ message = "Chargement..." }) => (
  <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
    <p className="mt-3 text-muted">{message}</p>
  </Container>
);

const InfoCard = ({ title, icon: Icon, children, onEdit, editLabel = "Modifier" }) => (
  <Card className="border h-100">
    <Card.Header className="bg-white text-dark d-flex justify-content-between align-items-center py-3 border-bottom">
      <div className="d-flex align-items-center gap-2">
        {Icon && <Icon size={18} className="text-muted" />}
        <h5 className="mb-0 fw-semibold">{title}</h5>
      </div>
      {onEdit && (
        <OverlayTrigger placement="top" overlay={<Tooltip>{editLabel}</Tooltip>}>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={onEdit}
            className="d-flex align-items-center justify-content-center"
          >
            <PencilFill size={14} />
          </Button>
        </OverlayTrigger>
      )}
    </Card.Header>
    <Card.Body className="p-3">{children}</Card.Body>
  </Card>
);

const InfoItem = ({ label, value, icon: Icon, type = 'text', linkTo = null }) => (
  <div className="mb-3">
    <small className="text-muted d-flex align-items-center gap-1 mb-1">
      {Icon && <Icon size={12} />}
      {label}
    </small>
    {type === 'badge' ? (
      <Badge bg="light" text="dark" className="fw-semibold border">
        {value || 'Non spécifié'}
      </Badge>
    ) : type === 'email' ? (
      <a href={`mailto:${value}`} className="text-decoration-none d-block text-primary">
        {value || 'Non spécifié'}
      </a>
    ) : type === 'phone' ? (
      <a href={`tel:${value}`} className="text-decoration-none d-block text-primary">
        {value || 'Non spécifié'}
      </a>
    ) : type === 'money' ? (
      <span className="fw-semibold d-block">
        {value ? new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA' }).format(value) : 'Non spécifié'}
      </span>
    ) : linkTo ? (
      <Link to={linkTo} className="text-decoration-none d-block text-primary">
        {value || 'Non spécifié'}
      </Link>
    ) : (
      <p className="mb-0 text-dark">{value || 'Non spécifié'}</p>
    )}
  </div>
);

const StatusBadge = ({ contrat }) => {
  const getStatusConfig = () => {
    if (!contrat) return { label: 'Inconnu', variant: 'secondary', icon: ExclamationTriangleFill };
    
    const aujourdHui = new Date().toISOString().split('T')[0];
    const dateFin = contrat.dateFinAssignationPoste;
    
    if (!dateFin) return { label: 'En cours', variant: 'success', icon: CheckCircleFill };
    if (dateFin < aujourdHui) return { label: 'Terminé', variant: 'danger', icon: XCircleFill };
    
    const joursRestants = Math.ceil((new Date(dateFin) - new Date(aujourdHui)) / (1000 * 60 * 60 * 24));
    if (joursRestants <= 30) return { label: `Expire dans ${joursRestants} jours`, variant: 'warning', icon: ExclamationTriangleFill };
    
    return { label: 'En cours', variant: 'success', icon: CheckCircleFill };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge bg={config.variant} className="d-inline-flex align-items-center gap-1">
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

const ContratBadge = ({ typeContrat }) => {
  const getContratConfig = () => {
    switch(typeContrat?.intitule) {
      case 'CDI':
        return { label: 'CDI', variant: 'success', icon: Award };
      case 'CDD':
        return { label: 'CDD', variant: 'info', icon: CalendarFill };
      case 'Stage':
        return { label: 'Stage', variant: 'secondary', icon: ClockHistory };
      case 'Projet':
        return { label: 'Projet', variant: 'primary', icon: BriefcaseFill };
      default:
        return { label: typeContrat?.intitule || 'Inconnu', variant: 'light', text: 'dark', icon: FileEarmarkPlus };
    }
  };

  const config = getContratConfig();
  const Icon = config.icon;

  return (
    <Badge bg={config.variant} text={config.text} className="d-inline-flex align-items-center gap-1 border">
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

const BaseModal = ({ show, onClose, title, children, onSave, isSubmitting, size = "lg", error = null }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog" style={{ maxWidth: size === "xl" ? '1100px' : '800px' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Fermer"></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <Alert variant="danger" className="mb-4">
                <ExclamationTriangleFill className="me-2" />
                {error}
              </Alert>
            )}
            {children}
          </div>
          <div className="modal-footer">
            <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button variant="primary" onClick={onSave} disabled={isSubmitting} className="d-flex align-items-center gap-2">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Enregistrer</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonnelModal = ({ show, onClose, personnelData, onDataChange, onSave, isSubmitting,
  etatsCivilOptions = [], sexes = [], nationalites = [], regions = []}) => (
  <BaseModal show={show} onClose={onClose} title="Modifier les informations personnelles" onSave={onSave} isSubmitting={isSubmitting} size="xl">
    <div className="row g-3">
      <div className="col-12">
        <h6 className="border-bottom pb-2 mb-3 fw-semibold text-secondary">
          <PersonFill className="me-2" /> Identité
        </h6>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
          <Form.Control value={personnelData.nom || ''} onChange={(e) => onDataChange('nom', e.target.value)} required placeholder="Entrez le nom" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Prénom <span className="text-danger">*</span></Form.Label>
          <Form.Control value={personnelData.prenom || ''} onChange={(e) => onDataChange('prenom', e.target.value)} required placeholder="Entrez le prénom" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>CIN</Form.Label>
          <Form.Control value={personnelData.cin || ''} onChange={(e) => onDataChange('cin', e.target.value)} placeholder="Numéro de CIN" maxLength="12" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Numéro CNAPS</Form.Label>
          <Form.Control value={personnelData.numCnaps || ''} onChange={(e) => onDataChange('numCnaps', e.target.value)} placeholder="Numéro CNAPS" />
        </Form.Group>
      </div>
      <div className="col-12 mt-4">
        <h6 className="border-bottom pb-2 mb-3 fw-semibold text-secondary">
          <CalendarFill className="me-2" /> Naissance
        </h6>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Date de naissance</Form.Label>
          <Form.Control type="date" value={personnelData.dateNaissance || ''} onChange={(e) => onDataChange('dateNaissance', e.target.value)} max={new Date().toISOString().split('T')[0]} />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Lieu de naissance</Form.Label>
          <Form.Control value={personnelData.lieuNaissance || ''} onChange={(e) => onDataChange('lieuNaissance', e.target.value)} placeholder="Ville, Région, Pays" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Nom de la mère</Form.Label>
          <Form.Control value={personnelData.nomMere || ''} onChange={(e) => onDataChange('nomMere', e.target.value)} placeholder="Nom complet de la mère" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Nom du père</Form.Label>
          <Form.Control value={personnelData.nomPere || ''} onChange={(e) => onDataChange('nomPere', e.target.value)} placeholder="Nom complet du père" />
        </Form.Group>
      </div>
      <div className="col-12 mt-4">
        <h6 className="border-bottom pb-2 mb-3 fw-semibold text-secondary">
          <PeopleFill className="me-2" /> État civil et famille
        </h6>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>État civil</Form.Label>
          <Form.Select value={personnelData.etatCivil || ''} onChange={(e) => onDataChange('etatCivil', e.target.value)}>
            <option value="">Sélectionner un état civil</option>
            {etatsCivilOptions.map((etat) => (
              <option key={etat.code} value={etat.code}>{etat.libelle}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Nombre d'enfants</Form.Label>
          <Form.Control type="number" min="0" step="1" value={personnelData.nbEnfants || 0} onChange={(e) => onDataChange('nbEnfants', parseInt(e.target.value) || 0)} placeholder="0" />
        </Form.Group>
      </div>
      {(personnelData.etatCivil === 'MARIE' || personnelData.etatCivil === '') && (
        <div className="col-12">
          <Form.Group className="mb-3">
            <Form.Label>Nom du conjoint</Form.Label>
            <Form.Control value={personnelData.nomConjoint || ''} onChange={(e) => onDataChange('nomConjoint', e.target.value)} placeholder="Nom complet du conjoint (si marié)" />
          </Form.Group>
        </div>
      )}
      <div className="col-12 mt-4">
        <h6 className="border-bottom pb-2 mb-3 fw-semibold text-secondary">
          <TelephoneFill className="me-2" /> Contact
        </h6>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Téléphone</Form.Label>
          <Form.Control type="tel" value={personnelData.telephone || ''} onChange={(e) => onDataChange('telephone', e.target.value)} placeholder="Ex: +261 32 12 345 67" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={personnelData.email || ''} onChange={(e) => onDataChange('email', e.target.value)} placeholder="exemple@entreprise.mg" />
        </Form.Group>
      </div>
      <div className="col-12">
        <Form.Group className="mb-3">
          <Form.Label>Adresse complète</Form.Label>
          <Form.Control as="textarea" rows={3} value={personnelData.adresse || ''} onChange={(e) => onDataChange('adresse', e.target.value)} placeholder="Adresse, Commune, Ville, Code postal" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Sexe</Form.Label>
          <Form.Select value={personnelData.sexeId || ''} onChange={(e) => onDataChange('sexeId', e.target.value)}>
            <option value="">-- Sélectionner un sexe --</option>
            {sexes.map((sexe) => (
              <option key={sexe.id} value={sexe.id}>{sexe.sexe}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Nationalité</Form.Label>
          <Form.Select value={personnelData.nationaliteId || ''} onChange={(e) => onDataChange('nationaliteId', e.target.value)}>
            <option value="">-- Sélectionner une nationalité --</option>
            {nationalites.map((nationalite) => (
              <option key={nationalite.id} value={nationalite.id}>{nationalite.nationalite}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Région</Form.Label>
          <Form.Select value={personnelData.regionId || ''} onChange={(e) => onDataChange('regionId', e.target.value)}>
            <option value="">-- Sélectionner une région --</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>{region.nom}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Numéro OSTIE</Form.Label>
          <Form.Control value={personnelData.numOstie || ''} onChange={(e) => onDataChange('numOstie', e.target.value)} placeholder="Numéro OSTIE" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Code Postal</Form.Label>
          <Form.Control value={personnelData.codePostal || ''} onChange={(e) => onDataChange('codePostal', e.target.value)} placeholder="Code postal" maxLength="5" />
        </Form.Group>
      </div>
    </div>
  </BaseModal>
);

const ProModal = ({ show, onClose, proData, onDataChange, onSave, isSubmitting, categories = [], typeTempsTravails = [], typeEntrees = [] }) => (
  <BaseModal show={show} onClose={onClose} title="Modifier les informations professionnelles" onSave={onSave} isSubmitting={isSubmitting}>
    <div className="row g-3">
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Matricule</Form.Label>
          <Form.Control type="text" value={proData.matricule || ''} onChange={(e) => onDataChange('matricule', e.target.value)} placeholder="Matricule de l'employé" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Classification</Form.Label>
          <Form.Control type="text" value={proData.classification || ''} onChange={(e) => onDataChange('classification', e.target.value)} placeholder="Ex: Cadre, Agent de maîtrise, Employé" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Date d'embauche</Form.Label>
          <Form.Control type="date" value={proData.dateEmbauche || ''} onChange={(e) => onDataChange('dateEmbauche', e.target.value)} />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Date début d'assignation</Form.Label>
          <Form.Control type="date" value={proData.dateDebutAssignationPoste || ''} onChange={(e) => onDataChange('dateDebutAssignationPoste', e.target.value)} />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Date fin d'assignation</Form.Label>
          <Form.Control type="date" value={proData.dateFinAssignationPoste || ''} onChange={(e) => onDataChange('dateFinAssignationPoste', e.target.value)} />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Salaire de base (Ar)</Form.Label>
          <Form.Control type="number" step="1000" min="0" value={proData.salaireBase || ''} onChange={(e) => onDataChange('salaireBase', e.target.value)} placeholder="0" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Catégorie professionnelle</Form.Label>
          <Form.Select value={proData.categorieProfessionnelle?.id || proData.idCategorie || ''} onChange={(e) => onDataChange('idCategorie', e.target.value)}>
            <option value="">-- Sélectionner une catégorie --</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>{categorie.libelle} ({categorie.code})</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Type de temps de travail</Form.Label>
          <Form.Select value={proData.typeTempsTravail?.id || proData.idTempsTravail || ''} onChange={(e) => onDataChange('idTempsTravail', e.target.value)}>
            <option value="">-- Sélectionner un type --</option>
            {typeTempsTravails.map((type) => (
              <option key={type.id} value={type.id}>{type.tempsTravail}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Type d'entrée</Form.Label>
          <Form.Select value={proData.typeEntree?.id || proData.idTypeEntree || ''} onChange={(e) => onDataChange('idTypeEntree', e.target.value)}>
            <option value="">-- Sélectionner un type --</option>
            {typeEntrees.map((type) => (
              <option key={type.id} value={type.id}>{type.nom || type.libelle || type.typeEntree}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Date débauche</Form.Label>
          <Form.Control type="date" value={proData.dateDebauche || ''} onChange={(e) => onDataChange('dateDebauche', e.target.value)} />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Motif de départ</Form.Label>
          <Form.Control value={proData.motifDepart || ''} onChange={(e) => onDataChange('motifDepart', e.target.value)} placeholder="Motif de départ" />
        </Form.Group>
      </div>
    </div>
  </BaseModal>
);

const ContactModal = ({ show, onClose, contactData, onDataChange, onSave, isSubmitting }) => (
  <BaseModal show={show} onClose={onClose} title="Modifier le contact d'urgence" onSave={onSave} isSubmitting={isSubmitting}>
    <div className="row g-3">
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Nom complet <span className="text-danger">*</span></Form.Label>
          <Form.Control value={contactData.nom || ''} onChange={(e) => onDataChange('nom', e.target.value)} required placeholder="Nom et prénom" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Téléphone <span className="text-danger">*</span></Form.Label>
          <Form.Control value={contactData.contact || ''} onChange={(e) => onDataChange('contact', e.target.value)} required placeholder="Numéro de téléphone" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={contactData.email || ''} onChange={(e) => onDataChange('email', e.target.value)} placeholder="email@exemple.com" />
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3">
          <Form.Label>Adresse</Form.Label>
          <Form.Control value={contactData.adresse || ''} onChange={(e) => onDataChange('adresse', e.target.value)} placeholder="Adresse complète" />
        </Form.Group>
      </div>
    </div>
  </BaseModal>
);

// COMPOSANT MODE DE PAIEMENT CARD
const ModePaiementCard = ({ mode, typesPaiement, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...mode });
  const [calculatingRib, setCalculatingRib] = useState(false);

  const getTypePaiementLibelle = (typeId) => {
    const type = typesPaiement.find(t => t.id === typeId);
    return type ? type.libelle : 'Type inconnu';
  };

  const getTypeIcon = (typeId) => {
    switch(typeId) {
      case 'TP001': return <Bank className="me-2" />;
      case 'TP002': return <Phone className="me-2" />;
      case 'TP003': return <Cash className="me-2" />;
      default: return <CreditCardFill className="me-2" />;
    }
  };

  const formatRIB = () => {
    if (formData.codeBanque && formData.codeGuichet && formData.numeroCompte && formData.cleRib) {
      return `${formData.codeBanque} ${formData.codeGuichet} ${formData.numeroCompte} ${formData.cleRib}`;
    }
    return null;
  };

  const calculerCleRIB = async (codeBanque, codeGuichet, numeroCompte) => {
    try {
      setCalculatingRib(true);
      const response = await axiosInstance.post('/api/modes-paiement/calculer-cle-rib', {
        codeBanque,
        codeGuichet,
        numeroCompte
      });
      setFormData(prev => ({ ...prev, cleRib: response.data.cleRib }));
    } catch (error) {
      console.error("Erreur calcul clé RIB:", error);
    } finally {
      setCalculatingRib(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCodeChange = (field, pos, value) => {
    let newValue = formData[field] || '';
    newValue = newValue.padEnd(field === 'numeroCompte' ? 11 : 5, '');
    const chars = newValue.split('');
    chars[pos] = value;
    const finalValue = chars.join('');
    setFormData(prev => ({ ...prev, [field]: finalValue }));

    if (field === 'codeBanque' || field === 'codeGuichet' || field === 'numeroCompte') {
      const newFormData = { ...formData, [field]: finalValue };
      if (
        (field === 'codeBanque' ? finalValue : newFormData.codeBanque)?.length === 5 &&
        (field === 'codeGuichet' ? finalValue : newFormData.codeGuichet)?.length === 5 &&
        (field === 'numeroCompte' ? finalValue : newFormData.numeroCompte)?.length === 11
      ) {
        calculerCleRIB(
          field === 'codeBanque' ? finalValue : newFormData.codeBanque,
          field === 'codeGuichet' ? finalValue : newFormData.codeGuichet,
          field === 'numeroCompte' ? finalValue : newFormData.numeroCompte
        );
      }
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(mode.id, formData);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...mode });
    setEditing(false);
  };

  if (!editing) {
    return (
      <Card className={`mb-3 border-${mode.estParDefaut ? 'success' : 'secondary'} shadow-sm`}>
        <Card.Header className={`bg-${mode.estParDefaut ? 'success' : 'light'} bg-opacity-10 py-2 d-flex justify-content-between align-items-center`}>
          <div className="d-flex align-items-center">
            {getTypeIcon(mode.typePaiement?.id)}
            <span className="fw-semibold">{getTypePaiementLibelle(mode.typePaiement?.id)}</span>
            {mode.estParDefaut && <Badge bg="success" className="ms-2">Par défaut</Badge>}
          </div>
          <div className="d-flex gap-2">
            <Button variant="link" className="text-primary p-0" onClick={() => setEditing(true)} size="sm">
              <PencilFill size={14} />
            </Button>
            {onDelete && (
              <Button variant="link" className="text-danger p-0" onClick={() => onDelete(mode.id)} size="sm">
                <Trash size={14} />
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="py-3">
          <Row>
            <Col md={6}>
              <small className="text-muted d-block">Titulaire du compte</small>
              <p className="mb-2 fw-semibold">{mode.titulaireCompte || 'Non spécifié'}</p>
            </Col>
          </Row>
          {mode.typePaiement?.id === 'TP001' && (
            <>
              <Row>
                <Col md={6}>
                  <small className="text-muted d-block">Banque</small>
                  <p className="mb-2">{mode.nomBanque || 'Non spécifiée'}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Agence</small>
                  <p className="mb-2">{mode.domiciliationAgence || 'Non spécifiée'}</p>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <small className="text-muted d-block">RIB</small>
                  <p className="mb-0 font-monospace bg-light p-2 rounded">
                    {formatRIB() || 'RIB non disponible'}
                  </p>
                </Col>
              </Row>
            </>
          )}
          {mode.typePaiement?.id === 'TP002' && (
            <Row>
              <Col md={6}>
                <small className="text-muted d-block">Téléphone</small>
                <p className="mb-0 fw-semibold">{mode.telephoneMobile || 'Non spécifié'}</p>
              </Col>
            </Row>
          )}
          {mode.typePaiement?.id === 'TP003' && (
            <Row>
              <Col md={12}>
                <Alert variant="info" className="py-2 mb-0">
                  <small>Paiement en espèces - aucune coordonnée bancaire requise</small>
                </Alert>
              </Col>
            </Row>
          )}
          <small className="text-muted d-block mt-2">
            Statut: {mode.estActif ? <Badge bg="success" pill>Actif</Badge> : <Badge bg="secondary" pill>Inactif</Badge>}
          </small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3 border-primary">
      <Card.Header className="bg-primary bg-opacity-10 text-primary py-2">
        <h6 className="mb-0 fw-semibold">Modifier le mode de paiement</h6>
      </Card.Header>
      <Card.Body className="py-3">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Type de paiement <span className="text-danger">*</span></Form.Label>
              <Form.Select size="sm" value={formData.typePaiement?.id || ''} onChange={(e) => setFormData(prev => ({ ...prev, typePaiement: { id: e.target.value } }))} required>
                <option value="">-- Sélectionnez un type --</option>
                {typesPaiement.map(t => <option key={t.id} value={t.id}>{t.libelle}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Titulaire du compte <span className="text-danger">*</span></Form.Label>
              <Form.Control size="sm" value={formData.titulaireCompte || ''} onChange={(e) => handleInputChange('titulaireCompte', e.target.value)} placeholder="Nom du titulaire" required />
            </Form.Group>
          </Col>
        </Row>

        {formData.typePaiement?.id === 'TP001' && (
          <>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nom de la banque <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" value={formData.nomBanque || ''} onChange={(e) => handleInputChange('nomBanque', e.target.value)} placeholder="Ex: BNI Madagascar" required />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={12}>
                <Form.Label>Code banque <span className="text-danger">*</span></Form.Label>
              </Col>
              <Col md={12}>
                <div className="d-flex gap-1">
                  {[0,1,2,3,4].map((pos) => (
                    <Form.Control key={`cb_edit_${pos}`} size="sm" style={{ width: '45px', textAlign: 'center' }}
                      value={formData.codeBanque?.[pos] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                        handleCodeChange('codeBanque', pos, val);
                        if (val && pos < 4) document.getElementById(`cb_edit_${pos+1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !formData.codeBanque?.[pos] && pos > 0) {
                          document.getElementById(`cb_edit_${pos-1}`)?.focus();
                        }
                      }}
                      maxLength="1" pattern="[0-9]" id={`cb_edit_${pos}`} autoComplete="off"
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={12}>
                <Form.Label>Code guichet <span className="text-danger">*</span></Form.Label>
              </Col>
              <Col md={12}>
                <div className="d-flex gap-1">
                  {[0,1,2,3,4].map((pos) => (
                    <Form.Control key={`cg_edit_${pos}`} size="sm" style={{ width: '45px', textAlign: 'center' }}
                      value={formData.codeGuichet?.[pos] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                        handleCodeChange('codeGuichet', pos, val);
                        if (val && pos < 4) document.getElementById(`cg_edit_${pos+1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !formData.codeGuichet?.[pos] && pos > 0) {
                          document.getElementById(`cg_edit_${pos-1}`)?.focus();
                        }
                      }}
                      maxLength="1" pattern="[0-9]" id={`cg_edit_${pos}`} autoComplete="off"
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={12}>
                <Form.Label>Numéro de compte <span className="text-danger">*</span></Form.Label>
              </Col>
              <Col md={12}>
                <div className="d-flex gap-1 flex-wrap">
                  {[0,1,2,3,4,5,6,7,8,9,10].map((pos) => (
                    <Form.Control key={`nc_edit_${pos}`} size="sm" style={{ width: '40px', textAlign: 'center', marginBottom: '5px' }}
                      value={formData.numeroCompte?.[pos] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                        handleCodeChange('numeroCompte', pos, val);
                        if (val && pos < 10) document.getElementById(`nc_edit_${pos+1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !formData.numeroCompte?.[pos] && pos > 0) {
                          document.getElementById(`nc_edit_${pos-1}`)?.focus();
                        }
                      }}
                      maxLength="1" pattern="[0-9]" id={`nc_edit_${pos}`} autoComplete="off"
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Clé RIB</Form.Label>
              </Col>
              <Col md={12}>
                <div className="d-flex gap-1">
                  {[0,1].map((pos) => (
                    <Form.Control key={`cr_edit_${pos}`} size="sm" style={{ width: '45px', textAlign: 'center' }}
                      value={formData.cleRib?.[pos] || ''} readOnly
                      className={formData.cleRib ? 'bg-success bg-opacity-10' : 'bg-light'} placeholder="-"
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Domiciliation agence</Form.Label>
                  <Form.Control size="sm" value={formData.domiciliationAgence || ''} onChange={(e) => handleInputChange('domiciliationAgence', e.target.value)} placeholder="Ex: Agence Analakely" />
                </Form.Group>
              </Col>
            </Row>
            {formData.codeBanque?.length === 5 && formData.codeGuichet?.length === 5 && formData.numeroCompte?.length === 11 && formData.cleRib && (
              <div className="mt-2 p-2 bg-light rounded">
                <small className="text-muted">RIB complet :</small>
                <div className="font-monospace">
                  <strong>{formData.codeBanque} {formData.codeGuichet} {formData.numeroCompte} {formData.cleRib}</strong>
                </div>
              </div>
            )}
          </>
        )}

        {formData.typePaiement?.id === 'TP002' && (
          <Row>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Téléphone <span className="text-danger">*</span></Form.Label>
                <Form.Control size="sm" value={formData.telephoneMobile || ''} onChange={(e) => handleInputChange('telephoneMobile', e.target.value)} placeholder="Ex: 0341234567" maxLength="10" required />
              </Form.Group>
            </Col>
          </Row>
        )}

        {formData.typePaiement?.id === 'TP003' && (
          <Row>
            <Col md={12}>
              <Alert variant="info" className="py-2">
                <small>Paiement en espèces - aucune coordonnée bancaire requise</small>
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Actif" checked={formData.estActif} onChange={(e) => handleInputChange('estActif', e.target.checked)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Par défaut" checked={formData.estParDefaut} onChange={(e) => handleInputChange('estParDefaut', e.target.checked)} />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" size="sm" onClick={handleCancel}>Annuler</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Enregistrer</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// MODAL POUR GÉRER LES MODES DE PAIEMENT
const ModesPaiementModal = ({ show, onClose, modesPaiement, typesPaiement, onSave, isSubmitting, error, employeId, employeeData }) => {
  const [modes, setModes] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    typePaiementId: '',
    nomBanque: '',
    codeBanque: '',
    codeGuichet: '',
    numeroCompte: '',
    cleRib: '',
    titulaireCompte: '',
    domiciliationAgence: '',
    telephoneMobile: '',
    estActif: true,
    estParDefaut: false
  });

  useEffect(() => {
    if (show && modesPaiement) setModes(modesPaiement);
  }, [show, modesPaiement]);

  const calculerCleRIB = async (codeBanque, codeGuichet, numeroCompte) => {
    try {
      const response = await axiosInstance.post('/api/modes-paiement/calculer-cle-rib', { codeBanque, codeGuichet, numeroCompte });
      setFormData(prev => ({ ...prev, cleRib: response.data.cleRib }));
    } catch (error) {
      console.error("Erreur calcul clé RIB:", error);
    }
  };

  const handleUpdateMode = async (modeId, updatedData) => {
    try {
      await axiosInstance.put(`/api/modes-paiement/${modeId}`, updatedData);
      setModes(modes.map(m => m.id === modeId ? { ...m, ...updatedData } : m));
      toast.success('Mode de paiement modifié avec succès');
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      toast.error('Erreur lors de la modification du mode de paiement');
    }
  };

  const handleAddMode = () => {
    const employe = employeeData?.employe;
    const titulaire = `${employe.nom} ${employe.prenom}`.trim();
    setFormData({
      typePaiementId: '', nomBanque: '', codeBanque: '', codeGuichet: '', numeroCompte: '', cleRib: '',
      titulaireCompte: titulaire , domiciliationAgence: '', telephoneMobile: '', estActif: true, estParDefaut: modes.length === 0
    });
    setEditingMode(null);
    setShowForm(true);
  };

  const handleEditMode = (mode) => {
    setFormData({
      id: mode.id, typePaiementId: mode.typePaiement?.id || '', nomBanque: mode.nomBanque || '',
      codeBanque: mode.codeBanque || '', codeGuichet: mode.codeGuichet || '', numeroCompte: mode.numeroCompte || '',
      cleRib: mode.cleRib || '', titulaireCompte: mode.titulaireCompte || '', domiciliationAgence: mode.domiciliationAgence || '',
      telephoneMobile: mode.telephoneMobile || '', estActif: mode.estActif, estParDefaut: mode.estParDefaut
    });
    setEditingMode(mode.id);
    setShowForm(true);
  };

  const handleDeleteMode = async (modeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mode de paiement ?')) {
      try {
        await axiosInstance.delete(`/api/modes-paiement/${modeId}`);
        setModes(modes.filter(m => m.id !== modeId));
        toast.success('Mode de paiement supprimé avec succès');
      } catch (error) {
        console.error("Erreur suppression:", error);
        toast.error('Erreur lors de la suppression du mode de paiement');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'codeBanque' || field === 'codeGuichet' || field === 'numeroCompte') {
      const newFormData = { ...formData, [field]: value };
      if (newFormData.codeBanque?.length === 5 && newFormData.codeGuichet?.length === 5 && newFormData.numeroCompte?.length === 11) {
        calculerCleRIB(newFormData.codeBanque, newFormData.codeGuichet, newFormData.numeroCompte);
      } else {
        setFormData(prev => ({ ...prev, cleRib: '' }));
      }
    }
  };

  const handleCodeChange = (field, pos, value) => {
    let newValue = formData[field] || '';
    newValue = newValue.padEnd(field === 'numeroCompte' ? 11 : 5, '');
    const chars = newValue.split('');
    chars[pos] = value;
    const finalValue = chars.join('');
    setFormData(prev => ({ ...prev, [field]: finalValue }));

    if (field === 'codeBanque' || field === 'codeGuichet' || field === 'numeroCompte') {
      const newFormData = { ...formData, [field]: finalValue };
      if (
        (field === 'codeBanque' ? finalValue : newFormData.codeBanque)?.length === 5 &&
        (field === 'codeGuichet' ? finalValue : newFormData.codeGuichet)?.length === 5 &&
        (field === 'numeroCompte' ? finalValue : newFormData.numeroCompte)?.length === 11
      ) {
        calculerCleRIB(
          field === 'codeBanque' ? finalValue : newFormData.codeBanque,
          field === 'codeGuichet' ? finalValue : newFormData.codeGuichet,
          field === 'numeroCompte' ? finalValue : newFormData.numeroCompte
        );
      }
    }
  };

  const handleSubmitForm = async () => {
    try {
      const dataToSend = { ...formData, employe: { id: employeId }, typePaiement: { id: formData.typePaiementId } };
      if (formData.id) {
        await axiosInstance.put(`/api/modes-paiement/${formData.id}`, dataToSend);
        toast.success('Mode de paiement modifié avec succès');
      } else {
        const response = await axiosInstance.post('/api/modes-paiement', dataToSend);
        setModes([...modes, response.data]);
        toast.success('Mode de paiement ajouté avec succès');
      }
      setShowForm(false);
      setFormData({ typePaiementId: '', nomBanque: '', codeBanque: '', codeGuichet: '', numeroCompte: '', cleRib: '', titulaireCompte: '', domiciliationAgence: '', telephoneMobile: '', estActif: true, estParDefaut: false });
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error('Erreur lors de la sauvegarde du mode de paiement');
    }
  };

  return (
    <BaseModal show={show} onClose={onClose} title="Modes de paiement" onSave={onSave} isSubmitting={isSubmitting} size="xl">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold mb-0">Liste des modes de paiement</h6>
          <Button variant="outline-primary" size="sm" onClick={handleAddMode} className="d-flex align-items-center gap-2">
            <PlusCircle size={16} /> Ajouter un mode
          </Button>
        </div>
        {modes.length === 0 ? (
          <Alert variant="info">Aucun mode de paiement enregistré pour cet employé.</Alert>
        ) : (
          <div className="mb-4">
            {modes.map(mode => (
              <ModePaiementCard key={mode.id} mode={mode} typesPaiement={typesPaiement} onDelete={handleDeleteMode} onUpdate={handleUpdateMode} />
            ))}
          </div>
        )}
        {showForm && (
          <Card className="border-primary mt-4">
            <Card.Header className="bg-primary bg-opacity-10 text-primary">
              <h6 className="mb-0 fw-semibold">{editingMode ? 'Modifier' : 'Ajouter'} un mode de paiement</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de paiement <span className="text-danger">*</span></Form.Label>
                    <Form.Select value={formData.typePaiementId} onChange={(e) => handleInputChange('typePaiementId', e.target.value)} required>
                      <option value="">-- Sélectionnez un type --</option>
                      {typesPaiement.map(t => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Titulaire du compte <span className="text-danger">*</span></Form.Label>
                    <Form.Control value={formData.titulaireCompte} onChange={(e) => handleInputChange('titulaireCompte', e.target.value)} placeholder="Nom du titulaire" required />
                  </Form.Group>
                </Col>
              </Row>

              {formData.typePaiementId === 'TP001' && (
                <>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom de la banque <span className="text-danger">*</span></Form.Label>
                        <Form.Control value={formData.nomBanque} onChange={(e) => handleInputChange('nomBanque', e.target.value)} placeholder="Ex: BNI Madagascar" required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={12}>
                      <Form.Label>Code banque <span className="text-danger">*</span></Form.Label>
                    </Col>
                    <Col md={12}>
                      <div className="d-flex gap-1">
                        {[0,1,2,3,4].map((pos) => (
                          <Form.Control key={`cb_${pos}`} size="sm" style={{ width: '45px', textAlign: 'center' }}
                            value={formData.codeBanque?.[pos] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                              handleCodeChange('codeBanque', pos, val);
                              if (val && pos < 4) document.getElementById(`cb_${pos+1}`)?.focus();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !formData.codeBanque?.[pos] && pos > 0) {
                                document.getElementById(`cb_${pos-1}`)?.focus();
                              }
                            }}
                            maxLength="1" pattern="[0-9]" id={`cb_${pos}`} autoComplete="off"
                          />
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={12}>
                      <Form.Label>Code guichet <span className="text-danger">*</span></Form.Label>
                    </Col>
                    <Col md={12}>
                      <div className="d-flex gap-1">
                        {[0,1,2,3,4].map((pos) => (
                          <Form.Control key={`cg_${pos}`} size="sm" style={{ width: '45px', textAlign: 'center' }}
                            value={formData.codeGuichet?.[pos] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                              handleCodeChange('codeGuichet', pos, val);
                              if (val && pos < 4) document.getElementById(`cg_${pos+1}`)?.focus();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !formData.codeGuichet?.[pos] && pos > 0) {
                                document.getElementById(`cg_${pos-1}`)?.focus();
                              }
                            }}
                            maxLength="1" pattern="[0-9]" id={`cg_${pos}`} autoComplete="off"
                          />
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={12}>
                      <Form.Label>Numéro de compte <span className="text-danger">*</span></Form.Label>
                    </Col>
                    <Col md={12}>
                      <div className="d-flex gap-1 flex-wrap">
                        {[0,1,2,3,4,5,6,7,8,9,10].map((pos) => (
                          <Form.Control key={`nc_${pos}`} size="sm" style={{ width: '40px', textAlign: 'center', marginBottom: '5px' }}
                            value={formData.numeroCompte?.[pos] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                              handleCodeChange('numeroCompte', pos, val);
                              if (val && pos < 10) document.getElementById(`nc_${pos+1}`)?.focus();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !formData.numeroCompte?.[pos] && pos > 0) {
                                document.getElementById(`nc_${pos-1}`)?.focus();
                              }
                            }}
                            maxLength="1" pattern="[0-9]" id={`nc_${pos}`} autoComplete="off"
                          />
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Label>Clé RIB</Form.Label>
                    </Col>
                    <Col md={12}>
                      <div className="d-flex gap-1">
                        {[0,1].map((pos) => (
                          <Form.Control key={`cr_${pos}`} size="sm" style={{ width: '45px', textAlign: 'center' }}
                            value={formData.cleRib?.[pos] || ''} readOnly
                            className={formData.cleRib ? 'bg-success bg-opacity-10' : 'bg-light'} placeholder="-"
                          />
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Domiciliation agence</Form.Label>
                        <Form.Control size="sm" value={formData.domiciliationAgence} onChange={(e) => handleInputChange('domiciliationAgence', e.target.value)} placeholder="Ex: Agence Analakely" />
                      </Form.Group>
                    </Col>
                  </Row>
                  {formData.codeBanque?.length === 5 && formData.codeGuichet?.length === 5 && formData.numeroCompte?.length === 11 && formData.cleRib && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted">RIB complet :</small>
                      <div className="font-monospace">
                        <strong>{formData.codeBanque} {formData.codeGuichet} {formData.numeroCompte} {formData.cleRib}</strong>
                      </div>
                    </div>
                  )}
                </>
              )}

              {formData.typePaiementId === 'TP002' && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone <span className="text-danger">*</span></Form.Label>
                      <Form.Control value={formData.telephoneMobile} onChange={(e) => handleInputChange('telephoneMobile', e.target.value)} placeholder="Ex: 0341234567" maxLength="10" required />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {formData.typePaiementId === 'TP003' && (
                <Row>
                  <Col md={12}>
                    <Alert variant="info">Paiement en espèces - aucune coordonnée bancaire requise</Alert>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check type="checkbox" label="Actif" checked={formData.estActif} onChange={(e) => handleInputChange('estActif', e.target.checked)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check type="checkbox" label="Par défaut" checked={formData.estParDefaut} onChange={(e) => handleInputChange('estParDefaut', e.target.checked)} disabled={formData.estParDefaut && modes.length > 0} />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="outline-secondary" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button variant="primary" size="sm" onClick={handleSubmitForm}>{editingMode ? 'Modifier' : 'Ajouter'}</Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </BaseModal>
  );
};

function EmployeeInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sexes, setSexes] = useState([]);
  const [nationalites, setNationalites] = useState([]);
  const [regions, setRegions] = useState([]);
  const [typesPaiement, setTypesPaiement] = useState([]);
  const [etatsCivilOptions, setEtatsCivilOptions] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showModesPaiementModal, setShowModesPaiementModal] = useState(false);
  const [personnelData, setPersonnelData] = useState({});
  const [proData, setProData] = useState({});
  const [contactData, setContactData] = useState({});
  const [modesPaiement, setModesPaiement] = useState([]);
  const [selectedContratIndex, setSelectedContratIndex] = useState(null);
  const [isSubmittingPersonnel, setIsSubmittingPersonnel] = useState(false);
  const [isSubmittingPro, setIsSubmittingPro] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingModes, setIsSubmittingModes] = useState(false);
  const [activeKey, setActiveKey] = useState('personnel');
  const [categories, setCategories] = useState([]);
  const [typeTempsTravails, setTypeTempsTravails] = useState([]);
  const [typeEntrees, setTypeEntrees] = useState([]);
  const [personnelError, setPersonnelError] = useState('');
  const [proError, setProError] = useState('');
  const [contactError, setContactError] = useState('');
  const [modesError, setModesError] = useState('');
  const [loadingModes, setLoadingModes] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
    }
  }, [navigate]);

  const fetchEtatsCivil = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/etat-civil');
      const options = response.data.map(code => {
        let libelle = code;
        switch(code) {
          case 'CELIBATAIRE': libelle = 'Célibataire'; break;
          case 'MARIE': libelle = 'Marié(e)'; break;
          case 'DIVORCE': libelle = 'Divorcé(e)'; break;
          case 'VEUF': libelle = 'Veuf/Veuve'; break;
          default: libelle = code;
        }
        return { code, libelle };
      });
      setEtatsCivilOptions(options);
    } catch (error) {
      console.error("Erreur lors du chargement des états civils:", error);
    }
  }, []);

  const fetchTypesPaiement = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/types-paiement');
      setTypesPaiement(response.data);
    } catch (error) {
      console.error("Erreur chargement types paiement:", error);
    }
  }, []);

  const fetchAdditionalData = useCallback(async () => {
    try {
      const [categoriesRes, tempsTravailRes, entreesRes, sexesRes, nationalitesRes, regionsRes] = await Promise.all([
        axiosInstance.get('/api/categories-professionnelles'),
        axiosInstance.get('/api/types-temps-travail'),
        axiosInstance.get('/api/types-entree'),
        axiosInstance.get('/api/sexes'),
        axiosInstance.get('/api/nationalites'),
        axiosInstance.get('/api/regions')
      ]);
      setCategories(categoriesRes.data);
      setTypeTempsTravails(tempsTravailRes.data);
      setTypeEntrees(entreesRes.data);
      setSexes(sexesRes.data);
      setNationalites(nationalitesRes.data);
      setRegions(regionsRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données supplémentaires:", error);
    }
  }, []);

  const fetchModesPaiement = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingModes(true);
      const response = await axiosInstance.get(`/api/modes-paiement/employe/${id}`);
      setModesPaiement(response.data);
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    } finally {
      setLoadingModes(false);
    }
  }, [id]);

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/api/employes/${id}`);
      setEmployeeData(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear();
        navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
      } else {
        setError('Erreur lors du chargement des données de l\'employé');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEmployee();
    fetchEtatsCivil();
    fetchAdditionalData();
    fetchTypesPaiement();
    fetchModesPaiement();
  }, [fetchEmployee, fetchEtatsCivil, fetchAdditionalData, fetchTypesPaiement, fetchModesPaiement]);

  const getEtatCivilLibelle = (etatCivilCode) => {
    if (!etatCivilCode) return 'Non spécifié';
    const etat = etatsCivilOptions.find(e => e.code === etatCivilCode);
    return etat ? etat.libelle : etatCivilCode;
  };

  const handleExportPDF = async (employeId) => {
    try {
      const response = await axiosInstance.get(`/api/export/${employeId}`, {
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Créer une URL pour le Blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employe_${employeId}.pdf`);
      
      // Ajouter au DOM, cliquer et retirer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export du PDF');
    }
  };

  const handlePersonnelDataChange = useCallback((field, value) => {
    setPersonnelData(prev => ({...prev, [field]: value}));
  }, []);

  const handleProDataChange = useCallback((field, value) => {
    setProData(prev => {
      if (field === 'idCategorie') return { ...prev, idCategorie: value, categorieProfessionnelle: value ? { id: value } : null };
      if (field === 'idTempsTravail') return { ...prev, idTempsTravail: value, typeTempsTravail: value ? { id: value } : null };
      if (field === 'idTypeEntree') return { ...prev, idTypeEntree: value, typeEntree: value ? { id: value } : null };
      return { ...prev, [field]: value };
    });
  }, []);

  const handleContactDataChange = useCallback((field, value) => {
    setContactData(prev => ({...prev, [field]: value}));
  }, []);

  const openPersonnelModal = () => {
    const employe = employeeData?.employe;
    setPersonnelData({
      id: employe?.id, nom: employe?.nom || '', prenom: employe?.prenom || '', dateNaissance: employe?.dateNaissance || '',
      lieuNaissance: employe?.lieuNaissance || '', telephone: employe?.telephone || '', email: employe?.email || '',
      adresse: employe?.adresse || '', nomMere: employe?.nomMere || '', nomPere: employe?.nomPere || '',
      nbEnfants: employe?.nbEnfants || 0, nomConjoint: employe?.nomConjoint || '', etatCivil: employe?.etatCivil || '',
      cin: employe?.cin || '', numCnaps: employe?.numCnaps || '', numOstie: employe?.numOstie || '',
      codePostal: employe?.codePostal || '', nationaliteId: employe?.nationalite?.id || '',
      sexeId: employe?.sexe?.id || '', regionId: employe?.region?.id || ''
    });
    setShowPersonnelModal(true);
  };

  const openProModal = (contratIndex = null) => {
    const infosProArray = employeeData?.infosProfessionnelles || [];
    const employeId = employeeData?.employe?.id;
    let managerId = '', departementId = '';
    if (employeeData?.infosProfessionnelles?.length > 0) {
      const infosPro = employeeData.infosProfessionnelles[0];
      managerId = infosPro?.manager?.id;
      departementId = infosPro?.departement?.id;
    }
    let contratActuel = infosProArray.find(contrat => contrat.statut === 0) || (infosProArray.length > 0 ? infosProArray[infosProArray.length - 1] : null);
    if (contratActuel) {
      const currentIndex = infosProArray.findIndex(contrat => contrat.id === contratActuel.id);
      setSelectedContratIndex(currentIndex);
      setProData({
        id: contratActuel?.id, idManager: managerId, idEmploye: employeId,
        dateEmbauche: contratActuel?.dateEmbauche || '', dateDebutAssignationPoste: contratActuel?.dateDebutAssignationPoste || '',
        dateFinAssignationPoste: contratActuel?.dateFinAssignationPoste || '', salaireBase: contratActuel?.salaireBase || 0,
        classification: contratActuel?.classification || '', matricule: contratActuel?.matricule || '',
        dateDebauche: contratActuel?.dateDebauche || '', motifDepart: contratActuel?.motifDepart || '',
        statut: contratActuel?.statut || 0, idCategorie: contratActuel?.categorieProfessionnelle?.id || '',
        categorieProfessionnelle: contratActuel?.categorieProfessionnelle || null,
        idTempsTravail: contratActuel?.typeTempsTravail?.id || '', typeTempsTravail: contratActuel?.typeTempsTravail || null,
        idTypeEntree: contratActuel?.typeEntree?.id || '', typeEntree: contratActuel?.typeEntree || null,
        idPoste: contratActuel?.poste?.id || '', poste: contratActuel?.poste || null,
        idDepartement: departementId, departement: contratActuel?.poste?.departement || contratActuel?.departement || null,
        idTypeContrat: contratActuel?.typeContrat?.id || '', typeContrat: contratActuel?.typeContrat || null
      });
      setShowProModal(true);
    } else if (contratIndex !== null && infosProArray[contratIndex]) {
      const contrat = infosProArray[contratIndex];
      setSelectedContratIndex(contratIndex);
      setProData({
        id: contrat?.id, idEmploye: employeId, idManager: managerId,
        dateEmbauche: contrat?.dateEmbauche || '', dateDebutAssignationPoste: contrat?.dateDebutAssignationPoste || '',
        dateFinAssignationPoste: contrat?.dateFinAssignationPoste || '', salaireBase: contrat?.salaireBase || 0,
        classification: contrat?.classification || '', matricule: contrat?.matricule || '',
        dateDebauche: contrat?.dateDebauche || '', motifDepart: contrat?.motifDepart || '',
        statut: contrat?.statut || 0, idCategorie: contrat?.categorieProfessionnelle?.id || '',
        categorieProfessionnelle: contrat?.categorieProfessionnelle || null,
        idTempsTravail: contrat?.typeTempsTravail?.id || '', typeTempsTravail: contrat?.typeTempsTravail || null,
        idTypeEntree: contrat?.typeEntree?.id || '', typeEntree: contrat?.typeEntree || null,
        idPoste: contrat?.poste?.id || '', poste: contrat?.poste || null,
        idDepartement: departementId, departement: contrat?.poste?.departement || contrat?.departement || null,
        idTypeContrat: contrat?.typeContrat?.id || '', typeContrat: contrat?.typeContrat || null
      });
      setShowProModal(true);
    } else {
      setProData({ idEmploye: employeId, idManager: managerId, idDepartement: departementId, dateEmbauche: '', dateDebutAssignationPoste: '', dateFinAssignationPoste: '', salaireBase: 0, classification: '', matricule: '', dateDebauche: '', motifDepart: '', statut: 0, idCategorie: '', idTempsTravail: '', idTypeEntree: '', idPoste: '', idTypeContrat: '' });
      setShowProModal(true);
    }
  };

  const openContactModal = () => {
    const employe = employeeData?.employe;
    setContactData({ id: employe?.emergencyContact?.id, nom: employe?.emergencyContact?.nom || '', contact: employe?.emergencyContact?.contact || '', email: employe?.emergencyContact?.email || '', adresse: employe?.emergencyContact?.adresse || '' });
    setShowContactModal(true);
  };

  const openModesPaiementModal = () => {
    fetchModesPaiement();
    setShowModesPaiementModal(true);
  };

  const savePersonnel = async () => {
    const errors = [];
    if (!personnelData.nom?.trim()) errors.push("Le nom est obligatoire");
    if (!personnelData.prenom?.trim()) errors.push("Le prénom est obligatoire");
    if (errors.length > 0) { setError(errors.join('. ')); return; }
    setIsSubmittingPersonnel(true);
    try {
      const dataToSend = { ...personnelData, nbEnfants: parseInt(personnelData.nbEnfants) || 0, etatCivil: personnelData.etatCivil || null, sexe: personnelData.sexeId ? { id: personnelData.sexeId } : null, nationalite: personnelData.nationaliteId ? { id: personnelData.nationaliteId } : null, region: personnelData.regionId ? { id: personnelData.regionId } : null };
      delete dataToSend.sexeId; delete dataToSend.nationaliteId; delete dataToSend.regionId;
      await axiosInstance.put(`/api/employes/${id}`, dataToSend);
      await fetchEmployee();
      setSuccess('Informations personnelles mises à jour avec succès');
      setError(''); setShowPersonnelModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Erreur modification:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear();
        navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data || 'Erreur lors de la modification des informations personnelles';
        toast.error(errorMsg);
        setPersonnelError(errorMsg);
      }
    } finally {
      setIsSubmittingPersonnel(false);
    }
  };

  const savePro = async () => {
    setIsSubmittingPro(true);
    try {
      const infoId = proData.id;
      if (!infoId) throw new Error("ID du contrat manquant");
      const dataToSend = {
        id: proData.id, employe: {id: proData.idEmploye}, departement: {id: proData.idDepartement},
        dateEmbauche: proData.dateEmbauche || null, dateDebutAssignationPoste: proData.dateDebutAssignationPoste || null,
        dateFinAssignationPoste: proData.dateFinAssignationPoste || null, salaireBase: proData.salaireBase ? Number(proData.salaireBase) : null,
        classification: proData.classification || null, matricule: proData.matricule || '',
        dateDebauche: proData.dateDebauche || null, motifDepart: proData.motifDepart || null, statut: proData.statut !== undefined ? proData.statut : 0,
        categorieProfessionnelle: proData.idCategorie ? { id: proData.idCategorie } : null,
        typeTempsTravail: proData.idTempsTravail ? { id: proData.idTempsTravail } : null,
        typeEntree: proData.idTypeEntree ? { id: proData.idTypeEntree } : null,
        poste: proData.idPoste ? { id: proData.idPoste } : null,
        typeContrat: proData.idTypeContrat ? { id: proData.idTypeContrat } : null
      };
      if (proData.manager && proData.manager.trim() !== '') dataToSend.manager = { id: proData.idManager };
      await axiosInstance.put(`/api/infosPro/${infoId}`, dataToSend);
      await fetchEmployee();
      setSuccess('Informations professionnelles mises à jour avec succès');
      setError(''); setShowProModal(false); setSelectedContratIndex(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Erreur détaillée de modification:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear();
        navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data || 'Erreur lors de la modification des informations professionnelles';
        setError(errorMsg);
      }
    } finally {
      setIsSubmittingPro(false);
    }
  };

  const saveContact = async () => {
    const errors = [];
    if (!contactData.nom?.trim()) errors.push("Le nom du contact est obligatoire");
    if (!contactData.contact?.trim()) errors.push("Le téléphone du contact est obligatoire");
    if (errors.length > 0) { setError(errors.join('. ')); return; }
    setIsSubmittingContact(true);
    try {
      const contactId = contactData.id;
      if (!contactId) throw new Error("ID du contact manquant");
      await axiosInstance.put(`/api/emergency-contact/${contactId}`, contactData);
      await fetchEmployee();
      setSuccess('Contact d\'urgence mis à jour avec succès');
      setError(''); setShowContactModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Erreur modification:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.clear();
        navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data || 'Erreur lors de la modification du contact d\'urgence';
        setError(errorMsg);
      }
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const saveModesPaiement = async () => {
    try {
      setIsSubmittingModes(true);
      await fetchModesPaiement();
      setShowModesPaiementModal(false);
      toast.success('Modes de paiement mis à jour avec succès');
    } catch (error) {
      console.error("Erreur:", error);
      toast.error('Erreur lors de la mise à jour des modes de paiement');
    } finally {
      setIsSubmittingModes(false);
    }
  };

  const safeDisplay = (value) => value || 'Non spécifié';
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try { return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return dateString; }
  };
  const formatSalaire = (salaire) => {
    if (!salaire) return 'Non spécifié';
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', minimumFractionDigits: 0 }).format(salaire);
  };
  const getContratsTries = () => {
    if (!employeeData?.infosProfessionnelles) return [];
    return [...employeeData.infosProfessionnelles].sort((a, b) => new Date(b.dateDebutAssignationPoste || b.dateEmbauche || '') - new Date(a.dateDebutAssignationPoste || a.dateEmbauche || ''));
  };
  const getContratActuel = () => {
    if (!employeeData?.infosProfessionnelles) return null;
    const contratsTries = getContratsTries();
    return contratsTries.find(contrat => contrat.statut === 0) || (contratsTries.length > 0 ? contratsTries[0] : null);
  };
  const isPeriodeEssai = (contrat) => contrat?.typeContrat?.id === "CONT002" && contrat?.dateFinAssignationPoste;

  if (loading) return <LoadingSpinner />;

  if (!employeeData?.employe) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Employé non trouvé</Alert.Heading>
          <p>L'employé que vous recherchez n'existe pas ou a été supprimé.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={() => navigate('/dashboard-RH/employees')}>Retour à la liste des employés</Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const employe = employeeData.employe;
  const contratsTries = getContratsTries();
  const contratActuel = getContratActuel();
  const infosPro = contratActuel || {};

  return (
    <Container fluid className="py-4">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
            
<Card className="border mb-4 position-relative">
      {/* Dropdown positionné en absolu en haut à droite */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <Dropdown drop="down">
          <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center gap-2">
            <Download /> Actions
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleExportPDF(employe.id)}>
              <FileEarmarkTextFill className="me-2" />
              Exporter en PDF
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate(`/dashboard-RH/employees/${id}/absences`)}>
              <CalendarFill className="me-2" />
              Voir les absences
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate(`/dashboard-RH/employees/${id}/soldesConges`)}>
              <CalendarFill className="me-2" />
              Voir les soldes de congé 
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate(`/dashboard-RH/employees/${id}/mouvements`)}>
              <CalendarFill className="me-2" /> 
              Voir les mouvements  
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-light rounded-circle p-3">
                <PersonFill size={40} className="text-primary" />
              </div>
              <div>
                <h1 className="h2 mb-2 fw-bold">{employe.prenom} {employe.nom}</h1>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <MatriculeBadge matricule={infosPro?.matricule || employe.matricule} />
                  <StatusBadge contrat={contratActuel} />
                </div>
              </div>
            </div>
            
            <div className="d-flex flex-wrap gap-2">
              {infosPro?.poste?.departement?.nom && (
                <Badge bg="light" text="dark" className="border d-flex align-items-center gap-1">
                  <BuildingFill size={12} />
                  {safeDisplay(infosPro?.poste?.departement?.nom)}
                </Badge>
              )}
              {infosPro?.poste?.nom && (
                <Badge bg="light" text="dark" className="border d-flex align-items-center gap-1">
                  <BriefcaseFill size={12} />
                  {safeDisplay(infosPro?.poste?.nom)}
                </Badge>
              )}
              {infosPro?.typeContrat?.intitule && (
                <Badge bg="light" text="dark" className="border">
                  {infosPro.typeContrat.intitule}
                </Badge>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4"><ExclamationTriangleFill className="me-2" />{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4"><CheckCircleFill className="me-2" />{success}</Alert>}

      <Card className="border mb-4">
        <Card.Body className="p-0">
          <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="border-0" fill>
            <Tab eventKey="personnel" title={<span className="d-flex align-items-center gap-2"><PersonFill /> Personnel</span>}>
              <div className="p-3">
                <Row className="g-4">
                  <Col lg={6}>
                    <InfoCard title="Informations Personnelles" icon={PersonFill} onEdit={openPersonnelModal}>
                      <Row>
                        <Col md={6}>
                          <InfoItem label="Nom" value={employe.nom} />
                          <InfoItem label="Prénom" value={employe.prenom} />
                          <InfoItem label="Date de naissance" value={formatDate(employe.dateNaissance)} icon={CalendarFill} />
                          <InfoItem label="Lieu de naissance" value={employe.lieuNaissance} />
                          <InfoItem label="Sexe" value={employe.sexe?.sexe} />
                          <InfoItem label="Nationalité" value={employe.nationalite?.nationalite} />
                        </Col>
                        <Col md={6}>
                          <InfoItem label="Nom du père" value={employe.nomPere} />
                          <InfoItem label="Nom de la mère" value={employe.nomMere} />
                          <InfoItem label="État civil" value={getEtatCivilLibelle(employe.etatCivil)} />
                          <InfoItem label="Nombre d'enfants" value={employe.nbEnfants} />
                          {employe.nomConjoint && <InfoItem label="Nom du conjoint" value={employe.nomConjoint} />}
                        </Col>
                      </Row>
                    </InfoCard>
                  </Col>
                  <Col lg={6}>
                    <Row className="g-4">
                      <Col xs={12}>
                        <InfoCard title="Coordonnées et Documents" icon={TelephoneFill} onEdit={openPersonnelModal}>
                          <InfoItem label="Email" value={employe.email} type="email" icon={EnvelopeFill} />
                          <InfoItem label="Téléphone" value={employe.telephone} type="phone" icon={TelephoneFill} />
                          <InfoItem label="Adresse" value={employe.adresse} icon={GeoAltFill} />
                          <InfoItem label="Région" value={employe.region?.nom} />
                          <InfoItem label="Code postal" value={employe.codePostal} />
                          <div className="mt-4">
                            <h6 className="fw-semibold mb-3">Documents administratifs</h6>
                            <InfoItem label="CIN" value={employe.cin} />
                            <InfoItem label="Numéro CNAPS" value={employe.numCnaps || '-'} />
                            <InfoItem label="Numéro OSTIE" value={employe.numOstie || '-'} />
                          </div>
                        </InfoCard>
                      </Col>
                      <Col xs={12}>
                        <InfoCard title="Contact d'urgence" icon={PeopleFill} onEdit={openContactModal}>
                          <InfoItem label="Nom" value={employe.emergencyContact?.nom} />
                          <InfoItem label="Téléphone" value={employe.emergencyContact?.contact} type="phone" />
                          <InfoItem label="Email" value={employe.emergencyContact?.email || '-'} type="email" />
                          <InfoItem label="Adresse" value={employe.emergencyContact?.adresse} />
                        </InfoCard>
                      </Col>
                      <Col xs={12}>
                        <InfoCard title="Modes de paiement" icon={CreditCardFill} onEdit={openModesPaiementModal} editLabel="Gérer les modes de paiement">
                          {loadingModes ? (
                            <div className="text-center py-3"><Spinner size="sm" animation="border" variant="primary" /><p className="mt-2 text-muted small">Chargement...</p></div>
                          ) : modesPaiement.length === 0 ? (
                            <Alert variant="info" className="py-2"><small>Aucun mode de paiement enregistré.</small></Alert>
                          ) : (
                            <div>
                              {modesPaiement.slice(0, 2).map(mode => (
                                <div key={mode.id} className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                  <div className="d-flex align-items-center gap-2">
                                    {mode.typePaiement?.id === 'TP001' && <Bank size={16} className="text-primary" />}
                                    {mode.typePaiement?.id === 'TP002' && <Phone size={16} className="text-success" />}
                                    {mode.typePaiement?.id === 'TP003' && <Cash size={16} className="text-warning" />}
                                    <div>
                                      <small className="d-block fw-semibold">{typesPaiement.find(t => t.id === mode.typePaiement?.id)?.libelle || 'Mode de paiement'}</small>
                                      {mode.typePaiement?.id === 'TP001' && <small className="text-muted">{mode.nomBanque} •••• {mode.numeroCompte?.slice(-4)}</small>}
                                      {mode.typePaiement?.id === 'TP002' && <small className="text-muted">{mode.telephoneMobile}</small>}
                                    </div>
                                  </div>
                                  {mode.estParDefaut && <Badge bg="success" pill>Défaut</Badge>}
                                </div>
                              ))}
                              {modesPaiement.length > 2 && (
                                <Button variant="link" className="p-0 mt-2 text-decoration-none" onClick={openModesPaiementModal}>
                                  + {modesPaiement.length - 2} autre(s) mode(s)
                                </Button>
                              )}
                            </div>
                          )}
                        </InfoCard>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Tab>
            <Tab eventKey="professionnel" title={<span className="d-flex align-items-center gap-2"><BriefcaseFill /> Professionnel</span>}>
              <div className="p-3">
                <Row className="g-4 mb-4">
                  <Col lg={8}>
                    <InfoCard title="Contrat Actuel" icon={BriefcaseFill} onEdit={() => openProModal(0)}>
                      <Row>
                        <Col md={6}>
                          <InfoItem label="Poste" value={infosPro?.poste?.nom} />
                          <InfoItem label="Département" value={infosPro?.poste?.departement?.nom || infosPro?.departement?.nom} />
                          <InfoItem label="Salaire de base" value={infosPro?.salaireBase} type="money" />
                          {infosPro?.manager?.employe && (
                            <InfoItem label="Manager" value={`${infosPro.manager.employe.prenom} ${infosPro.manager.employe.nom}`} linkTo={`/dashboard-RH/employees/employe/manager/${infosPro.manager.id}`} />
                          )}
                        </Col>
                        <Col md={6}>
                          <InfoItem label="Date d'embauche" value={formatDate(infosPro?.dateEmbauche)} icon={CalendarFill} />
                          <InfoItem label="Date début d'assignation" value={formatDate(infosPro?.dateDebutAssignationPoste)} icon={ClockFill} />
                          <InfoItem label="Date fin d'assignation" value={formatDate(infosPro?.dateFinAssignationPoste)} icon={ClockFill} />
                          <div className="mb-3">
                            <small className="text-muted d-flex align-items-center gap-1 mb-1">Type de contrat</small>
                            <ContratBadge typeContrat={infosPro?.typeContrat} />
                          </div>
                          {infosPro?.classification && <InfoItem label="Classification" value={infosPro.classification} />}
                          {infosPro?.categorieProfessionnelle && <InfoItem label="Catégorie professionnelle" value={infosPro.categorieProfessionnelle.libelle} />}
                          {infosPro?.typeTempsTravail && <InfoItem label="Temps de travail" value={infosPro.typeTempsTravail.tempsTravail} />}
                          {infosPro?.typeEntree && <InfoItem label="Type d'entrée" value={infosPro.typeEntree.nom || infosPro.typeEntree.libelle} />}
                        </Col>
                      </Row>
                    </InfoCard>
                  </Col>
                </Row>
                <Card className="border">
                  <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2"><ClockHistory /> Historique des Contrats</h5>
                  </Card.Header>
                  <Card.Body>
                    {contratsTries.length > 0 ? (
                      <Accordion>
                        {contratsTries.map((contrat, index) => (
                          <Accordion.Item eventKey={index.toString()} key={contrat.id}>
                            <Accordion.Header>
                              <div className="d-flex align-items-center gap-3 w-100">
                                <ContratBadge typeContrat={contrat.typeContrat} />
                                <div>
                                  <span className="fw-semibold">{contrat.poste?.nom || 'Poste non spécifié'}</span>
                                  <small className="text-muted ms-3">
                                    {formatDate(contrat.dateDebutAssignationPoste || contrat.dateEmbauche)}
                                    {contrat.dateFinAssignationPoste && ` → ${formatDate(contrat.dateFinAssignationPoste)}`}
                                  </small>
                                </div>
                                <div className="ms-auto"><StatusBadge contrat={contrat} /></div>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              <Row>
                                <Col md={6}>
                                  <h6 className="fw-semibold mb-3">Informations du contrat</h6>
                                  <Table borderless size="sm">
                                    <tbody>
                                      {contrat.classification && <tr><td className="text-muted">Classification:</td><td><Badge bg="light" text="dark" className="fw-normal border">{contrat.classification}</Badge></td></tr>}
                                      {contrat.categorieProfessionnelle && <tr><td className="text-muted">Catégorie:</td><td>{contrat.categorieProfessionnelle.libelle}</td></tr>}
                                      {contrat.typeTempsTravail && <tr><td className="text-muted">Temps travail:</td><td><Badge bg="light" text="dark" className="fw-normal border">{contrat.typeTempsTravail.tempsTravail}</Badge></td></tr>}
                                      {contrat.typeEntree && <tr><td className="text-muted">Type d'entrée:</td><td>{contrat.typeEntree.nom || contrat.typeEntree.libelle}</td></tr>}
                                      <tr><td className="text-muted" width="40%">Salaire:</td><td className="fw-semibold">{formatSalaire(contrat.salaireBase)}</td></tr>
                                      <tr><td className="text-muted">Département:</td><td>{contrat.poste?.departement?.nom || contrat.departement?.nom || '-'}</td></tr>
                                      <tr><td className="text-muted">Manager:</td><td>{contrat.manager?.employe ? `${contrat.manager.employe.prenom} ${contrat.manager.employe.nom}` : '-'}</td></tr>
                                      {isPeriodeEssai(contrat) && <tr><td className="text-muted">Type:</td><td><Badge bg="warning" text="dark">Période d'essai</Badge></td></tr>}
                                    </tbody>
                                  </Table>
                                </Col>
                                <Col md={6}>
                                  <h6 className="fw-semibold mb-3">Dates</h6>
                                  <Table borderless size="sm">
                                    <tbody>
                                      <tr><td className="text-muted" width="40%">Embauche:</td><td>{formatDate(contrat.dateEmbauche)}</td></tr>
                                      <tr><td className="text-muted">Début assignation:</td><td>{formatDate(contrat.dateDebutAssignationPoste)}</td></tr>
                                      <tr><td className="text-muted">Fin assignation:</td><td>{formatDate(contrat.dateFinAssignationPoste) || 'Indéterminée'}</td></tr>
                                    </tbody>
                                  </Table>
                                </Col>
                              </Row>
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    ) : (
                      <Alert variant="info" className="text-center">Aucun contrat enregistré pour cet employé.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
        <Card.Footer className="bg-white py-3">
          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={() => navigate(-1)} className="d-flex align-items-center gap-2"><ChevronLeft /> Retour</Button>
          </div>
        </Card.Footer>
      </Card>

      <PersonnelModal show={showPersonnelModal} onClose={() => setShowPersonnelModal(false)} personnelData={personnelData} onDataChange={handlePersonnelDataChange} onSave={savePersonnel} isSubmitting={isSubmittingPersonnel} etatsCivilOptions={etatsCivilOptions} sexes={sexes} nationalites={nationalites} regions={regions} />
      <ProModal show={showProModal} onClose={() => setShowProModal(false)} proData={proData} onDataChange={handleProDataChange} onSave={savePro} isSubmitting={isSubmittingPro} categories={categories} typeTempsTravails={typeTempsTravails} typeEntrees={typeEntrees} />
      <ContactModal show={showContactModal} onClose={() => setShowContactModal(false)} contactData={contactData} onDataChange={handleContactDataChange} onSave={saveContact} isSubmitting={isSubmittingContact} />
      <ModesPaiementModal show={showModesPaiementModal} onClose={() => setShowModesPaiementModal(false)} modesPaiement={modesPaiement} typesPaiement={typesPaiement} onSave={saveModesPaiement} isSubmitting={isSubmittingModes} error={modesError} employeId={id} employeeData={employeeData} />
    </Container>
  );
}

export default EmployeeInfo;