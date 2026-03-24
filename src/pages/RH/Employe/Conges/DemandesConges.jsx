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
        label: 'Attente validation Manager', 
        shortLabel: 'Attente Manager',
        color: 'warning',
        icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
        bgColor: '#ed6c02',
        borderColor: '#ff9800',
        bgLight: '#fff8e1'
    },
    1: { 
        label: 'Validé par Manager', 
        shortLabel: 'Validé Manager',
        color: 'info',
        icon: <TaskAlt sx={{ fontSize: 16 }} />,
        bgColor: '#0288d1',
        borderColor: '#03a9f4',
        bgLight: '#e1f5fe'
    },
    2: { 
        label: 'Refusé par Manager', 
        shortLabel: 'Refusé Manager',
        color: 'error',
        icon: <Close sx={{ fontSize: 16 }} />,
        bgColor: '#d32f2f',
        borderColor: '#f44336',
        bgLight: '#ffebee'
    },
    3: { 
        label: 'Accepté par RH', 
        shortLabel: 'Accepté RH',
        color: 'success',
        icon: <VerifiedUser sx={{ fontSize: 16 }} />,
        bgColor: '#2e7d32',
        borderColor: '#4caf50',
        bgLight: '#e8f5e9'
    },
    4: { 
        label: 'Refusé par RH', 
        shortLabel: 'Refusé RH',
        color: 'error',
        icon: <Block sx={{ fontSize: 16 }} />,
        bgColor: '#c62828',
        borderColor: '#ef5350',
        bgLight: '#ffebee'
    },
    5: { 
        label: 'Acquis', 
        shortLabel: 'Acquis',
        color: 'success',
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
        bgColor: '#388e3c',
        borderColor: '#66bb6a',
        bgLight: '#e8f5e9'
    },
    6: { 
        label: 'Annulé', 
        shortLabel: 'Annulé',
        color: 'default',
        icon: <Cancel sx={{ fontSize: 16 }} />,
        bgColor: '#757575',
        borderColor: '#9e9e9e',
        bgLight: '#f5f5f5'
    }
};

