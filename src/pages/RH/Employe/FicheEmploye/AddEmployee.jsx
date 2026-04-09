// src/components/AddEmployeeModal.jsx
import React, { useState, useEffect } from "react";
import { 
  Button, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Alert, 
  Spinner,
  Modal,
  ProgressBar 
} from "react-bootstrap";
import {
  PersonFill,
  ChevronLeft,
  ChevronRight,
  CheckCircleFill,
  TelephoneFill,
  EnvelopeFill,
  GeoAltFill,
  BriefcaseFill,
  CalendarFill,
  BuildingFill,
  PeopleFill,
  CreditCardFill
} from "react-bootstrap-icons";
import axiosInstance from "../../../utils/AxiosInstance";

// Définir l'enum des états civils
const ETAT_CIVIL = {
  CELIBATAIRE: "CELIBATAIRE",
  MARIE: "MARIE",
  DIVORCE: "DIVORCE",
  VEUF: "VEUF"
};

// Options pour l'affichage
const ETAT_CIVIL_OPTIONS = [
  { value: ETAT_CIVIL.CELIBATAIRE, label: "Célibataire" },
  { value: ETAT_CIVIL.MARIE, label: "Marié(e)" },
  { value: ETAT_CIVIL.DIVORCE, label: "Divorcé(e)" },
  { value: ETAT_CIVIL.VEUF, label: "Veuf/Veuve" }
];

// Durées de période d'essai par catégorie
const DUREES_ESSAI = [
  { value: "2", label: "2 mois (Ouvriers/Employés)" },
  { value: "3", label: "3 mois (Agents de maîtrise)" },
  { value: "6", label: "6 mois (Cadres)" }
];

// Durées suggérées par type de contrat
const DUREES_SUGGEREES = {
  "CONT001": [], // CDI = pas de suggestions
  "CONT002": [3, 6, 12, 18, 24], // CDD
  "CONT003": [1, 2, 3, 6], // Stage
  "CONT004": [12, 18, 24, 36], // Alternance
  "CONT008": [3, 6, 12, 18], // Projet
  "CONT010": [3, 6, 9, 12] // Saisonnier
};

