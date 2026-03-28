import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Alert, Divider,
  Stack, IconButton, Tooltip, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Breadcrumbs, InputAdornment, Avatar, Badge,
  LinearProgress, Fade
} from '@mui/material';
import {
  ArrowBack, CalendarMonth, Add, Refresh,
  Search, FilterList, Person, Event,
  AccessTime, CheckCircle, Cancel,
  Warning, Visibility, DeleteOutline,
  DateRange, Today, Edit, FileCopy,
  Download, Print, MoreVert,
  NavigateNext, Home, CalendarToday,
  PendingActions, ThumbUp, ThumbDown,
  Block, EditCalendar, HourglassEmpty,
  TaskAlt, Close, VerifiedUser,
  DoneAll, FiberManualRecord
} from '@mui/icons-material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import axiosInstance from './../../utils/AxiosInstance';
import UpdateModalDemandeConge from './UpdateModalDemandeConge';

dayjs.locale('fr');

const DemandeConge = () => {
    const navigate = useNavigate();
    
    // États principaux
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [typesConge, setTypesConge] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // États pour le modal de création
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [editingDemande, setEditingDemande] = useState(null);
    const [formData, setFormData] = useState({
        dateDebut: '',
        dateFin: '',
        dateDemande: new Date().toISOString().split('T')[0],
        autreMotif: '',
        nbJours: 0,
        idTypeConge: '',
        typeMotif: 'standard'
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // États pour l'annulation
    const [showAnnulationModal, setShowAnnulationModal] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [annulationCommentaire, setAnnulationCommentaire] = useState('');

    // États pour l'utilisateur (juste pour affichage)
    const [userInfo, setUserInfo] = useState({
        nomComplet: sessionStorage.getItem('nomComplet') || '',
        departement: sessionStorage.getItem('département') || ''
    });

    // Vérification de l'authentification
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
            return;
        }
        
        // Charger les données initiales
        loadTypesConge();
        loadDemandes();
    }, [navigate]);

    const loadTypesConge = async () => {
        setLoadingTypes(true);
        try {
            const response = await axiosInstance.get('/api/type-conge');
            
            if (Array.isArray(response.data)) {
                const formattedTypes = response.data.map(type => ({
                    id: String(type.id || type.code || ''),
                    nom: type.intitule || 'Type inconnu',
                    code: type.code || ''
                }));
                setTypesConge(formattedTypes);
            } 
        } catch (err) {
            console.error('Erreur chargement types:', err);
        } finally {
            setLoadingTypes(false);
        }
    };

    const loadDemandes = async () => {
        setLoading(true);
        try {  
            // Le backend détermine l'employé à partir du token
            const response = await axiosInstance.get('/api/demandes-conge/mes-demandes');
            
            setDemandes(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            console.error('Erreur chargement demandes:', err);
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                sessionStorage.clear();
                navigate('/?message=' + encodeURIComponent('Session expirée. Veuillez vous reconnecter.'));
            } else if (err.response?.status === 404) {
                setDemandes([]);
            } else {
                setError('Impossible de charger les demandes');
            }
        } finally {
            setLoading(false);
        }
    };

    // Appliquer les filtres
    useEffect(() => {
        let filtered = demandes;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(demande =>
                demande.typeConge?.intitule?.toLowerCase().includes(term) ||
                demande.autreMotif?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(demande => demande.decisionManager === parseInt(statusFilter));
        }

        setFilteredDemandes(filtered);
    }, [demandes, searchTerm, statusFilter]);

    // GESTION DU MODAL DE CRÉATION
    const handleOpenCreateModal = () => {
        setFormData({
            dateDebut: '',
            dateFin: '',
            dateDemande: new Date().toISOString().split('T')[0],
            autreMotif: '',
            nbJours: 0,
            idTypeConge: '',
            typeMotif: 'standard'
        });
        setFormError('');
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setFormError('');
    };

    const handleOpenUpdateModal = (demande) => {
        setEditingDemande(demande);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setEditingDemande(null);
    };

    const handleUpdatedDemande = () => {
        // Recharge la liste complÃ¨te pour rÃ©cupÃ©rer les relations (ex: typeConge)
        loadDemandes();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'dateDebut' || name === 'dateFin') {
            const startDate = name === 'dateDebut' ? new Date(value) : new Date(formData.dateDebut);
            const endDate = name === 'dateFin' ? new Date(value) : new Date(formData.dateFin);
            
            let updatedData = { ...formData, [name]: value };
            
            if (startDate && endDate && startDate <= endDate && !isNaN(startDate) && !isNaN(endDate)) {
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                updatedData.nbJours = diffDays;
            }
            
            setFormData(updatedData);
            return;
        }
        
        if (name === 'typeMotif') {
            if (value === 'standard') {
                setFormData(prev => ({
                    ...prev,
                    typeMotif: value,
                    autreMotif: '',
                    idTypeConge: prev.idTypeConge || ''
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    typeMotif: value,
                    idTypeConge: '',
                    autreMotif: prev.autreMotif || ''
                }));
            }
            return;
        }
        
        if (name === 'idTypeConge') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                autreMotif: ''
            }));
            return;
        }
        
        if (name === 'autreMotif') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                idTypeConge: ''
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = [];
        
        if (!formData.dateDebut) errors.push("La date de début est requise");
        if (!formData.dateFin) errors.push("La date de fin est requise");
        
        if (formData.dateDebut && formData.dateFin) {
            const start = new Date(formData.dateDebut);
            const end = new Date(formData.dateFin);
            if (start > end) errors.push("La date de début doit être antérieure à la date de fin");
        }
        
        if (formData.typeMotif === 'standard') {
            if (!formData.idTypeConge) errors.push("Veuillez sélectionner un type de congé");
        } else {
            if (!formData.autreMotif || formData.autreMotif.trim().length < 5) {
                errors.push("Veuillez décrire le motif (minimum 5 caractères)");
            }
        }
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (errors.length > 0) {
            setFormError(errors.join(', '));
            return;
        }
        
        setSubmitting(true);
        setFormError('');

        try {
            const demandeData = {
                dateDebut: formData.dateDebut,
                dateFin: formData.dateFin,
                dateDemande: formData.dateDemande,
                autreMotif: formData.typeMotif === 'autre' ? formData.autreMotif : null,
                nbJours: formData.nbJours,
                typeConge: formData.typeMotif === 'standard' && formData.idTypeConge 
                    ? { id: formData.idTypeConge } 
                    : null
            };
            const response = await axiosInstance.post('/api/demandes-conge', demandeData);
            setDemandes(prev => [response.data, ...prev]);
            handleCloseCreateModal();
        } catch (err) {
            console.error('Erreur création:', err);
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;
                
                if (status === 400) {
                    if (typeof data === 'string') setFormError(data);
                    else if (data.message) setFormError(data.message);
                    else if (data.errors) {
                        const validationErrors = Object.values(data.errors).flat().join(', ');
                        setFormError(validationErrors);
                    } else setFormError('Erreur de validation');
                } else if (status === 500) {
                    setFormError(data);
                } else {
                    setFormError(`Erreur ${status}: ${data?.message || 'Erreur inconnue'}`);
                }
            } else if (err.request) {
                setFormError('Aucune réponse du serveur. Vérifiez votre connexion.');
            } else {
                setFormError(err.message || 'Erreur lors de la création');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnnulation = (demande) => {
        setSelectedDemande(demande);
        setAnnulationCommentaire('');
        setShowAnnulationModal(true);
    };

    const confirmerAnnulation = async () => {
        if (!selectedDemande) return;

        if (!annulationCommentaire.trim()) {
            alert("Veuillez saisir un commentaire pour justifier l'annulation.");
            return;
        }

        setSubmitting(true);

        try {
            await axiosInstance.put(
                `/api/demandes-conge/annuler/${selectedDemande.id}`,
                { commentaireAnnulation: annulationCommentaire }
            );

            setShowAnnulationModal(false);
            setAnnulationCommentaire('');
            loadDemandes(); // Recharger la liste

        } catch (err) {
            console.error('Erreur annulation:', err);
            if (err.response?.data) {
                setFormError(typeof err.response.data === 'string' 
                    ? err.response.data 
                    : err.response.data.message || 'Erreur lors de l\'annulation');
            } else {
                setFormError('Erreur lors de l\'annulation');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (decisionManager) => {
        const configs = {
            0: { 
                label: 'En attente', 
                color: 'warning', 
                icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
                bgColor: 'warning.main',
                dotColor: '#ff9800',
                visible: true
            },
            1: { 
                label: 'Approuvé', 
                color: 'success', 
                icon: <TaskAlt sx={{ fontSize: 16 }} />,
                bgColor: 'success.main',
                dotColor: '#4caf50',
                visible: true
            },
            2: { 
                label: 'Rejeté', 
                color: 'error', 
                icon: <Close sx={{ fontSize: 16 }} />,
                bgColor: 'error.main',
                dotColor: '#f44336',
                visible: true
            },
            3: { 
                label: 'Annulé', 
                color: 'default', 
                icon: <Block sx={{ fontSize: 16 }} />,
                bgColor: 'grey.500',
                dotColor: '#9e9e9e',
                visible: true
            },
            4: { 
                label: 'Annulé par responsable', 
                color: 'default', 
                icon: <Block sx={{ fontSize: 16 }} />,
                bgColor: 'grey.500',
                dotColor: '#9e9e9e',
                visible: true
            },
            5: { 
                label: 'Terminé', 
                color: 'info', 
                icon: <VerifiedUser sx={{ fontSize: 16 }} />,
                bgColor: 'info.main',
                dotColor: '#0288d1',
                visible: true
            }
        };
        
        return configs[decisionManager] || { 
            label: 'Inconnu', 
            color: 'default', 
            icon: null,
            bgColor: 'grey.500',
            dotColor: '#9e9e9e',
            visible: true
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    // Calcul des statistiques
    const stats = {
        enAttente: demandes.filter(d => d.decisionManager === 0).length,
        approuves: demandes.filter(d => d.decisionManager === 1).length,
        rejetes: demandes.filter(d => d.decisionManager === 2).length,
        annules: demandes.filter(d => d.decisionManager === 3 || d.decisionManager === 4).length,
        termines: demandes.filter(d => d.decisionManager === 5).length
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
                                Mes Demandes de Congé
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                <Breadcrumbs 
                                    sx={{ color: 'white', '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.5)' } }}
                                    separator={<NavigateNext fontSize="small" />}
                                >
                                    <Box display="flex" alignItems="center">
                                        <Home sx={{ mr: 0.5 }} fontSize="small" />
                                        <Typography variant="body2">Accueil</Typography>
                                    </Box>
                                    <Typography variant="body2">Demandes de congé</Typography>
                                </Breadcrumbs>
                                
                                {userInfo.nomComplet && (
                                    <Chip
                                        label={userInfo.nomComplet}
                                        size="small"
                                        icon={<Person />}
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            color: 'white',
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<Add />}
                                onClick={handleOpenCreateModal}
                                size="large"
                            >
                                Nouvelle demande
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
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <HourglassEmpty color="warning" sx={{ mr: 1, fontSize: 30 }} />
                                <Typography variant="h6" color="textSecondary">
                                    En attente
                                </Typography>
                            </Box>
                            <Typography variant="h3" color="warning.main" fontWeight="bold" align="center">
                                {stats.enAttente}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TaskAlt color="success" sx={{ mr: 1, fontSize: 30 }} />
                                <Typography variant="h6" color="textSecondary">
                                    Approuvés
                                </Typography>
                            </Box>
                            <Typography variant="h3" color="success.main" fontWeight="bold" align="center">
                                {stats.approuves}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Close color="error" sx={{ mr: 1, fontSize: 30 }} />
                                <Typography variant="h6" color="textSecondary">
                                    Rejetés
                                </Typography>
                            </Box>
                            <Typography variant="h3" color="error.main" fontWeight="bold" align="center">
                                {stats.rejetes}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Block color="disabled" sx={{ mr: 1, fontSize: 30 }} />
                                <Typography variant="h6" color="textSecondary">
                                    Annulés
                                </Typography>
                            </Box>
                            <Typography variant="h3" color="textSecondary" fontWeight="bold" align="center">
                                {stats.annules}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <VerifiedUser color="info" sx={{ mr: 1, fontSize: 30 }} />
                                <Typography variant="h6" color="textSecondary">
                                    Terminés
                                </Typography>
                            </Box>
                            <Typography variant="h3" color="info.main" fontWeight="bold" align="center">
                                {stats.termines}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtres */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Filtres
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Rechercher par type, motif..."
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
                        
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Statut"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="all">Tous les statuts</MenuItem>
                                    <MenuItem value="0">En attente</MenuItem>
                                    <MenuItem value="1">Approuvé</MenuItem>
                                    <MenuItem value="2">Rejeté</MenuItem>
                                    <MenuItem value="3">Annulé</MenuItem>
                                    <MenuItem value="5">Terminé</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={loadDemandes}
                                disabled={loading}
                            >
                                Actualiser
                            </Button>
                        </Grid>
                    </Grid>
                    
                    <Box mt={2}>
                        <Typography variant="caption" color="textSecondary">
                            Affichage de {filteredDemandes.length} demandes sur {demandes.length}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Table des demandes */}
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6">
                            <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Liste des demandes
                        </Typography>
                    </Box>

                    {filteredDemandes.length === 0 ? (
                        <Alert severity="info">
                            Aucune demande trouvée.
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Période</TableCell>
                                        <TableCell align="right">Jours</TableCell>
                                        <TableCell>Statut</TableCell>
                                        <TableCell>Date Demande</TableCell>
                                        <TableCell>Motif</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDemandes.map((demande) => {
                                        const statusConfig = getStatusConfig(demande.decisionManager);
                                        const peutAnnuler = demande.decisionManager === 0 || demande.decisionManager === 1;
                                        
                                        return (
                                            <TableRow key={demande.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {demande.typeConge?.intitule || 'Non spécifié'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Event color="primary" sx={{ mr: 1, fontSize: 'small' }} />
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {formatDate(demande.dateDebut)} → {formatDate(demande.dateFin)}
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
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                        {demande.autreMotif || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Voir détails">
                                                            <IconButton 
                                                                size="small"
                                                                onClick={() => setSelectedDemande(demande)}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Modifier">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleOpenUpdateModal(demande)}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {peutAnnuler && (
                                                            <Tooltip title="Annuler la demande">
                                                                <IconButton 
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleAnnulation(demande)}
                                                                >
                                                                    <DeleteOutline fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
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

            {/* MODAL DE CRÉATION */}
            <Dialog open={showCreateModal} onClose={handleCloseCreateModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Add color="primary" />
                        Nouvelle Demande de Congé
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="Date de début *"
                                            value={formData.dateDebut ? dayjs(formData.dateDebut) : null}
                                            format="DD/MM/YYYY"
                                            onChange={(newValue) => handleInputChange({
                                                target: { name: 'dateDebut', value: newValue ? newValue.format('YYYY-MM-DD') : '' }
                                            })}
                                            slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="Date de fin *"
                                            value={formData.dateFin ? dayjs(formData.dateFin) : null}
                                            format="DD/MM/YYYY"
                                            onChange={(newValue) => handleInputChange({
                                                target: { name: 'dateFin', value: newValue ? newValue.format('YYYY-MM-DD') : '' }
                                            })}
                                            slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre de jours"
                                    value={formData.nbJours}
                                    InputProps={{
                                        readOnly: true,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Today />
                                            </InputAdornment>
                                        ),
                                    }}
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Type de motif *
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant={formData.typeMotif === 'standard' ? 'contained' : 'outlined'}
                                        onClick={() => handleInputChange({ target: { name: 'typeMotif', value: 'standard' } })}
                                        startIcon={<FileCopy />}
                                    >
                                        Type standard
                                    </Button>
                                    <Button
                                        variant={formData.typeMotif === 'autre' ? 'contained' : 'outlined'}
                                        onClick={() => handleInputChange({ target: { name: 'typeMotif', value: 'autre' } })}
                                        startIcon={<Edit />}
                                    >
                                        Autre motif
                                    </Button>
                                </Stack>
                            </Grid>
                            
                            {formData.typeMotif === 'standard' ? (
                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Type de congé *</InputLabel>
                                        <Select
                                            value={formData.idTypeConge}
                                            label="Type de congé *"
                                            onChange={handleInputChange}
                                            name="idTypeConge"
                                            required
                                        >
                                            <MenuItem value="">Sélectionnez un type...</MenuItem>
                                            {typesConge.map(type => (
                                                <MenuItem key={type.id} value={type.id}>
                                                    {type.nom}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            ) : (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description du motif *"
                                        name="autreMotif"
                                        value={formData.autreMotif}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        size="small"
                                        required
                                        helperText="Minimum 5 caractères"
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateModal}>Annuler</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={<Add />}
                    >
                        {submitting ? 'Création...' : 'Soumettre'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL D'ANNULATION */}
            <UpdateModalDemandeConge
                open={showUpdateModal}
                onClose={handleCloseUpdateModal}
                demande={editingDemande}
                typesConge={typesConge}
                onUpdated={handleUpdatedDemande}
            />

            <Dialog open={showAnnulationModal} onClose={() => setShowAnnulationModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <DeleteOutline color="error" />
                        Annulation de demande
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    
                    {selectedDemande && (
                        <>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Êtes-vous sûr de vouloir annuler cette demande ?
                            </Alert>
                            
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Période
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(selectedDemande.dateDebut)} au {formatDate(selectedDemande.dateFin)}
                                </Typography>
                            </Box>
                            
                            <TextField
                                fullWidth
                                label="Commentaire d'annulation *"
                                value={annulationCommentaire}
                                onChange={(e) => setAnnulationCommentaire(e.target.value)}
                                multiline
                                rows={3}
                                size="small"
                                required
                                error={!!formError}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAnnulationModal(false)}>Annuler</Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={confirmerAnnulation}
                        disabled={submitting || !annulationCommentaire.trim()}
                        startIcon={<DeleteOutline />}
                    >
                        {submitting ? 'Traitement...' : 'Confirmer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE DÉTAILS */}
            <Dialog open={!!selectedDemande && !showAnnulationModal && !showCreateModal && !showUpdateModal} onClose={() => setSelectedDemande(null)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Visibility color="primary" />
                        Détails de la demande
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedDemande && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Type de congé</Typography>
                                <Typography variant="body1">{selectedDemande.typeConge?.intitule || 'Non spécifié'}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date de début</Typography>
                                <Typography variant="body1">{formatDate(selectedDemande.dateDebut)}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date de fin</Typography>
                                <Typography variant="body1">{formatDate(selectedDemande.dateFin)}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Durée</Typography>
                                <Typography variant="body1" fontWeight="bold">{selectedDemande.nbJours} jours</Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date de demande</Typography>
                                <Typography variant="body1">{formatDate(selectedDemande.dateDemande)}</Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">Statut</Typography>
                                <Chip
                                    label={getStatusConfig(selectedDemande.decisionManager).label}
                                    size="small"
                                    sx={{
                                        bgcolor: `${getStatusConfig(selectedDemande.decisionManager).bgColor}15`,
                                        color: getStatusConfig(selectedDemande.decisionManager).bgColor,
                                        border: `1px solid ${getStatusConfig(selectedDemande.decisionManager).bgColor}`,
                                        fontWeight: 500,
                                        mt: 0.5
                                    }}
                                    icon={getStatusConfig(selectedDemande.decisionManager).icon}
                                />
                            </Grid>
                            
                            {selectedDemande.autreMotif && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Motif détaillé</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body2">{selectedDemande.autreMotif}</Typography>
                                    </Paper>
                                </Grid>
                            )}
                            
                            {selectedDemande.commentaireManager && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Commentaire du responsable</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body2">{selectedDemande.commentaireManager}</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedDemande(null)}>Fermer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DemandeConge;
