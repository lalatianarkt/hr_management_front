import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Alert,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  MenuItem
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Today, FileCopy } from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import axiosInstance from './../../utils/AxiosInstance';

dayjs.locale('fr');

const UpdateModalDemandeConge = ({ open, onClose, demande, typesConge, onUpdated }) => {
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    dateDemande: '',
    autreMotif: '',
    nbJours: 0,
    idTypeConge: '',
    typeMotif: 'standard'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDemande, setLoadingDemande] = useState(false);
  const [fullDemande, setFullDemande] = useState(null);

  useEffect(() => {
    if (!demande?.id || !open) return;

    const fetchFullDemande = async () => {
      setLoadingDemande(true);
      setFormError('');
      try {
        const response = await axiosInstance.get(`/api/demandes-conge/${demande.id}`);
        console.log("response : ", response.data);
        const loaded = response.data;
        setFullDemande(loaded);

        const hasTypeConge = !!loaded?.typeConge?.id;
        setFormData({
          dateDebut: loaded?.dateDebut || '',
          dateFin: loaded?.dateFin || '',
          dateDemande: loaded?.dateDemande || dayjs().format('YYYY-MM-DD'),
          autreMotif: loaded?.autreMotif || '',
          nbJours: loaded?.nbJours || 0,
          idTypeConge: hasTypeConge ? String(loaded.typeConge.id) : '',
          typeMotif: hasTypeConge ? 'standard' : 'autre'
        });
      } catch (err) {
        console.error('Erreur chargement demande:', err);
        setFormError(err.response?.data?.message || 'Impossible de charger la demande');
      } finally {
        setLoadingDemande(false);
      }
    };

    fetchFullDemande();
  }, [demande, open]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dateDebut' || name === 'dateFin') {
      const startDate = name === 'dateDebut' ? new Date(value) : new Date(formData.dateDebut);
      const endDate = name === 'dateFin' ? new Date(value) : new Date(formData.dateFin);

      const updatedData = { ...formData, [name]: value };

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
    if (!demande) return;

    const errors = validateForm();
    if (errors.length > 0) {
      setFormError(errors.join(', '));
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const updatedPayload = {
        ...(fullDemande || demande),
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        dateDemande: formData.dateDemande,
        autreMotif: formData.typeMotif === 'autre' ? formData.autreMotif : null,
        nbJours: formData.nbJours,
        typeConge: formData.typeMotif === 'standard' && formData.idTypeConge
          ? { id: formData.idTypeConge }
          : null
      };

      const response = await axiosInstance.put(`/api/demandes-conge/${demande.id}`, updatedPayload);
      if (onUpdated) onUpdated(response.data);
      onClose();
    } catch (err) {
      console.error('Erreur modification:', err);
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
        setFormError(err.message || 'Erreur lors de la modification');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Modifier la demande de congé</DialogTitle>
      <DialogContent>
        {loadingDemande && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Chargement de la demande...
          </Alert>
        )}

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
                >
                  Autre motif
                </Button>
              </Stack>
            </Grid>

            {formData.typeMotif === 'standard' && (
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Type de congé"
                  value={formData.idTypeConge}
                  onChange={(e) => handleInputChange({ target: { name: 'idTypeConge', value: e.target.value } })}
                  required
                >
                  {typesConge.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.nom}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {formData.typeMotif === 'autre' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Motif"
                  value={formData.autreMotif}
                  onChange={(e) => handleInputChange({ target: { name: 'autreMotif', value: e.target.value } })}
                  required
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting || loadingDemande}>
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateModalDemandeConge;
