import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Alert, Divider,
  Stack, IconButton, Tooltip, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Pagination, PaginationItem as MuiPaginationItem,
  InputAdornment, ToggleButton, ToggleButtonGroup,
  Autocomplete, Tab, Tabs
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Cancel,
  CalendarMonth, Refresh, FilterList,
  Search, Visibility,
  AccessTime, Warning,
  Person, Event, Today, DateRange,
  ViewList, ViewModule,
  NavigateBefore, NavigateNext,
  ChevronLeft, ChevronRight,
  Business, Badge, HourglassEmpty, TaskAlt, Block, VerifiedUser,
  AddCircleOutline, EventBusy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axiosInstance from '../../../utils/AxiosInstance';

// Configuration de dayjs en français
dayjs.locale('fr');

const localizer = dayjsLocalizer(dayjs);

const SuiviConges = () => {
  const navigate = useNavigate();
  
  // État pour l'onglet actif (0 = Congés, 1 = Absences)
  const [activeTab, setActiveTab] = useState(0);
  
  // États pour les données
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour les départements
  const [departements, setDepartements] = useState([]);
  const [matriculeInput, setMatriculeInput] = useState('');
  
  // États pour les détails
  const [selectedDemande, setSelectedDemande] = useState(null);
  
  // États pour les soldes
  const [soldes, setSoldes] = useState({});
  const [soldesDetails, setSoldesDetails] = useState({});
  const [loadingSoldes, setLoadingSoldes] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('');
  const [decisionComment, setDecisionComment] = useState('');
  const [decisionDemande, setDecisionDemande] = useState(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    statut: '',
    matricule: '',
    idDepartement: '',
    dateDebut: null,
    dateFin: null,
    periode: '30jours'
  });
  
  // États pour le calendrier
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Pagination pour la vue liste
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const unifiedButtonSx = {
    borderRadius: '8px',
    minHeight: '32px',
    height: '32px',
    px: 1.5,
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '0.85rem'
  };

  const unifiedButtonContainedSx = {
    ...unifiedButtonSx,
    bgcolor: 'var(--bg-primary)',
    color: '#ffffff',
    borderColor: 'var(--bg-primary)',
    '&:hover': { bgcolor: 'var(--bg-primary)', opacity: 0.9 }
  };

  const unifiedButtonOutlinedSx = {
    ...unifiedButtonSx,
    borderColor: 'rgba(176, 83, 173, 0.35)',
    color: 'var(--bg-primary)'
  };

  const unifiedToggleButtonSx = {
    ...unifiedButtonOutlinedSx,
    '&.Mui-selected': {
      bgcolor: 'var(--bg-primary)',
      color: '#ffffff'
    },
    '&.Mui-selected:hover': {
      bgcolor: 'var(--bg-primary)',
      opacity: 0.9
    }
  };

  // Fonction pour naviguer vers la page d'ajout de demande
  const handleAjouterDemande = () => {
    if (activeTab === 0) {
      navigate('/dashboard-RH/conges/ajouter');
    } else {
      navigate('/dashboard-RH/absences/ajouter');
    }
  };

  // Charger les données initiales
  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  const chargerDonneesInitiales = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Charger les départements depuis l'API
      const deptsResponse = await axiosInstance.get('/api/departements/actif');
      const deptsData = Array.isArray(deptsResponse.data) ? deptsResponse.data : [];
      setDepartements(deptsData);

      // 2. Charger toutes les demandes depuis la vue
      const response = await axiosInstance.get('/api/vue-demandes-conge');
      const demandesArray = Array.isArray(response.data) ? response.data : [];

      console.log("Demandes chargées:", demandesArray);
      console.log("Structure de la première demande:", demandesArray[0] ? Object.keys(demandesArray[0]) : "Aucune demande");
      console.log(
        "Exemples statuts (id -> statut):",
        demandesArray.slice(0, 10).map(d => ({ id: d.id, statut: d.statut }))
      );
      
      setDemandes(demandesArray);
      setFilteredDemandes(demandesArray);
      
      // Charger les soldes après avoir les demandes
      await chargerSoldes(demandesArray);
      
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError(`Impossible de charger les données: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const chargerSoldes = async (demandesList) => {
    setLoadingSoldes(true);
    
    try {
      const soldesMap = {};
      const soldesDetailsMap = {};
      
      // Filtrer les IDs valides - utiliser idEmploye (exactement comme dans les données)
      const idsUniques = [...new Set(demandesList
        .map(d => d.idEmploye)
        .filter(id => id && id !== '' && id !== undefined && id !== null)
      )];
      
      console.log("IDs uniques pour chargement soldes:", idsUniques);
      
      // Charger les soldes pour chaque employé
      for (const idEmploye of idsUniques) {
        try {
          console.log(`Chargement solde pour employé ${idEmploye}...`);
          const response = await axiosInstance.get(`/api/mouvementSolde/employe/${idEmploye}/solde-actuel`);
          
          console.log(`Réponse solde pour ${idEmploye}:`, response.data);
          
          if (response.data) {
            soldesDetailsMap[idEmploye] = response.data;
            // Vérifier la structure de la réponse
            const solde = response.data.nbCongeRestant !== undefined ? response.data.nbCongeRestant : 
                         response.data.solde !== undefined ? response.data.solde : 
                         response.data.nbJoursRestant !== undefined ? response.data.nbJoursRestant : 0;
            soldesMap[idEmploye] = solde;
          } else {
            soldesMap[idEmploye] = 0;
          }
        } catch (err) {
          console.error(`Erreur chargement solde pour ${idEmploye}:`, err);
          soldesMap[idEmploye] = 0;
        }
      }
      
      console.log("Soldes chargés:", soldesMap);
      setSoldes(soldesMap);
      setSoldesDetails(soldesDetailsMap);
      
    } catch (err) {
      console.error('Erreur chargement soldes:', err);
    } finally {
      setLoadingSoldes(false);
    }
  };

  const verifierSoldeSuffisant = (demande) => {
    if (!demande) {
      return false;
    }
    
    const idEmploye = demande.idEmploye;
    if (!idEmploye) {
      console.warn("idEmploye manquant pour la demande:", demande.id);
      return false;
    }
    
    const soldeActuel = soldes[idEmploye] !== undefined ? soldes[idEmploye] : 0;
    const joursDemandes = demande.nbJours || 0;
    
    return soldeActuel >= joursDemandes;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMatriculeInputChange = (e) => {
    setMatriculeInput(e.target.value);
  };

  const appliquerFiltres = () => {
    let result = [...demandes];
    
    // Filtre par statut
    if (filters.statut) {
      result = result.filter(d => d.statut === parseInt(filters.statut));
    }
    
    // Filtre par matricule
    if (matriculeInput.trim() !== '') {
      result = result.filter(d => 
        d.matricule && d.matricule.toLowerCase().includes(matriculeInput.toLowerCase())
      );
    }
    
    // Filtre par département
    if (filters.idDepartement) {
      result = result.filter(d => d.idDepartement == filters.idDepartement);
    }
    
    // Filtres par date
    if (filters.dateDebut) {
      result = result.filter(d => dayjs(d.dateDebut).isSameOrAfter(filters.dateDebut, 'day'));
    }
    
    if (filters.dateFin) {
      result = result.filter(d => dayjs(d.dateFin).isSameOrBefore(filters.dateFin, 'day'));
    }
    
    // Filtre par période
    if (filters.periode !== 'personnalise') {
      const aujourdhui = dayjs();
      let jours;
      
      switch(filters.periode) {
        case '7jours':
          jours = 7;
          break;
        case '30jours':
          jours = 30;
          break;
        case '90jours':
          jours = 90;
          break;
        default:
          jours = 30;
      }
      
      const dateLimite = aujourdhui.subtract(jours, 'day');
      result = result.filter(d => dayjs(d.dateDemande).isSameOrAfter(dateLimite, 'day'));
    }
    
    setFilteredDemandes(result);
    setCurrentPage(1);
  };

  const reinitialiserFiltres = () => {
    setFilters({
      statut: '',
      matricule: '',
      idDepartement: '',
      dateDebut: null,
      dateFin: null,
      periode: '30jours'
    });
    setMatriculeInput('');
    setFilteredDemandes(demandes);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Fonctions de statut
  const getStatutColor = (statut) => {
    switch(statut) {
      case 0: return 'warning';
      case 1: return 'info';
      case 2: return 'info';
      case 4: return 'default';
      case 5: return 'success';
      case 6: return 'success';
      case 7: return 'error';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 0: return 'En attente Manager';
      case 1: return 'Validé par Manager';
      case 2: return 'Validé par Manager';
      case 4: return 'Annulé par RH/Manager';
      case 5: return 'Acquis/Terminé';
      case 6: return 'Validé par RH';
      case 7: return 'Refusé par RH';
      default: return 'Inconnu';
    }
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 0: return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case 1: return <TaskAlt sx={{ fontSize: 16 }} />;
      case 2: return <TaskAlt sx={{ fontSize: 16 }} />;
      case 4: return <Block sx={{ fontSize: 16 }} />;
      case 5: return <CheckCircle sx={{ fontSize: 16 }} />;
      case 6: return <VerifiedUser sx={{ fontSize: 16 }} />;
      case 7: return <Cancel sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  // Calcul des statistiques
  const stats = {
    enAttenteManager: demandes.filter(d => d.statut === 0).length,
    valideManager: demandes.filter(d => d.statut === 1 || d.statut === 2).length,
    annule: demandes.filter(d => d.statut === 4).length,
    acquis: demandes.filter(d => d.statut === 5).length,
    valideRH: demandes.filter(d => d.statut === 6).length,
    refuseRH: demandes.filter(d => d.statut === 7).length
  };

  // Données factices pour les absences (pour le test)
  const absencesData = {
    enAttente: 0,
    validees: 0,
    refusees: 0,
    total: 0
  };

  // Préparer les événements pour le calendrier
  const prepareCalendarEvents = () => {
    return filteredDemandes.map(demande => {
      const aujourdhui = dayjs();
      const dateDebut = dayjs(demande.dateDebut);
      const dateFin = dayjs(demande.dateFin);
      
      let backgroundColor = '#b053ad';
      const statut = demande.statut;
      
      if (statut === 5) {
        backgroundColor = '#4caf50';
      } else if (statut === 7) {
        backgroundColor = '#f44336';
      } else if (statut === 6) {
        backgroundColor = '#2196f3';
      } else if (statut === 1 || statut === 2) {
        backgroundColor = '#0288d1';
      } else if (statut === 0) {
        backgroundColor = '#ff9800';
      } else if (statut === 4) {
        backgroundColor = '#9e9e9e';
      } else if (dateDebut.isBefore(aujourdhui, 'day') && dateFin.isAfter(aujourdhui, 'day')) {
        backgroundColor = '#ff9800';
      } else if (dateFin.isBefore(aujourdhui, 'day')) {
        backgroundColor = '#5c2458';
      }
      
      return {
        id: demande.id,
        title: `${demande.nomEmploye} ${demande.prenomEmploye} - ${demande.nbJours}j - ${getStatutLabel(statut)}`,
        start: new Date(demande.dateDebut),
        end: new Date(demande.dateFin),
        allDay: true,
        resource: demande,
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: 0.8,
          color: 'white',
          border: '0px',
          display: 'block'
        }
      };
    });
  };

  const calendarEvents = prepareCalendarEvents();

  const handleSelectEvent = (event) => {
    setSelectedDemande(event.resource);
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const handleNavigate = (newDate) => {
    setCalendarDate(newDate);
  };

  const canReviewDemande = (demande) => [1, 2].includes(demande?.statut);

  const openDecisionDialog = (demande, decision) => {
    setDecisionDemande(demande);
    setDecisionType(decision);
    setDecisionComment('');
    setDecisionDialogOpen(true);
    setError('');
    setSuccessMessage('');
  };

  const closeDecisionDialog = () => {
    if (actionLoadingId) return;

    setDecisionDialogOpen(false);
    setDecisionType('');
    setDecisionComment('');
    setDecisionDemande(null);
  };

  const handleRhDecision = async () => {
    if (!decisionDemande?.id) return;

    const commentaire = decisionComment.trim();

    if (!commentaire) {
      setError("Veuillez saisir un commentaire avant de valider l'action RH.");
      return;
    }

    setActionLoadingId(decisionDemande.id);
    setError('');
    setSuccessMessage('');

    try {
      if (decisionType === 'accept') {
        const mouvement = soldesDetails[decisionDemande.idEmploye];
        const idMouvement = mouvement?.id;

        if (!idMouvement) {
          throw new Error("Impossible de valider cette demande : mouvement de solde introuvable pour l'employé.");
        }

        await axiosInstance.put(
          `/api/demandes-conge/validate-rh/${decisionDemande.id}?idMouvement=${idMouvement}`,
          {
            ...decisionDemande,
            commentaire,
            statut: 6
          }
        );

        setSuccessMessage('Demande validée par le RH avec succès.');
      } else {
        await axiosInstance.put(
          `/api/demandes-conge/refuser-rh/${decisionDemande.id}`,
          {
            ...decisionDemande,
            commentaire,
            statut: 7
          }
        );

        setSuccessMessage('Demande refusée par le RH avec succès.');
      }

      if (selectedDemande?.id === decisionDemande.id) {
        setSelectedDemande(null);
      }

      closeDecisionDialog();
      await chargerDonneesInitiales();
    } catch (err) {
      console.error(`Erreur lors de la décision RH (${decisionType}):`, err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Une erreur est survenue lors du traitement de la demande."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const indexDebut = (currentPage - 1) * itemsPerPage;
  const indexFin = indexDebut + itemsPerPage;
  const demandesPage = filteredDemandes.slice(indexDebut, indexFin);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const goToToday = () => {
    setCalendarDate(new Date());
  };

  const goToPrevious = () => {
    let newDate;
    if (calendarView === Views.MONTH) {
      newDate = dayjs(calendarDate).subtract(1, 'month').toDate();
    } else if (calendarView === Views.WEEK) {
      newDate = dayjs(calendarDate).subtract(1, 'week').toDate();
    } else {
      newDate = dayjs(calendarDate).subtract(1, 'day').toDate();
    }
    setCalendarDate(newDate);
  };

  const goToNext = () => {
    let newDate;
    if (calendarView === Views.MONTH) {
      newDate = dayjs(calendarDate).add(1, 'month').toDate();
    } else if (calendarView === Views.WEEK) {
      newDate = dayjs(calendarDate).add(1, 'week').toDate();
    } else {
      newDate = dayjs(calendarDate).add(1, 'day').toDate();
    }
    setCalendarDate(newDate);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Chargement des demandes...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* En-tête */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '20px',
          border: '1px solid rgba(176, 83, 173, 0.14)',
          boxShadow: '0 10px 24px rgba(176, 83, 173, 0.08)',
          background: 'linear-gradient(135deg, #fff 0%, #fcf8fc 100%)'
        }}
      >
        <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Ligne 1 : Flèche retour + Titre + Bouton Ajouter */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  color: 'var(--bg-primary)',
                  bgcolor: 'rgba(176, 83, 173, 0.08)',
                  border: '1px solid rgba(176, 83, 173, 0.16)',
                  '&:hover': {
                    bgcolor: 'rgba(176, 83, 173, 0.14)'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <Box display="flex" alignItems="center" gap={1}>
                {activeTab === 0 ? (
                  <CalendarMonth sx={{ color: 'var(--bg-primary)', fontSize: 32 }} />
                ) : (
                  <EventBusy sx={{ color: 'var(--bg-primary)', fontSize: 32 }} />
                )}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.6rem', md: '2.1rem' }
                  }}
                >
                  {activeTab === 0 ? 'Suivi des Congés' : 'Suivi des Absences'}
                </Typography>
              </Box>
            </Box>

            {/* Bouton Ajouter à droite */}
            <Button
              variant="contained"
              onClick={handleAjouterDemande}
              startIcon={<AddCircleOutline />}
              sx={{
                borderRadius: '12px',
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: 'var(--bg-primary)',
                boxShadow: '0 6px 16px rgba(176, 83, 173, 0.25)',
                '&:hover': {
                  bgcolor: 'var(--bg-primary)',
                  opacity: 0.9
                }
              }}
            >
              Ajouter une demande
            </Button>
          </Box>

          {/* Onglets */}
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(176, 83, 173, 0.25)', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="onglets congés et absences"
              sx={{
                minHeight: 44,
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--bg-primary)',
                  height: 3,
                  borderRadius: 3
                },
                '& .MuiTab-root': {
                  minHeight: 44,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: '#64748b',
                  px: 2,
                  borderRadius: '12px 12px 0 0',
                  '&:hover': { color: 'var(--bg-primary)' }
                },
                '& .MuiTab-root.Mui-selected': { color: 'var(--bg-primary)' },
                '& .MuiTab-root .MuiSvgIcon-root': { color: 'inherit' }
              }}
            >
              <Tab 
                label="Suivi des Congés" 
                icon={<CalendarMonth />} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              />
              <Tab 
                label={`Absences (${absencesData.total})`} 
                icon={<EventBusy />} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              />
            </Tabs>
          </Box>

          {/* Ligne 2 : Statuts + Actualiser (uniquement pour l'onglet Congés) */}
          {activeTab === 0 && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              {/* Statuts */}
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={`${stats.enAttenteManager} en attente`}
                  sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ed6c02', fontWeight: 500 }}
                />
                <Chip 
                  label={`${stats.valideManager} validés`}
                  sx={{ bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#0288d1', fontWeight: 500 }}
                />
                <Chip 
                  label={`${stats.acquis} acquis`}
                  sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32', fontWeight: 500 }}
                />
                <Chip 
                  label={`${stats.valideRH} validés RH`}
                  sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#1976d2', fontWeight: 500 }}
                />
                <Chip 
                  label={`${stats.refuseRH} refusés`}
                  sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f', fontWeight: 500 }}
                />
              </Box>

              {/* Bouton Actualiser */}
              <Button
                variant="outlined"
                onClick={chargerDonneesInitiales}
                startIcon={<Refresh />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'var(--bg-primary)',
                  borderColor: 'rgba(176,83,173,0.3)',
                  '&:hover': {
                    borderColor: 'var(--bg-primary)',
                    bgcolor: 'rgba(176,83,173,0.04)'
                  }
                }}
              >
                Actualiser
              </Button>
            </Box>
          )}

          {/* Message pour l'onglet Absences */}
          {activeTab === 1 && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <Alert severity="info" icon={<EventBusy />}>
                <Typography variant="body1">
                  Module Absences en cours de développement. (Test - 0 absence pour le moment)
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Afficher le contenu uniquement pour l'onglet Congés */}
      {activeTab === 0 && (
        <>
          {/* Filtres */}
          <Card
            sx={{
              mb: 3,
              borderRadius: '18px',
              border: '1px solid rgba(176, 83, 173, 0.12)',
              boxShadow: '0 10px 24px rgba(176, 83, 173, 0.05)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: '#fcf7fb',
                borderBottom: '1px solid rgba(176, 83, 173, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FilterList sx={{ color: 'var(--bg-primary)' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#3a1438' }}>
                Filtres
              </Typography>
            </Box>

            <CardContent sx={{ p: 2.5 }}>
              
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                  gap: 2,
                  alignItems: 'center',
                  overflowX: { md: 'auto' },
                  pb: { md: 0.5 }
                }}
              >
                <Box sx={{ flex: '0 1 240px', minWidth: 200 }}>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', fontWeight: 800, color: '#4a2350', mb: 0.5, ml: 0.5 }}
                  >
                    Statut
                  </Typography>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                  >
                    <Select
                      displayEmpty
                      value={filters.statut}
                      name="statut"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Tous les statuts</span>
                      </MenuItem>
                      <MenuItem value="0">En attente Manager</MenuItem>
                      <MenuItem value="1">Validé par Manager</MenuItem>
                      <MenuItem value="2">Validé par Manager</MenuItem>
                      <MenuItem value="4">Annulé par RH/Manager</MenuItem>
                      <MenuItem value="5">Acquis/Terminé</MenuItem>
                      <MenuItem value="6">Validé par RH</MenuItem>
                      <MenuItem value="7">Refusé par RH</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 360px', minWidth: 260 }}>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', fontWeight: 800, color: '#4a2350', mb: 0.5, ml: 0.5 }}
                  >
                    Matricule
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={matriculeInput}
                    onChange={handleMatriculeInputChange}
                    placeholder="Entrez un matricule"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' },
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 1 280px', minWidth: 220 }}>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', fontWeight: 800, color: '#4a2350', mb: 0.5, ml: 0.5 }}
                  >
                    Département
                  </Typography>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                  >
                    <Select
                      displayEmpty
                      value={filters.idDepartement}
                      name="idDepartement"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Tous les départements</span>
                      </MenuItem>
                      {departements.map(dept => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '0 1 260px', minWidth: 220 }}>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', fontWeight: 800, color: '#4a2350', mb: 0.5, ml: 0.5 }}
                  >
                    Période
                  </Typography>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                  >
                    <Select
                      value={filters.periode}
                      name="periode"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="7jours">7 derniers jours</MenuItem>
                      <MenuItem value="30jours">30 derniers jours</MenuItem>
                      <MenuItem value="90jours">90 derniers jours</MenuItem>
                      <MenuItem value="personnalise">Période personnalisée</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {filters.periode === 'personnalise' && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ flex: '1 1 260px', minWidth: 240 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', fontWeight: 800, color: '#4a2350', mb: 0.5, ml: 0.5 }}
                    >
                      Date début
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                      <DatePicker
                        value={filters.dateDebut}
                        onChange={(newValue) => setFilters(prev => ({ ...prev, dateDebut: newValue }))}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            placeholder: 'DD/MM/YYYY',
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box sx={{ flex: '1 1 260px', minWidth: 240 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', fontWeight: 800, color: '#4a2350', mb: 0.5, ml: 0.5 }}
                    >
                      Date fin
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                      <DatePicker
                        value={filters.dateFin}
                        onChange={(newValue) => setFilters(prev => ({ ...prev, dateFin: newValue }))}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            placeholder: 'DD/MM/YYYY',
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              )}

              <Box
                mt={2}
                pt={2}
                sx={{
                  borderTop: '1px solid rgba(176, 83, 173, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Affichage de {filteredDemandes.length} demandes sur {demandes.length}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={reinitialiserFiltres}
                    sx={unifiedButtonOutlinedSx}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    variant="primary"
                    onClick={appliquerFiltres}
                    disabled={loading}
                    sx={unifiedButtonContainedSx}
                  >
                    Appliquer
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Sélecteur de vue */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight="medium">
              {viewMode === 'calendar' ? 'Vue Calendrier' : 'Vue Liste'} 
              <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                ({filteredDemandes.length} demandes)
              </Typography>
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
            >
              <ToggleButton value="calendar" sx={unifiedToggleButtonSx}>
                <ViewModule sx={{ mr: 1 }} />
                Calendrier
              </ToggleButton>
              <ToggleButton value="list" sx={unifiedToggleButtonSx}>
                <ViewList sx={{ mr: 1 }} />
                Liste
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Vue Calendrier */}
          {viewMode === 'calendar' && (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={1} bgcolor="var(--brand-50)" borderRadius={1}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={goToToday}
                      startIcon={<Today />}
                      sx={unifiedButtonOutlinedSx}
                    >
                      Aujourd'hui
                    </Button>
                    <IconButton onClick={goToPrevious} size="small">
                      <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={goToNext} size="small">
                      <ChevronRight />
                    </IconButton>
                  </Stack>
                  
                  <Typography variant="h6" fontWeight="medium">
                    {calendarView === Views.MONTH && dayjs(calendarDate).format('MMMM YYYY')}
                    {calendarView === Views.WEEK && `Semaine du ${dayjs(calendarDate).startOf('week').format('DD/MM/YYYY')}`}
                    {calendarView === Views.DAY && dayjs(calendarDate).format('dddd DD MMMM YYYY')}
                  </Typography>
                  
                  <ToggleButtonGroup
                    value={calendarView}
                    exclusive
                    onChange={(e, newView) => newView && handleViewChange(newView)}
                    size="small"
                  >
                    <ToggleButton value={Views.MONTH} sx={unifiedToggleButtonSx}>
                      Mois
                    </ToggleButton>
                    <ToggleButton value={Views.WEEK} sx={unifiedToggleButtonSx}>
                      Semaine
                    </ToggleButton>
                    <ToggleButton value={Views.DAY} sx={unifiedToggleButtonSx}>
                      Jour
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Box sx={{ height: 600, mt: 1 }}>
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    view={calendarView}
                    onView={handleViewChange}
                    date={calendarDate}
                    onNavigate={handleNavigate}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    messages={{
                      today: "Aujourd'hui",
                      previous: 'Précédent',
                      next: 'Suivant',
                      month: 'Mois',
                      week: 'Semaine',
                      day: 'Jour'
                    }}
                    eventPropGetter={(event) => ({
                      style: event.style
                    })}
                    components={{
                      toolbar: () => null,
                    }}
                  />
                </Box>
                
                {/* Légende */}
                <Box mt={3} p={2} bgcolor="var(--brand-50)" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Légende
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={2.4}>
                      <Box display="flex" alignItems="center">
                        <Box width={20} height={20} bgcolor="#ff9800" mr={1} borderRadius={1} />
                        <Typography variant="body2">
                          En attente Manager ({stats.enAttenteManager})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box display="flex" alignItems="center">
                        <Box width={20} height={20} bgcolor="#0288d1" mr={1} borderRadius={1} />
                        <Typography variant="body2">
                          Validé Manager ({stats.valideManager})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box display="flex" alignItems="center">
                        <Box width={20} height={20} bgcolor="#f44336" mr={1} borderRadius={1} />
                        <Typography variant="body2">
                          Refusé ({stats.refuseRH})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box display="flex" alignItems="center">
                        <Box width={20} height={20} bgcolor="#9e9e9e" mr={1} borderRadius={1} />
                        <Typography variant="body2">
                          Annulé ({stats.annule})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box display="flex" alignItems="center">
                        <Box width={20} height={20} bgcolor="#4caf50" mr={1} borderRadius={1} />
                        <Typography variant="body2">
                          Acquis ({stats.acquis})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box display="flex" alignItems="center">
                        <Box width={20} height={20} bgcolor="#2196f3" mr={1} borderRadius={1} />
                        <Typography variant="body2">
                          Validé RH ({stats.valideRH})
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    <ViewList sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Liste des demandes
                    {filteredDemandes.length > 0 && (
                      <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                        ({filteredDemandes.length} demandes)
                      </Typography>
                    )}
                  </Typography>
                </Box>

                {filteredDemandes.length === 0 ? (
                  <Alert severity="info">
                    Aucune demande trouvée correspondant aux critères de recherche.
                    <Button 
                      variant="outlined"
                      size="small"
                      onClick={reinitialiserFiltres}
                      sx={{ ...unifiedButtonOutlinedSx, ml: 2 }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </Alert>
                ) : (
                  <>
                    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Employé</TableCell>
                            <TableCell>Matricule</TableCell>
                            <TableCell>Département</TableCell>
                            <TableCell>Période</TableCell>
                            <TableCell align="right">Jours</TableCell>
                            <TableCell align="right">Solde</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {demandesPage.map((demande) => {
                            const soldeActuel = soldes[demande.idEmploye] !== undefined ? soldes[demande.idEmploye] : 0;
                            const soldeSuffisant = verifierSoldeSuffisant(demande);
                            
                            return (
                              <TableRow key={demande.id} hover>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {demande.nomEmploye} {demande.prenomEmploye}
                                    </Typography>
                                    {/* <Typography variant="caption" color="textSecondary">
                                      ID: {demande.idEmploye}
                                    </Typography> */}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {demande.matricule || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {demande.nomDepartement}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">
                                      {formatDate(demande.dateDebut)} → {formatDate(demande.dateFin)}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body1" fontWeight="bold">
                                    {demande.nbJours}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                                    <Typography 
                                      variant="body2" 
                                      color={soldeSuffisant ? 'success.main' : 'error.main'}
                                      fontWeight="medium"
                                    >
                                      {soldeActuel.toFixed(1)} j
                                    </Typography>
                                    {!soldeSuffisant && soldeActuel > 0 && (
                                      <Typography variant="caption" color="error">
                                        <Warning fontSize="inherit" /> Insuffisant
                                      </Typography>
                                    )}
                                    {soldeActuel === 0 && !loadingSoldes && (
                                      <Typography variant="caption" color="warning.main">
                                        Aucun solde
                                      </Typography>
                                    )}
                                    {loadingSoldes && (
                                      <Typography variant="caption" color="textSecondary">
                                        <CircularProgress size={12} sx={{ mr: 0.5 }} />
                                        Chargement...
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={getStatutLabel(demande.statut)}
                                    color={getStatutColor(demande.statut)}
                                    size="small"
                                    icon={getStatutIcon(demande.statut)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    {canReviewDemande(demande) && (
                                      <>
                                        <Tooltip title="Accepter la demande">
                                          <span>
                                            <IconButton
                                              size="small"
                                              color="success"
                                              onClick={() => openDecisionDialog(demande, 'accept')}
                                              disabled={actionLoadingId === demande.id}
                                            >
                                              {actionLoadingId === demande.id ? (
                                                <CircularProgress size={18} color="inherit" />
                                              ) : (
                                                <CheckCircle fontSize="small" />
                                              )}
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                        <Tooltip title="Refuser la demande">
                                          <span>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={() => openDecisionDialog(demande, 'reject')}
                                              disabled={actionLoadingId === demande.id}
                                            >
                                              {actionLoadingId === demande.id ? (
                                                <CircularProgress size={18} color="inherit" />
                                              ) : (
                                                <Cancel fontSize="small" />
                                              )}
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      </>
                                    )}
                                    <Tooltip title="Voir les détails">
                                      <IconButton
                                        size="small"
                                        onClick={() => setSelectedDemande(demande)}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                      <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="small"
                          showFirstButton
                          showLastButton
                          sx={{
                            '& .MuiPaginationItem-root': {
                              ...unifiedButtonSx,
                              minWidth: '32px'
                            },
                            '& .MuiPaginationItem-root.Mui-selected': {
                              bgcolor: 'var(--bg-primary)',
                              color: '#ffffff'
                            }
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box mt={1} textAlign="center">
                      <Typography variant="caption" color="textSecondary">
                        Affichage des demandes {indexDebut + 1} à {Math.min(indexFin, filteredDemandes.length)} sur {filteredDemandes.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog
        open={decisionDialogOpen}
        onClose={closeDecisionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {decisionType === 'accept' ? 'Valider la demande RH' : 'Refuser la demande RH'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity={decisionType === 'accept' ? 'success' : 'warning'}>
              {decisionDemande
                ? `${decisionDemande.nomEmploye} ${decisionDemande.prenomEmploye} - ${decisionDemande.matricule}`
                : 'Aucune demande sélectionnée'}
            </Alert>
            <TextField
              label="Commentaire RH"
              placeholder="Saisissez le commentaire de validation ou de refus"
              fullWidth
              multiline
              minRows={4}
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              disabled={!!actionLoadingId}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={closeDecisionDialog}
            disabled={!!actionLoadingId}
            sx={unifiedButtonOutlinedSx}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color={decisionType === 'accept' ? 'success' : 'error'}
            onClick={handleRhDecision}
            disabled={!!actionLoadingId}
            sx={decisionType === 'accept' ? unifiedButtonContainedSx : undefined}
          >
            {actionLoadingId ? (
              <CircularProgress size={18} color="inherit" />
            ) : decisionType === 'accept' ? (
              'Valider'
            ) : (
              'Refuser'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de détails */}
      <Dialog 
        open={!!selectedDemande} 
        onClose={() => setSelectedDemande(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedDemande && (
          <>
            <DialogTitle sx={{ pb: 1.5 }}>
              <Box
                display="flex"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                gap={2}
                flexDirection={{ xs: 'column', sm: 'row' }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Visibility />
                  <Typography variant="h6" component="span">
                    Détails de la demande #{selectedDemande.id}
                  </Typography>
                </Box>
                <Chip
                  label={getStatutLabel(selectedDemande.statut)}
                  color={getStatutColor(selectedDemande.statut)}
                  icon={getStatutIcon(selectedDemande.statut)}
                  sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        Employé
                      </Typography>
                      <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                        <Person sx={{ color: 'primary.main', mt: 0.2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {selectedDemande.nomEmploye} {selectedDemande.prenomEmploye}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Matricule: {selectedDemande.matricule}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID employé: {selectedDemande.idEmploye}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        Département
                      </Typography>
                      <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                        <Business sx={{ color: 'secondary.main', mt: 0.2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {selectedDemande.nomDepartement}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Manager: {selectedDemande.nomCompletManager || selectedDemande.nomManager || 'Non défini'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        Période
                      </Typography>
                      <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                        <DateRange sx={{ color: 'info.main', mt: 0.2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {formatDate(selectedDemande.dateDebut)} → {formatDate(selectedDemande.dateFin)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedDemande.nbJours} jours ouvrables
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        Solde disponible
                      </Typography>
                      <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                        <Today
                          sx={{
                            color: verifierSoldeSuffisant(selectedDemande) ? 'success.main' : 'error.main',
                            mt: 0.2
                          }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            color={verifierSoldeSuffisant(selectedDemande) ? 'success.main' : 'error.main'}
                          >
                            {(soldes[selectedDemande.idEmploye] !== undefined ? soldes[selectedDemande.idEmploye] : 0).toFixed(1)} jours
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {verifierSoldeSuffisant(selectedDemande) ? 'Solde suffisant' : 'Solde insuffisant'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                    gap: 2,
                    width: '100%'
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{ p: 2.25, borderRadius: 3, minHeight: 180, height: '100%', bgcolor: '#fff', width: '100%' }}
                  >
                    <Typography variant="overline" color="text.secondary">
                      Commentaire du manager
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                      {selectedDemande.commentaireManager || 'Aucun commentaire du manager'}
                    </Typography>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{ p: 2.25, borderRadius: 3, minHeight: 180, height: '100%', bgcolor: '#fff', width: '100%' }}
                  >
                    <Typography variant="overline" color="text.secondary">
                      Commentaire RH
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                      {selectedDemande.commentaire || 'Aucun commentaire RH'}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => setSelectedDemande(null)}
                sx={unifiedButtonContainedSx}
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SuiviConges;
