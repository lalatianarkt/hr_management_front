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
  Menu,
  MenuItem as MuiMenuItem,
  IconButton,
  Autocomplete
} from '@mui/material';
import { 
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';

const CloturePaiePage = () => {
  const [soldes, setSoldes] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployes, setLoadingEmployes] = useState(false);
  const [clotureLoading, setClotureLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmploye, setSelectedEmploye] = useState('TOUS');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Référence pour suivre l'employé précédent
  const previousEmployeRef = useRef('TOUS');
  
  // Menu contextuel
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const API_BASE_URL = 'http://localhost:8080/api';
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const cardSx = { borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 24px rgba(0,0,0,0.04)' };
  const sectionTitleSx = { fontWeight: 800, color: '#3a1438' };
  const primaryButtonSx = { borderRadius: '10px', fontWeight: 700, bgcolor: 'var(--bg-primary)', color: '#fff', '&:hover': { bgcolor: 'var(--bg-primary)', opacity: 0.9 } };
  const outlineButtonSx = { borderRadius: '10px', fontWeight: 700, borderColor: 'rgba(176, 83, 173, 0.35)', color: 'var(--bg-primary)' };

  useEffect(() => {
    fetchEmployes();
    fetchSoldes();
  }, [selectedYear]);

  useEffect(() => {
    // Log pour déboguer les changements d'employé sélectionné
    console.log("Employé sélectionné changé:", selectedEmploye);
    console.log("Soldes disponibles:", soldes.length);
    
    // Si on change d'employé et que c'est différent de "TOUS"
    if (selectedEmploye !== 'TOUS' && selectedEmploye !== previousEmployeRef.current) {
      console.log("Changement d'employé détecté");
      const solde = soldes.find(s => s.idEmploye === selectedEmploye);
      console.log("Solde trouvé pour cet employé:", solde);
    }
    
    // Mettre à jour la référence
    previousEmployeRef.current = selectedEmploye;
  }, [selectedEmploye, soldes]);

  // Récupérer la liste complète des employés
  const fetchEmployes = async () => {
    try {
      setLoadingEmployes(true);
      // À ADAPTER : remplacez par votre endpoint API qui récupère les employés
      const response = await axios.get(`${API_BASE_URL}/employes`); // ou /api/employes
      
      // Si l'API retourne un tableau d'objets avec id et nom
      if (response.data && Array.isArray(response.data)) {
        // Supposons que chaque employé a un 'id' et un 'nom'
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
      // En cas d'erreur, on utilisera les employés des soldes comme fallback
    } finally {
      setLoadingEmployes(false);
    }
  };

  const fetchSoldes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/solde-annuel/annee/${selectedYear}`);
      
      // Vérifiez la structure de la réponse
      console.log("Réponse API brute:", response.data);
      
      let soldesData = [];
      
      // Si l'API retourne un objet avec une propriété "soldes"
      if (response.data && response.data.soldes && Array.isArray(response.data.soldes)) {
        soldesData = response.data.soldes;
        console.log(`Structure 1: ${soldesData.length} soldes trouvés`);
      } 
      // Si l'API retourne directement un tableau
      else if (response.data && Array.isArray(response.data)) {
        soldesData = response.data;
        console.log(`Structure 2: ${soldesData.length} soldes trouvés`);
      }
      // Sinon, c'est vide
      else {
        console.warn("Structure de données inattendue:", response.data);
        soldesData = [];
      }
      
      setSoldes(soldesData);
      console.log(`${soldesData.length} soldes chargés pour ${selectedYear}`);
      setError(null);
      
    } catch (err) {
      console.error("Erreur fetchSoldes:", err);
      console.error("Détails:", err.response?.data || err.message);
      setError('Erreur lors du chargement des soldes');
      setSoldes([]);
    } finally {
      setLoading(false);
    }
  };

  // Version améliorée avec recherche dans les employés
  const getEmployesList = () => {
    // Si on a la liste des employés de l'API, on l'utilise
    if (employes.length > 0) {
      return [
        { id: 'TOUS', nom: 'Tous les employés', type: 'groupe' },
        ...employes.map(emp => ({ ...emp, type: 'employe' }))
      ];
    }
    
    // Sinon, on utilise les employés des soldes
    const employesFromSoldes = [...new Set(soldes.map(s => s.idEmploye))];
    return [
      { id: 'TOUS', nom: 'Tous les employés', type: 'groupe' },
      ...employesFromSoldes.map(id => ({ id, nom: `Employé ${id}`, type: 'employe' }))
    ];
  };

  const handleCloture = () => {
    console.log("Ouvrir dialog pour:", selectedEmploye);
    setOpenDialog(true);
  };

  const handleClotureIndividuelle = (employeId) => {
    console.log("Clic tableau pour employé:", employeId);
    
    // Forcer la mise à jour de l'employé sélectionné
    setSelectedEmploye(employeId);
    
    // Forcer un re-render
    setForceUpdate(prev => prev + 1);
    
    // Ouvrir le dialog après un petit délai
    setTimeout(() => {
      console.log("Dialog ouvert pour:", employeId);
      setOpenDialog(true);
    }, 100);
  };

  const executerCloture = async () => {
    try {
      setClotureLoading(true);
      console.log("Exécution clôture pour:", selectedEmploye, "année:", selectedYear);
      
      if (selectedEmploye === 'TOUS') {
        // Clôture pour tous les employés
        const response = await axios.post(`${API_BASE_URL}/solde-annuel/cloture/globale/${selectedYear}`);
        
        console.log("Réponse clôture globale:", response.data);
        
        // Gérer différentes structures de réponse
        let message = `Clôture ${selectedYear} terminée`;
        if (response.data && Array.isArray(response.data)) {
          message = `${response.data.length} soldes clôturés pour ${selectedYear}`;
        } else if (response.data && response.data.message) {
          message = `${response.data.message}`;
        }
        
        setNotification({
          open: true,
          message,
          severity: 'success'
        });
      } else {
        // Clôture pour un employé spécifique
        const response = await axios.post(
          `${API_BASE_URL}/solde-annuel/cloture/employe/${selectedEmploye}/${selectedYear}`
        );
        
        console.log("Réponse clôture individuelle:", response.data);
        
        setNotification({
          open: true,
          message: `${selectedEmploye} clôturé pour ${selectedYear}`,
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      
      // Recharger les soldes après un délai
      setTimeout(() => {
        fetchSoldes();
      }, 1500);
      
    } catch (err) {
      console.error("Erreur lors de la clôture:", err);
      console.error("Détails:", err.response?.data || err.message);
      
      setNotification({
        open: true,
        message: `Erreur: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    } finally {
      setClotureLoading(false);
    }
  };

  const getStatusBadge = (statutCloture) => {
    return statutCloture === 1 ? (
      <Chip icon={<CheckIcon />} label="Clôturé" color="success" size="small" />
    ) : (
      <Chip icon={<CloseIcon />} label="À clôturer" color="warning" size="small" />
    );
  };

  // Calcul des statistiques
  const stats = {
    total: soldes.length,
    clotures: soldes.filter(s => s.statutCloture === 1).length,
    aCloturer: soldes.filter(s => s.statutCloture !== 1).length,
    totalCongesPris: soldes.reduce((sum, s) => sum + (s.nbCongePris || 0), 0),
    totalCongesRestants: soldes.reduce((sum, s) => sum + (s.nbCongeRestant || 0), 0)
  };

  // Trouver l'employé sélectionné dans la liste
  const selectedEmployeInfo = getEmployesList().find(e => e.id === selectedEmploye);
  
  // Vérifier si le solde est déjà clôturé pour l'employé sélectionné
  const soldeEmployeSelectionne = soldes.find(s => s.idEmploye === selectedEmploye);
  const estDejaCloture = soldeEmployeSelectionne?.statutCloture === 1;

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* En-tête */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h1" sx={sectionTitleSx} gutterBottom>
            Cloture de Paie {selectedYear}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calcul automatique et cloture des conges annuels
          </Typography>
        </CardContent>
      </Card>

      {/* Panneau de contrôle */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Employé</InputLabel>
                <Select
                  value={selectedEmploye}
                  label="Employé"
                  onChange={(e) => {
                    console.log("Changement select:", e.target.value);
                    setSelectedEmploye(e.target.value);
                    setForceUpdate(prev => prev + 1);
                  }}
                  disabled={loadingEmployes}
                >
                  {getEmployesList().map((employe) => (
                    <MenuItem 
                      key={employe.id} 
                      value={employe.id}
                      sx={{
                        fontWeight: employe.type === 'groupe' ? 'bold' : 'normal',
                        bgcolor: employe.type === 'groupe' ? '#f9f1f8' : 'transparent'
                      }}
                    >
                      {employe.type === 'groupe' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupIcon fontSize="small" />
                          <Typography variant="body2" fontWeight="bold">
                            {employe.nom}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          <Typography variant="body2">
                            {employe.nom}
                          </Typography>
                        </Box>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Année</InputLabel>
                <Select
                  value={selectedYear}
                  label="Année"
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedEmploye('TOUS'); // Réinitialiser la sélection d'employé
                  }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CalculateIcon />}
                  onClick={handleCloture}
                  disabled={
                    clotureLoading || 
                    (selectedEmploye !== 'TOUS' && estDejaCloture)
                  }
                  sx={{ ...primaryButtonSx, flex: 1 }}
                >
                  {clotureLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : selectedEmploye === 'TOUS' ? (
                    `Clôturer Tous (${stats.aCloturer})`
                  ) : estDejaCloture ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon fontSize="small" />
                      <span>Déjà clôturé</span>
                    </Box>
                  ) : (
                    `Clôturer ${selectedEmployeInfo?.nom || selectedEmploye}`
                  )}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    fetchSoldes();
                    setForceUpdate(prev => prev + 1);
                  }}
                  disabled={loading}
                  sx={outlineButtonSx}
                >
                  Actualiser
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Info-bulle */}
          {selectedEmploye !== 'TOUS' && selectedEmployeInfo && (
            <Alert 
              severity={estDejaCloture ? "success" : "info"} 
              sx={{ mt: 2 }}
            >
              {estDejaCloture ? (
                `${selectedEmployeInfo.nom} déjà clôturé pour ${selectedYear}`
              ) : (
                `Clôture individuelle pour ${selectedEmployeInfo.nom} - Année ${selectedYear}`
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Box className="stat-card">
            <div className="stat-icon"><GroupIcon fontSize="small" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total employés</div>
            </div>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box className="stat-card">
            <div className="stat-icon"><CheckIcon fontSize="small" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.clotures}</div>
              <div className="stat-label">Clôturés</div>
            </div>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box className="stat-card">
            <div className="stat-icon"><CloseIcon fontSize="small" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.aCloturer}</div>
              <div className="stat-label">À clôturer</div>
            </div>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box className="stat-card">
            <div className="stat-icon"><CalculateIcon fontSize="small" /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalCongesPris.toFixed(1)}</div>
              <div className="stat-label">Jours pris</div>
            </div>
          </Box>
        </Grid>
      </Grid>

      {/* Tableau des soldes */}
      <TableContainer component={Paper} sx={{ ...cardSx, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(176, 83, 173, 0.06)' }}>
              <TableCell><strong>Employé</strong></TableCell>
              <TableCell><strong>Année</strong></TableCell>
              <TableCell align="right"><strong>Total Jours</strong></TableCell>
              <TableCell align="right"><strong>Congés Pris</strong></TableCell>
              <TableCell align="right"><strong>Reste</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : soldes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Aucun solde trouvé pour {selectedYear}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              soldes.map((solde) => {
                const employeInfo = getEmployesList().find(e => e.id === solde.idEmploye);
                const estCloture = solde.statutCloture === 1;
                
                return (
                  <TableRow 
                    key={solde.id || Math.random()}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: '#f9f1f8' },
                      opacity: estCloture ? 0.7 : 1
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
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
                        color={solde.annee === selectedYear ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        {solde.nbCongeTotal?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="secondary" fontWeight="medium">
                        {solde.nbCongePris?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        fontWeight="bold"
                        color={solde.nbCongeRestant > 0 ? 'success.main' : 'error.main'}
                      >
                        {solde.nbCongeRestant?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(solde.statutCloture)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant={estCloture ? "outlined" : "contained"}
                        color={estCloture ? "success" : "primary"}
                        onClick={() => handleClotureIndividuelle(solde.idEmploye)}
                        disabled={estCloture}
                        sx={{ 
                          minWidth: 120,
                          opacity: estCloture ? 0.7 : 1
                        }}
                        startIcon={estCloture ? <CheckIcon /> : <CalculateIcon />}
                      >
                        {estCloture ? 'Déjà clôturé' : 'Clôturer'}
                      </Button>
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon color="primary" />
            Confirmation de clôture {selectedYear}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedEmploye === 'TOUS' ? (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  Clôture globale {selectedYear}
                </Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Vous allez clôturer l'exercice {selectedYear} pour tous les employés ({stats.aCloturer} employés).
                  </Typography>
                </Alert>
              </>
            ) : (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  Clôture individuelle {selectedYear}
                </Typography>
                <Typography>
                  Employé : <strong>{selectedEmployeInfo?.nom || selectedEmploye}</strong>
                </Typography>
                
                {soldeEmployeSelectionne && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f1f8', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Total congés :</strong> {soldeEmployeSelectionne.nbCongeTotal?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Congés pris :</strong> {soldeEmployeSelectionne.nbCongePris?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Congés restants :</strong> {soldeEmployeSelectionne.nbCongeRestant?.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
            disabled={clotureLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={executerCloture} 
            color="primary" 
            variant="contained"
            disabled={clotureLoading}
            startIcon={clotureLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
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
