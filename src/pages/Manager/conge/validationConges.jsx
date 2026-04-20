import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  CircularProgress, Alert, Stack, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  Breadcrumbs, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, LinearProgress, Badge,
  Tooltip, Divider, Avatar, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  ArrowBack, CalendarMonth, Home, NavigateNext,
  Person, FilterList, CheckCircle, Cancel,
  Visibility, CalendarToday, Event, AccessTime,
  PendingActions, ThumbUp, ThumbDown, Warning,
  FiberManualRecord, Refresh, HourglassEmpty,
  TaskAlt, Block, VerifiedUser, Close,
  ExpandMore, ExpandLess, DateRange, Today,
  Download, Print, MoreVert,
  StackedBarChartOutlined, ChevronLeft, ChevronRight, ViewList
} from '@mui/icons-material';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axiosInstance from './../../utils/AxiosInstance';

dayjs.locale('fr');

const localizer = dayjsLocalizer(dayjs);

const ValidationConges = () => {
  // États pour les demandes
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour la validation
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaireManager, setCommentaireManager] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationDecision, setValidationDecision] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // États pour les filtres
  const [filters, setFilters] = useState({
    statut: '',
    idEmploye: '',
    typeConge: '',
    dateDebut: '',
    dateFin: '',
    periode: '30jours'
  });
  
  // États pour les données de référence
  const [typesConge, setTypesConge] = useState([]);
  const [employes, setEmployes] = useState([]);
  
  // États pour le calendrier
  const [calendrierEmploye, setCalendrierEmploye] = useState(null);
  const [showCalendrier, setShowCalendrier] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [calendarView, setCalendarView] = useState(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  // Initialisation
  useEffect(() => {
    chargerDonneesInitiales();
  }, []);
  
  const chargerDonneesInitiales = async () => {
    setLoading(true);
    try {
      const [demandesRes, typesRes, employesRes] = await Promise.all([
        axiosInstance.get('/api/demandes-conge/ByManager'),
        axiosInstance.get('/api/type-conge'),
        axiosInstance.get('/api/employes')
      ]);
      
      console.log("demande result : ", demandesRes.data);
      
      let demandesArray;
      if (Array.isArray(demandesRes.data)) {
        demandesArray = demandesRes.data;
      } else if (demandesRes.data && Array.isArray(demandesRes.data)) {
        demandesArray = demandesRes.data;
      } else {
        console.warn("Structure de données inattendue:", demandesRes.data);
        demandesArray = [];
      }
      
      console.log("demandesArray : ", demandesArray);
      
      setDemandes(demandesArray);
      setFilteredDemandes(demandesArray);
      setTypesConge(Array.isArray(typesRes.data) ? typesRes.data : []);
      
      if (employesRes.data) {
        const employesData = employesRes.data;
        setEmployes(Array.isArray(employesData) ? employesData : []);
      } else {
        const idsUniques = [...new Set(demandesArray.map(d => 
          d.employe && d.employe.id ? d.employe.id : d.idEmploye
        ))];
        setEmployes(idsUniques.map(id => ({ 
          id, 
          nom: demandesArray.find(d => 
            (d.employe && d.employe.id === id) || d.idEmploye === id
          )?.employe?.nom || `Employé ${id}` 
        })));
      }
      
    } catch (err) {
      console.log("Erreur détaillée:", err);
      
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          sessionStorage.removeItem('token');
          setError('Session expirée. Veuillez vous reconnecter.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data.message || 'Erreur serveur'}`);
        }
      } else if (err.request) {
        setError('Erreur de connexion. Vérifiez votre réseau.');
      } else {
        setError(`Erreur: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Appliquer les filtres
  const appliquerFiltres = () => {
    let result = [...demandes];
    
    if (filters.statut) {
      result = result.filter(d => d.statut === parseInt(filters.statut));
    }
    
    if (filters.idEmploye) {
      result = result.filter(d => d.idEmploye === filters.idEmploye);
    }
    
    if (filters.typeConge) {
      result = result.filter(d => d.idTypeConge === filters.typeConge);
    }
    
    if (filters.dateDebut) {
      const dateFilter = new Date(filters.dateDebut);
      result = result.filter(d => new Date(d.dateDebut) >= dateFilter);
    }
    
    if (filters.dateFin) {
      const dateFilter = new Date(filters.dateFin);
      result = result.filter(d => new Date(d.dateFin) <= dateFilter);
    }
    
    if (filters.periode !== 'personnalise') {
      const aujourdhui = new Date();
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
      
      const dateLimite = new Date();
      dateLimite.setDate(aujourdhui.getDate() - jours);
      
      result = result.filter(d => new Date(d.dateDemande) >= dateLimite);
    }
    
    setFilteredDemandes(result);
  };

  const reinitialiserFiltres = () => {
    setFilters({
      statut: '',
      idEmploye: '',
      typeConge: '',
      dateDebut: '',
      dateFin: '',
      periode: '30jours'
    });
    setFilteredDemandes([...demandes]);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour valider ou rejeter une demande avec body dans la requête
  const validerDemande = async (decision) => {
    if (!selectedDemande) return;

    setValidationLoading(true);

    try {
      const validationData = {
        ...selectedDemande,

        statut: decision,
        commentaireManager:
          commentaireManager ||
          (decision === 1
            ? "Demande approuvée par le manager"
            : "Demande rejetée par le manager"),

        dateValidation: decision === 1 ? new Date().toISOString() : null,
        modifiedAt: new Date().toISOString()
      };

      let response;

      if (decision === 1) {
        response = await axiosInstance.put(
          `/api/demandes-conge/validate/${selectedDemande.id}`,
          validationData
        );
      } else {
        response = await axiosInstance.put(
          `/api/demandes-conge/refuser/${selectedDemande.id}`,
          validationData
        );
      }

      const result = response.data;

      const updatedDemandes = demandes.map(d =>
        d.id === selectedDemande.id ? result : d
      );

      setDemandes(updatedDemandes);
      setFilteredDemandes(updatedDemandes);

      // Reset
      setShowValidationModal(false);
      setSelectedDemande(null);
      setCommentaireManager('');
      setValidationDecision(null);

      alert(`Demande ${decision === 1 ? 'approuvée' : 'rejetée'} avec succès!`);
    } catch (err) {
      console.error('Erreur validation:', err);

      if (err.response) {
        alert(`Erreur ${err.response.status}: ${err.response.data.message || 'Erreur serveur'}`);
      } else if (err.request) {
        alert('Erreur de connexion. Vérifiez votre réseau.');
      } else {
        alert(`Erreur: ${err.message}`);
      }
    } finally {
      setValidationLoading(false);
    }
  };

  const handleValidationClick = (demande, isApprove) => {
    setSelectedDemande(demande);
    setCommentaireManager('');
    setValidationDecision(isApprove ? 1 : 2);
    setShowValidationModal(true);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getTypeCongeName = (idTypeConge) => {
    const type = typesConge.find(t => t.id === String(idTypeConge));
    return type ? type.intitule : idTypeConge || 'Non spécifié';
  };

  const getStatusConfig = (statut) => {
    const configs = {
      0: { 
        label: 'En attente', 
        color: 'warning', 
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
        bgColor: '#ff9800'
      },
      1: { 
        label: 'Approuve (attente RH)',
        color: 'success', 
        icon: <TaskAlt sx={{ fontSize: 16 }} />,
        bgColor: '#4caf50'
      },
      2: { 
        label: 'Rejete', 
        color: 'error', 
        icon: <Close sx={{ fontSize: 16 }} />,
        bgColor: '#f44336'
      },
      3: { 
        label: 'Annule', 
        color: 'success', 
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#5c2458'
      },
      5: { 
        label: 'Termine', 
        color: 'success', 
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#b053ad'
      },
      6: { 
        label: 'Valide par RH', 
        color: 'success', 
        icon: <VerifiedUser sx={{ fontSize: 16 }} />,
        bgColor: '#2e7d32'
      },
      7: { 
        label: 'Refuse par RH', 
        color: 'error', 
        icon: <Close sx={{ fontSize: 16 }} />,
        bgColor: '#d32f2f'
      },
    };
    
    return configs[statut] || { 
      label: 'Inconnu', 
      color: 'default', 
      icon: null,
      bgColor: '#5c2458'
    };
  };

  const prepareCalendarEvents = () => {
    return filteredDemandes.map((demande) => {
      const statusConfig = getStatusConfig(demande.statut);
      const employeNom = (demande.employe?.prenom || demande.employe?.nom)
        ? `${demande.employe?.prenom || ''} ${demande.employe?.nom || ''}`.trim()
        : `Employe ${demande.idEmploye || ''}`.trim();

      return {
        id: demande.id,
        title: `${employeNom} - ${demande.nbJours || 0}j - ${statusConfig.label}`,
        start: new Date(demande.dateDebut),
        end: new Date(demande.dateFin),
        allDay: true,
        resource: demande,
        style: {
          backgroundColor: statusConfig.bgColor || '#b053ad',
          borderRadius: '4px',
          opacity: 0.85,
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
    setValidationDecision(null);
    setShowValidationModal(true);
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const handleNavigate = (newDate) => {
    setCalendarDate(newDate);
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

  // Calcul des statistiques
  const stats = {
    enAttente: demandes.filter(d => d.statut === 0).length,
    approuves: demandes.filter(d => d.statut === 1).length,
    rejetes: demandes.filter(d => d.statut === 2).length,
    annules: demandes.filter(d => d.statut === 3).length,
    termines: demandes.filter(d => d.statut === 5).length,
    validesRH: demandes.filter(d => d.statut === 6).length,
    refusesRH: demandes.filter(d => d.statut === 7).length
  };

  if (loading && demandes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Chargement des demandes...
        </Typography>
      </Box>
    );
  }

  const purple = '#b053ad';

  return (
    <Box p={3} sx={{ bgcolor: '#f9f1f8', minHeight: '100vh' }}>
      {/* En-tête */}
      <Card sx={{ mb: 3, bgcolor: purple, color: 'white' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton
                component={Link}
                to="/dashboard"
                sx={{ color: 'white' }}
              >
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" gutterBottom>
                <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
                Validation des Demandes de Congé
              </Typography>
              
              <Breadcrumbs 
                sx={{ color: 'white', '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.5)' } }}
                separator={<NavigateNext fontSize="small" />}
              >
                <Box display="flex" alignItems="center">
                  <Home sx={{ mr: 0.5 }} fontSize="small" />
                  <Typography variant="body2">Accueil</Typography>
                </Box>
                <Typography variant="body2">Validation des congés</Typography>
              </Breadcrumbs>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(prev => !prev)}
                  sx={{
                    bgcolor: purple,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: purple, boxShadow: 'none' },
                    '&:active': { bgcolor: purple, boxShadow: 'none' },
                    '&.Mui-focusVisible': { bgcolor: purple, boxShadow: 'none' }
                  }}
                >
                  Filtre
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={chargerDonneesInitiales}
                  disabled={loading}
                  sx={{
                    bgcolor: purple,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: purple, boxShadow: 'none' },
                    '&:active': { bgcolor: purple, boxShadow: 'none' },
                    '&.Mui-focusVisible': { bgcolor: purple, boxShadow: 'none' }
                  }}
                >
                  Actualiser
                </Button>
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

      {/* Statistiques */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Card sx={{ minWidth: 220, flex: '1 1 200px', bgcolor: '#f8eff7', borderLeft: '4px solid #ff9800', borderRadius: 3, boxShadow: '0 6px 18px rgba(176,83,173,0.12)' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <HourglassEmpty sx={{ color: '#ff9800' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#7a4b73' }}>En attente</Typography>
                  <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>{stats.enAttente}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 220, flex: '1 1 200px', bgcolor: '#f8eff7', borderLeft: '4px solid #4caf50', borderRadius: 3, boxShadow: '0 6px 18px rgba(176,83,173,0.12)' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <TaskAlt sx={{ color: '#4caf50' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#7a4b73' }}>Approuves</Typography>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>{stats.approuves}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 220, flex: '1 1 200px', bgcolor: '#f8eff7', borderLeft: '4px solid #f44336', borderRadius: 3, boxShadow: '0 6px 18px rgba(176,83,173,0.12)' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Close sx={{ color: '#f44336' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#7a4b73' }}>Rejetes</Typography>
                  <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 700 }}>{stats.rejetes}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Filtres */}
      {showFilters && (
        <Card sx={{ mb: 3, bgcolor: '#f8eff7', border: '1px solid #e2c9df', borderRadius: 3, boxShadow: '0 6px 18px rgba(176,83,173,0.12)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#7a4b73' }}>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle', color: purple }} />
              Filtres Multicriteres
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{
                  '& .MuiInputLabel-root': { color: '#7a4b73' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#d8b8d6' },
                    '&:hover fieldset': { borderColor: purple },
                    '&.Mui-focused fieldset': { borderColor: purple }
                  }
                }}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="statut"
                    value={filters.statut}
                    onChange={handleFilterChange}
                    label="Statut"
                  >
                    <MenuItem value="">Tous les statuts</MenuItem>
                    <MenuItem value="0">En attente</MenuItem>
                    <MenuItem value="1">Approuve</MenuItem>
                    <MenuItem value="2">Rejete</MenuItem>
                    <MenuItem value="3">Annule</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{
                  '& .MuiInputLabel-root': { color: '#7a4b73' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#d8b8d6' },
                    '&:hover fieldset': { borderColor: purple },
                    '&.Mui-focused fieldset': { borderColor: purple }
                  }
                }}>
                  <InputLabel>Employe</InputLabel>
                  <Select
                    name="idEmploye"
                    value={filters.idEmploye}
                    onChange={handleFilterChange}
                    label="Employe"
                  >
                    <MenuItem value="">Tous les employes</MenuItem>
                    {employes.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.nom || `Employe ${emp.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{
                  '& .MuiInputLabel-root': { color: '#7a4b73' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#d8b8d6' },
                    '&:hover fieldset': { borderColor: purple },
                    '&.Mui-focused fieldset': { borderColor: purple }
                  }
                }}>
                  <InputLabel>Type de conge</InputLabel>
                  <Select
                    name="typeConge"
                    value={filters.typeConge}
                    onChange={handleFilterChange}
                    label="Type de conge"
                  >
                    <MenuItem value="">Tous les types</MenuItem>
                    {typesConge.map(type => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.intitule}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{
                  '& .MuiInputLabel-root': { color: '#7a4b73' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#d8b8d6' },
                    '&:hover fieldset': { borderColor: purple },
                    '&.Mui-focused fieldset': { borderColor: purple }
                  }
                }}>
                  <InputLabel>Periode</InputLabel>
                  <Select
                    name="periode"
                    value={filters.periode}
                    onChange={handleFilterChange}
                    label="Periode"
                  >
                    <MenuItem value="7jours">7 derniers jours</MenuItem>
                    <MenuItem value="30jours">30 derniers jours</MenuItem>
                    <MenuItem value="90jours">90 derniers jours</MenuItem>
                    <MenuItem value="personnalise">Periode personnalisee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {filters.periode === 'personnalise' && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="dateDebut"
                      label="Date debut"
                      value={filters.dateDebut}
                      onChange={handleFilterChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputLabel-root': { color: '#7a4b73' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d8b8d6' },
                          '&:hover fieldset': { borderColor: purple },
                          '&.Mui-focused fieldset': { borderColor: purple }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="dateFin"
                      label="Date fin"
                      value={filters.dateFin}
                      onChange={handleFilterChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputLabel-root': { color: '#7a4b73' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d8b8d6' },
                          '&:hover fieldset': { borderColor: purple },
                          '&.Mui-focused fieldset': { borderColor: purple }
                        }
                      }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={appliquerFiltres}
                  disabled={loading}
                  startIcon={<FilterList />}
                  sx={{
                    bgcolor: purple,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: purple, boxShadow: 'none' },
                    '&:active': { bgcolor: purple, boxShadow: 'none' },
                    '&.Mui-focusVisible': { bgcolor: purple, boxShadow: 'none' }
                  }}
                >
                  Appliquer
                </Button>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={reinitialiserFiltres}
                  startIcon={<Refresh />}
                  sx={{
                    borderColor: purple,
                    color: purple,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: purple, color: purple, bgcolor: 'transparent' }
                  }}
                >
                  Reinitialiser
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Liste des demandes */}
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
        <Typography variant="h6" fontWeight="medium">
          {viewMode === 'calendar' ? `Vue Calendrier (${filteredDemandes.length} demandes)` : `Vue Liste (${filteredDemandes.length} demandes)`}
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newValue) => newValue && setViewMode(newValue)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderColor: purple,
              color: purple,
              textTransform: 'none',
              fontWeight: 600
            },
            '& .MuiToggleButton-root.Mui-selected': {
              bgcolor: purple,
              color: '#fff'
            }
          }}
        >
          <ToggleButton value="calendar">
            <CalendarMonth sx={{ mr: 0.5, fontSize: 18 }} />
            Calendrier
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList sx={{ mr: 0.5, fontSize: 18 }} />
            Liste
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'calendar' ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Today />}
                  onClick={goToToday}
                  sx={{
                    borderColor: purple,
                    color: purple,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: purple, color: purple, bgcolor: 'transparent' }
                  }}
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
                <ToggleButton value={Views.MONTH} sx={{ borderColor: purple, color: purple, textTransform: 'none', fontWeight: 600, '&.Mui-selected': { bgcolor: purple, color: '#fff' } }}>
                  Mois
                </ToggleButton>
                <ToggleButton value={Views.WEEK} sx={{ borderColor: purple, color: purple, textTransform: 'none', fontWeight: 600, '&.Mui-selected': { bgcolor: purple, color: '#fff' } }}>
                  Semaine
                </ToggleButton>
                <ToggleButton value={Views.DAY} sx={{ borderColor: purple, color: purple, textTransform: 'none', fontWeight: 600, '&.Mui-selected': { bgcolor: purple, color: '#fff' } }}>
                  Jour
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ height: 600 }}>
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
                  previous: 'Precedent',
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

            <Box mt={3} p={2} bgcolor="#f8eff7" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                Legende
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#ff9800" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      En attente ({stats.enAttente})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#4caf50" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      Approuve ({stats.approuves})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#f44336" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      Rejete ({stats.rejetes})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#5c2458" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      Annule ({stats.annules})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#b053ad" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      Termine ({stats.termines})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#2e7d32" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      Valide RH ({stats.validesRH})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Box display="flex" alignItems="center">
                    <Box width={20} height={20} bgcolor="#d32f2f" mr={1} borderRadius={1} />
                    <Typography variant="body2">
                      Refuse RH ({stats.refusesRH})
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
              Demandes à valider ({filteredDemandes.filter(d => d.statut === 0).length} en attente)
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Exporter">
                <IconButton aria-label="Exporter" size="small">
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimer">
                <IconButton aria-label="Imprimer" size="small">
                  <Print />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {filteredDemandes.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                bgcolor: '#f8eff7',
                border: '1px solid #e2c9df',
                color: '#7a4b73',
                '& .MuiAlert-icon': { color: purple }
              }}
            >
              Aucune demande trouvée correspondant aux critères de recherche.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employé</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell align="right">Jours</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date Demande</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDemandes.map((demande) => {
                    const statusConfig = getStatusConfig(demande.statut);
                    
                    return (
                      <TableRow key={demande.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 1,
                              bgcolor: purple,
                              fontSize: '0.875rem'
                            }}>
                              {demande.employe?.prenom?.charAt(0) || 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {demande.employe?.prenom} {demande.employe?.nom}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {demande.employe?.matricule || demande.idEmploye}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {demande.typeConge?.intitule || getTypeCongeName(demande.idTypeConge)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Event sx={{ mr: 1, fontSize: 'small', color: purple }} />
                            <Box>
                              <Typography variant="body2">
                                {formatDate(demande.dateDebut)} → {formatDate(demande.dateFin)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {demande.nbJours} jours
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            {demande.nbJours}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              bgcolor: `${statusConfig.bgColor}15`,
                              color: statusConfig.bgColor,
                              border: `1px solid ${statusConfig.bgColor}`,
                              fontWeight: 500
                            }}
                            icon={statusConfig.icon}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(demande.dateDemande)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Voir détails">
                              <IconButton aria-label="Voir détails" 
                                size="small"
                                onClick={() => {
                                  setSelectedDemande(demande);
                                  setValidationDecision(null);
                                  setShowValidationModal(true);
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {demande.statut === 0 && (
                              <>
                                <Tooltip title="Valider">
                                  <IconButton aria-label="Valider" 
                                    size="small"
                                    color="success"
                                    onClick={() => handleValidationClick(demande, true)}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rejeter">
                                  <IconButton aria-label="Rejeter" 
                                    size="small"
                                    color="error"
                                    onClick={() => handleValidationClick(demande, false)}
                                  >
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      )}

      {/* Modal de validation */}
      <Dialog 
        open={showValidationModal} 
        onClose={() => {
          setShowValidationModal(false);
          setSelectedDemande(null);
          setCommentaireManager('');
          setValidationDecision(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {validationDecision === 1 ? (
              <CheckCircle color="success" />
            ) : validationDecision === 2 ? (
              <Cancel color="error" />
            ) : (
              <Visibility color="primary" />
            )}
            {validationDecision === 1 ? 'Valider la demande' : 
             validationDecision === 2 ? 'Rejeter la demande' : 
             'Détails de la demande'}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedDemande && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Employé
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedDemande.employe?.nom} {selectedDemande.employe?.prenom}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date de début
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedDemande.dateDebut)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date de fin
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedDemande.dateFin)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Durée
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedDemande.nbJours} jours
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Motif
                  </Typography>
                  <Typography variant="body1">
                    {selectedDemande.typeConge?.intitule || selectedDemande.autreMotif || 'Non spécifié'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Champ commentaire pour validation/rejet */}
              {(validationDecision === 1 || validationDecision === 2) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Commentaire {validationDecision === 1 ? 'de validation' : 'de rejet'}:
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={commentaireManager}
                    onChange={(e) => setCommentaireManager(e.target.value)}
                    placeholder={
                      validationDecision === 1 ?
                       "Commentaire optionnel (ex: Bonne demande, congés approuvés)..."
                      : "Raison du rejet (ex: Période de forte activité)..."
                    }
                    size="small"
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => {
              setShowValidationModal(false);
              setSelectedDemande(null);
              setCommentaireManager('');
              setValidationDecision(null);
            }}
          >
            Annuler
          </Button>
          
          {/* Boutons de confirmation pour validation/rejet */}
          {(validationDecision === 1 || validationDecision === 2) ? (
            <Button 
              variant="contained"
              color={validationDecision === 1 ? "success" : "error"}
              onClick={() => validerDemande(validationDecision)}
              disabled={validationLoading}
              startIcon={validationDecision === 1 ? <CheckCircle /> : <Cancel />}
            >
              {validationLoading ? 'Traitement...' : 
               validationDecision === 1 ? 'Confirmer validation' : 
               'Confirmer rejet'}
            </Button>
          ) : selectedDemande?.statut === 0 ? (
            <>
              <Button 
                variant="outlined"
                color="error"
                onClick={() => setValidationDecision(2)}
                startIcon={<Cancel />}
              >
                Rejeter
              </Button>
              <Button 
                variant="contained"
                color="success"
                onClick={() => setValidationDecision(1)}
                startIcon={<CheckCircle />}
              >
                Valider
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ValidationConges;







