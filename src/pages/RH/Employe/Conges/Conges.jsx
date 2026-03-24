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
  Autocomplete
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
  Business, Badge
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
  const [loadingSoldes, setLoadingSoldes] = useState(false);
  
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

  // Charger les données initiales
  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  const chargerDonneesInitiales = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Charger les départements depuis l'API
      console.log("Chargement des départements depuis api/departements...");
      const deptsResponse = await axiosInstance.get('/api/departements');
      const deptsData = Array.isArray(deptsResponse.data) ? deptsResponse.data : [];
      console.log("Départements chargés:", deptsData);
      
      setDepartements(deptsData);

      // 2. Charger toutes les demandes depuis la vue
      console.log("Chargement des demandes depuis vue...");
      const response = await axiosInstance.get('/api/vue-demandes-conge');
      
      const demandesArray = Array.isArray(response.data) ? response.data : [];
      
      console.log("Toutes les demandes depuis vue:", demandesArray);
      
      setDemandes(demandesArray);
      setFilteredDemandes(demandesArray);
      
      // Charger les soldes pour tous les employés
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
      const idsUniques = [...new Set(demandesList.map(d => d.idEmploye))];
      
      console.log("Chargement des soldes pour les employés:", idsUniques);
      
      for (const idEmploye of idsUniques) {
        if (!idEmploye) continue;
        
        try {
          const response = await axiosInstance.get(`/api/mouvementSolde/employe/${idEmploye}/solde-actuel`);
          
          if (response.data) {
            soldesMap[idEmploye] = response.data.nbCongeRestant || 0;
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
      
    } catch (err) {
      console.error('Erreur chargement soldes:', err);
    } finally {
      setLoadingSoldes(false);
    }
  };

  const verifierSoldeSuffisant = (demande) => {
    if (!demande || !demande.idEmploye) return false;
    
    const idEmploye = demande.idEmploye;
    const soldeActuel = soldes[idEmploye] || 0;
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
    
    console.log("Application des filtres sur", result.length, "demandes");
    
    // Filtre par statut
    if (filters.statut) {
      console.log("Filtre statut:", filters.statut);
      
      result = result.filter(d => {
        const libelle = d.decisionManagerLibelle || '';
        
        switch(filters.statut) {
          case 'attente':
            return libelle.includes('attente') || libelle === 'en attente';
          case 'valide':
            return (libelle.includes('valid') && libelle.includes('manager')) ||
                   libelle === 'acquis';
          case 'rejete':
            return libelle.includes('refus') && libelle.includes('manager');
          case 'acquis':
            return libelle === 'acquis';
          default:
            return true;
        }
      });
      
      console.log("Après filtre statut:", result.length, "demandes");
    }
    
    // Filtre par matricule
    if (matriculeInput.trim() !== '') {
      console.log("Filtre matricule:", matriculeInput);
      result = result.filter(d => 
        d.matricule && d.matricule.toLowerCase().includes(matriculeInput.toLowerCase())
      );
      console.log("Après filtre matricule:", result.length, "demandes");
    }
    
    // Filtre par département
    if (filters.idDepartement) {
      console.log("Filtre département:", filters.idDepartement);
      result = result.filter(d => d.idDepartement == filters.idDepartement);
      console.log("Après filtre département:", result.length, "demandes");
    }
    
    // Filtres par date
    if (filters.dateDebut) {
      console.log("Filtre date début:", filters.dateDebut?.format('DD/MM/YYYY'));
      result = result.filter(d => dayjs(d.dateDebut).isSameOrAfter(filters.dateDebut, 'day'));
      console.log("Après filtre date début:", result.length, "demandes");
    }
    
    if (filters.dateFin) {
      console.log("Filtre date fin:", filters.dateFin?.format('DD/MM/YYYY'));
      result = result.filter(d => dayjs(d.dateFin).isSameOrBefore(filters.dateFin, 'day'));
      console.log("Après filtre date fin:", result.length, "demandes");
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
      console.log("Après filtre période:", result.length, "demandes");
    }
    
    console.log("Résultat final du filtrage:", result.length, "demandes");
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

  const getStatutColor = (decisionManagerLibelle) => {
    const libelle = decisionManagerLibelle || '';
    
    if (libelle.includes('attente')) {
      return 'warning';
    } else if (libelle.includes('valid') && libelle.includes('manager')) {
      return 'info';
    } else if (libelle.includes('acquis')) {
      return 'success';
    } else if (libelle.includes('refus') && libelle.includes('manager')) {
      return 'error';
    } else if (libelle.includes('annul')) {
      return 'default';
    } else {
      return 'default';
    }
  };

  const getStatutLabel = (decisionManagerLibelle) => {
    const libelle = decisionManagerLibelle || '';
    
    if (libelle.includes('attente')) {
      return 'En attente';
    } else if (libelle.includes('valid') && libelle.includes('manager')) {
      return 'Validé par manager';
    } else if (libelle.includes('acquis')) {
      return 'Acquis';
    } else if (libelle.includes('refus') && libelle.includes('manager')) {
      return 'Refusé par manager';
    } else if (libelle.includes('annul')) {
      return 'Annulé';
    } else {
      return libelle || 'Inconnu';
    }
  };

  // Préparer les événements pour le calendrier
  const prepareCalendarEvents = () => {
    return filteredDemandes.map(demande => {
      const aujourdhui = dayjs();
      const dateDebut = dayjs(demande.dateDebut);
      const dateFin = dayjs(demande.dateFin);
      
      let backgroundColor = '#b053ad';
      
      const libelle = demande.decisionManagerLibelle || '';
      
      if (libelle.includes('acquis')) {
        backgroundColor = '#4caf50';
      } else if (libelle.includes('refus') && libelle.includes('manager')) {
        backgroundColor = '#f44336';
      } else if (dateDebut.isBefore(aujourdhui, 'day') && dateFin.isAfter(aujourdhui, 'day')) {
        backgroundColor = '#ff9800';
      } else if (dateFin.isBefore(aujourdhui, 'day')) {
        backgroundColor = '#5c2458';
      }
      
      return {
        id: demande.id,
        title: `${demande.nomEmploye} ${demande.prenomEmploye} - ${demande.nbJours}j`,
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

  // Gestionnaire d'événement du calendrier
  const handleSelectEvent = (event) => {
    setSelectedDemande(event.resource);
  };

  // Gestionnaire pour changer de vue dans le calendrier
  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  // Gestionnaire pour naviguer dans le calendrier
  const handleNavigate = (newDate) => {
    setCalendarDate(newDate);
  };

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const indexDebut = (currentPage - 1) * itemsPerPage;
  const indexFin = indexDebut + itemsPerPage;
  const demandesPage = filteredDemandes.slice(indexDebut, indexFin);

  // Gestion du changement de page
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Fonctions de navigation personnalisées pour le calendrier
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
      <Card sx={{ mb: 3, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 24px rgba(0,0,0,0.04)' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ color: 'var(--bg-primary)' }}
              >
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" gutterBottom>
                <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                Suivi des Congés
              </Typography>
              
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mt={1}>
                <Chip
                  label={`${demandes.filter(d => {
                    const libelle = d.decisionManagerLibelle || '';
                    return libelle.includes('attente') || libelle === 'en attente';
                  }).length} en attente`}
                  variant="outlined"
                  sx={{ bgcolor: 'rgba(176, 83, 173, 0.08)', color: 'var(--bg-primary)' }}
                  icon={<AccessTime />}
                />
                <Chip
                  label={`${demandes.filter(d => (d.decisionManagerLibelle || '').includes('acquis')).length} acquis`}
                  variant="outlined"
                  sx={{ bgcolor: 'rgba(176, 83, 173, 0.08)', color: 'var(--bg-primary)' }}
                  icon={<CheckCircle />}
                />
                <Chip
                  label={`${demandes.filter(d => {
                    const libelle = d.decisionManagerLibelle || '';
                    return libelle.includes('refus') && libelle.includes('manager');
                  }).length} rejetés`}
                  variant="outlined"
                  sx={{ bgcolor: 'rgba(176, 83, 173, 0.08)', color: 'var(--bg-primary)' }}
                  icon={<Cancel />}
                />
                <Chip
                  label={`${demandes.filter(d => {
                    const libelle = d.decisionManagerLibelle || '';
                    return libelle.includes('valid') && libelle.includes('manager');
                  }).length} validés par manager`}
                  variant="outlined"
                  sx={{ bgcolor: 'rgba(176, 83, 173, 0.08)', color: 'var(--bg-primary)' }}
                  icon={<CheckCircle />}
                />
              </Box>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Actualiser">
                  <IconButton
                    onClick={chargerDonneesInitiales}
                    sx={{ color: 'var(--bg-primary)' }}
                    disabled={loading}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.statut}
                  label="Statut"
                  name="statut"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="attente">En attente</MenuItem>
                  <MenuItem value="valide">Validé par manager</MenuItem>
                  <MenuItem value="acquis">Acquis</MenuItem>
                  <MenuItem value="rejete">Refusé par manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Matricule"
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
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Département</InputLabel>
                <Select
                  value={filters.idDepartement}
                  label="Département"
                  name="idDepartement"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Tous les départements</MenuItem>
                  {departements.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>
                <Select
                  value={filters.periode}
                  label="Période"
                  name="periode"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="7jours">7 derniers jours</MenuItem>
                  <MenuItem value="30jours">30 derniers jours</MenuItem>
                  <MenuItem value="90jours">90 derniers jours</MenuItem>
                  <MenuItem value="personnalise">Période personnalisée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {filters.periode === 'personnalise' && (
              <>
                <Grid item xs={12} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                    <DatePicker
                      label="Date début"
                      value={filters.dateDebut}
                      onChange={(newValue) => setFilters(prev => ({ ...prev, dateDebut: newValue }))}
                      format="DD/MM/YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                    <DatePicker
                      label="Date fin"
                      value={filters.dateFin}
                      onChange={(newValue) => setFilters(prev => ({ ...prev, dateFin: newValue }))}
                      format="DD/MM/YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={appliquerFiltres}
                  disabled={loading}
                  sx={unifiedButtonContainedSx}
                >
                  Appliquer
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={reinitialiserFiltres}
                  sx={unifiedButtonOutlinedSx}
                >
                  Réinitialiser
                </Button>
              </Stack>
            </Grid>
          </Grid>
          
          {/* Information sur le filtrage */}
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary">
              Affichage de {filteredDemandes.length} demandes sur {demandes.length} • 
              {filters.statut && ` Statut: ${filters.statut}`}
              {matriculeInput && ` • Matricule contenant: "${matriculeInput}"`}
              {filters.idDepartement && ` • Département: ${departements.find(d => d.id == filters.idDepartement)?.nom}`}
              {filters.dateDebut && ` • Du ${filters.dateDebut?.format('DD/MM/YYYY')}`}
              {filters.dateFin && ` au ${filters.dateFin?.format('DD/MM/YYYY')}`}
            </Typography>
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
            {/* Barre de navigation personnalisée pour le calendrier */}
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
                    <Box width={20} height={20} bgcolor="#b053ad" mr={1} borderRadius={1} />
                    <Typography variant="body2">Validé par manager</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#4caf50" mr={1} borderRadius={1} />
                    <Typography variant="body2">Acquis</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#f44336" mr={1} borderRadius={1} />
                    <Typography variant="body2">Rejeté</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#ff9800" mr={1} borderRadius={1} />
                    <Typography variant="body2">En cours</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={2.4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#5c2458" mr={1} borderRadius={1} />
                    <Typography variant="body2">Passé</Typography>
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
                        const soldeActuel = soldes[demande.idEmploye] || 0;
                        const soldeSuffisant = verifierSoldeSuffisant(demande);
                        
                        return (
                          <TableRow key={demande.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {demande.nomEmploye} {demande.prenomEmploye}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  ID: {demande.idEmploye}
                                </Typography>
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
                                {!soldeSuffisant && (
                                  <Typography variant="caption" color="error">
                                    <Warning fontSize="inherit" /> Insuffisant
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatutLabel(demande.decisionManagerLibelle)}
                                color={getStatutColor(demande.decisionManagerLibelle)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  size="small"
                                  onClick={() => setSelectedDemande(demande)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
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

      {/* Modal de détails */}
      <Dialog 
        open={!!selectedDemande} 
        onClose={() => setSelectedDemande(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedDemande && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Visibility />
                Détails de la demande #{selectedDemande.id}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Employé
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person color="primary" />
                    <Typography variant="body1">
                      {selectedDemande.nomEmploye} {selectedDemande.prenomEmploye}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Matricule: {selectedDemande.matricule} • ID: {selectedDemande.idEmploye}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Département
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business color="secondary" />
                    <Typography variant="body1">
                      {selectedDemande.nomDepartement}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Manager: {selectedDemande.nomCompletManager}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Période
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DateRange color="primary" />
                    <Typography variant="body1">
                      {formatDate(selectedDemande.dateDebut)} → {formatDate(selectedDemande.dateFin)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {selectedDemande.nbJours} jours ouvrables
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Solde disponible
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Today color={verifierSoldeSuffisant(selectedDemande) ? "success" : "error"} />
                    <Typography 
                      variant="body1" 
                      color={verifierSoldeSuffisant(selectedDemande) ? "success.main" : "error.main"}
                      fontWeight="bold"
                    >
                      {(soldes[selectedDemande.idEmploye] || 0).toFixed(1)} jours
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Statut
                  </Typography>
                  <Chip
                    label={getStatutLabel(selectedDemande.decisionManagerLibelle)}
                    color={getStatutColor(selectedDemande.decisionManagerLibelle)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Commentaire du manager
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--brand-50)' }}>
                    <Typography variant="body2">
                      {selectedDemande.commentaireManager || "Aucun commentaire du manager"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
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