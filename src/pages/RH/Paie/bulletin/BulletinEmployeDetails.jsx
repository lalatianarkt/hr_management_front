import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  Grid,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  PictureAsPdf,
  Download,
  Print,
  Person,
  Badge,
  AccountBalance,
  AttachMoney,
  Percent,
  TrendingUp,
  TrendingDown,
  Business,
  Info,
  CalendarMonth,
  Work,
  Cake,
  Apartment,
  CorporateFare
} from '@mui/icons-material';
import axiosInstance from '../../../utils/AxiosInstance'; 

const BulletinEmployeDetail = () => {
  const { paieId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rubriques, setRubriques] = useState([]);
  const [bulletinInfo, setBulletinInfo] = useState(null);
  const [employeInfo, setEmployeInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // États pour les totaux
  const [totaux, setTotaux] = useState({
    totalGains: 0,
    totalRetenues: 0,
    totalCharges: 0,
    totalBase: 0,
    salaireBrut: 0,
    salaireNet: 0
  });

  useEffect(() => {
    if (paieId) {
      fetchBulletinDetails();
    } else {
      setError("ID de paie manquant");
      setLoading(false);
    }
  }, [paieId]);

  const fetchBulletinDetails = async () => {
    try {
      setLoading(true);
      setError('');

      console.log("Récupération des détails pour paieId:", paieId);

      // 1. Récupérer les rubriques avec axiosInstance
      const rubriquesResponse = await axiosInstance.get(
        `/api/vue-paie-fille/paie/${paieId}`
      );

      console.log("Rubriques reçues:", rubriquesResponse.data);

      if (rubriquesResponse.data && rubriquesResponse.data.length > 0) {
        setRubriques(rubriquesResponse.data);

        // Extraire les informations du premier bulletin (elles sont les mêmes pour toutes les rubriques)
        const firstRubrique = rubriquesResponse.data[0];

        // 2. Récupérer les informations du bulletin principal
        try {
          const bulletinResponse = await axiosInstance.get(
            `/api/vue-paie-complete/bulletin/${paieId}`
          );

          if (bulletinResponse.data) {
            const bulletinData = bulletinResponse.data;
            setBulletinInfo(bulletinData);

            const employeData = {
              idEmploye: bulletinData.idEmploye,
              matricule: bulletinData.matricule,
              nomComplet: bulletinData.nomComplet,
              fonction: bulletinData.fonction,
              departement: bulletinData.departement,
              dateNaissance: bulletinData.dateNaissance,
              dateEmbauche: bulletinData.dateEmbauche,
              anciennete: bulletinData.anciennete,
              numCnaps: bulletinData.numCnaps
            };

            setEmployeInfo(employeData);

            // Récupérer les informations de l'entreprise depuis la réponse
            if (bulletinData.nomCompany) {
              setCompanyInfo({
                nom: bulletinData.nomCompany,
                logo: bulletinData.logo || null
              });
            }
          }
        } catch (bulletinErr) {
          console.warn("Impossible de récupérer les infos bulletin, utilisation des données disponibles");
          const bulletinData = {
            paieId: firstRubrique.paieId,
            salaireBrut: firstRubrique.salaireBrut,
            salaireNet: firstRubrique.salaireNet,
            salaireBase: firstRubrique.salaireBase,
            totalRetenue: firstRubrique.totalRetenue,
            totalCotisations: firstRubrique.totalCotisations,
            moisPaie: firstRubrique.moisPaie,
            anneePaie: firstRubrique.anneePaie,
            dateDebutPeriode: firstRubrique.dateDebutPeriode,
            dateFinPeriode: firstRubrique.dateFinPeriode,
            statutPaieLibelle: firstRubrique.statutPaieLibelle,
            statutCloture: firstRubrique.statutCloture,
            categorieSalaire: firstRubrique.categorieSalaire,
            nomCompany: firstRubrique.nomCompany,  // Ajout du nom de l'entreprise
            logo: firstRubrique.logo               // Ajout du logo
          };

          const employeData = {
            idEmploye: firstRubrique.idEmploye,
            matricule: firstRubrique.matricule,
            nomComplet: firstRubrique.nomComplet,
            fonction: firstRubrique.fonction,
            departement: firstRubrique.departement,
          };

          setBulletinInfo(bulletinData);
          setEmployeInfo(employeData);

          // Récupérer les informations de l'entreprise depuis firstRubrique
          if (firstRubrique.nomCompany) {
            setCompanyInfo({
              nom: firstRubrique.nomCompany,
              logo: firstRubrique.logo || null
            });
          }
        }

        // Calculer les totaux
        calculateTotaux(rubriquesResponse.data, bulletinInfo);
      } else {
        setError("Aucune rubrique trouvée pour ce bulletin");
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      
      // Gestion d'erreur améliorée
      if (err.response) {
        setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur lors du chargement des détails'}`);
      } else if (err.request) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError('Erreur lors du chargement des détails du bulletin');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotaux = (rubriquesList, bulletinData) => {
    let totalGains = 0;
    let totalRetenues = 0;
    let totalCharges = 0;
    let totalBase = 0;

    rubriquesList.forEach(rubrique => {
      const montant = rubrique.montant || 0;
      const type = rubrique.typeRubrique?.toLowerCase() || '';

      // Accumuler les bases
      totalBase += (rubrique.base || 0);

      // Classer par type de rubrique
      if (type.includes('gain')) {
        totalGains += montant;
      } else if (type.includes('retenue')) {
        totalRetenues += montant;
      } else if (type.includes('charge patronale')) {
        totalCharges += montant;
      }
    });

    const salaireBrut = bulletinData?.salaireBrut || totalGains;
    const salaireNet = bulletinData?.salaireNet || (salaireBrut - totalRetenues);

    setTotaux({
      totalGains,
      totalRetenues,
      totalCharges,
      totalBase,
      salaireBrut,
      salaireNet
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0,00 Ar';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' Ar';
  };

  const formatPercent = (value) => {
    if (!value && value !== 0) return '-';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
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

  const getMonthName = (month) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || `Mois ${month}`;
  };

  const getPeriodeString = () => {
    if (!bulletinInfo) return 'Non spécifiée';
    if (bulletinInfo.moisPaie && bulletinInfo.anneePaie) {
      const mois = getMonthName(bulletinInfo.moisPaie);
      const debut = formatDate(bulletinInfo.dateDebutPeriode);
      const fin = formatDate(bulletinInfo.dateFinPeriode);
      return `${mois} ${bulletinInfo.anneePaie} (${debut} - ${fin})`;
    }
    return 'Non spécifiée';
  };

  const getTypeColor = (type) => {
    const typeStr = (type || '').toLowerCase();
    if (typeStr.includes('gain')) return 'success';
    if (typeStr.includes('retenue')) return 'error';
    if (typeStr.includes('charge patronale')) return 'warning';
    return 'default';
  };

  const getTypeIcon = (type) => {
    const typeStr = (type || '').toLowerCase();
    if (typeStr.includes('gain')) return <TrendingUp fontSize="small" />;
    if (typeStr.includes('retenue')) return <TrendingDown fontSize="small" />;
    if (typeStr.includes('charge patronale')) return <Business fontSize="small" />;
    return <Info fontSize="small" />;
  };

  // Fonction pour déterminer où afficher le taux selon votre règle
  const getTauxColumn = (rubrique) => {
    const type = rubrique.typeRubrique || '';
    const taux = rubrique.taux;

    if (!taux && taux !== 0) return { salarial: '-', patronal: '-' };

    if (type.toLowerCase().includes('charge patronale')) {
      return { salarial: '-', patronal: formatPercent(taux) };
    } else {
      return { salarial: formatPercent(taux), patronal: '-' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);

      console.log("Téléchargement PDF pour paieId:", paieId);

      // Utiliser axiosInstance pour le PDF
      const response = await axiosInstance.get(
        `/api/export/bulletin/${paieId}/pdf`,
        {
          responseType: 'blob', // IMPORTANT pour les fichiers PDF
        }
      );

      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `bulletin_${paieId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libérer l'URL
      window.URL.revokeObjectURL(url);

      console.log("Téléchargement PDF réussi");

    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);

      if (err.response) {
        if (err.response.status === 404) {
          alert('Service d\'export PDF non disponible.');
        } else if (err.response.status === 500) {
          alert('Erreur serveur lors de la génération du PDF.');
        }
      } else if (err.request) {
        alert('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      } else {
        alert('Erreur lors du téléchargement du PDF.');
      }
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);

      // Option 1: Si vous avez une API d'export Excel
      try {
        const response = await axiosInstance({
          method: 'GET',
          url: `/api/export/bulletin/${paieId}/excel`,
          responseType: 'blob',
        });

        const excelBlob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const excelUrl = window.URL.createObjectURL(excelBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = excelUrl;
        downloadLink.download = `bulletin_${employeInfo?.matricule || 'employe'}_${paieId}.xlsx`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(excelUrl);

      } catch (apiErr) {
        // Option 2: Si pas d'API Excel, générer un fichier Excel côté client
        alert('Export Excel à implémenter ou API non disponible');
      }

    } catch (err) {
      console.error('Erreur lors de l\'export Excel:', err);
      alert('Erreur lors de l\'export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Chargement du détail du bulletin...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
        >
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
        color: 'white',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(97, 18, 202, 0.2)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
                variant="contained"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', boxShadow: 'none' }
                }}
              >
                Retour
              </Button>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" component="h1" fontWeight="800" sx={{ letterSpacing: '-1px', mb: 3 }}>
                <AccountBalance sx={{ mr: 2, fontSize: '2.5rem', verticalAlign: 'middle' }} />
                Bulletin de Paie
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}>
                      <Person fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="800">
                        {employeInfo?.nomComplet || 'Employé'}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                        <Chip
                          icon={<Badge style={{ color: 'white' }} />}
                          label={`Matricule: ${employeInfo?.matricule || 'N/A'}`}
                          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 'bold' }}
                        />
                        <Chip
                          icon={<Work style={{ color: 'white' }} />}
                          label={employeInfo?.fonction || 'Fonction'}
                          sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 'bold' }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth fontSize="small" /> Période
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {getPeriodeString()}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1.5}>
                      <Chip
                        label={bulletinInfo?.statutPaieLibelle || 'Validé'}
                        size="small"
                        sx={{
                          bgcolor: bulletinInfo?.statutCloture === 1 ? 'success.main' : 'warning.main',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Stack direction="column" spacing={1.5}>
                <Button
                  startIcon={<Print />}
                  onClick={handlePrint}
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', borderRadius: '10px' }}
                >
                  Imprimer
                </Button>
                <Button
                  startIcon={exportingPDF ? <CircularProgress size={18} /> : <PictureAsPdf />}
                  onClick={handleExportPDF}
                  variant="contained"
                  fullWidth
                  disabled={exportingPDF}
                  sx={{ bgcolor: 'white', color: 'error.main', fontWeight: 'bold', borderRadius: '10px' }}
                >
                  PDF
                </Button>
                <Button
                  startIcon={<Download />}
                  onClick={handleExportExcel}
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: 'white', color: 'success.main', fontWeight: 'bold', borderRadius: '10px' }}
                >
                  Excel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: 'none', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="800" color="textSecondary">
                  Salarié
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary" fontWeight="600">Matricule</Typography>
                  <Typography variant="body2" fontWeight="800">{employeInfo?.matricule || 'N/A'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary" fontWeight="600">Catégorie</Typography>
                  <Typography variant="body2" fontWeight="800">{bulletinInfo?.categorieSalaire || 'Standard'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary" fontWeight="600">Département</Typography>
                  <Typography variant="body2" fontWeight="800">{employeInfo?.departement || 'RH'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Totaux synthèse */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: 'none', borderRadius: '20px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <AttachMoney color="primary" sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h5" color="primary" fontWeight="800">
                    {formatCurrency(bulletinInfo?.salaireBrut || totaux.salaireBrut)}
                  </Typography>
                  <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                    Salaire Brut
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: 'none', borderRadius: '20px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingDown color="error" sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h5" color="error.main" fontWeight="800">
                    {formatCurrency(bulletinInfo?.totalRetenue || totaux.totalRetenues)}
                  </Typography>
                  <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                    Retenues
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: 'none', borderRadius: '20px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Business color="warning" sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h5" color="warning.main" fontWeight="800">
                    {formatCurrency(bulletinInfo?.totalCotisations || totaux.totalCharges)}
                  </Typography>
                  <Typography variant="caption" fontWeight="700" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                    Charges Pat.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: 'none', borderRadius: '24px', height: '100%', background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <AttachMoney sx={{ fontSize: 32, mb: 1, color: 'white' }} />
                  <Typography variant="h5" fontWeight="900">
                    {formatCurrency(bulletinInfo?.salaireNet || totaux.salaireNet)}
                  </Typography>
                  <Typography variant="caption" fontWeight="700" sx={{ textTransform: 'uppercase', opacity: 0.9 }}>
                    Salaire Net
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Tableau des rubriques */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalance sx={{ mr: 1 }} />
            Détail des rubriques de paie
            <Chip
              label={`${rubriques.length} rubrique(s)`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(176, 83, 173, 0.08)' }}>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '8%' }}>Code</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '22%' }}>Rubrique</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '12%' }} align="right">Base</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '12%' }} align="center">Taux Salarial</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '12%' }} align="right">Gains</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '12%' }} align="right">Retenues</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '12%' }} align="center">Taux Patronal</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '12%' }} align="right">Charges</TableCell>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '8%' }} align="center">Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rubriques.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        Aucune rubrique trouvée pour ce bulletin
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rubriques.map((rubrique, index) => {
                    const type = rubrique.typeRubrique || '';
                    const categorie = rubrique.categorieRubrique || '';
                    const rubriqueNom = rubrique.rubriqueNom || rubrique.rubrique_nom || categorie || 'Non spécifié';
                    const isGain = type.toLowerCase().includes('gain');
                    const isRetenue = type.toLowerCase().includes('retenue');
                    const isCharge = type.toLowerCase().includes('charge patronale');

                    const tauxColumns = getTauxColumn(rubrique);

                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          '&:hover': { bgcolor: 'action.hover' },
                          borderLeft: 4,
                          borderLeftColor: getTypeColor(type) + '.main'
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={rubrique.code}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {rubriqueNom}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {type || 'Sans type'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>
                            {rubrique.base ? formatCurrency(rubrique.base) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {tauxColumns.salarial !== '-' ? (
                            <Chip
                              label={tauxColumns.salarial}
                              size="small"
                              color={isGain ? 'success' : 'error'}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {tauxColumns.salarial}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {isGain ? (
                            <Typography fontWeight="bold" color="success.main">
                              {formatCurrency(rubrique.montant)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {isRetenue ? (
                            <Typography fontWeight="bold" color="error">
                              {formatCurrency(rubrique.montant)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {tauxColumns.patronal !== '-' ? (
                            <Chip
                              label={tauxColumns.patronal}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {tauxColumns.patronal}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {isCharge ? (
                            <Typography fontWeight="bold" color="warning.main">
                              {formatCurrency(rubrique.montant)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`${type} - ${categorie}`}>
                            <IconButton size="small">
                              {getTypeIcon(type)}
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
        </CardContent>
      </Card>

      {/* Résumé final */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Récapitulatif du bulletin
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'rgba(176, 83, 173, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Synthèse des montants
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total des gains:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {formatCurrency(totaux.totalGains)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total des retenues:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="error">
                      {formatCurrency(totaux.totalRetenues)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total des charges patronales:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                      {formatCurrency(totaux.totalCharges)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="bold">Salaire brut:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(bulletinInfo?.salaireBrut || totaux.salaireBrut)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="bold">Salaire net à payer:</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(bulletinInfo?.salaireNet || totaux.salaireNet)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'rgba(176, 83, 173, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Informations techniques
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Identifiant paie:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {paieId}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Période:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {getPeriodeString()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Catégorie:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {bulletinInfo?.categorieSalaire || 'Non spécifiée'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Statut:</Typography>
                    <Chip
                      label={bulletinInfo?.statutPaieLibelle || 'Validé'}
                      size="small"
                      color={bulletinInfo?.statutCloture === 1 ? 'success' : 'warning'}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Nombre de rubriques:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {rubriques.length}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Date d'extraction:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date().toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Informations entreprise - Maintenant correctement affichées */}
      {companyInfo?.nom && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <CorporateFare color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Informations entreprise
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Entreprise:</strong> {companyInfo.nom}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BulletinEmployeDetail;