import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid,
  Chip, CircularProgress, Alert, Divider,
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

  const getTypeBadgeClass = (type) => {
    const variant = getTypeMouvementColor(type);
    const bootstrapVariant = variant === 'default' ? 'secondary' : variant;
    return `badge bg-${bootstrapVariant} bg-opacity-10 text-${bootstrapVariant} border border-${bootstrapVariant} fw-normal`;
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
      {/* En-tête avec informations employé primary.main*/}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ color: '#b053ad' }}
              >
                <ArrowBack />
              </IconButton>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#3a1438', fontWeight: 800 }}>
                <AccountCircle sx={{ mr: 1, verticalAlign: 'middle', color: '#b053ad' }} />
                Historique des soldes de congés
              </Typography>
              
              {employeInfo && (
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                  <Typography variant="h6" sx={{ color: '#5c2458', fontWeight: 700 }}>
                    {employeInfo.prenom} {employeInfo.nom}
                  </Typography>
                  {/* <Chip
                    label={`Matricule: ${employeInfo.matricule}`}
                    variant="outlined"
                    className='primary'
                    sx={{ bgcolor: '#f9f1f8', color: '#5c2458', borderColor: '#e1b2db' }}
                  /> */}

                  {/* <Chip
                    label={employeInfo.fonction}
                    variant="outlined"
                    sx={{ bgcolor: '#f9f1f8', color: '#5c2458', borderColor: '#e1b2db' }}
                  />

                  {employeInfo.departement && (
                    <Chip
                      label={employeInfo.departement}
                      variant="outlined"
                      sx={{ bgcolor: '#f9f1f8', color: '#5c2458', borderColor: '#e1b2db' }}
                    />
                  )} */}

                </Box>
              )}
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Actualiser">
                  <IconButton
                    aria-label="Actualiser"
                    onClick={fetchMouvementsEmploye}
                    sx={{ color: '#b053ad' }}
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
      <Card sx={{ mb: 3, overflow: 'hidden', p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            background: '#f9f1f8',
            borderBottom: '1px solid #e1b2db',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <FilterList sx={{ color: '#b053ad' }} />
          <Typography variant="h6" sx={{ m: 0, fontWeight: 800, color: '#3a1438' }}>
            Filtres et recherche
          </Typography>
        </Box>

        <CardContent sx={{ p: 3, pt: 2.5 }}>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 520px', minWidth: { xs: '100%', md: 520 } }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher dans les commentaires..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#b053ad' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ flex: '0 0 260px', minWidth: { xs: '100%', sm: 260 } }}>
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
            </Box>

            <Box sx={{ flex: '0 0 190px', minWidth: { xs: '100%', sm: 190 } }}>
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
            </Box>

            <Box sx={{ ml: { md: 'auto' }, minWidth: { xs: '100%', sm: 'auto' } }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSearchTerm('');
                  setFiltreType('tous');
                  setAnneeFiltre('');
                }}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: '#b053ad',
                  color: '#b053ad',
                  fontWeight: 800,
                  '&:hover': {
                    borderColor: '#a05aa8',
                    backgroundColor: 'rgba(176, 83, 173, 0.08)'
                  }
                }}
              >
                Réinitialiser
              </Button>
            </Box>
          </Box>
          
          {currentStats && (
            <Box
              mt={2}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: '1px solid #edd8ea',
                background: 'linear-gradient(180deg, #fcf7fb 0%, #ffffff 100%)'
              }}
            >
              <Typography variant="body2" sx={{ color: '#5c2458' }}>
                Période couverte: {currentStats.periode} • Moyenne mensuelle: {currentStats.moyenneMensuelle?.toFixed(1)} jours • Affichage de{' '}
                {filteredMouvements.length} mouvements sur {mouvements.length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tableau des mouvements */}
      <Card sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2, p: 0 }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" sx={{ px: 3, pt: 3 }}>
              <History sx={{ mr: 1, color: '#b053ad' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#3a1438' }}>
                Mouvements de solde
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ px: 3, pt: 3 }}>
              <Button
                startIcon={<Print />}
                onClick={handlePrint}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#b053ad',
                  color: '#b053ad',
                  fontWeight: 800,
                  '&:hover': { borderColor: '#a05aa8', backgroundColor: 'rgba(176, 83, 173, 0.08)' }
                }}
              >
                Imprimer
              </Button>
              <Button
                startIcon={<Download />}
                onClick={handleExportExcel}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#b053ad',
                  color: '#b053ad',
                  fontWeight: 800,
                  '&:hover': { borderColor: '#a05aa8', backgroundColor: 'rgba(176, 83, 173, 0.08)' }
                }}
              >
                Excel
              </Button>
              <Button
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                variant="contained"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #b053ad 0%, #a05aa8 100%)',
                  fontWeight: 900,
                  '&:hover': { background: 'linear-gradient(135deg, #a05aa8 0%, #b053ad 100%)' }
                }}
              >
                PDF
              </Button>
            </Stack>
          </Box>

          {filteredMouvements.length === 0 ? (
            <Alert severity="info" sx={{ mx: 3, mb: 3 }}>
              Aucun mouvement trouvé correspondant aux critères de recherche.
            </Alert>
          ) : (
            <div className="mx-3 mb-3 border rounded" style={{ borderColor: '#ead7e7', overflow: 'hidden' }}>
              <div className="table-responsive" style={{ maxHeight: 600, overflowY: 'auto' }}>
                <table className="table table-hover table-sm mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-2 ps-3" style={{ width: '5%' }}></th>
                      <th className="py-2" style={{ width: '15%', cursor: 'pointer' }} onClick={() => handleSort('annee')}>
                        Période{sortConfig.key === 'annee' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                      </th>
                      <th className="py-2" style={{ width: '15%' }}>Type</th>
                      <th className="py-2 text-end" style={{ width: '12%', cursor: 'pointer' }} onClick={() => handleSort('nbCongeTotal')}>
                        Total{sortConfig.key === 'nbCongeTotal' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                      </th>
                      <th className="py-2 text-end" style={{ width: '12%' }}>Pris</th>
                      <th className="py-2 text-end" style={{ width: '12%', cursor: 'pointer' }} onClick={() => handleSort('nbCongeRestant')}>
                        Restant{sortConfig.key === 'nbCongeRestant' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                      </th>
                      <th className="py-2" style={{ width: '19%', cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                        Date création{sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMouvements.map((mouvement) => (
                      <React.Fragment key={mouvement.id}>
                        <tr style={{ background: mouvement.typeMouvement === 'REPORT' ? 'rgba(176, 83, 173, 0.06)' : 'transparent' }}>
                          <td className="py-2 ps-2">
                            <IconButton size="small" onClick={() => toggleRowExpansion(mouvement.id)} sx={{ color: '#5c2458' }}>
                              {expandedRows[mouvement.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </td>
                          <td className="py-2">
                            <div className="fw-medium">{getMoisNom(mouvement.mois)} {mouvement.annee}</div>
                            <small className="text-muted">{mouvement.mois}/{mouvement.annee}</small>
                          </td>
                          <td className="py-2">
                            <span className={getTypeBadgeClass(mouvement.typeMouvement)}>
                              {getTypeMouvementLabel(mouvement.typeMouvement)}
                            </span>
                          </td>
                          <td className="py-2 text-end">
                            <span className="fw-bold">{mouvement.nbCongeTotal?.toFixed(1)} j</span>
                          </td>
                          <td className="py-2 text-end">
                            <span className="text-warning">{mouvement.nbCongePris?.toFixed(1)} j</span>
                          </td>
                          <td className="py-2 text-end">
                            <span className="text-success fw-bold">{mouvement.nbCongeRestant?.toFixed(1)} j</span>
                          </td>
                          <td className="py-2">
                            <Tooltip title={formatDate(mouvement.createdAt)}>
                              <span>{formatDateShort(mouvement.createdAt)}</span>
                            </Tooltip>
                          </td>
                        </tr>

                        {expandedRows[mouvement.id] && (
                          <tr>
                            <td colSpan={7} className="p-0" style={{ backgroundColor: '#fcf7fb' }}>
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
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Résumé */}
          {filteredMouvements.length > 0 && (
            <Box
              mt={3}
              p={3}
              sx={{
                background: '#f8f9fa',
                border: '1px solid #ead7e7',
                borderRadius: 2,
                mx: 3,
                mb: 3
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#3a1438', fontWeight: 800 }}>
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
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#3a1438', fontWeight: 800 }}>
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
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#3a1438', fontWeight: 800 }}>
                    Taux d'utilisation global
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#b053ad', fontWeight: 900 }}>
                    {((currentStats?.totalPris / currentStats?.totalAcquis) * 100 || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5c2458' }}>
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