const DemandesCongeEmploye = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
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
    const getStatusConfig = useCallback((decisionManager) => {
        return STATUS_CONFIGS[decisionManager] || { 
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
            filtered = filtered.filter(demande => demande.decisionManager === parseInt(statusFilter));
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
                filtered = filtered.filter(d => [0, 1, 2].includes(d.decisionManager));
                break;
            case 2:
                filtered = filtered.filter(d => [3, 4].includes(d.decisionManager));
                break;
            case 3:
                filtered = filtered.filter(d => d.decisionManager === 5);
                break;
            case 4:
                filtered = filtered.filter(d => d.decisionManager === 6);
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
        attenteManager: demandes.filter(d => d.decisionManager === 0).length,
        valideManager: demandes.filter(d => d.decisionManager === 1).length,
        refuseManager: demandes.filter(d => d.decisionManager === 2).length,
        accepteRH: demandes.filter(d => d.decisionManager === 3).length,
        refuseRH: demandes.filter(d => d.decisionManager === 4).length,
        acquis: demandes.filter(d => d.decisionManager === 5).length,
        annule: demandes.filter(d => d.decisionManager === 6).length
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
            getStatusConfig(d.decisionManager).label,
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

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

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
        <Box p={3}>
            {/* En-tête avec retour */}
            <Box mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2, color: '#b053ad' }}
                >
                    Retour
                </Button>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Box>
                        <Typography variant="h5" component="h1" gutterBottom>
                            <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle', color: '#b053ad' }} />
                            Demandes de congé
                        </Typography>
                        {employe && (
                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                                <Chip
                                    icon={<Person />}
                                    label={`${employe.prenom || ''} ${employe.nom || ''}`}
                                    sx={{ bgcolor: '#f8eff7', color: '#b053ad' }}
                                />
                                {employe.departement && (
                                    <Chip
                                        label={`Département: ${employe.departement}`}
                                        variant="outlined"
                                        sx={{ borderColor: '#b053ad', color: '#b053ad' }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                    
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<Print />}
                            onClick={handlePrint}
                            sx={{ borderColor: '#b053ad', color: '#b053ad' }}
                        >
                            Imprimer
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExport}
                            sx={{ borderColor: '#b053ad', color: '#b053ad' }}
                        >
                            Exporter CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            disabled={loading}
                            sx={{ bgcolor: '#b053ad' }}
                        >
                            Actualiser
                        </Button>
                    </Stack>
                </Box>
            </Box>

            {/* Message d'erreur */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Cartes de statistiques */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f8eff7', borderLeft: '4px solid #ff9800' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">En attente Manager</Typography>
                            <Typography variant="h4" color="#ed6c02">{stats.attenteManager}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f8eff7', borderLeft: '4px solid #03a9f4' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Validé Manager</Typography>
                            <Typography variant="h4" color="#0288d1">{stats.valideManager}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f8eff7', borderLeft: '4px solid #4caf50' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Accepté RH</Typography>
                            <Typography variant="h4" color="#2e7d32">{stats.accepteRH}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f8eff7', borderLeft: '4px solid #66bb6a' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Acquis</Typography>
                            <Typography variant="h4" color="#388e3c">{stats.acquis}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Onglets */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                    TabIndicatorProps={{ sx: { bgcolor: '#b053ad' } }}
                >
                    <Tab label={`Toutes (${stats.total})`} sx={{ '&.Mui-selected': { color: '#b053ad' } }} />
                    <Tab label={`En cours (${stats.attenteManager + stats.valideManager + stats.refuseManager})`} sx={{ '&.Mui-selected': { color: '#b053ad' } }} />
                    <Tab label={`Traitement RH (${stats.accepteRH + stats.refuseRH})`} sx={{ '&.Mui-selected': { color: '#b053ad' } }} />
                    <Tab label={`Acquis (${stats.acquis})`} sx={{ '&.Mui-selected': { color: '#b053ad' } }} />
                    <Tab label={`Annulé (${stats.annule})`} sx={{ '&.Mui-selected': { color: '#b053ad' } }} />
                </Tabs>
            </Paper>

            {/* Filtres */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <FilterList sx={{ color: '#b053ad' }} />
                            <Typography variant="h6">Filtres</Typography>
                        </Box>
                        <Button
                            size="small"
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{ color: '#b053ad' }}
                        >
                            {showFilters ? 'Masquer' : 'Afficher'}
                        </Button>
                    </Box>
                    
                    {showFilters && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Rechercher..."
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
                                    <InputLabel>Statut</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Statut"
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value="all">Tous</MenuItem>
                                        <MenuItem value="0">Attente Manager</MenuItem>
                                        <MenuItem value="1">Validé Manager</MenuItem>
                                        <MenuItem value="2">Refusé Manager</MenuItem>
                                        <MenuItem value="3">Accepté RH</MenuItem>
                                        <MenuItem value="4">Refusé RH</MenuItem>
                                        <MenuItem value="5">Acquis</MenuItem>
                                        <MenuItem value="6">Annulé</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} md={2}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                                    <DatePicker
                                        label="Date début"
                                        value={dateDebutFilter}
                                        onChange={setDateDebutFilter}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            
                            <Grid item xs={12} md={2}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                                    <DatePicker
                                        label="Date fin"
                                        value={dateFinFilter}
                                        onChange={setDateFinFilter}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            
                            <Grid item xs={12} md={1}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                    sx={{ borderColor: '#b053ad', color: '#b053ad' }}
                                >
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                    
                    <Box mt={2}>
                        <Typography variant="caption" color="textSecondary">
                            {filteredDemandes.length} demande(s) sur {demandes.length}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Tableau des demandes */}
            <Card>
                <CardContent>
                    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
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
                                        const statusConfig = getStatusConfig(demande.decisionManager);
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
                                                            sx={{ color: '#b053ad' }}
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
                                        bgcolor: '#b053ad',
                                        color: 'white',
                                        '&:hover': { bgcolor: '#8e3d8b' }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Modal de détails - reste identique */}
            <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f8eff7', color: '#b053ad' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Event sx={{ color: '#b053ad' }} />
                        Détails de la demande
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedDemande && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Type de congé</Typography>
                                <Typography variant="body1">
                                    {selectedDemande.typeConge?.intitule || 'Non spécifié'}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Statut</Typography>
                                <Chip
                                    label={getStatusConfig(selectedDemande.decisionManager).label}
                                    size="small"
                                    sx={{
                                        bgcolor: getStatusConfig(selectedDemande.decisionManager).bgLight,
                                        color: getStatusConfig(selectedDemande.decisionManager).bgColor,
                                        border: `1px solid ${getStatusConfig(selectedDemande.decisionManager).borderColor}`,
                                        fontWeight: 500,
                                        mt: 0.5
                                    }}
                                    icon={getStatusConfig(selectedDemande.decisionManager).icon}
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date de début</Typography>
                                <Typography variant="body1">
                                    {formatDateLong(selectedDemande.dateDebut)}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date de fin</Typography>
                                <Typography variant="body1">
                                    {formatDateLong(selectedDemande.dateFin)}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Durée totale</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {selectedDemande.nbJours} jour(s)
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            
                            {selectedDemande.autreMotif && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Motif détaillé</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8eff7' }}>
                                        <Typography variant="body2">{selectedDemande.autreMotif}</Typography>
                                    </Paper>
                                </Grid>
                            )}
                            
                            {selectedDemande.commentaireManager && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Commentaire du Manager
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e1f5fe' }}>
                                        <Typography variant="body2">{selectedDemande.commentaireManager}</Typography>
                                        {selectedDemande.dateDecisionManager && (
                                            <Typography variant="caption" color="textSecondary">
                                                Le {formatDate(selectedDemande.dateDecisionManager)}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            )}
                            
                            {selectedDemande.commentaireRh && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Commentaire du RH
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                                        <Typography variant="body2">{selectedDemande.commentaireRh}</Typography>
                                        {selectedDemande.dateDecisionRh && (
                                            <Typography variant="caption" color="textSecondary">
                                                Le {formatDate(selectedDemande.dateDecisionRh)}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            )}
                            
                            {selectedDemande.commentaireAnnulation && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Commentaire d'annulation
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#ffebee' }}>
                                        <Typography variant="body2">{selectedDemande.commentaireAnnulation}</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDetailsModal(false)} sx={{ color: '#b053ad' }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DemandesCongeEmploye;
