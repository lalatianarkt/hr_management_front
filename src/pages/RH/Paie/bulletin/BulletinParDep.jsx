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
  const departementName = location.state?.departementName;
  if (!departementName) {
    alert('Nom du département introuvable.');
    return;
  }

  try {
    const response = await axiosInstance.get(
      `/api/export/bulletin/departement/${encodeURIComponent(departementName)}/excel`,
      { responseType: 'blob' }
    );

    const excelBlob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const excelUrl = window.URL.createObjectURL(excelBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = excelUrl;
    downloadLink.download = `etat_paie_${departementName.replace(/[^a-zA-Z0-9-_]/g, '_')}.xlsx`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(excelUrl);
  } catch (error) {
    console.error('Erreur export Excel département:', error);
    alert("Erreur lors de l'export Excel du département.");
  }
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

      {/* En-tête harmonisé */}
      <Card
        sx={{
          borderRadius: '24px',
          border: '1px solid rgba(176, 83, 173, 0.14)',
          background: 'linear-gradient(135deg, #fff 0%, #fdf7fc 100%)',
          boxShadow: '0 10px 24px rgba(176, 83, 173, 0.08)'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* Partie gauche */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#8e3a8b',
                      fontWeight: 700,
                      letterSpacing: '1px'
                    }}
                  >
                    Portail RH • Paie
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1.5,
                      mt: 0.5
                    }}
                  >
                    <Typography
                      component="h1"
                      sx={{
                        fontSize: { xs: '1.8rem', md: '2.4rem' },
                        fontWeight: 800,
                        color: '#4b1f47',
                        lineHeight: 1.2
                      }}
                    >
                      {location.state?.departementName || 'Département'}
                    </Typography>

                    <Chip
                      label={`${totauxDepartement.totalEmployes} employé(s)`}
                      icon={<AccountCircle sx={{ color: '#8e3a8b !important' }} />}
                      sx={{
                        bgcolor: '#f3e2f1',
                        color: '#8e3a8b',
                        fontWeight: 700,
                        border: '1px solid #e1b2db',
                        borderRadius: '999px'
                      }}
                    />
                  </Box>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    variant="outlined"
                    sx={{
                      alignSelf: 'flex-start',
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#8e3a8b',
                      borderColor: '#d79ed0',
                      borderRadius: '999px',
                      px: 2.2,
                      py: 1,
                      '&:hover': {
                        borderColor: '#b053ad',
                        backgroundColor: '#f9eef8'
                      }
                    }}
                  >
                    Retour
                  </Button>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: '999px',
                      bgcolor: '#f9eef8',
                      border: '1px solid #efd2ea'
                    }}
                  >
                    <DateRange sx={{ color: '#b053ad', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: '#5c2458' }}>
                      {periodeActuelle.dateDebut} — {periodeActuelle.dateFin}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            {/* Partie droite */}
            <Grid item xs={12} lg={4}>
              <Stack
                direction="row"
                spacing={1.2}
                justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
                flexWrap="wrap"
                useFlexGap
              >

                <Button
                  startIcon={<Download />}
                  onClick={handleExportExcel}
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '14px',
                    px: 2.2,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #b053ad 0%, #8e3a8b 100%)',
                    boxShadow: '0 8px 18px rgba(176, 83, 173, 0.22)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #9d469a 0%, #7b3178 100%)'
                    }
                  }}
                >
                  Excel
                </Button>

                <Button
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '14px',
                    px: 2.2,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #6a1b63 0%, #4b1f47 100%)',
                    boxShadow: '0 8px 18px rgba(75, 31, 71, 0.18)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #581552 0%, #3e183a 100%)'
                    }
                  }}
                >
                  PDF
                </Button>
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
      <Card
        sx={{
          borderRadius: '24px',
          border: '1px solid rgba(176, 83, 173, 0.12)',
          boxShadow: '0 8px 20px rgba(176, 83, 173, 0.06)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography
            variant="overline"
            sx={{
              color: '#7b5177',
              fontWeight: 800,
              letterSpacing: '1.2px'
            }}
          >
            Recherche & filtres
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Recherche */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher (nom, matricule, fonction)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#8e3a8b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: '#fcf7fb'
                  }
                }}
              />
            </Grid>

            {/* Statut */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: '#fcf7fb'
                  }
                }}
              >
                <InputLabel>Statut</InputLabel>
                <Select
                  value={tempFiltreStatut}
                  label="Statut"
                  onChange={(e) => setTempFiltreStatut(e.target.value)}
                >
                  {statutOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor:
                              opt.color === 'warning'
                                ? '#f59e0b'
                                : opt.color === 'success'
                                ? '#22c55e'
                                : '#9ca3af'
                          }}
                        />
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date début */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Date début"
                type="date"
                value={tempDateDebut}
                onChange={(e) => setTempDateDebut(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: '#fcf7fb'
                  }
                }}
              />
            </Grid>

            {/* Date fin */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Date fin"
                type="date"
                value={tempDateFin}
                onChange={(e) => setTempDateFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    backgroundColor: '#fcf7fb'
                  }
                }}
              />
            </Grid>

            {/* Bouton appliquer */}
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                onClick={applyFilters}
                disabled={!hasTempFiltersChanged()}
                startIcon={<Check />}
                fullWidth
                sx={{
                  height: '56px',
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #b053ad 0%, #8e3a8b 100%)',
                  boxShadow: '0 8px 18px rgba(176, 83, 173, 0.20)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #9d469a 0%, #7b3178 100%)'
                  },
                  '&.Mui-disabled': {
                    background: '#e7e2e8',
                    color: '#9b93a1'
                  }
                }}
              >
                Appliquer
              </Button>
            </Grid>
          </Grid>

          {/* Ligne du bas */}
          <Box
            mt={2.5}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2
            }}
          >
            {/* Filtres actifs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {hasActiveFilters() && (
                <>
                  <Typography variant="caption" sx={{ color: '#6b5a68', fontWeight: 700 }}>
                    Filtres actifs :
                  </Typography>

                  {filtreStatut !== 'tous' && (
                    <Chip
                      size="small"
                      label={`Statut : ${statutOptions.find(opt => opt.value === filtreStatut)?.label}`}
                      onDelete={resetFilters}
                      sx={{
                        bgcolor: '#f3e2f1',
                        color: '#8e3a8b',
                        border: '1px solid #e1b2db'
                      }}
                    />
                  )}

                  {dateDebut && (
                    <Chip
                      size="small"
                      label={`Du : ${formatDateDisplay(dateDebut)}`}
                      onDelete={resetFilters}
                      sx={{
                        bgcolor: '#f3e2f1',
                        color: '#8e3a8b',
                        border: '1px solid #e1b2db'
                      }}
                    />
                  )}

                  {dateFin && (
                    <Chip
                      size="small"
                      label={`Au : ${formatDateDisplay(dateFin)}`}
                      onDelete={resetFilters}
                      sx={{
                        bgcolor: '#f3e2f1',
                        color: '#8e3a8b',
                        border: '1px solid #e1b2db'
                      }}
                    />
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={resetFilters}
                    sx={{
                      ml: 0.5,
                      textTransform: 'none',
                      borderRadius: '999px',
                      borderColor: '#d8a9d3',
                      color: '#8e3a8b',
                      '&:hover': {
                        borderColor: '#b053ad',
                        backgroundColor: '#faf1f9'
                      }
                    }}
                  >
                    Réinitialiser
                  </Button>
                </>
              )}
            </Box>

            {/* Taille de page */}
            <FormControl
              size="small"
              sx={{
                minWidth: 130,
                alignSelf: { xs: 'flex-end', md: 'center' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#fcf7fb'
                }
              }}
            >
              <Select value={pageSize} onChange={handlePageSizeChange}>
                {pageSizeOptions.map(size => (
                  <MenuItem key={size} value={size}>
                    {size} / page
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(176, 83, 173, 0.12)',
          boxShadow: '0 10px 24px rgba(176, 83, 173, 0.06)',
          background: '#fff'
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: '#fcf7fb',
                '& th': {
                  borderBottom: '1px solid rgba(176, 83, 173, 0.14)',
                  color: '#5c2458',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  py: 2.2
                }
              }}
            >
              <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleSort('matricule')}>
                Matricule {sortBy === 'matricule' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleSort('nomComplet')}>
                Collaborateur {sortBy === 'nomComplet' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('salaireBrut')}>
                Brut {sortBy === 'salaireBrut' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('salaireBase')}>
                Base {sortBy === 'salaireBase' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="right" sx={{ cursor: 'pointer' }} onClick={() => handleSort('salaireNet')}>
                Net {sortBy === 'salaireNet' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="center">Période</TableCell>
              <TableCell align="center">Détails</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {bulletins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: '#7b5177', fontWeight: 600 }}>
                    Aucun bulletin trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              bulletins.map((employe, index) => (
                <React.Fragment key={employe.idEmploye}>
                  <TableRow
                    hover
                    onClick={() => toggleEmployeeDetails(employe.idEmploye)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      bgcolor: expandedEmployees[employe.idEmploye] ? '#fdf9fc' : '#fff',
                      '& td': {
                        borderBottom: expandedEmployees[employe.idEmploye]
                          ? 'none'
                          : '1px solid rgba(176, 83, 173, 0.08)',
                        py: 2.4
                      },
                      '&:hover': {
                        bgcolor: '#fcf7fb'
                      }
                    }}
                  >
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          px: 1.2,
                          py: 0.6,
                          borderRadius: '10px',
                          bgcolor: '#f9eef8',
                          color: '#b053ad',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {employe.matricule}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: '#f3e2f1',
                            color: '#8e3a8b',
                            fontWeight: 800,
                            mr: 2
                          }}
                        >
                          {employe.nomComplet?.charAt(0)}
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: '#2f172d',
                              fontSize: '1rem'
                            }}
                          >
                            {employe.nomComplet}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#7b6b79',
                              mt: 0.3
                            }}
                          >
                            {employe.fonction}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 800, color: '#2f172d' }}>
                        {formatCurrency(employe.totalBrut)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 800, color: '#5c2458' }}>
                        {formatCurrency(employe.totalSalaireBase)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 800, color: '#2e7d32' }}>
                        {formatCurrency(employe.totalNet)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {employe.bulletins?.[0] && (
                        <Chip
                          label={`${getMonthName(employe.bulletins[0].moisPaie)} ${employe.bulletins[0].anneePaie}`}
                          size="small"
                          sx={{
                            bgcolor: '#f5f0f4',
                            color: '#5c2458',
                            fontWeight: 600,
                            borderRadius: '999px'
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: expandedEmployees[employe.idEmploye] ? '#f3e2f1' : '#f9f1f8',
                          color: '#8e3a8b',
                          '&:hover': {
                            bgcolor: '#ead1e7'
                          }
                        }}
                      >
                        {expandedEmployees[employe.idEmploye] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0, borderBottom: 'none' }}>
                      <Collapse in={expandedEmployees[employe.idEmploye]} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            px: 3,
                            py: 2.5,
                            bgcolor: '#fdf7fc',
                            borderTop: '1px solid rgba(176, 83, 173, 0.08)',
                            borderBottom: '1px solid rgba(176, 83, 173, 0.08)'
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              fontWeight: 800,
                              color: '#5c2458'
                            }}
                          >
                            Historique des bulletins
                          </Typography>

                          <Table
                            size="small"
                            sx={{
                              bgcolor: '#fff',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              '& th': {
                                bgcolor: '#faf3f9',
                                color: '#7b5177',
                                fontWeight: 700,
                                borderBottom: '1px solid rgba(176, 83, 173, 0.10)'
                              },
                              '& td': {
                                borderBottom: '1px solid rgba(176, 83, 173, 0.07)'
                              }
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>Période</TableCell>
                                {/* <TableCell>Catégorie</TableCell> */}
                                <TableCell align="right">Brut</TableCell>
                                <TableCell align="right">Base</TableCell>
                                <TableCell align="right">Net</TableCell>
                                <TableCell align="center">Statut</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {employe.bulletins?.map((bulletin, idx) => (
                                <TableRow
                                  key={idx}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: '#fcf8fb'
                                    }
                                  }}
                                >
                                  <TableCell>
                                    <Typography sx={{ fontWeight: 600, color: '#3f223c' }}>
                                      {getMonthName(bulletin.moisPaie)} {bulletin.anneePaie}
                                    </Typography>
                                  </TableCell>

                                  {/* <TableCell>
                                    <Chip
                                      label={bulletin.categorieSalaire}
                                      size="small"
                                      sx={{
                                        bgcolor: '#f3e2f1',
                                        color: '#8e3a8b',
                                        fontWeight: 600
                                      }}
                                    />
                                  </TableCell> */}

                                  <TableCell align="right">{formatCurrency(bulletin.salaireBrut)}</TableCell>
                                  <TableCell align="right">{formatCurrency(bulletin.salaireBase)}</TableCell>
                                  <TableCell align="right">
                                    <Typography sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                      {formatCurrency(bulletin.salaireNet)}
                                    </Typography>
                                  </TableCell>

                                  <TableCell align="center">
                                    <Chip
                                      label={getStatutLabel(bulletin.statutCloture)}
                                      size="small"
                                      sx={{
                                        fontWeight: 700,
                                        color:
                                          bulletin.statutCloture === 1 ? '#1f6f43' : '#b45f06',
                                        bgcolor:
                                          bulletin.statutCloture === 1 ? '#e6f4ea' : '#fff1df',
                                        border:
                                          bulletin.statutCloture === 1
                                            ? '1px solid #b7dfc3'
                                            : '1px solid #ffd59a'
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => goToBulletinDetail(bulletin.paieId, employe, bulletin)}
                                      startIcon={<Info />}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderRadius: '10px',
                                        px: 1.8,
                                        background: 'linear-gradient(135deg, #b053ad 0%, #8e3a8b 100%)',
                                        boxShadow: '0 6px 14px rgba(176, 83, 173, 0.16)',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #9d469a 0%, #7b3178 100%)'
                                        }
                                      }}
                                    >
                                      Détail
                                    </Button>
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