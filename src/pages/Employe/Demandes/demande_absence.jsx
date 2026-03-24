import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  CircularProgress, Alert, Stack, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  InputAdornment, Breadcrumbs, IconButton,
  Divider, Chip, Container
} from '@mui/material';
import {
  ArrowBack, CalendarMonth, Add, AccessTime,
  Warning, Today, Event, Person, Home,
  NavigateNext, Schedule, Assignment, Description,
  Send, Cancel, History, Info,
  FiberManualRecord, LinearProgress
} from '@mui/icons-material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const AbsenceRequestPage = () => {
  // ID de l'employé
  const idEmploye = 'EMP-20251124-62B184';
  
  // États
  const [formData, setFormData] = useState({
    idEmploye: idEmploye,
    idTypeDemande: '',
    dateHeureAbsenceDebut: null,
    dateHeureAbsenceFin: null,
    commentaire: ''
  });
  
  const [typesDemande, setTypesDemande] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});
  const [employeInfo, setEmployeInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
    fetchEmployeInfo();
  }, []);

  // Récupérer les types de demande
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/types-demande');
      setTypesDemande(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des types de demande:', error);
      setFormError('Erreur lors du chargement des types de demande');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les informations de l'employé
  const fetchEmployeInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/employes/${idEmploye}`);
      setEmployeInfo(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des informations employé:', error);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setFormError('');
  };

  // Gérer les changements de date
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setFormError('');
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Valider le type de demande
    if (!formData.idTypeDemande) {
      newErrors.idTypeDemande = 'Veuillez sélectionner un type de demande';
    }
    
    // Valider la date de début
    if (!formData.dateHeureAbsenceDebut) {
      newErrors.dateHeureAbsenceDebut = 'Veuillez sélectionner une date de début';
    } else if (!formData.dateHeureAbsenceDebut.isValid()) {
      newErrors.dateHeureAbsenceDebut = 'Date de début invalide';
    } else if (formData.dateHeureAbsenceDebut.isBefore(dayjs())) {
      newErrors.dateHeureAbsenceDebut = 'La date de début ne peut pas être dans le passé';
    }
    
    // Valider la date de fin
    if (!formData.dateHeureAbsenceFin) {
      newErrors.dateHeureAbsenceFin = 'Veuillez sélectionner une date de fin';
    } else if (!formData.dateHeureAbsenceFin.isValid()) {
      newErrors.dateHeureAbsenceFin = 'Date de fin invalide';
    } else if (formData.dateHeureAbsenceDebut && formData.dateHeureAbsenceFin.isBefore(formData.dateHeureAbsenceDebut)) {
      newErrors.dateHeureAbsenceFin = 'La date de fin doit être après la date de début';
    }
    
    // Valider le commentaire (optionnel mais avec limite)
    if (formData.commentaire && formData.commentaire.length > 500) {
      newErrors.commentaire = 'Le commentaire ne peut pas dépasser 500 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError('');
      setSuccessMessage('');
      
      // Préparer les données pour l'API
      const requestData = {
        employe: { id: formData.idEmploye },
        typeDemande: { id: formData.idTypeDemande },
        dateHeureAbsenceDebut: formData.dateHeureAbsenceDebut.format("YYYY-MM-DDTHH:mm:ss"),
        dateHeureAbsenceFin: formData.dateHeureAbsenceFin.format("YYYY-MM-DDTHH:mm:ss"),
        commentaire: formData.commentaire || null,
        statut: 0 // Statut "En attente" par défaut
      };
      
      console.log("requestData : ", requestData);
      
      // Envoyer la requête
      const response = await axios.post('http://localhost:8080/api/demandes-absence', requestData);
      console.log("Réponse:", response.data);
      
      // Réinitialiser le formulaire
      setFormData({
        idEmploye: idEmploye,
        idTypeDemande: '',
        dateHeureAbsenceDebut: null,
        dateHeureAbsenceFin: null,
        commentaire: ''
      });
      
      // Afficher le message de succès
      setSuccessMessage('Demande d\'absence envoyée avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      // Gérer les erreurs spécifiques
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          if (typeof data === 'string') {
            setFormError(data);
          } else if (data.message) {
            setFormError(data.message);
          } else if (Array.isArray(data)) {
            setFormError(data.map(err => err.defaultMessage || err.message).join(', '));
          } else if (data.errors) {
            const validationErrors = Object.values(data.errors || {})
              .flat()
              .map(err => err.defaultMessage || err)
              .join(', ');
            setFormError(validationErrors);
          } else {
            setFormError('Erreur de validation');
          }
        } else if (status === 409) {
          setFormError('Vous avez déjà une demande pour cette période');
        } else if (status === 500) {
          setFormError('Erreur interne du serveur');
        } else {
          setFormError(`Erreur ${status}: ${data?.message || 'Erreur inconnue'}`);
        }
      } else if (error.request) {
        setFormError('Aucune réponse du serveur. Vérifiez votre connexion.');
      } else {
        setFormError(error.message || 'Erreur lors de l\'envoi de la demande');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculer la durée
  const calculateDuration = () => {
    if (!formData.dateHeureAbsenceDebut || !formData.dateHeureAbsenceFin) {
      return '';
    }
    
    const diffInMs = formData.dateHeureAbsenceFin.diff(formData.dateHeureAbsenceDebut);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffInDays === 0) {
      if (diffInHours === 0) {
        return `${diffInMinutes} minute(s)`;
      }
      return `${diffInHours} heure(s) et ${diffInMinutes} minute(s)`;
    }
    
    return `${diffInDays} jour(s) et ${diffInHours} heure(s)`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Chargement des données...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Même structure que DemandeConge */}
      <Box p={3} sx={{ 
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        {/* En-tête - Même design que Demande Congé */}
        <Card sx={{ 
          mb: 3, 
          bgcolor: 'primary.main', 
          color: 'white',
          width: '100%'
        }}>
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
                  Nouvelle Demande d'Absence
                </Typography>
                
                <Breadcrumbs 
                  sx={{ color: 'white', '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.5)' } }}
                  separator={<NavigateNext fontSize="small" />}
                >
                  <Box display="flex" alignItems="center">
                    <Home sx={{ mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2">Accueil</Typography>
                  </Box>
                  <Typography variant="body2">Demandes d'absence</Typography>
                </Breadcrumbs>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<History />}
                  component={Link}
                  to="/historique-absences"
                >
                  Historique
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Messages d'erreur/succès */}
        {formError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Contenu principal */}
        <Grid container spacing={3}>
          {/* Informations employé - Colonne de gauche */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Informations employé
                </Typography>
                
                {employeInfo ? (
                  <Box>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          mr: 2
                        }}
                      >
                        {employeInfo.prenom?.charAt(0) || '?'}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {employeInfo.nom} {employeInfo.prenom}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {employeInfo.matricule || employeInfo.id}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      {employeInfo.poste && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Poste
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {employeInfo.poste.libelle}
                          </Typography>
                        </Grid>
                      )}
                      
                      {employeInfo.service && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Service
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {employeInfo.service.libelle}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Formulaire - Colonne de droite */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Formulaire de demande
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Type de demande */}
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.idTypeDemande}>
                        <InputLabel>Type d'absence *</InputLabel>
                        <Select
                          name="idTypeDemande"
                          value={formData.idTypeDemande}
                          onChange={handleChange}
                          label="Type d'absence *"
                          size="medium"
                        >
                          <MenuItem value="">
                            <em>Sélectionnez un type</em>
                          </MenuItem>
                          {typesDemande.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              <Box display="flex" alignItems="center">
                                <AccessTime sx={{ mr: 1, fontSize: 'small' }} />
                                {type.type}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.idTypeDemande && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            {errors.idTypeDemande}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Dates */}
                    <Grid item xs={12} md={6}>
                      <DemoContainer components={['DateTimePicker']} sx={{ width: '100%' }}>
                        <DateTimePicker
                          label="Date et heure de début *"
                          value={formData.dateHeureAbsenceDebut}
                          onChange={(newValue) => handleDateChange('dateHeureAbsenceDebut', newValue)}
                          minDateTime={dayjs()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dateHeureAbsenceDebut,
                              helperText: errors.dateHeureAbsenceDebut,
                              size: 'medium'
                            },
                          }}
                        />
                      </DemoContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <DemoContainer components={['DateTimePicker']} sx={{ width: '100%' }}>
                        <DateTimePicker
                          label="Date et heure de fin *"
                          value={formData.dateHeureAbsenceFin}
                          onChange={(newValue) => handleDateChange('dateHeureAbsenceFin', newValue)}
                          minDateTime={formData.dateHeureAbsenceDebut || dayjs()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dateHeureAbsenceFin,
                              helperText: errors.dateHeureAbsenceFin,
                              size: 'medium'
                            },
                          }}
                        />
                      </DemoContainer>
                    </Grid>

                    {/* Durée calculée */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ 
                        p: 2, 
                        bgcolor: 'var(--brand-50)',
                        borderColor: 'primary.main',
                        borderWidth: 1
                      }}>
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Schedule sx={{ color: 'white' }} />
                            </Box>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="subtitle2" color="textSecondary">
                              Durée de l'absence
                            </Typography>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                              {calculateDuration() || 'Sélectionnez les dates'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* Commentaire */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="commentaire"
                        label="Commentaire (optionnel)"
                        placeholder="Expliquez brièvement la raison de votre absence..."
                        value={formData.commentaire}
                        onChange={handleChange}
                        error={!!errors.commentaire}
                        helperText={errors.commentaire || `${formData.commentaire.length}/500 caractères`}
                        inputProps={{ maxLength: 500 }}
                        size="medium"
                        variant="outlined"
                      />
                    </Grid>

                    {/* Informations importantes */}
                    <Grid item xs={12}>
                      <Alert 
                        severity="info" 
                        icon={<Info />}
                        sx={{ 
                          '& .MuiAlert-message': {
                            width: '100%'
                          }
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Note importante:</strong> Votre demande sera soumise à l'approbation de votre manager. 
                          Vous serez notifié une fois la décision prise.
                        </Typography>
                      </Alert>
                    </Grid>

                    {/* Boutons d'action */}
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button
                          variant="outlined"
                          component={Link}
                          to="/dashboard"
                          startIcon={<Cancel />}
                          disabled={submitting}
                          size="large"
                          sx={{ minWidth: 120 }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting}
                          startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                          size="large"
                          sx={{ minWidth: 200 }}
                        >
                          {submitting ? 'Envoi en cours...' : 'Soumettre la demande'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer ou informations supplémentaires */}
        <Box mt={3}>
          <Paper sx={{ p: 2, bgcolor: 'var(--brand-50)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Warning color="warning" />
              </Grid>
              <Grid item xs>
                <Typography variant="body2">
                  <strong>Procédure d'approbation:</strong> 
                  Toutes les demandes d'absence doivent être approuvées par votre manager. 
                  En cas d'urgence, veuillez contacter directement votre responsable.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AbsenceRequestPage;
