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
  Tooltip, Divider, Avatar
} from '@mui/material';
import {
  ArrowBack, CalendarMonth, Home, NavigateNext,
  Person, FilterList, CheckCircle, Cancel,
  Visibility, CalendarToday, Event, AccessTime,
  PendingActions, ThumbUp, ThumbDown, Warning,
  FiberManualRecord, Refresh, HourglassEmpty,
  TaskAlt, Block, VerifiedUser, Close,
  ExpandMore, ExpandLess, DateRange, Today,
  Download, Print, MoreVert
} from '@mui/icons-material';
import axiosInstance from './../../utils/AxiosInstance';

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
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        if (err.response.status === 401 || err.response.status === 403) {
          sessionStorage.removeItem('token');
          setError('Session expirée. Veuillez vous reconnecter.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur serveur'}`);
        }
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        setError('Erreur de connexion. Vérifiez votre réseau.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
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
      result = result.filter(d => d.decisionManager === parseInt(filters.statut));
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
    
    // Filtre par période
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
    setLoading(false);
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

  // Fonction pour valider ou rejeter une demande
  const validerDemande = async (decision) => {
    if (!selectedDemande) return;
    
    setValidationLoading(true);
    
    try {
      const validationData = {
        decisionManager: decision,
        commentaireManager: commentaireManager || (decision === 1 ? "Demande approuvée" : "Demande rejetée"),
      };
      
      let response;
      const url = decision === 1 
        ? `/api/demandes-conge/validate/${selectedDemande.id}`
        : `/api/demandes-conge/refuser/${selectedDemande.id}`;
      
      response = await axiosInstance.put(url, validationData);
      
      const result = response.data;
      
      // Mettre à jour la liste des demandes
      const updatedDemandes = demandes.map(d => 
        d.id === selectedDemande.id ? result : d
      );
      setDemandes(updatedDemandes);
      setFilteredDemandes(updatedDemandes);
      
      // Fermer la modal
      setShowValidationModal(false);
      setSelectedDemande(null);
      setCommentaireManager('');
      setValidationDecision(null);
      
      alert(`Demande ${decision === 1 ? 'approuvée' : 'rejetée'} avec succès!`);
      
    } catch (err) {
      console.error('Erreur validation:', err);
      
      if (err.response) {
        alert(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur serveur'}`);
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

  const getStatusConfig = (decisionManager) => {
    const configs = {
      0: { 
        label: 'En attente', 
        color: 'warning', 
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
        bgColor: '#ff9800'
      },
      1: { 
        label: 'Approuvé', 
        color: 'success', 
        icon: <TaskAlt sx={{ fontSize: 16 }} />,
        bgColor: '#4caf50'
      },
      2: { 
        label: 'Rejeté', 
        color: 'error', 
        icon: <Close sx={{ fontSize: 16 }} />,
        bgColor: '#f44336'
      },
      3: { 
        label: 'Annulé', 
        color: 'success', 
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#5c2458'
      },
      5: { 
        label: 'Terminé', 
        color: 'success', 
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#b053ad'
      },
    };
    
    return configs[decisionManager] || { 
      label: 'Inconnu', 
      color: 'default', 
      icon: null,
      bgColor: '#5c2458'
    };
  };

  // Calcul des statistiques
  const stats = {
    enAttente: demandes.filter(d => d.decisionManager === 0).length,
    approuves: demandes.filter(d => d.decisionManager === 1).length,
    rejetes: demandes.filter(d => d.decisionManager === 2).length
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

  return (
    <Box p={3}>
      {/* En-tête */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
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
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Refresh />}
                onClick={chargerDonneesInitiales}
                disabled={loading}
              >
                Actualiser
              </Button>
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ position: 'relative', mr: 1.5 }}>
                  <HourglassEmpty color="warning" sx={{ fontSize: 30 }} />
                  <FiberManualRecord 
                    sx={{ 
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      fontSize: 12,
                      color: '#ff9800'
                    }} 
                  />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  En attente
                </Typography>
              </Box>
              <Typography variant="h3" color="warning.main" fontWeight="bold" align="center">
                {stats.enAttente}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.enAttente > 0 ? 100 : 0}
                sx={{ 
                  mt: 1,
                  height: 4,
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff9800'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ position: 'relative', mr: 1.5 }}>
                  <TaskAlt color="success" sx={{ fontSize: 30 }} />
                  <FiberManualRecord 
                    sx={{ 
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      fontSize: 12,
                      color: '#4caf50'
                    }} 
                  />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Approuvés
                </Typography>
              </Box>
              <Typography variant="h3" color="success.main" fontWeight="bold" align="center">
                {stats.approuves}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.approuves > 0 ? 100 : 0}
                sx={{ 
                  mt: 1,
                  height: 4,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ position: 'relative', mr: 1.5 }}>
                  <Close color="error" sx={{ fontSize: 30 }} />
                  <FiberManualRecord 
                    sx={{ 
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      fontSize: 12,
                      color: '#f44336'
                    }} 
                  />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Rejetés
                </Typography>
              </Box>
              <Typography variant="h3" color="error.main" fontWeight="bold" align="center">
                {stats.rejetes}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.rejetes > 0 ? 100 : 0}
                sx={{ 
                  mt: 1,
                  height: 4,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#f44336'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres Multicritères
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={filters.statut}
                  onChange={handleFilterChange}
                  label="Statut"
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="0">En attente</MenuItem>
                  <MenuItem value="1">Approuvé</MenuItem>
                  <MenuItem value="2">Rejeté</MenuItem>
                  <MenuItem value="3">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Employé</InputLabel>
                <Select
                  name="idEmploye"
                  value={filters.idEmploye}
                  onChange={handleFilterChange}
                  label="Employé"
                >
                  <MenuItem value="">Tous les employés</MenuItem>
                  {employes.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.nom || `Employé ${emp.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de congé</InputLabel>
                <Select
                  name="typeConge"
                  value={filters.typeConge}
                  onChange={handleFilterChange}
                  label="Type de congé"
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
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>
                <Select
                  name="periode"
                  value={filters.periode}
                  onChange={handleFilterChange}
                  label="Période"
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
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    name="dateDebut"
                    label="Date début"
                    value={filters.dateDebut}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
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
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
              Demandes à valider ({filteredDemandes.filter(d => d.decisionManager === 0).length} en attente)
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
            <Alert severity="info">
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
                    const statusConfig = getStatusConfig(demande.decisionManager);
                    
                    return (
                      <TableRow key={demande.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 1,
                              bgcolor: 'primary.main',
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
                            <Event color="primary" sx={{ mr: 1, fontSize: 'small' }} />
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
                            
                            {demande.decisionManager === 0 && (
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
                      validationDecision === 1 
                      ? "Commentaire optionnel (ex: Bonne demande, congés approuvés)..."
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
          ) : selectedDemande?.decisionManager === 0 ? (
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