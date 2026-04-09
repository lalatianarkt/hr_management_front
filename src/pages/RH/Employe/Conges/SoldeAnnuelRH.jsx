import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  IconButton,
  Collapse,
  Tooltip,
  TableSortLabel
} from '@mui/material';
import { 
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import axiosInstance from '../../../utils/AxiosInstance';

const CloturePaiePage = () => {
  const [soldes, setSoldes] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployes, setLoadingEmployes] = useState(false);
  const [clotureLoading, setClotureLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    employe: '',
    annee: '',
    totalJoursMin: '',
    totalJoursMax: '',
    congesPrisMin: '',
    congesPrisMax: '',
    resteMin: '',
    resteMax: '',
    statut: ''
  });
  
  // États pour la sélection multiple
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // État pour le tri
  const [orderBy, setOrderBy] = useState('employe');
  const [order, setOrder] = useState('asc');

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  
  // Styles avec palette violette
  const cardSx = { borderRadius: '20px', border: '1px solid rgba(176, 83, 173, 0.2)', boxShadow: '0 10px 24px rgba(176, 83, 173, 0.08)' };
  const sectionTitleSx = { fontWeight: 800, color: '#b053ad' };
  const primaryButtonSx = { 
    borderRadius: '10px', 
    fontWeight: 700, 
    bgcolor: '#b053ad', 
    color: '#fff', 
    '&:hover': { bgcolor: '#8e3d8b', opacity: 0.9 },
    '&.Mui-disabled': { bgcolor: '#e0c0df', color: '#fff' }
  };
  const outlineButtonSx = { 
    borderRadius: '10px', 
    fontWeight: 700, 
    borderColor: '#b053ad', 
    color: '#b053ad',
    '&:hover': { borderColor: '#8e3d8b', color: '#8e3d8b', bgcolor: 'rgba(176, 83, 173, 0.04)' }
  };

  useEffect(() => {
    fetchEmployes();
    fetchSoldes();
  }, [selectedYear]);

  // Récupérer la liste complète des employés
  const fetchEmployes = async () => {
    try {
      setLoadingEmployes(true);
      const response = await axiosInstance.get(`/api/employes/allEmpActives`);
      
      if (response.data && Array.isArray(response.data)) {
        const employesList = response.data.map(emp => ({
          id: emp.id,
          nom: emp.nom || emp.prenom || emp.id,
          prenom: emp.prenom
        }));
        setEmployes(employesList);
      }
      setError(null);
    } catch (err) {
      console.warn('Impossible de charger la liste des employés, utilisation des soldes comme fallback');
    } finally {
      setLoadingEmployes(false);
    }
  };

  const fetchSoldes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/solde-annuel/annee/${selectedYear}`);
      
      let soldesData = [];
      
      if (response.data && response.data.soldes && Array.isArray(response.data.soldes)) {
        soldesData = response.data.soldes;
      } 
      else if (response.data && Array.isArray(response.data)) {
        soldesData = response.data;
      }
      else {
        soldesData = [];
      }
      
      setSoldes(soldesData);
      setError(null);
      
    } catch (err) {
      console.error("Erreur fetchSoldes:", err);
      setError('Erreur lors du chargement des soldes');
      setSoldes([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmployesList = () => {
    if (employes.length > 0) {
      return employes.map(emp => ({ ...emp, type: 'employe' }));
    }
    
    const employesFromSoldes = [...new Set(soldes.map(s => s.idEmploye))];
    return employesFromSoldes.map(id => ({ id, nom: `Employé ${id}`, type: 'employe' }));
  };

  // Fonction de filtrage
  const getFilteredSoldes = () => {
    return soldes.filter(solde => {
      const employeInfo = getEmployesList().find(e => e.id === solde.idEmploye);
      const employeNom = String(employeInfo?.nom || solde.idEmploye || '').toLowerCase();
      const annee = solde.annee?.toString() || '';
      const totalJours = solde.nbCongeTotal || 0;
      const congesPris = solde.nbCongePris || 0;
      const reste = solde.nbCongeRestant || 0;
      const statut = solde.statutCloture === 1 ? 'Clôturé' : 'À clôturer';
      
      return (
        (filters.employe === '' || employeNom.includes(filters.employe.toLowerCase())) &&
        (filters.annee === '' || annee.includes(filters.annee)) &&
        (filters.totalJoursMin === '' || totalJours >= parseFloat(filters.totalJoursMin)) &&
        (filters.totalJoursMax === '' || totalJours <= parseFloat(filters.totalJoursMax)) &&
        (filters.congesPrisMin === '' || congesPris >= parseFloat(filters.congesPrisMin)) &&
        (filters.congesPrisMax === '' || congesPris <= parseFloat(filters.congesPrisMax)) &&
        (filters.resteMin === '' || reste >= parseFloat(filters.resteMin)) &&
        (filters.resteMax === '' || reste <= parseFloat(filters.resteMax)) &&
        (filters.statut === '' || statut === filters.statut)
      );
    });
  };

  // Fonction de tri
  const getSortedSoldes = () => {
    const filtered = getFilteredSoldes();
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(orderBy) {
        case 'employe':
          const aEmploye = getEmployesList().find(e => e.id === a.idEmploye)?.nom || a.idEmploye;
          const bEmploye = getEmployesList().find(e => e.id === b.idEmploye)?.nom || b.idEmploye;
          aValue = aEmploye;
          bValue = bEmploye;
          break;
        case 'annee':
          aValue = a.annee;
          bValue = b.annee;
          break;
        case 'totalJours':
          aValue = a.nbCongeTotal || 0;
          bValue = b.nbCongeTotal || 0;
          break;
        case 'congesPris':
          aValue = a.nbCongePris || 0;
          bValue = b.nbCongePris || 0;
          break;
        case 'reste':
          aValue = a.nbCongeRestant || 0;
          bValue = b.nbCongeRestant || 0;
          break;
        case 'statut':
          aValue = a.statutCloture === 1 ? 1 : 0;
          bValue = b.statutCloture === 1 ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      employe: '',
      annee: '',
      totalJoursMin: '',
      totalJoursMax: '',
      congesPrisMin: '',
      congesPrisMax: '',
      resteMin: '',
      resteMax: '',
      statut: ''
    });
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      const filteredSoldes = getFilteredSoldes();
      const nonCloturedEmployees = filteredSoldes
        .filter(solde => solde.statutCloture !== 1)
        .map(solde => solde.idEmploye);
      setSelectedEmployees(nonCloturedEmployees);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
    setSelectAll(false);
  };

  const handleClotureMultiple = () => {
    if (selectedEmployees.length === 0) {
      setNotification({
        open: true,
        message: 'Veuillez sélectionner au moins un employé à clôturer',
        severity: 'warning'
      });
      return;
    }
    setOpenDialog(true);
  };

  const executerCloture = async () => {
    try {
      setClotureLoading(true);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const employeId of selectedEmployees) {
        try {
          await axiosInstance.post(
            `/api/solde-annuel/cloture/employe/${employeId}/annee/${selectedYear}`
          );
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Erreur pour l'employé ${employeId}:`, err);
        }
      }
      
      setNotification({
        open: true,
        message: `${successCount} employé(s) clôturé(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
        severity: errorCount > 0 ? 'warning' : 'success'
      });
      
      setOpenDialog(false);
      setSelectedEmployees([]);
      setSelectAll(false);
      
      setTimeout(() => {
        fetchSoldes();
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de la clôture:", err);
      setNotification({
        open: true,
        message: `Erreur: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    } finally {
      setClotureLoading(false);
    }
  };

  // Composant pour l'indicateur de statut visuel
  const StatusIndicator = ({ isClosed }) => {
    return (
      <Tooltip title={isClosed ? "Clôturé" : "À clôturer"}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon 
            sx={{ 
              fontSize: 12, 
              color: isClosed ? '#4caf50' : '#ff9800',
              animation: !isClosed ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 0.6, transform: 'scale(0.95)' },
                '50%': { opacity: 1, transform: 'scale(1.05)' },
                '100%': { opacity: 0.6, transform: 'scale(0.95)' }
              }
            }} 
          />
          <Chip
            label={isClosed ? "Clôturé" : "À clôturer"}
            size="small"
            sx={{
              bgcolor: isClosed ? '#4caf50' : '#ff9800',
              color: '#fff',
              fontWeight: 500,
              '& .MuiChip-label': { px: 1.5, py: 0.5 },
              display: { xs: 'none', sm: 'flex' }
            }}
          />
        </Box>
      </Tooltip>
    );
  };

  // Composant pour le bouton d'action rapide
  const ActionButton = ({ isClosed, onClick, employeeId }) => {
    if (isClosed) {
      return (
        <Tooltip title="Déjà clôturé">
          <Chip
            icon={<CheckIcon />}
            label="Clôturé"
            size="small"
            sx={{
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
              border: '1px solid #4caf50',
              cursor: 'default'
            }}
          />
        </Tooltip>
      );
    }
    
    return (
      <Button
        size="small"
        variant="contained"
        onClick={() => {
          handleSelectEmployee(employeeId);
          setTimeout(() => handleClotureMultiple(), 100);
        }}
        sx={{
          minWidth: 'auto',
          px: 2,
          py: 0.5,
          bgcolor: '#b053ad',
          '&:hover': { bgcolor: '#8e3d8b' },
          fontSize: '0.75rem'
        }}
      >
        Clôturer
      </Button>
    );
  };

  // Calcul des statistiques
  const filteredSoldes = getSortedSoldes();
  const nonCloturedSoldes = filteredSoldes.filter(s => s.statutCloture !== 1);
  const stats = {
    total: filteredSoldes.length,
    clotures: filteredSoldes.filter(s => s.statutCloture === 1).length,
    aCloturer: nonCloturedSoldes.length,
    totalCongesPris: filteredSoldes.reduce((sum, s) => sum + (s.nbCongePris || 0), 0),
    totalCongesRestants: filteredSoldes.reduce((sum, s) => sum + (s.nbCongeRestant || 0), 0),
    selectedCount: selectedEmployees.length
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* En-tête */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h1" sx={sectionTitleSx} gutterBottom>
            Cloture de Paie {selectedYear}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calcul automatique et cloture des congés annuels
          </Typography>
        </CardContent>
      </Card>

      {/* Panneau de contrôle */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#b053ad' }}>Année</InputLabel>
                <Select
                  value={selectedYear}
                  label="Année"
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedEmployees([]);
                    setSelectAll(false);
                  }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0c0df' } }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={outlineButtonSx}
                fullWidth
              >
                {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              </Button>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchSoldes();
                  setSelectedEmployees([]);
                  setSelectAll(false);
                }}
                disabled={loading}
                sx={outlineButtonSx}
                fullWidth
              >
                Actualiser
              </Button>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleClotureMultiple}
                disabled={clotureLoading || stats.selectedCount === 0}
                sx={primaryButtonSx}
                fullWidth
              >
                {clotureLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Clôturer (${stats.selectedCount})`
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Panneau des filtres */}
      <Collapse in={showFilters}>
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon sx={{ color: '#b053ad' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#b053ad' }}>
                  Paramètres de filtrage
                </Typography>
              </Box>
              <Button 
                onClick={clearFilters} 
                size="small" 
                startIcon={<ClearIcon />}
                sx={{ color: '#b053ad' }}
              >
                Effacer tous les filtres
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Employé"
                  value={filters.employe}
                  onChange={(e) => handleFilterChange('employe', e.target.value)}
                  placeholder="Rechercher un employé..."
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Année"
                  value={filters.annee}
                  onChange={(e) => handleFilterChange('annee', e.target.value)}
                  placeholder="Ex: 2024"
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#b053ad' }}>Statut</InputLabel>
                  <Select
                    value={filters.statut}
                    label="Statut"
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0c0df' } }}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="Clôturé">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircleIcon sx={{ fontSize: 12, color: '#4caf50' }} />
                        <span>Clôturé</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="À clôturer">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircleIcon sx={{ fontSize: 12, color: '#ff9800' }} />
                        <span>À clôturer</span>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Total Jours (min)"
                    type="number"
                    value={filters.totalJoursMin}
                    onChange={(e) => handleFilterChange('totalJoursMin', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Total Jours (max)"
                    type="number"
                    value={filters.totalJoursMax}
                    onChange={(e) => handleFilterChange('totalJoursMax', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Congés Pris (min)"
                    type="number"
                    value={filters.congesPrisMin}
                    onChange={(e) => handleFilterChange('congesPrisMin', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Congés Pris (max)"
                    type="number"
                    value={filters.congesPrisMax}
                    onChange={(e) => handleFilterChange('congesPrisMax', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reste (min)"
                    type="number"
                    value={filters.resteMin}
                    onChange={(e) => handleFilterChange('resteMin', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Reste (max)"
                    type="number"
                    value={filters.resteMax}
                    onChange={(e) => handleFilterChange('resteMax', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e0c0df' } } }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {filteredSoldes.length} résultat(s) trouvé(s) • {nonCloturedSoldes.length} à clôturer
            </Typography>
          </CardContent>
        </Card>
      </Collapse>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 2, border: '1px solid rgba(176, 83, 173, 0.2)', boxShadow: '0 2px 8px rgba(176, 83, 173, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GroupIcon sx={{ color: '#b053ad' }} />
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#b053ad' }}>{stats.total}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 2, border: '1px solid rgba(176, 83, 173, 0.2)', boxShadow: '0 2px 8px rgba(176, 83, 173, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CircleIcon sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">Clôturés</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>{stats.clotures}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 2, border: '1px solid rgba(176, 83, 173, 0.2)', boxShadow: '0 2px 8px rgba(176, 83, 173, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CircleIcon sx={{ color: '#ff9800', fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">À clôturer</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>{stats.aCloturer}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 2, border: '1px solid rgba(176, 83, 173, 0.2)', boxShadow: '0 2px 8px rgba(176, 83, 173, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalculateIcon sx={{ color: '#b053ad' }} />
              <Typography variant="body2" color="text.secondary">Jours pris</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#b053ad' }}>{stats.totalCongesPris.toFixed(1)}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 2, border: '1px solid rgba(176, 83, 173, 0.2)', boxShadow: '0 2px 8px rgba(176, 83, 173, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckBoxIcon sx={{ color: '#b053ad' }} />
              <Typography variant="body2" color="text.secondary">Sélectionnés</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#b053ad' }}>{stats.selectedCount}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Tableau des soldes */}
      <TableContainer component={Paper} sx={{ ...cardSx, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(176, 83, 173, 0.06)' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < nonCloturedSoldes.length}
                  checked={selectAll && nonCloturedSoldes.length > 0}
                  onChange={handleSelectAll}
                  disabled={nonCloturedSoldes.length === 0}
                  sx={{ color: '#b053ad' }}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'employe'}
                  direction={orderBy === 'employe' ? order : 'asc'}
                  onClick={() => handleRequestSort('employe')}
                  sx={{ fontWeight: 'bold', color: '#b053ad' }}
                >
                  Employé
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'annee'}
                  direction={orderBy === 'annee' ? order : 'asc'}
                  onClick={() => handleRequestSort('annee')}
                  sx={{ fontWeight: 'bold', color: '#b053ad' }}
                >
                  Année
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'totalJours'}
                  direction={orderBy === 'totalJours' ? order : 'asc'}
                  onClick={() => handleRequestSort('totalJours')}
                  sx={{ fontWeight: 'bold', color: '#b053ad' }}
                >
                  Total Jours
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'congesPris'}
                  direction={orderBy === 'congesPris' ? order : 'asc'}
                  onClick={() => handleRequestSort('congesPris')}
                  sx={{ fontWeight: 'bold', color: '#b053ad' }}
                >
                  Congés Pris
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'reste'}
                  direction={orderBy === 'reste' ? order : 'asc'}
                  onClick={() => handleRequestSort('reste')}
                  sx={{ fontWeight: 'bold', color: '#b053ad' }}
                >
                  Reste
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'statut'}
                  direction={orderBy === 'statut' ? order : 'asc'}
                  onClick={() => handleRequestSort('statut')}
                  sx={{ fontWeight: 'bold', color: '#b053ad' }}
                >
                  Statut
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <Typography sx={{ fontWeight: 'bold', color: '#b053ad' }}>
                  Action
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress sx={{ color: '#b053ad' }} />
                </TableCell>
              </TableRow>
            ) : filteredSoldes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Aucun solde trouvé pour {selectedYear}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSoldes.map((solde) => {
                const employeInfo = getEmployesList().find(e => e.id === solde.idEmploye);
                const estCloture = solde.statutCloture === 1;
                const isSelected = selectedEmployees.includes(solde.idEmploye);
                
                return (
                  <TableRow 
                    key={solde.id || Math.random()}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: '#f9f1f8' },
                      opacity: estCloture ? 0.7 : 1,
                      bgcolor: isSelected ? 'rgba(176, 83, 173, 0.08)' : 'inherit'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectEmployee(solde.idEmploye)}
                        disabled={estCloture}
                        sx={{ color: '#b053ad' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" sx={{ color: '#b053ad' }} />
                        <Typography>
                          {employeInfo?.nom || solde.idEmploye}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={solde.annee} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          borderColor: solde.annee === selectedYear ? '#b053ad' : '#e0c0df',
                          color: solde.annee === selectedYear ? '#b053ad' : 'inherit'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        {solde.nbCongeTotal?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="#b053ad" fontWeight="medium">
                        {solde.nbCongePris?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        fontWeight="bold"
                        color={solde.nbCongeRestant > 0 ? '#4caf50' : '#f44336'}
                      >
                        {solde.nbCongeRestant?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusIndicator isClosed={estCloture} />
                    </TableCell>
                    <TableCell align="center">
                      <ActionButton 
                        isClosed={estCloture}
                        employeeId={solde.idEmploye}
                        onClick={() => handleSelectEmployee(solde.idEmploye)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmation */}
      <Dialog
        open={openDialog}
        onClose={() => !clotureLoading && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#b053ad' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon sx={{ color: '#b053ad' }} />
            Confirmation de clôture {selectedYear}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#b053ad' }} gutterBottom>
              Clôture multiple
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="body2" fontWeight="bold">
                Vous allez clôturer {stats.selectedCount} employé(s) pour l'année {selectedYear}.
              </Typography>
            </Alert>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f1f8', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Liste des employés à clôturer :
              </Typography>
              {selectedEmployees.map(empId => {
                const employeInfo = getEmployesList().find(e => e.id === empId);
                const solde = soldes.find(s => s.idEmploye === empId);
                return (
                  <Typography key={empId} variant="body2" sx={{ ml: 2 }}>
                    • {employeInfo?.nom || empId} - Congés restants: {solde?.nbCongeRestant?.toFixed(2) || '0.00'} jours
                  </Typography>
                );
              })}
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            sx={{ color: '#b053ad' }}
            disabled={clotureLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={executerCloture} 
            variant="contained"
            disabled={clotureLoading}
            startIcon={clotureLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
            sx={primaryButtonSx}
          >
            {clotureLoading ? 'Clôture en cours...' : 'Confirmer la clôture'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CloturePaiePage;