// Composant pour les étapes
const StepIndicator = ({ step, currentStep }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="d-flex align-items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="d-flex flex-column align-items-center">
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= s ? 'bg-primary text-white' : 'bg-light text-muted border'}`}
                 style={{ width: '36px', height: '36px', fontWeight: '600' }}>
              {s}
            </div>
            <small className={`mt-1 ${currentStep >= s ? 'text-primary fw-semibold' : 'text-muted'}`}>
              {s === 1 ? 'Personnel' : s === 2 ? 'Contact & Paiement' : 'Professionnel'}
            </small>
          </div>
        ))}
      </div>
    </div>
    <ProgressBar 
      now={(currentStep / 3) * 100} 
      style={{ height: '3px' }}
      variant="primary"
    />
  </div>
);

function AddEmployeeModal({ show, onHide, onSuccess, refreshEmployees }) {
  const [step, setStep] = useState(1);
  const [sexes, setSexes] = useState([]);
  const [postes, setPostes] = useState([]);
  const [typeContrats, setTypeContrats] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [nationalites, setNationalites] = useState([]);
  const [regions, setRegions] = useState([]);
  const [typesPaiement, setTypesPaiement] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingPostes, setLoadingPostes] = useState(false);
  const [showNomConjoint, setShowNomConjoint] = useState(false);
  const [assignedManager, setAssignedManager] = useState(null);
  const [loadingManager, setLoadingManager] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [typeTempsTravails, setTypeTempsTravails] = useState([]);
  const [typeEntrees, setTypeEntrees] = useState([]);

  const [employee, setEmployee] = useState({
    // Informations personnelles
    nom: "",
    prenom: "",
    sexeId: "",
    dateNaissance: "",
    telephone: "",
    email: "",
    adresse: "",
    nomMere: "",
    nomPere: "",
    lieuNaissance: "",
    nationaliteId: "",

    // Contact d'urgence
    contactUrgence: "",
    emailUrgence: "",
    adresseUrgence: "",
    telephoneUrgence: "",

    // Informations administratives
    numCnaps: "",
    cin: "",
    nombreEnfants: 0,
    etatCivil: ETAT_CIVIL.CELIBATAIRE,
    nomConjoint: "",
    numOstie: "",
    codePostal: "",
    idRegion: "",

    // Informations professionnelles
    dateEmbauche: "",
    matricule: "",
    salaireBaseEssai: "",
    salaireBaseApresEssai: "",
    typeContratId: "",
    dureeContratMois: "",
    posteId: "",
    departementId: "",
    managerId: "",
    classification: "",
    idCategorie: "",
    idTempsTravail: "",
    idTypeEntree: "",
    
    // Période d'essai
    avecPeriodeEssai: true,
    dureeEssai: "3",
    dateDebutEssai: "",
    dateFinEssai: "",
    
    // Dates d'assignation
    dateDebutAssignation: "",
    dateFinAssignation: "",

    // Modes de paiement
    modePaiements: []
  });

  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      if (!show) return;
      
      try {
        setDataLoading(true);
        setError('');

        const [
          sexesResponse,
          contratsResponse,
          departementsResponse,
          nationalitesResponse,
          regionsResponse,
          categoriesResponse,
          typeTempsTravailsResponse,
          typeEntreesResponse,
          typesPaiementResponse,
        ] = await Promise.all([
          axiosInstance.get("/api/sexes"),
          axiosInstance.get("/api/type-contrats"),
          axiosInstance.get("/api/departements"),
          axiosInstance.get("/api/nationalites"),
          axiosInstance.get("/api/regions"), 
          axiosInstance.get("/api/categories-professionnelles"),
          axiosInstance.get("/api/types-temps-travail"),
          axiosInstance.get("/api/types-entree"),
          axiosInstance.get("/api/types-paiement"),
        ]);

        setSexes(sexesResponse.data);
        setTypeContrats(contratsResponse.data);
        setDepartements(departementsResponse.data);
        setNationalites(nationalitesResponse.data);
        setRegions(regionsResponse.data);
        setCategories(categoriesResponse.data); 
        setTypeTempsTravails(typeTempsTravailsResponse.data); 
        setTypeEntrees(typeEntreesResponse.data); 
        setTypesPaiement(typesPaiementResponse.data);

        const analamanga = regionsResponse.data.find(
          region => region.nom && region.nom.toLowerCase().includes('analamanga')
        );

        if (analamanga) {
          setEmployee(prev => ({ ...prev, idRegion: analamanga.id }));
        }

        const tempsPlein = typeTempsTravailsResponse.data.find(
          type => type.tempsTravail && 
          (type.tempsTravail.toLowerCase().includes('temps plein') || 
          type.tempsTravail.toLowerCase().includes('temps-plein') ||
          type.tempsTravail.toLowerCase().includes('plein'))
        );

        if (tempsPlein) {
          setEmployee(prev => ({ ...prev, idTempsTravail: tempsPlein.id }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError('Erreur lors du chargement des données initiales');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [show]);

  // Mettre à jour le titulaire du compte quand le nom/prénom change
  useEffect(() => {
    if (employee.nom || employee.prenom) {
      setEmployee(prev => ({
        ...prev,
        modePaiements: prev.modePaiements.map(mode => ({
          ...mode,
          titulaireCompte: `${employee.nom} ${employee.prenom}`.trim()
        }))
      }));
    }
  }, [employee.nom, employee.prenom]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        setStep(1);
        setEmployee({
          nom: "",
          prenom: "",
          sexeId: "",
          dateNaissance: "",
          telephone: "",
          email: "",
          adresse: "",
          nomMere: "",
          nomPere: "",
          lieuNaissance: "",
          nationaliteId: "",
          contactUrgence: "",
          emailUrgence: "",
          adresseUrgence: "",
          telephoneUrgence: "",
          numCnaps: "",
          cin: "",
          numOstie: "",
          codePostal: "",
          idRegion: "",
          classification: "",
          idCategorie: "",
          idTempsTravail: "",
          idTypeEntree: "",
          nombreEnfants: 0,
          etatCivil: ETAT_CIVIL.CELIBATAIRE,
          nomConjoint: "",
          dateEmbauche: "",
          matricule: "",
          salaireBaseEssai: "",
          salaireBaseApresEssai: "",
          typeContratId: "",
          dureeContratMois: "",
          posteId: "",
          departementId: "",
          managerId: "",
          avecPeriodeEssai: true,
          dureeEssai: "3",
          dateDebutEssai: "",
          dateFinEssai: "",
          dateDebutAssignation: "",
          dateFinAssignation: "",
          modePaiements: []
        });
        setPostes([]);
        setAssignedManager(null);
        setShowNomConjoint(false);
        setError('');
      }, 300);
    }
  }, [show]);

  // Fonctions pour les modes de paiement
  const ajouterModePaiement = () => {
    if (employee.modePaiements.length >= 2) return;
    
    const nouveauMode = {
      id: `temp_${Date.now()}_${Math.random()}`,
      typePaiementId: "",
      nomBanque: "",
      codeBanque: "",
      codeGuichet: "",
      numeroCompte: "",
      cleRib: "",
      titulaireCompte: `${employee.nom} ${employee.prenom}`.trim(),
      domiciliationAgence: "",
      telephoneMobile: "",
      estActif: true,
      estParDefaut: employee.modePaiements.length === 0
    };
    
    setEmployee(prev => ({
      ...prev,
      modePaiements: [...prev.modePaiements, nouveauMode]
    }));
  };

  const supprimerModePaiement = (index) => {
    // Demander confirmation avant suppression
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce mode de paiement ?')) {
      return;
    }
    
    setEmployee(prev => {
      const nouveauxModes = prev.modePaiements.filter((_, i) => i !== index);
      
      // Si après suppression il reste des modes
      if (nouveauxModes.length > 0) {
        // Vérifier s'il y a toujours un mode par défaut
        const aUnDefault = nouveauxModes.some(m => m.estParDefaut);
        
        // Si aucun mode par défaut, mettre le premier comme défaut
        if (!aUnDefault) {
          nouveauxModes[0].estParDefaut = true;
        }
      }
      
      return { ...prev, modePaiements: nouveauxModes };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const calculerProchainePaie = () => {
    if (!employee.dateFinEssai) return null;
    return getDateSuivante(employee.dateFinEssai);
  };

  const updateModePaiement = (index, field, value) => {
    setEmployee(prev => {
      const nouveauxModes = [...prev.modePaiements];
      nouveauxModes[index] = { ...nouveauxModes[index], [field]: value };
      
      const mode = nouveauxModes[index];
      
      // Si les champs bancaires sont modifiés, déclencher le calcul de la clé RIB
      if (field === 'codeBanque' || field === 'codeGuichet' || field === 'numeroCompte') {
        // Vérifier si tous les champs sont complets (5,5,11)
        if (mode.codeBanque?.length === 5 && 
            mode.codeGuichet?.length === 5 && 
            mode.numeroCompte?.length === 11) {
          
          // Vider la clé RIB en attendant le calcul
          nouveauxModes[index].cleRib = '';
          
          // Appel API pour calculer la clé RIB
          calculerCleRIB(index, mode.codeBanque, mode.codeGuichet, mode.numeroCompte);
        } else {
          // Vider la clé si les champs ne sont pas complets
          nouveauxModes[index].cleRib = '';
        }
      }
      
      // Gestion du mode par défaut
      if (field === 'estParDefaut' && value === true) {
        nouveauxModes.forEach((mode, i) => {
          if (i !== index) mode.estParDefaut = false;
        });
      }
      
      return { ...prev, modePaiements: nouveauxModes };
    });
  };

  // Fonction pour calculer la clé RIB
  const calculerCleRIB = async (index, codeBanque, codeGuichet, numeroCompte) => {
    try {
      const response = await axiosInstance.post('/api/modes-paiement/calculer-cle-rib', {
        codeBanque,
        codeGuichet,
        numeroCompte
      });
      
      setEmployee(prev => {
        const nouveauxModes = [...prev.modePaiements];
        nouveauxModes[index].cleRib = response.data.cleRib;
        return { ...prev, modePaiements: nouveauxModes };
      });
    } catch (error) {
      console.error("Erreur calcul clé RIB:", error);
    }
  };

  // Fonction pour charger les postes d'un département spécifique
  const fetchPostesByDepartement = async (departementId) => {
    if (!departementId) {
      setPostes([]);
      return;
    }

    try {
      setLoadingPostes(true);
      const response = await axiosInstance.get(`/api/departements/${departementId}/postes`);
      setPostes(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des postes:", error);
      setPostes([]);
    } finally {
      setLoadingPostes(false);
    }
  };

  // Fonction pour charger le manager assigné au département
  const fetchManagerByDepartement = async (departementId) => {
    if (!departementId) {
      setAssignedManager(null);
      setEmployee(prev => ({ ...prev, managerId: "" }));
      return;
    }

    try {
      setLoadingManager(true);
      const response = await axiosInstance.get(`/api/managers/by-departement/${departementId}`);
      
      if (response.data) {
        const manager = response.data;
        setAssignedManager(manager);
        setEmployee(prev => ({ 
          ...prev, 
          managerId: manager.id 
        }));
      } else {
        setAssignedManager(null);
        setEmployee(prev => ({ ...prev, managerId: "" }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setAssignedManager(null);
        setEmployee(prev => ({ ...prev, managerId: "" }));
      } else {
        console.error("Erreur lors du chargement du manager:", error);
        setAssignedManager(null);
        setEmployee(prev => ({ ...prev, managerId: "" }));
      }
    } finally {
      setLoadingManager(false);
    }
  };

  // Calculer la date de fin d'essai
  const calculerDateFinEssai = (dateDebut, dureeMois) => {
    if (!dateDebut || !dureeMois) return "";

    const [y, m, d] = dateDebut.split("-").map(Number);
    const debut = new Date(y, m - 1, d);

    // Date cible = même jour, X mois plus tard
    let cible = new Date(y, m - 1 + Number(dureeMois), d);

    // Si le mois cible n'a pas ce jour (ex: 31 février),
    // JS déborde → on revient au dernier jour du mois cible
    if (cible.getDate() !== d) {
      cible = new Date(y, m - 1 + Number(dureeMois) + 1, 0);
    }

    // Fin de période = veille
    cible.setDate(cible.getDate() - 1);

    // Format YYYY-MM-DD (local, sans UTC)
    const yyyy = cible.getFullYear();
    const mm = String(cible.getMonth() + 1).padStart(2, "0");
    const dd = String(cible.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  // Calculer la date du jour suivant
  const getDateSuivante = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Calculer la date de fin d'assignation selon la durée saisie
  const calculerDateFinAssignation = (dateDebut, dureeMois) => {
    if (!dateDebut || !dureeMois) return null;
    
    const date = new Date(dateDebut);
    date.setMonth(date.getMonth() + parseInt(dureeMois));
    const derniereDate = new Date(date.getFullYear(), date.getMonth(), 0);
    return derniereDate.toISOString().split('T')[0];
  };

  // Obtenir les durées suggérées pour le type de contrat sélectionné
  const getDureesSuggeress = () => {
    if (!employee.typeContratId) return [];
    return DUREES_SUGGEREES[employee.typeContratId] || [];
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === "departementId") {
      const newEmployee = { 
        ...employee, 
        [name]: value,
        posteId: "",
        managerId: ""
      };
      
      setEmployee(newEmployee);
      await fetchPostesByDepartement(value);
      await fetchManagerByDepartement(value);
    } 
    else if (name === "etatCivil") {
      const newEmployee = { ...employee, [name]: value };
      
      if (value !== ETAT_CIVIL.MARIE) {
        newEmployee.nomConjoint = "";
      }
      
      setEmployee(newEmployee);
    }
    else if (name === "typeContratId") {
      const newEmployee = { ...employee, [name]: value };
      const contratCDI = value === "CONT001";
      const contratCDD = value === "CONT002";
      
      if (contratCDI) {
        newEmployee.avecPeriodeEssai = true;
        newEmployee.dureeEssai = "3";
        newEmployee.dureeContratMois = "";

        if (employee.dateEmbauche) {
          newEmployee.dateDebutEssai = employee.dateEmbauche;
          newEmployee.dateFinEssai = calculerDateFinEssai(employee.dateEmbauche, "3");
          console.log("CDI sélectionné - Dates d'essai calculées:", 
            newEmployee.dateDebutEssai, "->", newEmployee.dateFinEssai);
        }
      } else if (contratCDD) {
        newEmployee.avecPeriodeEssai = false;
        newEmployee.dureeEssai = "3";
        newEmployee.dureeContratMois = "12";
      } else {
        newEmployee.avecPeriodeEssai = false;
        newEmployee.dureeEssai = "";
        newEmployee.dureeContratMois = "";
      }
      
      // newEmployee.dateDebutEssai = "";
      // newEmployee.dateFinEssai = "";
      
      if (employee.dateEmbauche && newEmployee.dureeContratMois && value !== "CONT001") {
        newEmployee.dateFinAssignation = calculerDateFinAssignation(employee.dateEmbauche, newEmployee.dureeContratMois);
      } else if (value === "CONT001") {
        newEmployee.dateFinAssignation = null;
      }
      
      setEmployee(newEmployee);
    }  
    else if (name === "dateEmbauche") {
      const newEmployee = { ...employee, [name]: value };
      // newEmployee.dateDebutAssignation = value;
      // newEmployee.dateDebutEssai = value;
      // console.log("dateDebutEssai : ", newEmployee.dateDebutEssai);
      // console.log("tafiditra ato++++++++++++++++++");
      // console.log("dureeEssai : ", employee.dureeEssai);
      
      // const dureeEssaiUtilisee = employee.dureeEssai || "3";
      // if (dureeEssaiUtilisee) {
      //   newEmployee.dateFinEssai = calculerDateFinEssai(newEmployee.dateDebutEssai, dureeEssaiUtilisee);
      //   console.log("dateFin : ", newEmployee.dateFinEssai);
      // }
      // if (employee.dureeContratMois && employee.typeContratId !== "CONT001") {
      //   newEmployee.dateFinAssignation = calculerDateFinAssignation(value, employee.dureeContratMois);
      // }

      if (employee.typeContratId === "CONT001") {
        newEmployee.dateDebutEssai = value; // Date d'embauche = date début essai
        
        // Calculer la date de fin d'essai avec la durée par défaut (3 mois)
        if (employee.dureeEssai || "3") {
          const duree = employee.dureeEssai || "3";
          newEmployee.dateFinEssai = calculerDateFinEssai(value, duree);
          console.log("CDI - Date fin essai calculée:", newEmployee.dateFinEssai);
        }
      }
      
      setEmployee(newEmployee);
    } 
    else if (name === "dateDebutEssai") {
      const newEmployee = { ...employee, [name]: value };
      console.log("taf ato au moins6+++++++++");
      newEmployee.dateDebutEssai = employee.dateEmbauche;
      console.log("dateDebutEssai : ", newEmployee.dateDebutEssai);
      console.log("duréeEssai : ", employee.dureeEssai);
      if (employee.dureeEssai) {
        newEmployee.dateFinEssai = calculerDateFinEssai(value, employee.dureeEssai);
        console.log("fin : ", newEmployee.dateFinEssai);
      }
      setEmployee(newEmployee);
    }
    else if (name === "dureeEssai") {
      const newEmployee = { ...employee, [name]: value };
      console.log("ato e");
      console.log("durée essai : ", value);
      console.log("date débt : ", employee.dateDebutEssai);
      console.log("dateEmbauche : ", employee.dateEmbauche);

      const dateDebut = employee.dateDebutEssai || employee.dateEmbauche;
      if (dateDebut && value) {
        newEmployee.dateFinEssai = calculerDateFinEssai(dateDebut, value);
        console.log("dateFinEssai :", newEmployee.dateFinEssai);
      }
      setEmployee(newEmployee);
    }
    else if (name === "dureeContratMois") {
      const newEmployee = { ...employee, [name]: value };
      
      if (value && employee.dateEmbauche && employee.typeContratId !== "CONT001") {
        newEmployee.dateFinAssignation = calculerDateFinAssignation(employee.dateEmbauche, value);
      } else if (employee.typeContratId === "CONT001") {
        newEmployee.dateFinAssignation = null;
      }
      
      setEmployee(newEmployee);
    }
    else if (name === "avecPeriodeEssai") {
      const isChecked = e.target.checked;
      const newEmployee = { ...employee, [name]: isChecked };
      
      if (!isChecked) {
        newEmployee.dateDebutEssai = "";
        newEmployee.dateFinEssai = "";
      }
      
      setEmployee(newEmployee);
    }
    else if (name === "managerId") {
      return;
    }
    else {
      setEmployee({ ...employee, [name]: value });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!employee.nom || !employee.prenom || !employee.cin || !employee.sexeId || !employee.nationaliteId || !employee.dateNaissance || !employee.telephone || !employee.email || !employee.adresse) {
        setError("Veuillez remplir tous les champs obligatoires de l'étape 1.");
        return;
      }
    } else if (step === 2) {
      if (!employee.contactUrgence) {
        setError("Le nom du contact d'urgence est obligatoire.");
        return;
      }
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation finale
    if (employee.typeContratId === "CONT001" && !employee.avecPeriodeEssai) {
      setError("Pour un CDI, une période d'essai est obligatoire selon la pratique courante à Madagascar.");
      return;
    }
    
    if (employee.typeContratId !== "CONT001" && !employee.dureeContratMois) {
      setError("Veuillez saisir la durée du contrat pour les contrats à durée déterminée.");
      return;
    }
    
    if (employee.avecPeriodeEssai) {
      if (!employee.dateFinEssai) {
        setError("Pour une période d'essai, veuillez saisir les dates de début et de fin.");
        return;
      }
      
      const dateDebut = new Date(employee.dateDebutEssai);
      const dateFin = new Date(employee.dateFinEssai);
      
      if (dateFin <= dateDebut) {
        setError("La date de fin de période d'essai doit être postérieure à la date de début.");
        return;
      }
      
      if (!employee.salaireBaseApresEssai) {
        setError("Veuillez saisir le salaire de base après la période d'essai.");
        return;
      }
    }

    if (employee.etatCivil === ETAT_CIVIL.MARIE && !employee.nomConjoint) {
      setError("Le nom du conjoint est obligatoire pour les personnes mariées.");
      return;
    }

    if (!employee.matricule || !employee.dateEmbauche || !employee.typeContratId || !employee.posteId || !employee.departementId) {
      setError("Veuillez remplir tous les champs obligatoires des informations professionnelles.");
      return;
    }

    if (!employee.salaireBaseEssai) {
      setError("Veuillez saisir le salaire de base pendant la période d'essai.");
      return;
    }

    // Validation des modes de paiement
    const modesValides = employee.modePaiements.filter(
      mode => mode.typePaiementId && (
        (mode.typePaiementId === 'TP001' && mode.nomBanque && mode.codeBanque && mode.codeGuichet && mode.numeroCompte) ||
        (mode.typePaiementId === 'TP002' && mode.telephoneMobile) ||
        (mode.typePaiementId === 'TP003')
      )
    );
    
    if (modesValides.length > 0 && !modesValides.some(m => m.estParDefaut)) {
      setError("Un mode de paiement doit être défini comme par défaut.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        employe: {
          nom: employee.nom,
          prenom: employee.prenom,
          dateNaissance: employee.dateNaissance,
          telephone: employee.telephone,
          email: employee.email,
          adresse: employee.adresse,
          nomMere: employee.nomMere || "",
          nomPere: employee.nomPere || "",
          lieuNaissance: employee.lieuNaissance || "",
          numCnaps: employee.numCnaps || "",
          numOstie: employee.numOstie || "",
          codePostal: employee.codePostal || 0,
          cin: employee.cin,
          nbEnfants: parseInt(employee.nombreEnfants) || 0,
          etatCivil: employee.etatCivil,
          nomConjoint: employee.etatCivil === ETAT_CIVIL.MARIE ? employee.nomConjoint : null,
        },
        region: {
            id: employee.idRegion
        },
        sexe: { id: employee.sexeId },
        nationalite: { id: employee.nationaliteId },
        infosAdministratives: {
          createdAt: new Date().toISOString().split('T')[0] + 'T08:00:00',
          modifiedAt: null
        },
        emergencyContact: {
          nom: employee.contactUrgence,
          email: employee.emailUrgence || "",
          adresse: employee.adresseUrgence || "",
          contact: employee.telephoneUrgence || "",
        },
        infosProfessionnelles: [],
        modePaiements: modesValides.map(mode => ({
          nomBanque: mode.nomBanque,
          codeBanque: mode.codeBanque,
          codeGuichet: mode.codeGuichet,
          numeroCompte: mode.numeroCompte,
          cleRib: mode.cleRib,
          titulaireCompte: mode.titulaireCompte,
          domiciliationAgence: mode.domiciliationAgence,
          telephoneMobile: mode.telephoneMobile,
          estActif: mode.estActif,
          estParDefaut: mode.estParDefaut,
          typePaiement: { id: mode.typePaiementId }
        }))
      };
      
      if (employee.avecPeriodeEssai) {
        payload.infosProfessionnelles.push({
          matricule: employee.matricule,
          dateEmbauche: employee.dateEmbauche,
          dateDebutAssignationPoste: employee.dateEmbauche,
          dateFinAssignationPoste: employee.dateFinEssai,
          salaireBase: parseFloat(employee.salaireBaseEssai),
          typeContrat: { id: "CONT002" },
          poste: { id: employee.posteId },
          departement: { id: employee.departementId },
          categorieProfessionnelle: employee.idCategorie ? { id: employee.idCategorie } : null,
          typeTempsTravail: employee.idTempsTravail ? { id: employee.idTempsTravail } : null,
          typeEntree: employee.idTypeEntree ? { id: employee.idTypeEntree } : null,
          manager: assignedManager ? { id: assignedManager.id } : null,
          employe: {}
        });

        if (employee.typeContratId === "CONT001") {
          const dateDebutApresEssai = getDateSuivante(employee.dateFinEssai);
          
          payload.infosProfessionnelles.push({
            matricule: employee.matricule,
            dateEmbauche: employee.dateEmbauche,
            dateDebutAssignationPoste: dateDebutApresEssai,
            dateFinAssignationPoste: null,
            salaireBase: parseFloat(employee.salaireBaseApresEssai),
            typeContrat: { id: "CONT001" },
            poste: { id: employee.posteId },
            departement: { id: employee.departementId },
            categorieProfessionnelle: employee.idCategorie ? { id: employee.idCategorie } : null,
            typeTempsTravail: employee.idTempsTravail ? { id: employee.idTempsTravail } : null,
            typeEntree: employee.idTypeEntree ? { id: employee.idTypeEntree } : null,
            manager: assignedManager ? { id: assignedManager.id } : null,
            employe: {}
          });
        } else if (employee.typeContratId === "CONT002") {
          const dateDebutApresEssai = getDateSuivante(employee.dateFinEssai);
          const dateFinCDD = calculerDateFinAssignation(dateDebutApresEssai, employee.dureeContratMois);
          
          payload.infosProfessionnelles.push({
            matricule: employee.matricule,
            dateEmbauche: employee.dateEmbauche,
            dateDebutAssignationPoste: dateDebutApresEssai,
            dateFinAssignationPoste: dateFinCDD,
            salaireBase: parseFloat(employee.salaireBaseApresEssai),
            typeContrat: { id: "CONT002" },
            poste: { id: employee.posteId },
            departement: { id: employee.departementId },
            categorieProfessionnelle: employee.idCategorie ? { id: employee.idCategorie } : null,
            typeTempsTravail: employee.idTempsTravail ? { id: employee.idTempsTravail } : null,
            typeEntree: employee.idTypeEntree ? { id: employee.idTypeEntree } : null,
            manager: assignedManager ? { id: assignedManager.id } : null,
            employe: {}
          });
        }
      } else {
        const dateFinAssignation = employee.typeContratId === "CONT001" 
          ? null 
          : calculerDateFinAssignation(employee.dateEmbauche, employee.dureeContratMois);
        
        const salaireUtilise = employee.salaireBaseEssai || employee.salaireBaseApresEssai;

        payload.infosProfessionnelles.push({
          matricule: employee.matricule,
          dateEmbauche: employee.dateEmbauche,
          dateDebutAssignationPoste: employee.dateEmbauche,
          dateFinAssignationPoste: dateFinAssignation,
          salaireBase: parseFloat(salaireUtilise),
          typeContrat: { id: employee.typeContratId },
          poste: { id: employee.posteId },
          departement: { id: employee.departementId },
          categorieProfessionnelle: employee.idCategorie ? { id: employee.idCategorie } : null,
          typeTempsTravail: employee.idTempsTravail ? { id: employee.idTempsTravail } : null,
          typeEntree: employee.idTypeEntree ? { id: employee.idTypeEntree } : null,
          manager:{},
          employe: {}
        });
      }
      
      console.log("payload : ", payload);
      const response = await axiosInstance.post("/api/employes", payload);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (refreshEmployees) {
        refreshEmployees();
      }
      
      onHide();
      setStep(1);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      
      if (error.response) {
        setError(`Erreur: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        setError("Erreur inattendue: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effet pour afficher/masquer le champ nomConjoint
  useEffect(() => {
    setShowNomConjoint(employee.etatCivil === ETAT_CIVIL.MARIE);
  }, [employee.etatCivil]);

  const isCDI = employee.typeContratId === "CONT001";
  const isCDD = employee.typeContratId === "CONT002";
  const showPeriodeEssaiSection = isCDI || (isCDD && employee.avecPeriodeEssai);
  const showDureeContratField = employee.typeContratId && !isCDI;
  const dureesSuggeress = getDureesSuggeress();

  // Si le modal n'est pas visible, ne rien afficher
  if (!show) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton closeLabel="Fermer" className="border-bottom">
        <Modal.Title className="d-flex align-items-center gap-2">
          <PersonFill className="text-primary" />
          <span>Ajouter un nouvel employé</span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        )}

        <StepIndicator step={3} currentStep={step} />

        <Form onSubmit={handleSubmit}>
          {/* Étape 1 : Informations personnelles */}
          {step === 1 && (
            <div>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded-circle p-2 me-3">
                  <PersonFill size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="mb-1">Informations personnelles</h5>
                  <small className="text-muted">Renseignez les informations de base de l'employé</small>
                </div>
              </div>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={employee.nom}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prénom *</Form.Label>
                    <Form.Control
                      type="text"
                      name="prenom"
                      value={employee.prenom}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CIN *</Form.Label>
                    <Form.Control
                      type="text"
                      name="cin"
                      value={employee.cin}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro CNAPS</Form.Label>
                    <Form.Control
                      type="text"
                      name="numCnaps"
                      value={employee.numCnaps}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Optionnel"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>État civil *</Form.Label>
                    <Form.Select
                      name="etatCivil"
                      value={employee.etatCivil}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">-- Choisir votre état civil --</option>
                      {ETAT_CIVIL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {showNomConjoint && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom du conjoint *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nomConjoint"
                        value={employee.nomConjoint}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Entrez le nom complet du conjoint"
                      />
                    </Form.Group>
                  </Col>
                )}
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre d'enfants</Form.Label>
                    <Form.Control
                      type="number"
                      name="nombreEnfants"
                      value={employee.nombreEnfants}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sexe *</Form.Label>
                    <Form.Select
                      name="sexeId"
                      value={employee.sexeId}
                      onChange={handleChange}
                      required
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir --</option>
                      {sexes.map((s) => (
                        <option key={s.id} value={s.id}>{s.sexe}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nationalité *</Form.Label>
                    <Form.Select
                      name="nationaliteId"
                      value={employee.nationaliteId}
                      onChange={handleChange}
                      required
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir --</option>
                      {nationalites.map((n) => (
                        <option key={n.id} value={n.id}>{n.nationalite}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de naissance *</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateNaissance"
                      value={employee.dateNaissance}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lieu de naissance</Form.Label>
                    <Form.Control
                      type="text"
                      name="lieuNaissance"
                      value={employee.lieuNaissance}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <TelephoneFill size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        name="telephone"
                        value={employee.telephone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <EnvelopeFill size={14} />
                      </span>
                      <Form.Control
                        type="email"
                        name="email"
                        value={employee.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresse *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <GeoAltFill size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        name="adresse"
                        value={employee.adresse}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro OSTIE</Form.Label>
                    <Form.Control
                      type="text"
                      name="numOstie"
                      value={employee.numOstie}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={50}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Code postal</Form.Label>
                    <Form.Control
                      type="text"
                      name="codePostal"
                      value={employee.codePostal}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={50}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Région *</Form.Label>
                    <Form.Select
                      name="idRegion"
                      value={employee.idRegion}
                      onChange={handleChange}
                      required
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir une région --</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.nom}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom de la mère</Form.Label>
                    <Form.Control
                      type="text"
                      name="nomMere"
                      value={employee.nomMere}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom du père</Form.Label>
                    <Form.Control
                      type="text"
                      name="nomPere"
                      value={employee.nomPere}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          {/* Étape 2 : Contact d'urgence & Coordonnées de paiement */}
          {step === 2 && (
            <div>
              {/* SECTION 1: Contact d'urgence */}
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded-circle p-2 me-3">
                  <PeopleFill size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="mb-1">Contact d'urgence</h5>
                  <small className="text-muted">Personne à contacter en cas d'urgence</small>
                </div>
              </div>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom du contact *</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactUrgence"
                      value={employee.contactUrgence}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email du contact</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <EnvelopeFill size={14} />
                      </span>
                      <Form.Control
                        type="email"
                        name="emailUrgence"
                        value={employee.emailUrgence}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone du contact</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <TelephoneFill size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        name="telephoneUrgence"
                        value={employee.telephoneUrgence}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresse du contact</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <GeoAltFill size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        name="adresseUrgence"
                        value={employee.adresseUrgence}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* SECTION 2: Coordonnées de paiement */}
              <div className="mt-5">
                <hr />
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-light rounded-circle p-2 me-3">
                    <CreditCardFill size={20} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-1">Coordonnées de paiement</h5>
                    <small className="text-muted">
                      Où envoyer le salaire ? (Maximum 2 modes)
                    </small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Badge bg="info">Maximum 2 modes</Badge>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={ajouterModePaiement}
                    disabled={employee.modePaiements.length >= 2}
                  >
                    + Ajouter un mode de paiement
                  </Button>
                </div>
                
                {employee.modePaiements.length === 0 ? (
                  <Alert variant="info" className="py-2">
                    <small>Aucun mode de paiement saisi. Vous pourrez en ajouter plus tard.</small>
                  </Alert>
                ) : (
                  employee.modePaiements.map((mode, index) => (
                    <div key={mode.id} className="card mb-3 border">
                      <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                        <div>
                          <Badge bg={mode.estParDefaut ? "success" : "secondary"} className="me-2">
                            {mode.estParDefaut ? "Par défaut" : "Secondaire"}
                          </Badge>
                          <small className="text-muted">Mode {index + 1}/{employee.modePaiements.length}</small>
                        </div>
                        <Button 
                          variant="link" 
                          className="text-danger p-0" 
                          onClick={() => supprimerModePaiement(index)}
                        >
                          <small>Supprimer</small>
                        </Button>
                      </div>
                      <div className="card-body py-3">
                        {/* Type de paiement */}
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Type de paiement <span className="text-danger">*</span></Form.Label>
                              <Form.Select
                                size="sm"
                                value={mode.typePaiementId || ''}
                                onChange={(e) => updateModePaiement(index, 'typePaiementId', e.target.value)}
                                required
                              >
                                <option value="">-- Sélectionnez un type --</option>
                                {typesPaiement.map(t => (
                                  <option key={t.id} value={t.id}>{t.libelle}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Titulaire du compte <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                size="sm"
                                value={mode.titulaireCompte}
                                onChange={(e) => updateModePaiement(index, 'titulaireCompte', e.target.value)}
                                placeholder="Nom du titulaire"
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Affichage conditionnel selon le type */}
                        {mode.typePaiementId === 'TP001' && ( // BANCAIRE
                          <>
                            <Row className="mb-3">
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label>Nom de la banque <span className="text-danger">*</span></Form.Label>
                                  <Form.Control
                                    size="sm"
                                    value={mode.nomBanque || ''}
                                    onChange={(e) => updateModePaiement(index, 'nomBanque', e.target.value)}
                                    placeholder="Ex: BNI Madagascar"
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            {/* Code banque - 5 cases individuelles */}
                            <Row className="mb-2">
                              <Col md={12}>
                                <Form.Label>Code banque <span className="text-danger">*</span></Form.Label>
                              </Col>
                              <Col md={12}>
                                <div className="d-flex gap-1">
                                  {[0,1,2,3,4].map((pos) => (
                                    <Form.Control
                                      key={`cb_${index}_${pos}`}
                                      size="sm"
                                      style={{ width: '45px', textAlign: 'center' }}
                                      value={mode.codeBanque?.[pos] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                                        let newCodeBanque = mode.codeBanque || '';
                                        newCodeBanque = newCodeBanque.padEnd(5, '');
                                        const newValue = newCodeBanque.split('');
                                        newValue[pos] = val;
                                        const finalValue = newValue.join('');
                                        updateModePaiement(index, 'codeBanque', finalValue);
                                        
                                        // Auto-focus next field
                                        if (val && pos < 4) {
                                          const nextInput = document.getElementById(`cb_${index}_${pos+1}`);
                                          if (nextInput) nextInput.focus();
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !mode.codeBanque?.[pos] && pos > 0) {
                                          const prevInput = document.getElementById(`cb_${index}_${pos-1}`);
                                          if (prevInput) prevInput.focus();
                                        }
                                      }}
                                      maxLength="1"
                                      pattern="[0-9]"
                                      id={`cb_${index}_${pos}`}
                                      autoComplete="off"
                                    />
                                  ))}
                                </div>
                              </Col>
                            </Row>

                            {/* Code guichet - 5 cases individuelles */}
                            <Row className="mb-2">
                              <Col md={12}>
                                <Form.Label>Code guichet <span className="text-danger">*</span></Form.Label>
                              </Col>
                              <Col md={12}>
                                <div className="d-flex gap-1">
                                  {[0,1,2,3,4].map((pos) => (
                                    <Form.Control
                                      key={`cg_${index}_${pos}`}
                                      size="sm"
                                      style={{ width: '45px', textAlign: 'center' }}
                                      value={mode.codeGuichet?.[pos] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                                        let newCodeGuichet = mode.codeGuichet || '';
                                        newCodeGuichet = newCodeGuichet.padEnd(5, '');
                                        const newValue = newCodeGuichet.split('');
                                        newValue[pos] = val;
                                        const finalValue = newValue.join('');
                                        updateModePaiement(index, 'codeGuichet', finalValue);
                                        
                                        if (val && pos < 4) {
                                          const nextInput = document.getElementById(`cg_${index}_${pos+1}`);
                                          if (nextInput) nextInput.focus();
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !mode.codeGuichet?.[pos] && pos > 0) {
                                          const prevInput = document.getElementById(`cg_${index}_${pos-1}`);
                                          if (prevInput) prevInput.focus();
                                        }
                                      }}
                                      maxLength="1"
                                      pattern="[0-9]"
                                      id={`cg_${index}_${pos}`}
                                      autoComplete="off"
                                    />
                                  ))}
                                </div>
                              </Col>
                            </Row>

                            {/* Numéro de compte - 11 cases individuelles */}
                            <Row className="mb-2">
                              <Col md={12}>
                                <Form.Label>Numéro de compte <span className="text-danger">*</span></Form.Label>
                              </Col>
                              <Col md={12}>
                                <div className="d-flex gap-1 flex-wrap">
                                  {[0,1,2,3,4,5,6,7,8,9,10].map((pos) => (
                                    <Form.Control
                                      key={`nc_${index}_${pos}`}
                                      size="sm"
                                      style={{ width: '40px', textAlign: 'center', marginBottom: '5px' }}
                                      value={mode.numeroCompte?.[pos] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0,1);
                                        let newNumeroCompte = mode.numeroCompte || '';
                                        newNumeroCompte = newNumeroCompte.padEnd(11, '');
                                        const newValue = newNumeroCompte.split('');
                                        newValue[pos] = val;
                                        const finalValue = newValue.join('');
                                        updateModePaiement(index, 'numeroCompte', finalValue);
                                        
                                        if (val && pos < 10) {
                                          const nextInput = document.getElementById(`nc_${index}_${pos+1}`);
                                          if (nextInput) nextInput.focus();
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !mode.numeroCompte?.[pos] && pos > 0) {
                                          const prevInput = document.getElementById(`nc_${index}_${pos-1}`);
                                          if (prevInput) prevInput.focus();
                                        }
                                      }}
                                      maxLength="1"
                                      pattern="[0-9]"
                                      id={`nc_${index}_${pos}`}
                                      autoComplete="off"
                                    />
                                  ))}
                                </div>
                              </Col>
                            </Row>

                            {/* Clé RIB - 2 cases individuelles (readonly) */}
                            <Row className="mb-3">
                              <Col md={12}>
                                <Form.Label>Clé RIB</Form.Label>
                              </Col>
                              <Col md={12}>
                                <div className="d-flex gap-1">
                                  {[0,1].map((pos) => (
                                    <Form.Control
                                      key={`cr_${index}_${pos}`}
                                      size="sm"
                                      style={{ width: '45px', textAlign: 'center' }}
                                      value={mode.cleRib?.[pos] || ''}
                                      readOnly
                                      className={mode.cleRib ? 'bg-success bg-opacity-10' : 'bg-light'}
                                      placeholder="-"
                                    />
                                  ))}
                                </div>
                              </Col>
                            </Row>

                            <Row className="mb-3">
                              <Col md={8}>
                                <Form.Group>
                                  <Form.Label>Domiciliation agence</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    value={mode.domiciliationAgence || ''}
                                    onChange={(e) => updateModePaiement(index, 'domiciliationAgence', e.target.value)}
                                    placeholder="Ex: Agence Analakely"
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="d-block">Défaut</Form.Label>
                                  <Form.Check
                                    type="checkbox"
                                    checked={mode.estParDefaut || false}
                                    onChange={(e) => updateModePaiement(index, 'estParDefaut', e.target.checked)}
                                    disabled={mode.estParDefaut}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>

                            {/* Affichage du RIB complet */}
                            {mode.codeBanque?.length === 5 && mode.codeGuichet?.length === 5 && 
                            mode.numeroCompte?.length === 11 && mode.cleRib && (
                              <div className="mt-2 p-2 bg-light rounded">
                                <small className="text-muted">RIB complet :</small>
                                <div className="font-monospace">
                                  <strong>{mode.codeBanque} {mode.codeGuichet} {mode.numeroCompte} {mode.cleRib}</strong>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {mode.typePaiementId === 'TP002' && ( // MOBILE_MONEY
                          <Row>
                            <Col md={8}>
                              <Form.Group>
                                <Form.Label>Téléphone <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  size="sm"
                                  value={mode.telephoneMobile || ''}
                                  onChange={(e) => updateModePaiement(index, 'telephoneMobile', e.target.value)}
                                  placeholder="Ex: 0341234567"
                                  maxLength="10"
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="d-block">Défaut</Form.Label>
                                <Form.Check
                                  type="checkbox"
                                  checked={mode.estParDefaut || false}
                                  onChange={(e) => updateModePaiement(index, 'estParDefaut', e.target.checked)}
                                  disabled={mode.estParDefaut}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        )}

                        {mode.typePaiementId === 'TP003' && ( // ESPECES
                          <Row>
                            <Col md={12}>
                              <Alert variant="info" className="py-2 mb-2">
                                <small>Paiement en espèces - aucune coordonnée bancaire requise</small>
                              </Alert>
                            </Col>
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="d-block">Défaut</Form.Label>
                                <Form.Check
                                  type="checkbox"
                                  checked={mode.estParDefaut || false}
                                  onChange={(e) => updateModePaiement(index, 'estParDefaut', e.target.checked)}
                                  disabled={mode.estParDefaut}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Étape 3 : Informations professionnelles */}
          {step === 3 && (
            <div>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded-circle p-2 me-3">
                  <BriefcaseFill size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="mb-1">Informations professionnelles</h5>
                  <small className="text-muted">Détails du poste, contrat et rémunération</small>
                </div>
              </div>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Matricule *</Form.Label>
                    <Form.Control
                      type="text"
                      name="matricule"
                      value={employee.matricule}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date d'embauche *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <CalendarFill size={14} />
                      </span>
                      <Form.Control
                        type="date"
                        name="dateEmbauche"
                        value={employee.dateEmbauche}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Salaire de base pendant période d'essai (Ariary) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="salaireBaseEssai"
                      value={employee.salaireBaseEssai}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                
                {showPeriodeEssaiSection && employee.avecPeriodeEssai && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Salaire de base après période d'essai (Ariary) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="salaireBaseApresEssai"
                        value={employee.salaireBaseApresEssai}
                        onChange={handleChange}
                        required={employee.avecPeriodeEssai}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                )}
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de contrat *</Form.Label>
                    <Form.Select
                      name="typeContratId"
                      value={employee.typeContratId}
                      onChange={handleChange}
                      required
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir un type --</option>
                      {typeContrats.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.intitule}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {showDureeContratField ? (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Durée du contrat (mois) *</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          name="dureeContratMois"
                          value={employee.dureeContratMois}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          min="1"
                          max="60"
                        />
                        <span className="input-group-text">mois</span>
                      </div>
                      {dureesSuggeress.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">Durées suggérées :</small>
                          <div className="d-flex flex-wrap gap-2 mt-1">
                            {dureesSuggeress.map((duree) => (
                              <Button
                                key={duree}
                                variant={employee.dureeContratMois === duree.toString() ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => {
                                  setEmployee(prev => ({ 
                                    ...prev, 
                                    dureeContratMois: duree.toString(),
                                    dateFinAssignation: prev.dateEmbauche 
                                      ? calculerDateFinAssignation(prev.dateEmbauche, duree.toString())
                                      : prev.dateFinAssignation
                                  }));
                                }}
                              >
                                {duree} mois
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                ) : (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Durée du contrat</Form.Label>
                      <Form.Control
                        value="CDI - Durée indéterminée"
                        readOnly
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                )}
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Département *</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <BuildingFill size={14} />
                      </span>
                      <Form.Select
                        name="departementId"
                        value={employee.departementId}
                        onChange={handleChange}
                        required
                        disabled={dataLoading || loading}
                      >
                        <option value="">-- Choisir un département --</option>
                        {departements.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nom}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Poste *</Form.Label>
                    <Form.Select
                      name="posteId"
                      value={employee.posteId}
                      onChange={handleChange}
                      required
                      disabled={!employee.departementId || loadingPostes || loading}
                    >
                      <option value="">-- Choisir un poste --</option>
                      {postes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingPostes && (
                      <small className="text-muted">Chargement des postes...</small>
                    )}
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Manager assigné</Form.Label>
                    <Form.Control
                      value={
                        loadingManager 
                          ? "Chargement du manager..." 
                          : assignedManager 
                            ? `${assignedManager.employe?.nom || ''} ${assignedManager.employe?.prenom || ''}`.trim() 
                            : "Aucun manager assigné à ce département"
                      }
                      readOnly
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Classification</Form.Label>
                    <Form.Control
                      type="text"
                      name="classification"
                      value={employee.classification}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Ex: Cadre, Agent de maîtrise, Employé"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Catégorie professionnelle</Form.Label>
                    <Form.Select
                      name="idCategorie"
                      value={employee.idCategorie}
                      onChange={handleChange}
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir une catégorie --</option>
                      {categories.map((categorie) => (
                        <option key={categorie.id} value={categorie.id}>
                          {categorie.libelle} ({categorie.code})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type de temps de travail</Form.Label>
                    <Form.Select
                      name="idTempsTravail"
                      value={employee.idTempsTravail}
                      onChange={handleChange}
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir un type --</option>
                      {typeTempsTravails.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.tempsTravail}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type d'entrée</Form.Label>
                    <Form.Select
                      name="idTypeEntree"
                      value={employee.idTypeEntree}
                      onChange={handleChange}
                      disabled={dataLoading || loading}
                    >
                      <option value="">-- Choisir un type d'entrée --</option>
                      {typeEntrees.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.nom || type.libelle || type.typeEntree}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {isCDI && (
                  <Col md={6}>
                    <div className="alert alert-info py-2 mb-0">
                      <strong>Période d'essai :</strong> Obligatoire pour un CDI
                    </div>
                  </Col>
                )}
                
                {isCDD && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="avecPeriodeEssai"
                        label="Inclure une période d'essai (optionnel pour CDD)"
                        checked={employee.avecPeriodeEssai}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                )}
                
                {showPeriodeEssaiSection && employee.avecPeriodeEssai && (
                  <>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Durée période d'essai (mois) *</Form.Label>
                        <Form.Select
                          name="dureeEssai"
                          value={employee.dureeEssai}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="">-- Choisir la durée --</option>
                          {DUREES_ESSAI.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date début période d'essai *</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <CalendarFill size={14} />
                          </span>
                          <Form.Control
                            type="date"
                            name="dateDebutEssai"
                            value={employee.dateDebutEssai}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date fin période d'essai *</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <CalendarFill size={14} />
                          </span>
                          <Form.Control
                            type="date"
                            name="dateFinEssai"
                            value={employee.dateFinEssai} 
                            onChange={handleChange}
                            disabled={loading}
                            className="bg-light"
                          />
                        </div>
                        {/* <Form.Text className="text-muted">
                          Calculée automatiquement
                        </Form.Text> */}
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
            </div>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="border-top">
        <div className="d-flex justify-content-between w-100">
          <div>
            {step > 1 && (
              <Button variant="outline-secondary" onClick={prevStep} disabled={loading}>
                <ChevronLeft className="me-1" />
                Précédent
              </Button>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
              Annuler
            </Button>
            {step < 3 ? (
              <Button variant="primary" onClick={nextStep} disabled={loading}>
                Suivant
                <ChevronRight className="ms-1" />
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} disabled={loading || dataLoading}>
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircleFill className="me-2" />
                    Enregistrer l'employé
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AddEmployeeModal;
