import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Alert, Divider,
  Stack, IconButton, Tooltip, Avatar, Button,
  Select, MenuItem, FormControl, InputLabel,
  TextField, InputAdornment
} from '@mui/material';
import {
  ArrowBack, CalendarMonth, AccountCircle,
  TrendingUp, TrendingDown, Refresh,
  History, AccessTime, CheckCircle,
  ArrowForward, ArrowBack as ArrowBackIcon,
  Search, FilterList, PictureAsPdf,
  Download, Print, DateRange,
  Numbers, AttachMoney, Info,
  KeyboardArrowDown, KeyboardArrowUp,
  Visibility, VisibilityOff
} from '@mui/icons-material';
import axiosInstance from '../../../utils/AxiosInstance';
import { saveAs } from 'file-saver';

const DerniersMouvementsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeInfo, setEmployeInfo] = useState(null);
  const [mouvements, setMouvements] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreType, setFiltreType] = useState('tous');
  const [anneeFiltre, setAnneeFiltre] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Types de mouvements disponibles
  const typesMouvement = [
    { value: 'tous', label: 'Tous les types' },
    { value: 'REPORT', label: 'Report' },
    { value: 'ACQUISITION_MENSUELLE', label: 'Acquisition mensuelle' },
    { value: 'PRISE_CONGE', label: 'Prise de congé' },
    { value: 'REPORT_ANNUEL', label: 'Report annuel' },
    { value: 'CLOTURE_ANNUELLE', label: 'Clôture annuelle' },
    { value: 'AJUSTEMENT', label: 'Ajustement' },
    { value: 'SOLDE_INITIAL', label: 'Solde initial' }
  ];

  // Années disponibles pour le filtre
  const anneesDisponibles = Array.from(new Set(mouvements.map(m => m.annee)))
    .sort((a, b) => b - a);

  const fetchMouvementsEmploye = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`Chargement mouvements pour employé: ${id}`);
      
      const response = await axiosInstance.get(
        `/api/mouvementSolde/employe/${id}/mouvementSolde`
      );
      
      console.log('Réponse API:', response.data);
      
      if (response.data.success) {
        const apiData = response.data;
        
        // 1. Récupérer les mouvements
        if (Array.isArray(apiData.data) && apiData.data.length > 0) {
          setMouvements(apiData.data);
          console.log(`${apiData.data.length} mouvements chargés`);
          
          // 2. Récupérer les infos employé depuis le premier mouvement
          const premierMouvement = apiData.data[0];
          if (premierMouvement.employe) {
            setEmployeInfo(premierMouvement.employe);
            console.log('Informations employé chargées depuis le mouvement');
          }
        } else {
          setMouvements([]);
          console.log('Aucun mouvement trouvé');
        }
        
        // 3. Calculer les statistiques
        if (apiData.data && apiData.data.length > 0) {
          const statsCalcul = calculerStatistiques(apiData.data);
          setStats(statsCalcul);
        }
        
      } else {
        setError(response.data.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Erreur API:', err);
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction helper pour calculer les statistiques
  const calculerStatistiques = (mouvements) => {
    if (!mouvements || mouvements.length === 0) return null;
    
    const soldeActuel = mouvements[0]?.nbCongeRestant || 0;
    const totalPris = mouvements.reduce((sum, m) => sum + (m.nbCongePris || 0), 0);
    const totalAcquis = mouvements.reduce((sum, m) => sum + (m.nbCongeTotal || 0), 0);
    const totalMouvements = mouvements.length;
    
    return {
      soldeActuel,
      totalPris,
      totalAcquis,
      totalMouvements,
      tauxUtilisation: totalAcquis > 0 ? (totalPris / totalAcquis * 100) : 0
    };
  };

  useEffect(() => {
    if (id) {
      fetchMouvementsEmploye();
    }
  }, [id]);

  const handleExportPDF = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/mouvementSolde/employe/${id}/export/pdf`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `mouvements_solde_${employeInfo?.matricule || id}.pdf`);
      
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/mouvementSolde/employe/${id}/export/excel`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, `mouvements_solde_${employeInfo?.matricule || id}.xlsx`);
      
    } catch (err) {
      console.error('Erreur export Excel:', err);
      alert('Erreur lors de l\'export Excel');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleRowExpansion = (mouvementId) => {
    setExpandedRows(prev => ({
      ...prev,
      [mouvementId]: !prev[mouvementId]
    }));
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getMoisNom = (mois) => {
    const nomsMois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois >= 1 && mois <= 12 ? nomsMois[mois - 1] : `Mois ${mois}`;
  };

  const getTypeMouvementColor = (type) => {
    const colors = {
      'REPORT': 'primary',
      'ACQUISITION_MENSUELLE': 'success',
      'PRISE_CONGE': 'warning',
      'REPORT_ANNUEL': 'info',
      'CLOTURE_ANNUELLE': 'secondary',
      'AJUSTEMENT': 'default',
      'SOLDE_INITIAL': 'success'
    };
    return colors[type] || 'default';
  };

  const getTypeMouvementLabel = (type) => {
    const labels = {
      'REPORT': 'Report',
      'ACQUISITION_MENSUELLE': 'Acquisition mensuelle',
      'PRISE_CONGE': 'Prise de congé',
      'REPORT_ANNUEL': 'Report annuel',
      'CLOTURE_ANNUELLE': 'Clôture annuelle',
      'AJUSTEMENT': 'Ajustement',
      'SOLDE_INITIAL': 'Solde initial'
    };
    return labels[type] || type;
  };

  // Filtrage et tri des mouvements
  const filteredMouvements = mouvements
    .filter(mouvement => {
      // Filtre par type
      if (filtreType !== 'tous' && mouvement.typeMouvement !== filtreType) {
        return false;
      }
      
      // Filtre par année
      if (anneeFiltre && mouvement.annee !== parseInt(anneeFiltre)) {
        return false;
      }
      
      // Recherche dans commentaire
      if (searchTerm && 
          !mouvement.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !getTypeMouvementLabel(mouvement.typeMouvement).toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      if (sortConfig.key === 'annee' || sortConfig.key === 'mois') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      if (sortConfig.key === 'nbCongeRestant' || sortConfig.key === 'nbCongeTotal') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      // Tri par texte pour les autres champs
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const calculateStats = () => {
    if (!filteredMouvements.length) return null;
    
    const soldeActuel = filteredMouvements[0]?.nbCongeRestant || 0;
    const totalPris = filteredMouvements.reduce((sum, m) => sum + (m.nbCongePris || 0), 0);
    const totalAcquis = filteredMouvements.reduce((sum, m) => sum + (m.nbCongeTotal || 0), 0);
    
    const premierMouvement = filteredMouvements[filteredMouvements.length - 1];
    const dernierMouvement = filteredMouvements[0];
    
    return {
      soldeActuel,
      totalPris,
      totalAcquis,
      nombreMouvements: filteredMouvements.length,
      periode: `${getMoisNom(premierMouvement?.mois)} ${premierMouvement?.annee} - ${getMoisNom(dernierMouvement?.mois)} ${dernierMouvement?.annee}`,
      moyenneMensuelle: totalAcquis / filteredMouvements.length
    };
  };

  const currentStats = calculateStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Chargement des mouvements de solde...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* En-tête avec informations employé */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ color: 'white' }}
              >
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" gutterBottom>
                <AccountCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Historique des soldes de congés
              </Typography>
              
              {employeInfo && (
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                  <Typography variant="h6">
                    {employeInfo.nom} {employeInfo.prenom}
                  </Typography>
                  <Chip
                    label={`Matricule: ${employeInfo.matricule}`}
                    variant="outlined"
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  />
                  <Chip
                    label={employeInfo.fonction}
                    variant="outlined"
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  />
                  {employeInfo.departement && (
                    <Chip
                      label={employeInfo.departement}
                      variant="outlined"
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  )}
                </Box>
              )}
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Actualiser">
                  <IconButton
                    aria-label="Actualiser"
                    onClick={fetchMouvementsEmploye}
                    sx={{ color: 'white' }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {currentStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Numbers color="primary" sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" color="textSecondary">
                    Solde actuel
                  </Typography>
                </Box>
                <Typography variant="h3" color="primary" fontWeight="bold" align="center">
                  {currentStats.soldeActuel.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  jours disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarMonth color="warning" sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" color="textSecondary">
                    Congés pris
                  </Typography>
                </Box>
                <Typography variant="h3" color="warning.main" fontWeight="bold" align="center">
                  {currentStats.totalPris.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  jours consommés
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="success" sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" color="textSecondary">
                    Total acquis
                  </Typography>
                </Box>
                <Typography variant="h3" color="success.main" fontWeight="bold" align="center">
                  {currentStats.totalAcquis.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  jours accumulés
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <History color="info" sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" color="textSecondary">
                    Historique
                  </Typography>
                </Box>
                <Typography variant="h3" color="info.main" fontWeight="bold" align="center">
                  {currentStats.nombreMouvements}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  mouvements enregistrés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres et recherche
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher dans les commentaires..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de mouvement</InputLabel>
                <Select
                  value={filtreType}
                  label="Type de mouvement"
                  onChange={(e) => setFiltreType(e.target.value)}
                >
                  {typesMouvement.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Année</InputLabel>
                <Select
                  value={anneeFiltre}
                  label="Année"
                  onChange={(e) => setAnneeFiltre(e.target.value)}
                >
                  <MenuItem value="">Toutes les années</MenuItem>
                  {anneesDisponibles.map(annee => (
                    <MenuItem key={annee} value={annee}>
                      {annee}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSearchTerm('');
                  setFiltreType('tous');
                  setAnneeFiltre('');
                }}
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
          
          {currentStats && (
            <Box mt={2}>
              <Typography variant="caption" color="textSecondary">
                Période couverte: {currentStats.periode} • 
                Moyenne mensuelle: {currentStats.moyenneMensuelle?.toFixed(1)} jours • 
                Affichage de {filteredMouvements.length} mouvements sur {mouvements.length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tableau des mouvements */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <History sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5">
                Mouvements de solde
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<Print />}
                onClick={handlePrint}
                variant="outlined"
                size="small"
              >
                Imprimer
              </Button>
              <Button
                startIcon={<Download />}
                onClick={handleExportExcel}
                variant="outlined"
                size="small"
              >
                Excel
              </Button>
              <Button
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                variant="contained"
                size="small"
              >
                PDF
              </Button>
            </Stack>
          </Box>

          {filteredMouvements.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Aucun mouvement trouvé correspondant aux critères de recherche.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'var(--brand-100)' }}>
                    <TableCell width="5%"></TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold' }}>
                      <Box display="flex" alignItems="center" onClick={() => handleSort('annee')} sx={{ cursor: 'pointer' }}>
                        Période
                        {sortConfig.key === 'annee' && (
                          sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                        )}
                      </Box>
                    </TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell align="right" width="12%" sx={{ fontWeight: 'bold' }}>
                      <Box display="flex" alignItems="center" justifyContent="flex-end" onClick={() => handleSort('nbCongeTotal')} sx={{ cursor: 'pointer' }}>
                        Total
                        {sortConfig.key === 'nbCongeTotal' && (
                          sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right" width="12%" sx={{ fontWeight: 'bold' }}>Pris</TableCell>
                    <TableCell align="right" width="12%" sx={{ fontWeight: 'bold' }}>
                      <Box display="flex" alignItems="center" justifyContent="flex-end" onClick={() => handleSort('nbCongeRestant')} sx={{ cursor: 'pointer' }}>
                        Restant
                        {sortConfig.key === 'nbCongeRestant' && (
                          sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                        )}
                      </Box>
                    </TableCell>
                    <TableCell width="19%" sx={{ fontWeight: 'bold' }}>
                      <Box display="flex" alignItems="center" onClick={() => handleSort('createdAt')} sx={{ cursor: 'pointer' }}>
                        Date création
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMouvements.map((mouvement) => (
                    <React.Fragment key={mouvement.id}>
                      <TableRow hover sx={{ 
                        backgroundColor: mouvement.typeMouvement === 'REPORT' ? 'action.hover' : 'inherit'
                      }}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(mouvement.id)}
                          >
                            {expandedRows[mouvement.id] ? (
                              <KeyboardArrowUp />
                            ) : (
                              <KeyboardArrowDown />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getMoisNom(mouvement.mois)} {mouvement.annee}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {mouvement.mois}/{mouvement.annee}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTypeMouvementLabel(mouvement.typeMouvement)}
                            color={getTypeMouvementColor(mouvement.typeMouvement)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            {mouvement.nbCongeTotal?.toFixed(1)} j
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" color="warning.main">
                            {mouvement.nbCongePris?.toFixed(1)} j
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" color="success.main" fontWeight="bold">
                            {mouvement.nbCongeRestant?.toFixed(1)} j
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formatDate(mouvement.createdAt)}>
                            <Typography variant="body2">
                              {formatDateShort(mouvement.createdAt)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      
                      {/* Détails dépliables */}
                      {expandedRows[mouvement.id] && (
                        <TableRow>
                          <TableCell colSpan={8} style={{ padding: 0, backgroundColor: 'var(--brand-50)' }}>
                            <Box p={2}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Détails du mouvement
                                  </Typography>
                                  {mouvement.commentaire && (
                                    <Typography variant="body2" paragraph>
                                      <strong>Commentaire:</strong> {mouvement.commentaire}
                                    </Typography>
                                  )}
                                  {mouvement.modifiedAt && (
                                    <Typography variant="caption" color="textSecondary">
                                      Dernière modification: {formatDate(mouvement.modifiedAt)}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Analyse
                                  </Typography>
                                  <Box display="flex" flexDirection="column" gap={1}>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography variant="caption">Taux d'utilisation:</Typography>
                                      <Typography variant="caption" fontWeight="bold">
                                        {((mouvement.nbCongePris / mouvement.nbCongeTotal) * 100 || 0).toFixed(1)}%
                                      </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                      <Typography variant="caption">Solde restant:</Typography>
                                      <Typography variant="caption" fontWeight="bold" color="success.main">
                                        {mouvement.nbCongeRestant?.toFixed(1)} j
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Résumé */}
          {filteredMouvements.length > 0 && (
            <Box mt={3} p={2} bgcolor="var(--brand-50)" borderRadius={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Types de mouvements
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.entries(
                      filteredMouvements.reduce((acc, m) => {
                        acc[m.typeMouvement] = (acc[m.typeMouvement] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <Chip
                        key={type}
                        label={`${getTypeMouvementLabel(type)}: ${count}`}
                        size="small"
                        color={getTypeMouvementColor(type)}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Distribution par année
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.entries(
                      filteredMouvements.reduce((acc, m) => {
                        acc[m.annee] = (acc[m.annee] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([annee, count]) => (
                      <Chip
                        key={annee}
                        label={`${annee}: ${count}`}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Taux d'utilisation global
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {((currentStats?.totalPris / currentStats?.totalAcquis) * 100 || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {currentStats?.totalPris.toFixed(1)}j pris sur {currentStats?.totalAcquis.toFixed(1)}j acquis
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Box mt={2}>
        <Typography variant="caption" color="textSecondary">
          Données extraites le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')} • 
          ID Employé: {id}
        </Typography>
      </Box>
    </Box>
  );
};

export default DerniersMouvementsPage;