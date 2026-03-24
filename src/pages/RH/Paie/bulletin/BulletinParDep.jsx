import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Collapse,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormGroup,
  FormLabel
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  ArrowBack,
  Search,
  PictureAsPdf,
  Download,
  Print,
  CalendarMonth,
  AccountCircle,
  AttachMoney,
  Numbers,
  DateRange,
  Info,
  Clear,
  Check
} from '@mui/icons-material';
import axiosInstance from '../../../utils/AxiosInstance';

// Fonction pour formater une date en dd/MM/yyyy pour l'affichage
const formatDateDisplay = (dateString) => {
  if (!dateString) return 'Non définie';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// Fonction pour obtenir la couleur du statut
const getStatutColor = (statut) => {
  // statutCloture: 0 = Non clôturé, 1 = Clôturé
  switch(statut) {
    case 0: return 'warning';  // Non clôturé - orange
    case 1: return 'success';   // Clôturé - vert
    default: return 'default';
  }
};

// Fonction pour obtenir le libellé du statut
const getStatutLabel = (statut) => {
  switch(statut) {
    case 0: return 'Non clôturé';
    case 1: return 'Clôturé';
    default: return 'Inconnu';
  }
};

const BulletinDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bulletins, setBulletins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState({});

  // États pour les totaux
  const [totauxDepartement, setTotauxDepartement] = useState({
    totalBrut: 0,
    totalSalaireBase: 0,
    totalNet: 0,
    totalEmployes: 0
  });

  // Période actuelle
  const [periodeActuelle, setPeriodeActuelle] = useState({
    dateDebut: '',
    dateFin: ''
  });

  // États pour les filtres APPLIQUÉS
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  
  // États pour les filtres TEMPORAIRES
  const [tempFiltreStatut, setTempFiltreStatut] = useState('tous');
  const [tempDateDebut, setTempDateDebut] = useState('');
  const [tempDateFin, setTempDateFin] = useState('');

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [sortBy, setSortBy] = useState('nomComplet');
  const [sortDirection, setSortDirection] = useState('asc');

  const pageSizeOptions = [5, 10, 15, 20, 50, 100];
  
  // Options de statut (uniquement Clôturé et Non clôturé)
  const statutOptions = [
    { value: 'tous', label: 'Tous les statuts', color: 'default' },
    { value: '0', label: 'Non clôturé', color: 'warning' },
    { value: '1', label: 'Clôturé', color: 'success' }
  ];

  // Fonction principale de fetch avec les filtres en paramètres
  const fetchBulletinsWithFilters = async (page, size, statut, debut, fin) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        departement: id,
        page: page,
        size: size,
        sortBy: sortBy,
        direction: sortDirection
      };

      // Envoyer le statut (0 = Non clôturé, 1 = Clôturé, null pour tous)
      if (statut !== 'tous') {
        params.statutCloture = parseInt(statut);
      }
      
      if (debut) {
        params.dateDebut = debut;
      }
      
      if (fin) {
        params.dateFin = fin;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      console.log("📥 Paramètres envoyés à l'API :", {
        departement: params.departement,
        statutCloture: params.statutCloture || 'tous',
        dateDebut: params.dateDebut || 'non filtré',
        dateFin: params.dateFin || 'non filtré',
        search: params.search || 'non filtré',
        page: params.page,
        size: params.size
      });

      const response = await axiosInstance.get(
        `/api/vue-paie-complete/departement/${id}/pagine`,
        { params }
      );

      if (response.data) {
        setCurrentPage(response.data.currentPage || 0);
        setPageSize(response.data.pageSize || 10);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setHasNext(response.data.hasNext || false);
        setHasPrevious(response.data.hasPrevious || false);

        const bulletinsGroupes = groupByEmploye(response.data.content || []);
        setBulletins(bulletinsGroupes);
        updatePeriodeActuelle(bulletinsGroupes);
        calculateTotaux(bulletinsGroupes);
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors du chargement des bulletins');
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  const applyFilters = () => {
    console.log("🔘 Application des filtres:", {
      statut: tempFiltreStatut,
      dateDebut: tempDateDebut,
      dateFin: tempDateFin
    });
    
    setFiltreStatut(tempFiltreStatut);
    setDateDebut(tempDateDebut);
    setDateFin(tempDateFin);
    setCurrentPage(0);
    
    fetchBulletinsWithFilters(0, pageSize, tempFiltreStatut, tempDateDebut, tempDateFin);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    console.log("🔄 Réinitialisation des filtres");
    
    setTempFiltreStatut('tous');
    setTempDateDebut('');
    setTempDateFin('');
    setFiltreStatut('tous');
    setDateDebut('');
    setDateFin('');
    setCurrentPage(0);
    
    fetchBulletinsWithFilters(0, pageSize, 'tous', '', '');
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = () => {
    return (filtreStatut !== 'tous') || dateDebut || dateFin;
  };

  // Vérifier si les filtres temporaires sont différents des filtres appliqués
  const hasTempFiltersChanged = () => {
    return (tempFiltreStatut !== filtreStatut) ||
           (tempDateDebut !== dateDebut) ||
           (tempDateFin !== dateFin);
  };

  const groupByEmploye = (bulletinsList) => {
    const grouped = {};
    bulletinsList.forEach(bulletin => {
      const employeId = bulletin.idEmploye;
      if (!grouped[employeId]) {
        grouped[employeId] = {
          idEmploye: employeId,
          matricule: bulletin.matricule,
          nomComplet: bulletin.nomComplet,
          fonction: bulletin.fonction,
          bulletins: [],
          totalBrut: 0,
          totalSalaireBase: 0,
          totalNet: 0
        };
      }
      grouped[employeId].bulletins.push(bulletin);
      grouped[employeId].totalBrut += (bulletin.salaireBrut || 0);
      grouped[employeId].totalSalaireBase += (bulletin.salaireBase || 0);
      grouped[employeId].totalNet += (bulletin.salaireNet || 0);
    });
    return Object.values(grouped);
  };

  const updatePeriodeActuelle = (bulletinsGroupes) => {
    if (bulletinsGroupes.length > 0 && bulletinsGroupes[0].bulletins.length > 0) {
      const premierBulletin = bulletinsGroupes[0].bulletins[0];
      setPeriodeActuelle({
        dateDebut: formatDateDisplay(premierBulletin.dateDebutPeriode),
        dateFin: formatDateDisplay(premierBulletin.dateFinPeriode)
      });
    }
  };

  const calculateTotaux = (bulletinsGroupes) => {
    const totaux = bulletinsGroupes.reduce((acc, employe) => ({
      totalBrut: acc.totalBrut + (employe.totalBrut || 0),
      totalSalaireBase: acc.totalSalaireBase + (employe.totalSalaireBase || 0),
      totalNet: acc.totalNet + (employe.totalNet || 0),
      totalEmployes: acc.totalEmployes + 1
    }), {
      totalBrut: 0,
      totalSalaireBase: 0,
      totalNet: 0,
      totalEmployes: 0
    });
    setTotauxDepartement(totaux);
  };

  const toggleEmployeeDetails = (employeId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [employeId]: !prev[employeId]
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0,00 Ar';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' Ar';
  };

  const getMonthName = (month) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || `Mois ${month}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchBulletinsWithFilters(newPage, pageSize, filtreStatut, dateDebut, dateFin);
      setExpandedEmployees({});
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
    fetchBulletinsWithFilters(0, newSize, filtreStatut, dateDebut, dateFin);
    setExpandedEmployees({});
  };

  const handleSort = (field) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
    setCurrentPage(0);
    fetchBulletinsWithFilters(0, pageSize, filtreStatut, dateDebut, dateFin);
  };

  // Recherche en temps réel
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (id) {
        setCurrentPage(0);
        fetchBulletinsWithFilters(0, pageSize, filtreStatut, dateDebut, dateFin);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (id) {
      fetchBulletinsWithFilters(0, pageSize, filtreStatut, dateDebut, dateFin);
    } else {
      setError("ID de département manquant");
      setLoading(false);
    }
  }, [id]);

  const handleExportPDF = async () => {
    try {
      if (bulletins.length === 0) {
        alert('Aucun bulletin disponible');
        return;
      }
      setLoading(true);
      let exportedCount = 0;
      for (const employe of bulletins) {
        for (const bulletin of employe.bulletins) {
          const paieId = bulletin.paieId || bulletin.idPaie;
          if (!paieId) continue;
          try {
            const response = await axiosInstance.get(
              `/api/export/bulletin/${paieId}/pdf`,
              { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bulletin_${employe.matricule}_${bulletin.moisPaie}_${bulletin.anneePaie}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            exportedCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Erreur pour ${employe.nomComplet}:`, error);
          }
        }
      }
      alert(`${exportedCount} bulletin(s) PDF exporté(s) !`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    alert('Export Excel à implémenter');
  };

  const handlePrint = () => {
    window.print();
  };

  const goToBulletinDetail = (paieId, employeInfo, bulletinInfo) => {
    const extractedPaieId = bulletinInfo.paieId || bulletinInfo.idPaie;
    if (!extractedPaieId) {
      alert("ID de paie introuvable");
      return;
    }

    const employeData = {
      nom: employeInfo.nomComplet || 'Non spécifié',
      matricule: employeInfo.matricule || 'N/A',
      fonction: employeInfo.fonction || 'Non spécifié',
      idEmploye: employeInfo.idEmploye
    };

    const bulletinData = {
      paieId: extractedPaieId,
      periode: `${getMonthName(bulletinInfo.moisPaie)} ${bulletinInfo.anneePaie}`,
      salaireBrut: bulletinInfo.salaireBrut || 0,
      salaireNet: bulletinInfo.salaireNet || 0
    };

    navigate(`/dashboard-RH/paie/bulletin/departement/employe/${extractedPaieId}`, {
      state: {
        employe: employeData,
        bulletin: bulletinData,
        departement: location.state?.departementName || 'Département'
      }
    });
  };

  if (loading && bulletins.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  const paginationButtonSx = {
    borderRadius: '8px',
    minWidth: '32px',
    height: '30px',
    px: 1,
    fontWeight: 700,
    borderColor: 'rgba(176, 83, 173, 0.35)',
    color: 'var(--bg-primary)'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* En-tête */}
      <Card sx={{ borderRadius: '28px', boxShadow: '0 10px 24px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                variant="contained"
                sx={{ bgcolor: 'rgba(0,0,0,0.1)', color: '#3a1438', borderRadius: '12px', fontWeight: 'bold' }}
              >
                Retour
              </Button>
            </Grid>
            <Grid item xs>
              <Typography variant="overline">Portail RH • Paie</Typography>
              <Typography variant="h3" component="h1" fontWeight="900">
                {location.state?.departementName || 'Département'}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <Box display="flex" alignItems="center" sx={{ bgcolor: 'rgba(0,0,0,0.05)', px: 2, py: 1, borderRadius: '12px' }}>
                  <DateRange sx={{ mr: 1.5 }} />
                  <Typography fontWeight="700">{periodeActuelle.dateDebut} — {periodeActuelle.dateFin}</Typography>
                </Box>
                <Chip icon={<CalendarMonth />} label={`${totauxDepartement.totalEmployes} employé(s)`} />
              </Box>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={handlePrint} sx={{ bgcolor: '#f0f0f0', borderRadius: '12px' }}><Print /></IconButton>
                <Button startIcon={<Download />} onClick={handleExportExcel} variant="contained" sx={{ bgcolor: '#3a1438' }}>Excel</Button>
                <Button startIcon={<PictureAsPdf />} onClick={handleExportPDF} variant="contained" sx={{ bgcolor: '#3a1438' }}>PDF</Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Totaux */}
      <Card sx={{ borderRadius: '24px' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="800" mb={2}>Résumé financier</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#f5f5f5' }}>
                <Typography color="textSecondary">Total Brut</Typography>
                <Typography variant="h4" fontWeight="800" color="primary">{formatCurrency(totauxDepartement.totalBrut)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#f5f5f5' }}>
                <Typography color="textSecondary">Salaire Base</Typography>
                <Typography variant="h4" fontWeight="800" color="warning.main">{formatCurrency(totauxDepartement.totalSalaireBase)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#f5f5f5' }}>
                <Typography color="textSecondary">Total Net</Typography>
                <Typography variant="h4" fontWeight="800" color="success.main">{formatCurrency(totauxDepartement.totalNet)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card sx={{ borderRadius: '24px' }}>
        <CardContent>
          <Typography variant="overline" color="textSecondary" fontWeight="800">Recherche & Filtres</Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Recherche */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher (nom, matricule, fonction)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}><Clear /></IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Statut - Uniquement Clôturé et Non clôturé */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select value={tempFiltreStatut} label="Statut" onChange={(e) => setTempFiltreStatut(e.target.value)}>
                  {statutOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color === 'warning' ? '#ffc107' : opt.color === 'success' ? '#28a745' : '#6c757d' }} />
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Début */}
            <Grid item xs={12} md={2}>
              <FormGroup>
                <FormLabel sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>Date début</FormLabel>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={tempDateDebut}
                  onChange={(e) => setTempDateDebut(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.23)',
                    fontSize: '0.875rem',
                    width: '100%'
                  }}
                />
              </FormGroup>
            </Grid>

            {/* Date Fin */}
            <Grid item xs={12} md={2}>
              <FormGroup>
                <FormLabel sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>Date fin</FormLabel>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={tempDateFin}
                  onChange={(e) => setTempDateFin(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.23)',
                    fontSize: '0.875rem',
                    width: '100%'
                  }}
                />
              </FormGroup>
            </Grid>

            {/* Bouton Appliquer */}
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={applyFilters}
                disabled={!hasTempFiltersChanged()}
                sx={{ bgcolor: 'var(--bg-primary)', borderRadius: '10px', height: '40px', width: '100%' }}
                startIcon={<Check />}
              >
                Appliquer
              </Button>
            </Grid>
          </Grid>

          {/* Filtres actifs */}
          {hasActiveFilters() && (
            <Box mt={2} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="textSecondary" fontWeight="700">Filtres actifs:</Typography>
              {filtreStatut !== 'tous' && (
                <Chip 
                  size="small" 
                  label={`Statut: ${statutOptions.find(opt => opt.value === filtreStatut)?.label}`}
                  onDelete={resetFilters}
                  color={statutOptions.find(opt => opt.value === filtreStatut)?.color}
                />
              )}
              {dateDebut && (
                <Chip size="small" label={`Du: ${formatDateDisplay(dateDebut)}`} onDelete={resetFilters} />
              )}
              {dateFin && (
                <Chip size="small" label={`Au: ${formatDateDisplay(dateFin)}`} onDelete={resetFilters} />
              )}
              <Button size="small" variant="outlined" onClick={resetFilters} sx={{ ml: 1 }}>Tout réinitialiser</Button>
            </Box>
          )}

          {/* Taille page */}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={pageSize} onChange={handlePageSizeChange}>
                {pageSizeOptions.map(size => <MenuItem key={size} value={size}>{size} / page</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tableau */}
      <TableContainer component={Paper} sx={{ borderRadius: '24px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(176, 83, 173, 0.06)' }}>
              <TableCell sx={{ fontWeight: '800', cursor: 'pointer' }} onClick={() => handleSort('matricule')}>
                Matricule {sortBy === 'matricule' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ fontWeight: '800', cursor: 'pointer' }} onClick={() => handleSort('nomComplet')}>
                Collaborateur {sortBy === 'nomComplet' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: '800', cursor: 'pointer' }} onClick={() => handleSort('salaireBrut')}>
                Brut {sortBy === 'salaireBrut' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: '800', cursor: 'pointer' }} onClick={() => handleSort('salaireBase')}>
                Base {sortBy === 'salaireBase' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: '800', cursor: 'pointer' }} onClick={() => handleSort('salaireNet')}>
                Net {sortBy === 'salaireNet' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="center">Période</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bulletins.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography>Aucun bulletin trouvé</Typography></TableCell></TableRow>
            ) : (
              bulletins.map((employe) => (
                <React.Fragment key={employe.idEmploye}>
                  <TableRow hover onClick={() => toggleEmployeeDetails(employe.idEmploye)} sx={{ cursor: 'pointer' }}>
                    <TableCell><code style={{ padding: '4px 8px', background: '#f9f1f8', borderRadius: '6px' }}>{employe.matricule}</code></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'rgba(176, 83, 173, 0.12)', mr: 2 }}>{employe.nomComplet?.charAt(0)}</Avatar>
                        <Box><Typography fontWeight="800">{employe.nomComplet}</Typography><Typography variant="caption">{employe.fonction}</Typography></Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right"><Typography fontWeight="800">{formatCurrency(employe.totalBrut)}</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight="700">{formatCurrency(employe.totalSalaireBase)}</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight="800" color="success.main">{formatCurrency(employe.totalNet)}</Typography></TableCell>
                    <TableCell align="center">
                      {employe.bulletins?.[0] && <Chip label={`${getMonthName(employe.bulletins[0].moisPaie)} ${employe.bulletins[0].anneePaie}`} size="small" />}
                    </TableCell>
                    <TableCell><IconButton size="small">{expandedEmployees[employe.idEmploye] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} style={{ padding: 0 }}>
                      <Collapse in={expandedEmployees[employe.idEmploye]}>
                        <Box p={3} bgcolor="#f9f1f8">
                          <Typography variant="h6" mb={2}>Historique des bulletins</Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Période</TableCell>
                                <TableCell>Catégorie</TableCell>
                                <TableCell align="right">Brut</TableCell>
                                <TableCell align="right">Base</TableCell>
                                <TableCell align="right">Net</TableCell>
                                <TableCell align="center">Statut</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {employe.bulletins?.map((bulletin, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{getMonthName(bulletin.moisPaie)} {bulletin.anneePaie}</TableCell>
                                  <TableCell><Chip label={bulletin.categorieSalaire} size="small" /></TableCell>
                                  <TableCell align="right">{formatCurrency(bulletin.salaireBrut)}</TableCell>
                                  <TableCell align="right">{formatCurrency(bulletin.salaireBase)}</TableCell>
                                  <TableCell align="right">{formatCurrency(bulletin.salaireNet)}</TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={getStatutLabel(bulletin.statutCloture)} 
                                      size="small" 
                                      color={getStatutColor(bulletin.statutCloture)} 
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button size="small" variant="contained" onClick={() => goToBulletinDetail(bulletin.paieId, employe, bulletin)} startIcon={<Info />}>Détail</Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 0 && (
        <Card><CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="body2">Page <strong>{currentPage + 1}</strong> sur <strong>{totalPages}</strong> • {bulletins.length} employé(s) sur {totalElements}</Typography>
            <Box display="flex" gap={1}>
              <Button onClick={() => handlePageChange(0)} disabled={currentPage === 0} sx={paginationButtonSx}>≪</Button>
              <Button onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrevious} sx={paginationButtonSx}>‹</Button>
              <Box sx={{ px: 2, bgcolor: 'rgba(176, 83, 173, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                <Typography>Page {currentPage + 1} / {totalPages}</Typography>
              </Box>
              <Button onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNext} sx={paginationButtonSx}>›</Button>
              <Button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} sx={paginationButtonSx}>≫</Button>
            </Box>
          </Box>
        </CardContent></Card>
      )}
    </Box>
  );
};

export default BulletinDetails;