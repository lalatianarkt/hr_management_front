// src/pages/RH/Pointage/PointageDashboard.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/AxiosInstance"; 
import {
  Card, Table, Tag, Row, Col, Input, Select, Button,
  Progress, Spin, Alert, Empty, Badge, Tooltip, Modal, Statistic,
  Divider, Typography, Avatar, message
} from "antd";
import {
  SearchOutlined, FilterOutlined, DownloadOutlined,
  BarChartOutlined, TeamOutlined, ClockCircleOutlined,
  WarningOutlined, CheckCircleOutlined, UserOutlined,
  EyeOutlined, SortAscendingOutlined, SortDescendingOutlined,
  ExportOutlined, CoffeeOutlined, BankOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const PointageDashboard = () => {
  const [reportingData, setReportingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Ajoutez ces états au début du composant (après les autres useState)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); 
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [departementFilter, setDepartementFilter] = useState("all");
  const [sortField, setSortField] = useState("heuresTravaillees");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Liste des départements pour le filtre (maintenant avec id et nom)
  const [departements, setDepartements] = useState([]);
  // Map pour conversion rapide id -> nom
  const [departementMap, setDepartementMap] = useState(new Map());

  // Ajoutez ces constantes après les autres états
const months = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" }
];

// Générer les 5 dernières années
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Charger les données
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Charger les données de reporting présence
      const response = await axiosInstance.get("/api/reporting-presence");
      setReportingData(response.data);
      setFilteredData(response.data);
      
      // Extraire les départements uniques avec ID et nom
      const deptMap = new Map();
      response.data.forEach(item => {
        if (item.idDepartement && item.departementNom) {
          deptMap.set(item.idDepartement, item.departementNom);
        }
      });
      
      // Convertir en tableau d'objets pour le Select
      const departementsList = Array.from(deptMap, ([id, nom]) => ({ 
        id, 
        nom 
      }));
      
      setDepartements(departementsList);
      setDepartementMap(deptMap);
      
      console.log("Départements chargés:", departementsList);
      console.log("Map département:", deptMap);
      
      // Charger les statistiques
      const statsResponse = await axiosInstance.get("/api/reporting-presence/stats-globales");
      setStatistiques(statsResponse.data);
      
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les données de reporting");
      message.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...reportingData];
    
    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.nomComplet && item.nomComplet.toLowerCase().includes(term)) ||
        (item.matricule && item.matricule.toLowerCase().includes(term)) ||
        (item.departementNom && item.departementNom.toLowerCase().includes(term))
      );
    }
    
    // Filtre département (par ID maintenant)
    if (departementFilter !== "all") {
      filtered = filtered.filter(item => 
        item.idDepartement === departementFilter
      );
    }
    
    // Trier
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case "nom":
          valueA = a.nomComplet || "";
          valueB = b.nomComplet || "";
          break;
        case "matricule":
          valueA = a.matricule || "";
          valueB = b.matricule || "";
          break;
        case "departement":
          valueA = a.departementNom || "";
          valueB = b.departementNom || "";
          break;
        case "heuresTravaillees":
          valueA = a.totalHeureTravailleeEnHeures || 0;
          valueB = b.totalHeureTravailleeEnHeures || 0;
          break;
        case "retard":
          valueA = a.totalRetardEnHeures || 0;
          valueB = b.totalRetardEnHeures || 0;
          break;
        case "heuresSup":
          valueA = a.totalHeureSupEnHeures || 0;
          valueB = b.totalHeureSupEnHeures || 0;
          break;
        case "tempsEffectif":
          valueA = a.tempsEffectifEnHeures || 0;
          valueB = b.tempsEffectifEnHeures || 0;
          break;
        case "conges":
          valueA = a.totalJoursCongesTermines || 0;
          valueB = b.totalJoursCongesTermines || 0;
          break;
        default:
          valueA = a.totalHeureTravailleeEnHeures || 0;
          valueB = b.totalHeureTravailleeEnHeures || 0;
      }
      
      if (typeof valueA === "string") {
        return sortOrder === "asc" 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
    });
    
    setFilteredData(filtered);
  }, [reportingData, searchTerm, departementFilter, sortField, sortOrder]);

  // Obtenir le nom du département à partir de l'ID
  const getDepartementNomById = (id) => {
    return departementMap.get(id) || id;
  };

  // Exporter les données 
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Construire le filtre pour l'export POST avec les IDs corrects
      const filterPayload = {
        departementId: departementFilter !== "all" ? departementFilter : null,
        nomComplet: searchTerm && searchTerm.trim() ? searchTerm.trim() : null,
        minConges: null,
        maxConges: null,
        triPar: sortField !== "heuresTravaillees" ? sortField : null,
        ordreTri: sortOrder !== "desc" ? sortOrder : null
      };
      
      console.log("Payload envoyé:", filterPayload);
      
      // Utiliser l'endpoint POST qui fonctionne mieux avec les paramètres complexes
      const response = await axiosInstance.post(
        "/api/reporting-presence/export/filtres",
        filterPayload,
        {
          responseType: 'blob'
        }
      );
      
      // Créer le fichier de téléchargement
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Nom du fichier avec filtre
      let deptName = 'tous';
      if (departementFilter !== "all") {
        const nomDept = getDepartementNomById(departementFilter);
        deptName = nomDept.replace(/\s+/g, '_');
      }
      
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reporting_presence_${deptName}_${today}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Libérer l'URL
      window.URL.revokeObjectURL(downloadUrl);
      
      // Notification de succès
      message.success({
        content: departementFilter !== "all" 
          ? `Fichier exporté pour le département: ${getDepartementNomById(departementFilter)} (${filteredData.length} employés)`
          : `Fichier exporté (${filteredData.length} employés)`,
        duration: 3
      });
      
    } catch (err) {
      console.error("Erreur export:", err);
      
      // Afficher plus de détails sur l'erreur
      let errorMessage = "Impossible d'exporter les données filtrées";
      if (err.response) {
        // Essayer de lire le message d'erreur du backend
        try {
          const errorText = await err.response.data.text();
          console.error("Erreur backend:", errorText);
          errorMessage = `Erreur serveur: ${errorText.substring(0, 100)}...`;
        } catch (e) {
          errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`;
        }
      }
      
      message.error({
        content: errorMessage,
        duration: 5
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Alternative: export GET si POST ne fonctionne pas
  const handleExportGet = async () => {
    try {
      setExportLoading(true);
      
      // Construire les paramètres URL
      const params = new URLSearchParams();
      
      if (departementFilter !== "all") {
        params.append('departementId', departementFilter);
      }
      
      if (searchTerm && searchTerm.trim()) {
        params.append('nom', searchTerm.trim());
      }
      
      if (sortField !== "heuresTravaillees") {
        params.append('triPar', sortField);
      }
      
      if (sortOrder !== "desc") {
        params.append('ordreTri', sortOrder);
      }

      console.log("Params GET:", params.toString());
      
      const url = `/api/reporting-presence/export?${params.toString()}`;
      
      const response = await axiosInstance.get(url, {
        responseType: 'blob'
      });
      
      // Créer le fichier de téléchargement
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Nom du fichier
      let deptName = 'tous';
      if (departementFilter !== "all") {
        const nomDept = getDepartementNomById(departementFilter);
        deptName = nomDept.replace(/\s+/g, '_');
      }
      
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reporting_${deptName}_${today}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success(`Export réussi (${filteredData.length} employés)`);
      
    } catch (err) {
      console.error("Erreur export GET:", err);
      message.error("Échec de l'export via GET, essayez POST");
      // Essayer avec POST
      handleExport();
    } finally {
      setExportLoading(false);
    }
  };

  // Voir les détails d'un employé
  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setModalVisible(true);
  };

  // Fonction pour attribuer une couleur au département
  const getDepartmentColor = (departement) => {
    if (!departement) return '#e1b2db';
    
    const colors = {
      'Ressources Humaines': '#b053ad',
      'Développement Informatique': '#722ed1',
      'Ventes et Marketing': '#f5222d',
      'Comptabilité Générale': '#52c41a',
      'Maintenance et Logistique': '#fa8c16',
      'Direction': '#eb2f96',
      'Administration': '#13c2c2',
      'IT': '#722ed1',
      'RH': '#b053ad',
      'Marketing': '#f5222d',
      'Finance': '#52c41a',
      'Logistique': '#fa8c16',
      'Direction Générale': '#eb2f96'
    };
    
    // Chercher une correspondance exacte ou partielle
    for (const [key, color] of Object.entries(colors)) {
      if (departement.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Générer une couleur à partir du hash du nom
    let hash = 0;
    for (let i = 0; i < departement.length; i++) {
      hash = departement.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorsList = [
      '#b053ad', '#52c41a', '#fa8c16', '#f5222d',
      '#722ed1', '#eb2f96', '#13c2c2', '#a0d911',
      '#faad14', '#d4380d', '#531dab', '#c41d7f'
    ];
    
    return colorsList[Math.abs(hash) % colorsList.length];
  };

  // Colonnes du tableau
  const columns = [
    {
      title: "Matricule",
      dataIndex: "matricule",
      key: "matricule",
      width: 100,
      render: (matricule) => (
        <div style={{ textAlign: "center" }}>
          <Tag color="#b053ad" style={{ fontWeight: "bold" }}>
            {matricule}
          </Tag>
        </div>
      )
    },
    {
      title: "Employé",
      dataIndex: "nomComplet",
      key: "employe",
      width: 200,
      render: (nom, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <Avatar 
              size="small" 
              style={{ 
                backgroundColor: getDepartmentColor(record.departementNom),
                marginRight: 8 
              }}
              icon={<UserOutlined />}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: "14px" }}>{nom}</div>
              <div style={{ fontSize: "12px", color: "#5c2458", marginTop: 2 }}>
                <BankOutlined style={{ fontSize: "10px", marginRight: 4 }} />
                {record.departementNom || "Non affecté"}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Heures Travaillées",
      dataIndex: "totalHeureTravailleeEnHeures",
      key: "heuresTravaillees",
      width: 130,
      render: (heures) => (
        <div style={{ textAlign: "center" }}>
          <Statistic
            value={heures ? heures.toFixed(1) : 0}
            suffix="h"
            valueStyle={{ fontSize: "16px", color: "#b053ad" }}
          />
          <div style={{ fontSize: "11px", color: "#5c2458", marginTop: 2 }}>
            Temps total
          </div>
        </div>
      )
    },
    {
      title: "Retard",
      dataIndex: "totalRetardEnHeures",
      key: "retard",
      width: 110,
      render: (heures) => {
        const heuresFormatted = heures ? heures.toFixed(1) : 0;
        const isHigh = heures > 5;
        const isMedium = heures > 2;
        
        return (
          <div style={{ textAlign: "center" }}>
            <Badge
              status={isHigh ? "error" : isMedium ? "warning" : "default"}
              text={
                <span style={{ 
                  color: isHigh ? "#f5222d" : isMedium ? "#fa8c16" : "#5c2458",
                  fontWeight: isHigh ? "bold" : "normal",
                  fontSize: "14px"
                }}>
                  {heuresFormatted}h
                </span>
              }
            />
            <div style={{ fontSize: "11px", color: "#5c2458", marginTop: 2 }}>
              Cumulé
            </div>
          </div>
        );
      }
    },
    {
      title: "Heures Sup",
      dataIndex: "totalHeureSupEnHeures",
      key: "heuresSup",
      width: 110,
      render: (heures) => {
        const heuresFormatted = heures ? heures.toFixed(1) : 0;
        const isHigh = heures > 20;
        const isMedium = heures > 10;
        
        return (
          <div style={{ textAlign: "center" }}>
            <Badge
              status={isHigh ? "success" : isMedium ? "processing" : "default"}
              text={
                <span style={{ 
                  color: isHigh ? "#52c41a" : isMedium ? "#b053ad" : "#5c2458",
                  fontWeight: isHigh ? "bold" : "normal",
                  fontSize: "14px"
                }}>
                  {heuresFormatted}h
                </span>
              }
            />
            <div style={{ fontSize: "11px", color: "#5c2458", marginTop: 2 }}>
              Supplémentaires
            </div>
          </div>
        );
      }
    },
    {
      title: "Temps Effectif",
      dataIndex: "tempsEffectifEnHeures",
      key: "tempsEffectif",
      width: 140,
      render: (temps) => {
        const pourcentage = temps ? Math.min(100, (temps / 200) * 100) : 0;
        const isGood = pourcentage > 70;
        const isAverage = pourcentage > 50;
        
        return (
          <div style={{ textAlign: "center" }}>
            <Progress
              percent={pourcentage}
              size="small"
              strokeColor={isGood ? "#52c41a" : isAverage ? "#fa8c16" : "#f5222d"}
              showInfo={false}
              style={{ marginBottom: 4 }}
            />
            <div style={{ 
              fontSize: "14px", 
              fontWeight: 500,
              color: isGood ? "#52c41a" : isAverage ? "#fa8c16" : "#f5222d"
            }}>
              {temps ? temps.toFixed(1) : 0}h
            </div>
            <div style={{ fontSize: "11px", color: "#5c2458" }}>
              (Travail - Retard)
            </div>
          </div>
        );
      }
    },
    {
      title: "Congés Payés",
      key: "conges",
      width: 120,
      render: (_, record) => {
        const jours = record.totalJoursCongesTermines || 0;
        const conges = record.nombreCongesTermines || 0;
        
        let color = "default";
        let icon = null;
        
        if (jours > 20) {
          color = "red";
          icon = <CoffeeOutlined style={{ marginRight: 4 }} />;
        } else if (jours > 10) {
          color = "orange";
          icon = <CoffeeOutlined style={{ marginRight: 4 }} />;
        } else if (jours > 0) {
          color = "green";
          icon = <CoffeeOutlined style={{ marginRight: 4 }} />;
        }
        
        return (
          <div style={{ textAlign: "center" }}>
            <Tooltip title={`${conges} congé(s) pris`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
                <Tag color={color} style={{ fontSize: "12px", padding: "2px 8px" }}>
                  {jours} jours
                </Tag>
              </div>
            </Tooltip>
            <div style={{ fontSize: "11px", color: "#5c2458", marginTop: 2 }}>
              {conges} congé(s)
            </div>
          </div>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      width: 70,
      fixed: "right",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewEmployeeDetails(record)}
            size="small"
            // aria-label="Voir détails"
          />
        </div>
      )
    }
  ];

  // Cartes de statistiques
  const renderStatCards = () => {
    if (!statistiques) return null;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <div className="stat-card">
            <div className="stat-icon"><TeamOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.totalEmployes || 0}</div>
              <div className="stat-label">Total employés</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="stat-card">
            <div className="stat-icon"><ClockCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">
                {statistiques.totalHeuresTravaillees ? (statistiques.totalHeuresTravaillees / 60).toFixed(0) : 0}h
              </div>
              <div className="stat-label">Heures travaillées</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="stat-card">
            <div className="stat-icon"><CoffeeOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.totalJoursConges || 0} j</div>
              <div className="stat-label">Congés payés</div>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="stat-card">
            <div className="stat-icon"><BarChartOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">
                {statistiques.moyenneCongesParEmploye ? statistiques.moyenneCongesParEmploye.toFixed(1) : 0} j
              </div>
              <div className="stat-label">Moyenne congés / employé</div>
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  // Barre de filtres
  const renderFilterBar = () => (
    <Card className="ht-card" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={8}>
          <Search
            placeholder="Rechercher employé, matricule ou département..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onChange={e => setSearchTerm(e.target.value)}
            value={searchTerm}
            style={{ borderRadius: "6px" }}
          />
        </Col>
        
        <Col xs={24} md={6}>
          <Select
            style={{ width: "100%", borderRadius: "6px" }}
            placeholder="Filtrer par département"
            value={departementFilter}
            onChange={setDepartementFilter}
            allowClear
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Tous départements</Option>
            {departements.map(dept => (
              <Option key={dept.id} value={dept.id}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div 
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: getDepartmentColor(dept.nom),
                      marginRight: 8
                    }}
                  />
                  {dept.nom}
                </div>
              </Option>
            ))}
          </Select>
        </Col>
        
        <Col xs={24} md={6}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Select
              style={{ flex: 1, borderRadius: "6px" }}
              placeholder="Trier par"
              value={sortField}
              onChange={setSortField}
            >
              <Option value="heuresTravaillees">Heures travaillées</Option>
              <Option value="retard">Retard</Option>
              <Option value="heuresSup">Heures supplémentaires</Option>
              <Option value="tempsEffectif">Temps effectif</Option>
              <Option value="conges">Congés payés</Option>
              <Option value="nom">Nom</Option>
              <Option value="departement">Département</Option>
            </Select>
            
            <Button
              icon={sortOrder === "desc" ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              shape="circle"
            />
          </div>
        </Col>
        
        <Col xs={24} md={4}>
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exportLoading}
              size="middle"
              className="unified-btn"
            >
              Exporter
            </Button>

            <Button
              icon={<ExportOutlined />}
              onClick={fetchData}
              size="middle"
              className="unified-btn"
            >
              Actualiser
            </Button>
          </div>
        </Col>
      </Row>
      
      {/* Info sur le filtre actuel */}
      {departementFilter !== "all" && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "#f9f1f8", borderRadius: "4px" }}>
          <Text type="secondary">
            Filtre actuel: <Text strong>{getDepartementNomById(departementFilter)}</Text>
            {searchTerm && ` | Recherche: "${searchTerm}"`}
            {` | ${filteredData.length} employé(s) trouvé(s)`}
          </Text>
        </div>
      )}
    </Card>
  );

  // Modal de détails employé
  const renderEmployeeModal = () => (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar 
            style={{ 
              backgroundColor: selectedEmployee ? getDepartmentColor(selectedEmployee.departementNom) : '#b053ad',
              marginRight: 12
            }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{selectedEmployee?.nomComplet}</div>
            <div style={{ fontSize: "12px", color: "#5c2458" }}>
              {selectedEmployee?.matricule} • {selectedEmployee?.departementNom}
            </div>
          </div>
        </div>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setModalVisible(false)}>
          Fermer
        </Button>
      ]}
      width={500}
    >
      {selectedEmployee && (
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="Heures Travaillées" style={{ height: "100%" }}>
              <Statistic
                value={selectedEmployee.totalHeureTravailleeEnHeures?.toFixed(1) || 0}
                suffix="h"
                valueStyle={{ fontSize: "24px", color: "#b053ad" }}
              />
              <div style={{ fontSize: "12px", color: "#5c2458", marginTop: 4 }}>
                Total minutes: {selectedEmployee.totalHeureTravaillee || 0}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Retard" style={{ height: "100%" }}>
              <Statistic
                value={selectedEmployee.totalRetardEnHeures?.toFixed(1) || 0}
                suffix="h"
                valueStyle={{ 
                  fontSize: "24px",
                  color: selectedEmployee.totalRetardEnHeures > 5 ? "#f5222d" : "#fa8c16"
                }}
              />
              <div style={{ fontSize: "12px", color: "#5c2458", marginTop: 4 }}>
                {selectedEmployee.pourcentageRetard?.toFixed(1) || 0}% du temps
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Heures Supplémentaires" style={{ height: "100%" }}>
              <Statistic
                value={selectedEmployee.totalHeureSupEnHeures?.toFixed(1) || 0}
                suffix="h"
                valueStyle={{ 
                  fontSize: "24px",
                  color: selectedEmployee.totalHeureSupEnHeures > 20 ? "#52c41a" : "#b053ad"
                }}
              />
              <div style={{ fontSize: "12px", color: "#5c2458", marginTop: 4 }}>
                {selectedEmployee.pourcentageHeureSup?.toFixed(1) || 0}% du temps
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Temps Effectif" style={{ height: "100%" }}>
              <Statistic
                value={selectedEmployee.tempsEffectifEnHeures?.toFixed(1) || 0}
                suffix="h"
                valueStyle={{ fontSize: "24px", color: "#52c41a" }}
              />
              <div style={{ fontSize: "12px", color: "#5c2458", marginTop: 4 }}>
                (Heures - Retard)
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Card size="small" title="Congés Payés" style={{ marginTop: 8 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#5c2458", marginBottom: 4 }}>
                      Nombre de congés
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#b053ad" }}>
                      {selectedEmployee.nombreCongesTermines || 0}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#5c2458", marginBottom: 4 }}>
                      Jours totaux
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fa8c16" }}>
                      {selectedEmployee.totalJoursCongesTermines || 0}
                      <span style={{ fontSize: "14px", color: "#5c2458", marginLeft: 4 }}>jours</span>
                    </div>
                  </div>
                </Col>
              </Row>
              {selectedEmployee.dateDernierCongeTermine && (
                <div style={{ 
                  marginTop: 12, 
                  padding: "8px", 
                  backgroundColor: "#f6ffed",
                  borderRadius: "4px",
                  fontSize: "12px",
                  textAlign: "center"
                }}>
                  Dernier congé: <strong>{new Date(selectedEmployee.dateDernierCongeTermine).toLocaleDateString('fr-FR')}</strong>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </Modal>
  );

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "500px" 
      }}>
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Erreur"
        description={error}
        showIcon
        style={{ margin: "20px" }}
        action={
          <Button size="small" onClick={fetchData} className="unified-btn">
            Réessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="heure-travaillee-page" style={{ padding: "24px" }}>
      <Card className="ht-card" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 0, color: '#3a1438' }}>
        <BarChartOutlined style={{ marginRight: 12, color: "#b053ad" }} />
        Tableau de Bord Présence
      </Title>
      </Card>

      {renderStatCards()}
      {renderFilterBar()}
      
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              Liste des Employés
              <Text type="secondary" style={{ marginLeft: 12, fontSize: "14px" }}>
                {filteredData.length} employé(s)
              </Text>
            </span>
            <div style={{ fontSize: "12px", color: "#5c2458" }}>
              Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
        }
        className="ht-card"
      >
        {filteredData.length === 0 ? (
          <Empty
            description={
              searchTerm || departementFilter !== "all" ?
                "Aucun employé ne correspond aux critères" :
                "Aucune donnée disponible"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {(searchTerm || departementFilter !== "all") && (
              <Button 
                type="link" 
                onClick={() => {
                  setSearchTerm("");
                  setDepartementFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="idEmploye"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} sur ${total} employés`
            }}
            scroll={{ x: 1100 }}
            size="middle"
            style={{ borderRadius: "6px" }}
          />
        )}
      </Card>
      
      {renderEmployeeModal()}
      
      {/* Légende */}
      <div style={{ 
        marginTop: 24, 
        padding: "16px", 
        backgroundColor: "#f9f1f8",
        border: "1px solid #f9f1f8",
        borderRadius: "8px",
        fontSize: "12px"
      }}>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={8}>
            <div style={{ fontWeight: "500", marginBottom: 4 }}>Indicateurs</div>
            <div><Badge status="warning" text="Retard 2-5h" /></div>
            <div><Badge status="error" text="Retard > 5h" /></div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ fontWeight: "500", marginBottom: 4 }}>Heures supplémentaires</div>
            <div><Badge status="processing" text="10-20h" /></div>
            <div><Badge status="success" text="> 20h" /></div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ fontWeight: "500", marginBottom: 4 }}>Congés payés</div>
            <div><Tag color="green" style={{ margin: "2px" }}>≤ 10j</Tag></div>
            <div><Tag color="orange" style={{ margin: "2px" }}>10-20j</Tag></div>
            <div><Tag color="red" style={{ margin: "2px" }}>> 20j</Tag></div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PointageDashboard;