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
      <Card
        sx={{
          mb: 4,
          borderRadius: '24px',
          border: '1px solid rgba(176, 83, 173, 0.14)',
          background: 'linear-gradient(135deg, #fff 0%, #fdf7fc 100%)',
          boxShadow: '0 10px 24px rgba(176, 83, 173, 0.08)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* Partie gauche */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={2.2}>
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

                  <Typography
                    component="h1"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: '1.7rem', md: '2.3rem' },
                      fontWeight: 800,
                      color: '#4b1f47',
                      lineHeight: 1.2
                    }}
                  >
                    Bulletin de paie
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
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
                    <CalendarMonth sx={{ color: '#b053ad', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: '#5c2458' }}>
                      {getPeriodeString()}
                    </Typography>
                  </Box>

                  <Chip
                    label={bulletinInfo?.statutPaieLibelle || 'Validé'}
                    size="small"
                    sx={{
                      alignSelf: 'center',
                      fontWeight: 700,
                      color: bulletinInfo?.statutCloture === 1 ? '#1f6f43' : '#b45f06',
                      bgcolor: bulletinInfo?.statutCloture === 1 ? '#e6f4ea' : '#fff1df',
                      border: bulletinInfo?.statutCloture === 1
                        ? '1px solid #b7dfc3'
                        : '1px solid #ffd59a'
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    p: 2.2,
                    borderRadius: '18px',
                    bgcolor: '#fcf7fb',
                    border: '1px solid rgba(176, 83, 173, 0.10)'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 58,
                        height: 58,
                        bgcolor: '#f3e2f1',
                        color: '#8e3a8b',
                        fontWeight: 800
                      }}
                    >
                      {employeInfo?.nomComplet?.charAt(0) || <Person />}
                    </Avatar>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: '#2f172d',
                          fontSize: { xs: '1rem', md: '1.15rem' }
                        }}
                      >
                        {employeInfo?.nomComplet || 'Employé'}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        mt={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          icon={<Badge sx={{ color: '#8e3a8b !important' }} />}
                          label={`Matricule : ${employeInfo?.matricule || 'N/A'}`}
                          sx={{
                            bgcolor: '#f9eef8',
                            color: '#8e3a8b',
                            fontWeight: 700,
                            border: '1px solid #e7c5e2'
                          }}
                        />
                        <Chip
                          icon={<Work sx={{ color: '#8e3a8b !important' }} />}
                          label={employeInfo?.fonction || 'Fonction'}
                          sx={{
                            bgcolor: '#f9eef8',
                            color: '#8e3a8b',
                            fontWeight: 700,
                            border: '1px solid #e7c5e2'
                          }}
                        />
                        <Chip
                          icon={<Apartment sx={{ color: '#8e3a8b !important' }} />}
                          label={employeInfo?.departement || 'Département'}
                          sx={{
                            bgcolor: '#f9eef8',
                            color: '#8e3a8b',
                            fontWeight: 700,
                            border: '1px solid #e7c5e2'
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {/* Partie droite */}
            <Grid item xs={12} lg={4}>
              <Stack
                direction={{ xs: 'row', lg: 'column' }}
                spacing={1.5}
                justifyContent={{ xs: 'flex-start', lg: 'center' }}
                alignItems={{ xs: 'stretch', lg: 'flex-end' }}
                useFlexGap
                flexWrap="wrap"
              >
                <Button
                  startIcon={exportingPDF ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <PictureAsPdf />}
                  onClick={handleExportPDF}
                  variant="contained"
                  disabled={exportingPDF}
                  sx={{
                    minWidth: 140,
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

                <Button
                  startIcon={exportingExcel ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Download />}
                  onClick={handleExportExcel}
                  variant="contained"
                  disabled={exportingExcel}
                  sx={{
                    minWidth: 140,
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
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} mb={4}>
        {/* Cartes montants */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '22px',
                  border: '1px solid rgba(176, 83, 173, 0.10)',
                  boxShadow: '0 8px 22px rgba(176, 83, 173, 0.06)'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    minHeight: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoney sx={{ fontSize: 28, color: '#1976d2', mb: 1 }} />
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#1976d2',
                      lineHeight: 1.35
                    }}
                  >
                    {formatCurrency(bulletinInfo?.salaireBrut || totaux.salaireBrut)}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#6f6170',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}
                  >
                    Salaire brut
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '22px',
                  border: '1px solid rgba(176, 83, 173, 0.10)',
                  boxShadow: '0 8px 22px rgba(176, 83, 173, 0.06)'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    minHeight: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingDown sx={{ fontSize: 28, color: '#d32f2f', mb: 1 }} />
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#d32f2f',
                      lineHeight: 1.35
                    }}
                  >
                    {formatCurrency(bulletinInfo?.totalRetenue || totaux.totalRetenues)}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#6f6170',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}
                  >
                    Retenues
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '22px',
                  border: '1px solid rgba(176, 83, 173, 0.10)',
                  boxShadow: '0 8px 22px rgba(176, 83, 173, 0.06)'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    minHeight: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Business sx={{ fontSize: 28, color: '#ef6c00', mb: 1 }} />
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#ef6c00',
                      lineHeight: 1.35
                    }}
                  >
                    {formatCurrency(bulletinInfo?.totalCotisations || totaux.totalCharges)}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#6f6170',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}
                  >
                    Charges pat.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 170,
                  borderRadius: '22px',
                  backgroundColor: '#8e3a8b',
                  backgroundImage: 'linear-gradient(135deg, #b053ad 0%, #8e3a8b 100%)',
                  color: '#ffffff',
                  boxShadow: '0 10px 22px rgba(176, 83, 173, 0.20)',
                  overflow: 'hidden'
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    minHeight: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoney sx={{ fontSize: 28, color: '#8a1b1b', mb: 1 }} />

                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 900,
                      color: '#8a1b1b',
                      lineHeight: 1.35
                    }}
                  >
                    {formatCurrency(bulletinInfo?.salaireNet || totaux.salaireNet)}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#6f6170',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}
    
                  >
                    Salaire net
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
              sx={{
                ml: 2,
                bgcolor: '#f3e2f1',
                color: '#8e3a8b',
                fontWeight: 700,
                border: '1px solid #e1b2db'
              }}
            />
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: '16px',
                  overflowX: 'auto',
                  overflowY: 'hidden'
                }}
              >
            <Table
                sx={{
                  minWidth: 1280,
                  tableLayout: 'fixed'
                }}
              >
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(176, 83, 173, 0.08)' }}>
                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '8%' }}>
                    Code
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '16%' }}>
                    Rubrique
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '10%' }} align="right">
                    Base
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '10%' }} align="center">
                    Taux Salarial
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '10%' }} align="right">
                    Gains
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '10%' }} align="right">
                    Retenues
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '10%' }} align="center">
                    Taux Patronal
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '10%' }} align="right">
                    Charges
                  </TableCell>

                  <TableCell sx={{ color: '#5c2458', fontWeight: '800', width: '16%' }} align="left">
                    Type
                  </TableCell>
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
                          '&:hover': { bgcolor: '#fcf8fb' },
                          borderLeft: 4,
                          borderLeftColor: isGain
                            ? '#5ea86b'
                            : isRetenue
                            ? '#d37b7b'
                            : isCharge
                            ? '#d99a49'
                            : '#c88ac0'
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={rubrique.code}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: '#8e3a8b',
                              borderColor: '#c88ac0',
                              backgroundColor: '#fcf4fb',
                              fontWeight: 600
                            }}
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
                              variant="outlined"
                              sx={{
                                color: '#6e9f68',
                                borderColor: '#98c492',
                                backgroundColor: '#f7fbf6',
                                fontWeight: 500
                              }}
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
                              variant="outlined"
                              sx={{
                                color: '#b26a1f',
                                borderColor: '#e2b27d',
                                backgroundColor: '#fff8f1',
                                fontWeight: 500
                              }}
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
                        <TableCell
                          align="left"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={0.8} sx={{ minWidth: 0 }}>
                            <Tooltip title={`${type} - ${categorie}`}>
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#8e3a8b',
                                  p: 0.4,
                                  flexShrink: 0
                                }}
                              >
                                {getTypeIcon(type)}
                              </IconButton>
                            </Tooltip>

                            <Typography
                              variant="body2"
                              sx={{
                                color: '#5c2458',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {categorie || type || 'Non spécifié'}
                            </Typography>
                          </Box>
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
                    <Typography variant="h6" sx={{ color: '#8e3a8b', fontWeight: 800 }}>
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