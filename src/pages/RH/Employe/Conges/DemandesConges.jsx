import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Alert, Divider,
  Stack, IconButton, Tooltip, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Avatar, Breadcrumbs, Link,
  Tabs, Tab, Pagination
} from '@mui/material';
import {
  ArrowBack, CalendarMonth, Person, Event,
  AccessTime, CheckCircle, Cancel, Warning,
  Visibility, Download, Print, FilterList,
  Search, Today, HourglassEmpty, TaskAlt,
  Close, VerifiedUser, Block, Schedule,
  AssignmentLate, History, Refresh
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import axiosInstance from './../../../utils/AxiosInstance';

dayjs.locale('fr');

// Configuration des statuts en dehors du composant pour éviter les recréations
const STATUS_CONFIGS = {
    0: { 
        label: 'En attente', 
        shortLabel: 'En attente',
        color: 'warning',
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
        bgColor: '#ed6c02',
        borderColor: '#ff9800',
        bgLight: '#fff8e1'
    },
    1: { 
        label: 'Validé par manager', 
        shortLabel: 'Validé manager',
        color: 'info',
        icon: <TaskAlt sx={{ fontSize: 16 }} />,
        bgColor: '#0288d1',
        borderColor: '#03a9f4',
        bgLight: '#e1f5fe'
    },
    2: { 
        label: 'Refusé par manager', 
        shortLabel: 'Refusé manager',
        color: 'error',
        icon: <Close sx={{ fontSize: 16 }} />,
        bgColor: '#d32f2f',
        borderColor: '#f44336',
        bgLight: '#ffebee'
    },
    3: { 
        label: 'Annulé par le demandeur', 
        shortLabel: 'Annulé demandeur',
        color: 'default',
        icon: <Cancel sx={{ fontSize: 16 }} />,
        bgColor: '#757575',
        borderColor: '#9e9e9e',
        bgLight: '#f5f5f5'
    },
    4: { 
        label: 'Annulé par le responsable', 
        shortLabel: 'Annulé responsable',
        color: 'default',
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#616161',
        borderColor: '#9e9e9e',
        bgLight: '#f5f5f5'
    },
    5: { 
        label: 'Acquis / Terminé', 
        shortLabel: 'Acquis / Terminé',
        color: 'success',
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
        bgColor: '#388e3c',
        borderColor: '#66bb6a',
        bgLight: '#e8f5e9'
    },
    6: { 
        label: 'Validé par RH', 
        shortLabel: 'Validé RH',
        color: 'success',
        icon: <VerifiedUser sx={{ fontSize: 16 }} />,
        bgColor: '#2e7d32',
        borderColor: '#4caf50',
        bgLight: '#e8f5e9'
    },
    7: { 
        label: 'Refusé par RH', 
        shortLabel: 'Refusé RH',
        color: 'error',
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#c62828',
        borderColor: '#ef5350',
        bgLight: '#ffebee'
    }
};

const DemandesCongeEmploye = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const palette = useMemo(() => ({
        primary: 'var(--bg-primary)',
        primaryHover: 'var(--bg-primary-hover)',
        surfaceAlt: 'var(--brand-25)',
        border: 'var(--brand-100)',
        textMain: 'var(--color-text-main)',
        textMuted: 'var(--color-text-muted)'
    }), []);

    const unifiedButtonSx = useMemo(() => ({
        borderRadius: '10px',
        minHeight: '34px',
        height: '34px',
        px: 1.5,
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.85rem'
    }), []);

    const unifiedButtonContainedSx = useMemo(() => ({
        ...unifiedButtonSx,
        bgcolor: palette.primary,
        color: '#ffffff',
        borderColor: palette.primary,
        boxShadow: '0 10px 20px rgba(176, 83, 173, 0.18)',
        '&:hover': { bgcolor: palette.primaryHover, borderColor: palette.primaryHover, boxShadow: '0 12px 24px rgba(176, 83, 173, 0.22)' }
    }), [palette, unifiedButtonSx]);

    const unifiedButtonOutlinedSx = useMemo(() => ({
        ...unifiedButtonSx,
        borderColor: 'rgba(176, 83, 173, 0.35)',
        color: palette.primary,
        bgcolor: '#ffffff',
        '&:hover': { borderColor: palette.primaryHover, bgcolor: 'rgba(176, 83, 173, 0.06)' }
    }), [palette, unifiedButtonSx]);

    const unifiedButtonTextSx = useMemo(() => ({
        ...unifiedButtonSx,
        px: 1,
        color: palette.primary,
        '&:hover': { bgcolor: 'rgba(176, 83, 173, 0.08)' }
    }), [palette, unifiedButtonSx]);

    const surfaceCardSx = useMemo(() => ({
        borderRadius: 3,
        border: `1px solid ${palette.border}`,
        bgcolor: '#ffffff',
        boxShadow: '0 10px 26px rgba(43, 15, 42, 0.06)'
    }), [palette]);
    
    // États principaux
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [employeInfo, setEmployeInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingEmploye, setLoadingEmploye] = useState(true);
    const [error, setError] = useState('');
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateDebutFilter, setDateDebutFilter] = useState(null);
    const [dateFinFilter, setDateFinFilter] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // États pour la pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10); // Rendre constant pour éviter les re-rendus
    
    // États pour le modal de détails
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Onglet actif
    const [activeTab, setActiveTab] = useState(0);

    // Configuration des statuts - version memoized
    const getStatusConfig = useCallback((statut) => {
        return STATUS_CONFIGS[statut] || { 
            label: 'Inconnu', 
            shortLabel: 'Inconnu',
            color: 'default',
            icon: null,
            bgColor: '#9e9e9e',
            borderColor: '#bdbdbd',
            bgLight: '#f5f5f5'
        };
    }, []);

    // Chargement des données - avec AbortController pour annuler les requêtes en cours
    useEffect(() => {
        if (!id) return;
        
        const abortController = new AbortController();
        
        const loadData = async () => {
            setLoading(true);
            setError('');
            
            try {
                // Charger les deux ressources en parallèle
                const [demandesRes, employeRes] = await Promise.all([
                    axiosInstance.get(`/api/demandes-conge/employe/${id}`, {
                        signal: abortController.signal
                    }),
                    axiosInstance.get(`/api/employes/${id}`, {
                        signal: abortController.signal
                    })
                ]);
                
                setDemandes(Array.isArray(demandesRes.data) ? demandesRes.data : []);
                setEmployeInfo(employeRes.data);
                setError('');
            } catch (err) {
                if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
                    console.error('Erreur chargement:', err);
                    if (err.response?.status === 404) {
                        setDemandes([]);
                        setError('Aucune demande trouvée pour cet employé');
                    } else if (err.response?.status === 401 || err.response?.status === 403) {
                        setError('Non autorisé. Veuillez vous reconnecter.');
                        setTimeout(() => navigate('/'), 2000);
                    } else {
                        setError('Erreur lors du chargement des demandes');
                    }
                }
            } finally {
                setLoading(false);
                setLoadingEmploye(false);
            }
        };
        
        loadData();
        
        return () => abortController.abort();
    }, [id, navigate]);

    // Appliquer les filtres - optimisé avec useMemo
    const filteredData = useMemo(() => {
        let filtered = [...demandes];

        // Filtre recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(demande =>
                demande.typeConge?.intitule?.toLowerCase().includes(term) ||
                demande.autreMotif?.toLowerCase().includes(term) ||
                demande.commentaireManager?.toLowerCase().includes(term) ||
                demande.commentaireRh?.toLowerCase().includes(term)
            );
        }

        // Filtre statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter(demande => demande.statut === parseInt(statusFilter));
        }

        // Filtre dates
        if (dateDebutFilter) {
            const debutDate = dayjs(dateDebutFilter);
            filtered = filtered.filter(demande => 
                dayjs(demande.dateDebut).isAfter(debutDate.subtract(1, 'day'))
            );
        }
        if (dateFinFilter) {
            const finDate = dayjs(dateFinFilter);
            filtered = filtered.filter(demande => 
                dayjs(demande.dateFin).isBefore(finDate.add(1, 'day'))
            );
        }

        // Filtre par onglet
        switch(activeTab) {
            case 1:
                filtered = filtered.filter(d => [0, 1].includes(d.statut));
                break;
            case 2:
                filtered = filtered.filter(d => [6, 7].includes(d.statut));
                break;
            case 3:
                filtered = filtered.filter(d => d.statut === 5);
                break;
            case 4:
                filtered = filtered.filter(d => [3, 4].includes(d.statut));
                break;
            default:
                break;
        }

        return filtered;
    }, [demandes, searchTerm, statusFilter, dateDebutFilter, dateFinFilter, activeTab]);

    // Mettre à jour filteredDemandes quand filteredData change
    useEffect(() => {
        setFilteredDemandes(filteredData);
        setPage(1);
    }, [filteredData]);

    // Calcul des statistiques - optimisé avec useMemo
    const stats = useMemo(() => ({
        total: demandes.length,
        attente: demandes.filter(d => d.statut === 0).length,
        valideManager: demandes.filter(d => d.statut === 1).length,
        refuseManager: demandes.filter(d => d.statut === 2).length,
        annuleDemandeur: demandes.filter(d => d.statut === 3).length,
        annuleResponsable: demandes.filter(d => d.statut === 4).length,
        acquis: demandes.filter(d => d.statut === 5).length,
        valideRH: demandes.filter(d => d.statut === 6).length,
        refuseRH: demandes.filter(d => d.statut === 7).length
    }), [demandes]);

    // Fonctions memoized
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('DD/MM/YYYY');
    }, []);

    const formatDateLong = useCallback((dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('dddd DD MMMM YYYY');
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateDebutFilter(null);
        setDateFinFilter(null);
    }, []);

    const handleViewDetails = useCallback((demande) => {
        setSelectedDemande(demande);
        setShowDetailsModal(true);
    }, []);

    const handleExport = useCallback(() => {
        const headers = ['Type', 'Date Début', 'Date Fin', 'Nb Jours', 'Statut', 'Motif', 'Commentaire Manager', 'Commentaire RH'];
        const data = filteredDemandes.map(d => [
            d.typeConge?.intitule || '-',
            formatDate(d.dateDebut),
            formatDate(d.dateFin),
            d.nbJours,
            getStatusConfig(d.statut).label,
            d.autreMotif || '-',
            d.commentaireManager || '-',
            d.commentaireRh || '-'
        ]);
        
        const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `demandes_conge_${employeInfo?.employe?.nom || id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [filteredDemandes, formatDate, getStatusConfig, employeInfo, id]);

    const handleRefresh = useCallback(async () => {
        setLoading(true);
        try {
            const [demandesRes, employeRes] = await Promise.all([
                axiosInstance.get(`/api/demandes-conge/employe/${id}`),
                axiosInstance.get(`/api/employes/${id}`)
            ]);
            setDemandes(Array.isArray(demandesRes.data) ? demandesRes.data : []);
            setEmployeInfo(employeRes.data);
            setError('');
        } catch (err) {
            console.error('Erreur refresh:', err);
            setError('Erreur lors de l\'actualisation');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Pagination - optimisée
    const paginatedDemandes = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredDemandes.slice(start, end);
    }, [filteredDemandes, page, rowsPerPage]);

    const pageCount = useMemo(() => 
        Math.ceil(filteredDemandes.length / rowsPerPage), 
        [filteredDemandes.length, rowsPerPage]
    );

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

    const employe = employeInfo?.employe || employeInfo;

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--brand-50)', minHeight: '100%' }}>
            {/* En-tête avec retour */}
            <Paper
                elevation={0}
                sx={{
                    mb: 2.5,
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 3,
                    bgcolor: palette.surfaceAlt,
                    border: `1px solid ${palette.border}`
                }}
            >
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    size="small"
                    variant="text"
                    sx={{ ...unifiedButtonTextSx, mb: 1 }}
                >
                    Retour
                </Button>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                    <Box>
                            <Typography variant="h6" component="h1" gutterBottom sx={{ mb: 0.75, color: palette.textMain, fontWeight: 800 }}>
                                <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle', color: palette.primary, fontSize: 26 }} />
                            Demandes de congé
                        </Typography>
                        {employe && (
                            <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                                <Chip
                                    icon={<Person />}
                                    label={`${employe.prenom || ''} ${employe.nom || ''}`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'var(--brand-50)',
                                        color: palette.primary,
                                        border: `1px solid ${palette.border}`,
                                        fontWeight: 700
                                    }}
                                />
                                {employe.departement && (
                                    <Chip
                                        label={`Département: ${employe.departement}`}
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderColor: 'rgba(176, 83, 173, 0.35)', color: palette.primary, fontWeight: 700 }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                    
                    <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                        <Button
                            variant={showFilters ? 'contained' : 'outlined'}
                            startIcon={<FilterList />}
                            onClick={() => setShowFilters(!showFilters)}
                            size="small"
                            sx={showFilters ? unifiedButtonContainedSx : unifiedButtonOutlinedSx}
                        >
                            {showFilters ? 'Masquer filtres' : 'Filtres'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExport}
                            size="small"
                            sx={unifiedButtonOutlinedSx}
                        >
                            Exporter CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            disabled={loading}
                            size="small"
                            sx={unifiedButtonContainedSx}
                        >
                            Actualiser
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {/* Message d'erreur */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Cartes de statistiques */}
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...surfaceCardSx, py: 0.5, px: 0.5, borderLeft: '4px solid var(--status-warning)' }}>
                        <CardContent sx={{ py: 1.25, px: 2, minHeight: 84 }}>
                            <Typography variant="body2" color="textSecondary">En attente</Typography>
                            <Typography variant="h5" sx={{ lineHeight: 1.1, color: 'var(--status-warning)', fontWeight: 900 }}>{stats.attente}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...surfaceCardSx, py: 0.5, px: 0.5, borderLeft: '4px solid var(--status-info)' }}>
                        <CardContent sx={{ py: 1.25, px: 2, minHeight: 84 }}>
                            <Typography variant="body2" color="textSecondary">Validé manager</Typography>
                            <Typography variant="h5" sx={{ lineHeight: 1.1, color: 'var(--status-info)', fontWeight: 900 }}>{stats.valideManager}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...surfaceCardSx, py: 0.5, px: 0.5, borderLeft: '4px solid var(--status-success)' }}>
                        <CardContent sx={{ py: 1.25, px: 2, minHeight: 84 }}>
                            <Typography variant="body2" color="textSecondary">Validé RH</Typography>
                            <Typography variant="h5" sx={{ lineHeight: 1.1, color: 'var(--status-success)', fontWeight: 900 }}>{stats.valideRH}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...surfaceCardSx, py: 0.5, px: 0.5, borderLeft: '4px solid rgba(16, 185, 129, 0.6)' }}>
                        <CardContent sx={{ py: 1.25, px: 2, minHeight: 84 }}>
                            <Typography variant="body2" color="textSecondary">Acquis</Typography>
                            <Typography variant="h5" sx={{ lineHeight: 1.1, color: 'var(--status-success)', fontWeight: 900 }}>{stats.acquis}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Onglets */}
            <Paper sx={{ ...surfaceCardSx, mb: 3, bgcolor: palette.surfaceAlt }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                    TabIndicatorProps={{ sx: { bgcolor: palette.primary } }}
                >
                    <Tab label={`Toutes (${stats.total})`} sx={{ fontWeight: 700, '&.Mui-selected': { color: palette.primary } }} />
                    <Tab label={`En cours (${stats.attente + stats.valideManager})`} sx={{ fontWeight: 700, '&.Mui-selected': { color: palette.primary } }} />
                    <Tab label={`RH (${stats.valideRH + stats.refuseRH})`} sx={{ fontWeight: 700, '&.Mui-selected': { color: palette.primary } }} />
                    <Tab label={`Acquis (${stats.acquis})`} sx={{ fontWeight: 700, '&.Mui-selected': { color: palette.primary } }} />
                    <Tab label={`Annulé (${stats.annuleDemandeur + stats.annuleResponsable})`} sx={{ fontWeight: 700, '&.Mui-selected': { color: palette.primary } }} />
                </Tabs>
            </Paper>

            {/* Filtres */}
            {showFilters && (
                <Card sx={{ ...surfaceCardSx, mb: 3, bgcolor: palette.surfaceAlt }}>
                    <CardContent>
                        <Stack spacing={3}>
                            <Box
                                display="flex"
                                gap={2}
                                flexDirection={{ xs: 'column', md: 'row' }}
                                alignItems={{ xs: 'stretch', md: 'flex-start' }}
                            >
                                <Box sx={{ flex: 1, minWidth: { md: 0 } }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Rechercher par type, motif ou commentaire..."
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
                                </Box>

                                <Box sx={{ width: { xs: '100%', md: 180 }, flexShrink: 0 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Statut</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Statut"
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">Tous</MenuItem>
                                            <MenuItem value="0">En attente</MenuItem>
                                            <MenuItem value="1">Validé par manager</MenuItem>
                                            <MenuItem value="2">Refusé par manager</MenuItem>
                                            <MenuItem value="3">Annulé par le demandeur</MenuItem>
                                            <MenuItem value="4">Annulé par le responsable</MenuItem>
                                            <MenuItem value="5">Acquis / Terminé</MenuItem>
                                            <MenuItem value="6">Validé par RH</MenuItem>
                                            <MenuItem value="7">Refusé par RH</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                gap={2}
                                flexDirection={{ xs: 'column', md: 'row' }}
                                alignItems={{ xs: 'stretch', md: 'center' }}
                            >
                                <Box sx={{ flex: 1, minWidth: { md: 0 } }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                                        <DatePicker
                                            label="Date début"
                                            value={dateDebutFilter}
                                            onChange={setDateDebutFilter}
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                    </LocalizationProvider>
                                </Box>

                                <Box sx={{ flex: 1, minWidth: { md: 0 } }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                                        <DatePicker
                                            label="Date fin"
                                            value={dateFinFilter}
                                            onChange={setDateFinFilter}
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                    </LocalizationProvider>
                                </Box>

                                <Box sx={{ width: { xs: '100%', md: 160 }, flexShrink: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleResetFilters}
                                        sx={{ ...unifiedButtonOutlinedSx, height: '40px' }}
                                    >
                                        Réinitialiser
                                    </Button>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <Typography variant="caption" color="textSecondary">
                                    {filteredDemandes.length} demande(s) sur {demandes.length}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Tableau des demandes */}
            <Card sx={surfaceCardSx}>
                <CardContent>
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: 500,
                            borderRadius: 3,
                            border: `1px solid ${palette.border}`,
                            boxShadow: 'none',
                            '& .MuiTableCell-head': {
                                bgcolor: palette.surfaceAlt,
                                fontWeight: 800,
                                color: palette.textMain
                            },
                            '& .MuiTableRow-root:hover td': {
                                bgcolor: 'rgba(176, 83, 173, 0.04)'
                            }
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Période</TableCell>
                                    <TableCell align="center">Jours</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Date demande</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedDemandes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Alert severity="info" sx={{ m: 2 }}>
                                                Aucune demande trouvée
                                            </Alert>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedDemandes.map((demande) => {
                                        const statusConfig = getStatusConfig(demande.statut);
                                        return (
                                            <TableRow key={demande.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {demande.typeConge?.intitule || 'Non spécifié'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {formatDate(demande.dateDebut)} → {formatDate(demande.dateFin)}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {demande.nbJours} jour(s)
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${demande.nbJours}j`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={statusConfig.shortLabel}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: statusConfig.bgLight,
                                                            color: statusConfig.bgColor,
                                                            border: `1px solid ${statusConfig.borderColor}`,
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
                                                    <Tooltip title="Voir détails">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(demande)}
                                                            sx={{ color: palette.primary }}
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    {pageCount > 1 && (
                        <Box display="flex" justifyContent="center" mt={2}>
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                                sx={{
                                    '& .MuiPaginationItem-root.Mui-selected': {
                                        bgcolor: palette.primary,
                                        color: 'white',
                                        '&:hover': { bgcolor: palette.primaryHover }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Modal de détails */}
            <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="lg" fullWidth>
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
                                    <Event sx={{ color: palette.primary }} />
                                    <Typography variant="h6" component="span">
                                        Détails de la demande
                                    </Typography>
                                </Box>
                                <Chip
                                    label={getStatusConfig(selectedDemande.statut).label}
                                    size="small"
                                    sx={{
                                        bgcolor: getStatusConfig(selectedDemande.statut).bgLight,
                                        color: getStatusConfig(selectedDemande.statut).bgColor,
                                        border: `1px solid ${getStatusConfig(selectedDemande.statut).borderColor}`,
                                        fontWeight: 700,
                                        alignSelf: { xs: 'flex-start', sm: 'center' }
                                    }}
                                    icon={getStatusConfig(selectedDemande.statut).icon}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <Stack spacing={2.5}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} lg={3}>
                                        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}>
                                            <Typography variant="overline" color="text.secondary">
                                                Type de congé
                                            </Typography>
                                            <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                                                <CalendarMonth sx={{ color: palette.primary, mt: 0.2 }} />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {selectedDemande.typeConge?.intitule || 'Non spécifié'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Date demande: {formatDate(selectedDemande.dateDemande)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} sm={6} lg={3}>
                                        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}>
                                            <Typography variant="overline" color="text.secondary">
                                                Période
                                            </Typography>
                                            <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                                                <Event sx={{ color: '#03a9f4', mt: 0.2 }} />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {formatDate(selectedDemande.dateDebut)} → {formatDate(selectedDemande.dateFin)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDateLong(selectedDemande.dateDebut)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} sm={6} lg={3}>
                                        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}>
                                            <Typography variant="overline" color="text.secondary">
                                                Fin du congé
                                            </Typography>
                                            <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                                                <Today sx={{ color: '#03a9f4', mt: 0.2 }} />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {formatDateLong(selectedDemande.dateFin)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Retour prévu après cette date
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} sm={6} lg={3}>
                                        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%', bgcolor: '#fff' }}>
                                            <Typography variant="overline" color="text.secondary">
                                                Durée totale
                                            </Typography>
                                            <Box display="flex" alignItems="flex-start" gap={1.5} mt={0.75}>
                                                <AccessTime sx={{ color: '#2e7d32', mt: 0.2 }} />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700} color="#2e7d32">
                                                        {selectedDemande.nbJours} jour(s)
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Durée calculée de la demande
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {selectedDemande.autreMotif && (
                                    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, bgcolor: 'var(--brand-50)', borderColor: palette.border }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Motif détaillé
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                                            {selectedDemande.autreMotif}
                                        </Typography>
                                    </Paper>
                                )}

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                                        gap: 2,
                                        width: '100%'
                                    }}
                                >
                                    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, minHeight: 180, bgcolor: '#fff', width: '100%' }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Commentaire du manager
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                                            {selectedDemande.commentaireManager || 'Aucun commentaire du manager'}
                                        </Typography>
                                        {selectedDemande.dateDecisionManager && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                                                Le {formatDate(selectedDemande.dateDecisionManager)}
                                            </Typography>
                                        )}
                                    </Paper>

                                    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, minHeight: 180, bgcolor: '#fff', width: '100%' }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Commentaire RH
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                                            {selectedDemande.commentaireRh || 'Aucun commentaire RH'}
                                        </Typography>
                                        {selectedDemande.dateDecisionRh && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                                                Le {formatDate(selectedDemande.dateDecisionRh)}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Box>

                                {selectedDemande.commentaireAnnulation && (
                                    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, bgcolor: '#ffebee' }}>
                                        <Typography variant="overline" color="text.secondary">
                                            Commentaire d'annulation
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                                            {selectedDemande.commentaireAnnulation}
                                        </Typography>
                                    </Paper>
                                )}
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowDetailsModal(false)} variant="text" sx={unifiedButtonTextSx}>
                                Fermer
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default DemandesCongeEmploye;
