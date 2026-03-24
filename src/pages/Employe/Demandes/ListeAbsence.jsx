import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import axios from 'axios';

const AbsenceListPage = () => {
  const idEmploye = 'EMP-20251124-62B184';
  
  // États
  const [demandes, setDemandes] = useState([]);
  const [typesDemande, setTypesDemande] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // États pour la création (nouveau modal)
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    idTypeDemande: '',
    dateHeureAbsenceDebut: '',
    dateHeureAbsenceFin: '',
    commentaire: ''
  });
  const [creating, setCreating] = useState(false);
  
  // États pour la modification
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [editForm, setEditForm] = useState({
    idTypeDemande: '',
    dateHeureAbsenceDebut: '',
    dateHeureAbsenceFin: '',
    commentaire: ''
  });
  const [saving, setSaving] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Charger les données
  useEffect(() => {
    fetchDemandes();
    fetchTypesDemande();
  }, []);

  // Récupérer les demandes
  const fetchDemandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8080/api/demandes-absence/employe/${idEmploye}`);
      setDemandes(response.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les types de demande
  const fetchTypesDemande = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/types-demande');
      setTypesDemande(response.data);
    } catch (err) {
      console.error('Erreur types:', err);
    }
  };

  // Filtrer les demandes
  const filteredDemandes = demandes.filter(demande => {
    if (filterStatus !== 'all' && demande.statut !== parseInt(filterStatus)) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const typeMatch = demande.typeDemande?.type?.toLowerCase().includes(searchLower);
      const commentMatch = demande.commentaire?.toLowerCase().includes(searchLower);
      return typeMatch || commentMatch;
    }
    return true;
  });

  // GESTION DU MODAL DE CRÉATION
  const handleOpenCreateModal = () => {
    setCreateForm({
      idTypeDemande: '',
      dateHeureAbsenceDebut: '',
      dateHeureAbsenceFin: '',
      commentaire: ''
    });
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async () => {
    // Validation
    if (!createForm.idTypeDemande || !createForm.dateHeureAbsenceDebut || !createForm.dateHeureAbsenceFin) {
      showSnackbar('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (new Date(createForm.dateHeureAbsenceFin) <= new Date(createForm.dateHeureAbsenceDebut)) {
      showSnackbar('La date de fin doit être après la date de début', 'error');
      return;
    }

    try {
      setCreating(true);
      
      const requestData = {
        employe: { id: idEmploye },
        typeDemande: { id: createForm.idTypeDemande },
        dateHeureAbsenceDebut: createForm.dateHeureAbsenceDebut + ':00',
        dateHeureAbsenceFin: createForm.dateHeureAbsenceFin + ':00',
        commentaire: createForm.commentaire || null,
        statut: 0
      };

      const response = await axios.post('http://localhost:8080/api/demandes-absence', requestData);
      
      showSnackbar('Demande créée avec succès', 'success');
      fetchDemandes();
      handleCloseCreateModal();
      
    } catch (err) {
      console.error('Erreur création:', err);
      showSnackbar('Erreur lors de la création', 'error');
    } finally {
      setCreating(false);
    }
  };

  // GESTION DU MODAL DE MODIFICATION
  const handleOpenEditDialog = (demande) => {
    setSelectedDemande(demande);
    setEditForm({
      idTypeDemande: demande.typeDemande?.id || '',
      dateHeureAbsenceDebut: formatDateForInput(demande.dateHeureAbsenceDebut),
      dateHeureAbsenceFin: formatDateForInput(demande.dateHeureAbsenceFin),
      commentaire: demande.commentaire || ''
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedDemande(null);
    setEditForm({
      idTypeDemande: '',
      dateHeureAbsenceDebut: '',
      dateHeureAbsenceFin: '',
      commentaire: ''
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateDemande = async () => {
    try {
      setSaving(true);
      
      const updatedData = {
        typeDemande: { id: editForm.idTypeDemande },
        dateHeureAbsenceDebut: editForm.dateHeureAbsenceDebut,
        dateHeureAbsenceFin: editForm.dateHeureAbsenceFin,
        commentaire: editForm.commentaire
      };

      await axios.put(`http://localhost:8080/api/demandes-absence/${selectedDemande.id}`, updatedData);
      
      showSnackbar('Demande mise à jour avec succès', 'success');
      fetchDemandes();
      handleCloseEditDialog();
      
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      showSnackbar('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Annuler une demande
  const handleCancelDemande = async (demandeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      try {
        await axios.post(`http://localhost:8080/api/demandes-absence/${demandeId}/annuler`, null, {
          params: { employeeId: idEmploye }
        });
        showSnackbar('Demande annulée avec succès', 'success');
        fetchDemandes();
      } catch (err) {
        console.error('Erreur annulation:', err);
        showSnackbar('Erreur lors de l\'annulation', 'error');
      }
    }
  };

  // Voir les détails
  const handleViewDetails = (demande) => {
    alert(`Détails de la demande:\n
Type: ${demande.typeDemande?.type || 'N/A'}\n
Statut: ${getStatusLabel(demande.statut)}\n
Du: ${formatDate(demande.dateHeureAbsenceDebut)}\n
Au: ${formatDate(demande.dateHeureAbsenceFin)}\n
Durée: ${calculateDuration(demande.dateHeureAbsenceDebut, demande.dateHeureAbsenceFin)}\n
Commentaire: ${demande.commentaire || 'Aucun'}\n
Créée le: ${formatDate(demande.createdAt)}`);
  };

  // Helper functions
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const calculateDuration = (debut, fin) => {
    const start = new Date(debut);
    const end = new Date(fin);
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      return `${diffHours}h`;
    }
    return `${diffDays}j ${diffHours}h`;
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'error';
      case 3: return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 0: return 'En attente';
      case 1: return 'Approuvée';
      case 2: return 'Rejetée';
      case 3: return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mes Demandes d'Absence
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consultez et gérez vos demandes d'absence
        </Typography>
      </Box>

      {/* Barre d'actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          {/* BOUTON POUR OUVRIR LE MODAL DE CRÉATION */}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenCreateModal}
          >
            Nouvelle Demande
          </Button>
          
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchDemandes}>
            Actualiser
          </Button>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <TextField
            label="Rechercher"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 200 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Statut">
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="0">En attente</MenuItem>
              <MenuItem value="1">Approuvées</MenuItem>
              <MenuItem value="2">Rejetées</MenuItem>
              <MenuItem value="3">Annulées</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Résumé */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${demandes.length}`} color="primary" variant="outlined" />
          <Chip label={`En attente: ${demandes.filter(d => d.statut === 0).length}`} color="warning" variant="outlined" />
          <Chip label={`Approuvées: ${demandes.filter(d => d.statut === 1).length}`} color="success" variant="outlined" />
          <Chip label={`Rejetées: ${demandes.filter(d => d.statut === 2).length}`} color="error" variant="outlined" />
        </Box>
      </Paper>

      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tableau */}
      {filteredDemandes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {demandes.length === 0 ? 'Aucune demande' : 'Aucune demande avec ces filtres'}
          </Typography>
          {demandes.length === 0 && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenCreateModal}
              sx={{ mt: 2 }}
            >
              Créer une première demande
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Période</strong></TableCell>
                <TableCell><strong>Durée</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Créée le</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDemandes.map((demande) => (
                <TableRow key={demande.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {demande.typeDemande?.type || 'N/A'}
                    </Typography>
                    {demande.commentaire && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {demande.commentaire.substring(0, 30)}
                        {demande.commentaire.length > 30 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Du: {formatDate(demande.dateHeureAbsenceDebut)}
                    </Typography>
                    <Typography variant="body2">
                      Au: {formatDate(demande.dateHeureAbsenceFin)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {calculateDuration(demande.dateHeureAbsenceDebut, demande.dateHeureAbsenceFin)}
                  </TableCell>
                  <TableCell>
                    <Chip label={getStatusLabel(demande.statut)} color={getStatusColor(demande.statut)} size="small" />
                  </TableCell>
                  <TableCell>
                    {formatDate(demande.createdAt)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {/* Bouton Voir */}
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewDetails(demande)}
                        aria-label="Voir les détails"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      
                      {/* Bouton Modifier (seulement pour les demandes en attente) */}
                      {demande.statut === 0 && (
                        <IconButton 
                          size="small" 
                          color="warning" 
                          onClick={() => handleOpenEditDialog(demande)}
                          aria-label="Modifier"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {/* Bouton Annuler (seulement pour les demandes en attente) */}
                      {demande.statut === 0 && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleCancelDemande(demande.id)}
                          aria-label="Annuler"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL DE CRÉATION */}
      <Dialog 
        open={openCreateModal} 
        onClose={handleCloseCreateModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            <Typography variant="h6">Nouvelle Demande d'Absence</Typography>
          </Box>
          <IconButton
            onClick={handleCloseCreateModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Type d'absence *</InputLabel>
              <Select
                name="idTypeDemande"
                value={createForm.idTypeDemande}
                onChange={handleCreateInputChange}
                label="Type d'absence *"
              >
                <MenuItem value="">
                  <em>Sélectionnez un type</em>
                </MenuItem>
                {typesDemande.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date et heure de début *"
                  type="datetime-local"
                  name="dateHeureAbsenceDebut"
                  value={createForm.dateHeureAbsenceDebut}
                  onChange={handleCreateInputChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date et heure de fin *"
                  type="datetime-local"
                  name="dateHeureAbsenceFin"
                  value={createForm.dateHeureAbsenceFin}
                  onChange={handleCreateInputChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
            </Grid>
            
            {createForm.dateHeureAbsenceDebut && createForm.dateHeureAbsenceFin && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'var(--brand-50)', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Durée estimée:
                </Typography>
                <Typography variant="h6" color="primary">
                  {calculateDuration(
                    createForm.dateHeureAbsenceDebut, 
                    createForm.dateHeureAbsenceFin
                  )}
                </Typography>
              </Box>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={3}
              name="commentaire"
              label="Commentaire (optionnel)"
              value={createForm.commentaire}
              onChange={handleCreateInputChange}
              placeholder="Expliquez la raison de votre absence..."
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseCreateModal} disabled={creating}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateSubmit} 
            variant="contained" 
            disabled={creating || !createForm.idTypeDemande || !createForm.dateHeureAbsenceDebut || !createForm.dateHeureAbsenceFin}
            startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {creating ? 'Création en cours...' : 'Créer la demande'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE MODIFICATION */}
      {/* MODAL DE MODIFICATION - VERSION CORRIGÉE */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
            Modifier la demande
            <IconButton
            onClick={handleCloseEditDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            >
            <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2 }}>
            {/* Type d'absence - CORRIGÉ */}
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type d'absence *</InputLabel>
                <Select
                name="idTypeDemande"
                value={editForm.idTypeDemande}
                onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    idTypeDemande: e.target.value
                }))}
                label="Type d'absence *"
                >
                {typesDemande.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                    {type.type}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            
            {/* Date de début - CORRIGÉ */}
            <TextField
                fullWidth
                name="dateHeureAbsenceDebut"
                label="Date et heure de début *"
                type="datetime-local"
                value={editForm.dateHeureAbsenceDebut}
                onChange={(e) => setEditForm(prev => ({
                ...prev,
                dateHeureAbsenceDebut: e.target.value
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
            />
            
            {/* Date de fin - CORRIGÉ */}
            <TextField
                fullWidth
                name="dateHeureAbsenceFin"
                label="Date et heure de fin *"
                type="datetime-local"
                value={editForm.dateHeureAbsenceFin}
                onChange={(e) => setEditForm(prev => ({
                ...prev,
                dateHeureAbsenceFin: e.target.value
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
            />
            
            {/* Calcul de la durée */}
            {editForm.dateHeureAbsenceDebut && editForm.dateHeureAbsenceFin && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'var(--brand-50)', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Nouvelle durée:
                </Typography>
                <Typography variant="h6" color="primary">
                    {calculateDuration(editForm.dateHeureAbsenceDebut, editForm.dateHeureAbsenceFin)}
                </Typography>
                </Box>
            )}
            
            {/* Commentaire - CORRIGÉ */}
            <TextField
                fullWidth
                multiline
                rows={4}
                name="commentaire"
                label="Commentaire"
                value={editForm.commentaire}
                onChange={(e) => setEditForm(prev => ({
                ...prev,
                commentaire: e.target.value
                }))}
                placeholder="Expliquez la raison de votre absence..."
            />
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseEditDialog} disabled={saving}>
            Annuler
            </Button>
            <Button 
            onClick={handleUpdateDemande} 
            variant="contained" 
            disabled={saving || !editForm.idTypeDemande || !editForm.dateHeureAbsenceDebut || !editForm.dateHeureAbsenceFin}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
        </DialogActions>
        </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Pied de page */}
      {filteredDemandes.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredDemandes.length} demande(s) affichée(s) sur {demandes.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default AbsenceListPage;
