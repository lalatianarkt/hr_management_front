import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../utils/AxiosInstance";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  Progress,
  Tooltip,
  Badge,
  Avatar,
  Statistic
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  TeamOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

dayjs.locale("fr");

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const kpiColors = {
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  accent: "#8b5cf6"
};

const getDepartementId = () => {
  try {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return "";

    const user = JSON.parse(userStr);
    return (
      user?.departement?.id ||
      user?.infosPro?.departement?.id ||
      user?.infosPro?.poste?.departement?.id ||
      ""
    );
  } catch (error) {
    return "";
  }
};

const getDepartementNom = () => {
  try {
    const stored =
      sessionStorage.getItem("departement") ||
      sessionStorage.getItem("département");

    if (stored) return stored;

    const userStr = sessionStorage.getItem("user");
    if (!userStr) return "Département";

    const user = JSON.parse(userStr);
    return (
      user?.departement?.nom ||
      user?.infosPro?.departement?.nom ||
      user?.infosPro?.poste?.departement?.nom ||
      "Département"
    );
  } catch (error) {
    return "Département";
  }
};

const getKpiMeta = (kpi) => {
  const titre = (kpi?.titre || "").toLowerCase();

  if (titre.includes("effectif")) {
    return { title: "Effectif", subtitle: "Employés actifs" };
  }

  if (titre.includes("présence") || titre.includes("presence")) {
    return { title: "Taux présence", subtitle: "Présence du département" };
  }

  if (titre.includes("absent")) {
    return { title: "Absentéisme", subtitle: "Absences du département" };
  }

  if (titre.includes("heures travaill")) {
    return { title: "Heures travaillées", subtitle: "Sur la période" };
  }

  if (titre.includes("suppl")) {
    return { title: "Heures supp.", subtitle: "Sur la période" };
  }

  if (titre.includes("congé") || titre.includes("conge")) {
    return { title: "Congés pris", subtitle: "Jours sur la période" };
  }

  if (titre.includes("retard")) {
    return { title: "Retards", subtitle: "Nombre total de retards" };
  }

  return {
    title: kpi?.titre || "Indicateur",
    subtitle: kpi?.description || kpi?.unite || "Indicateur"
  };
};

const getKpiIcon = (iconName, color) => {
  const icons = {
    team: <TeamOutlined style={{ color }} />,
    "check-circle": <CheckCircleOutlined style={{ color }} />,
    warning: <WarningOutlined style={{ color }} />,
    "clock-circle": <ClockCircleOutlined style={{ color }} />,
    coffee: <CoffeeOutlined style={{ color }} />,
    "plus-circle": <PlusCircleOutlined style={{ color }} />,
    rise: <RiseOutlined style={{ color }} />,
    "exclamation-circle": <ExclamationCircleOutlined style={{ color }} />
  };

  return icons[iconName] || <BarChartOutlined style={{ color }} />;
};

const formatKPIValue = (value, unit) => {
  if (typeof value === "number") {
    if (unit === "%") {
      return `${value.toFixed(1)}${unit}`;
    }

    if (
      unit &&
      ["h", "heure", "heures", "jour", "jours"].includes(String(unit).toLowerCase())
    ) {
      return `${value.toLocaleString("fr-FR")} ${unit}`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }

    return value.toLocaleString("fr-FR");
  }

  return value;
};

const TableauBordManager = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [kpiModalVisible, setKpiModalVisible] = useState(false);
  const [dateDebut, setDateDebut] = useState(() =>
    dayjs().subtract(3, "month").startOf("month")
  );
  const [dateFin, setDateFin] = useState(() =>
    dayjs().subtract(1, "month").endOf("month")
  );

  const departementId = getDepartementId();
  const departementNom = getDepartementNom();

  const fetchDashboardData = useCallback(async ({ notify = false } = {}) => {
    try {
      setLoading(true);
      setError("");

      if (!dateDebut || !dateFin) {
        setError("Les dates de début et de fin sont obligatoires.");
        return;
      }

      if (dayjs(dateDebut).isAfter(dayjs(dateFin))) {
        setError("La date de début doit être antérieure à la date de fin.");
        return;
      }

      const response = await axiosInstance.get("/api/dashboard/manager", {
        params: {
          dateDebut: dayjs(dateDebut).format("YYYY-MM-DD"),
          dateFin: dayjs(dateFin).format("YYYY-MM-DD")
        }
      });
      setDashboardData(response.data);

      if (notify) {
        message.success("Données actualisées");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors du chargement du tableau de bord";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin]);

  useEffect(() => {
    if (dateDebut && dateFin) {
      fetchDashboardData();
    }
  }, [dateDebut, dateFin, fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData({ notify: true });
  };

  const applyPreset = (preset) => {
    let newDateDebut;
    let newDateFin;

    switch (preset) {
      case "trois_derniers_mois":
        newDateDebut = dayjs().subtract(3, "month").startOf("month");
        newDateFin = dayjs().subtract(1, "month").endOf("month");
        break;
      case "mois_courant":
        newDateDebut = dayjs().startOf("month");
        newDateFin = dayjs().endOf("month");
        break;
      case "mois_precedent":
        newDateDebut = dayjs().subtract(1, "month").startOf("month");
        newDateFin = dayjs().subtract(1, "month").endOf("month");
        break;
      default:
        return;
    }

    setDateDebut(newDateDebut);
    setDateFin(newDateFin);
  };

  const getPeriodeDisplay = () => {
    if (dateDebut && dateFin) {
      return `${dateDebut.format("DD/MM/YYYY")} - ${dateFin.format("DD/MM/YYYY")}`;
    }

    return "";
  };

  const handleKpiClick = (kpi) => {
    setSelectedKPI(kpi);
    setKpiModalVisible(true);
  };

  const renderKPICards = () => {
    if (!dashboardData) return null;

    const kpis = [
      { ...dashboardData.effectifTotal, icone: "team" },
      { ...dashboardData.tauxPresence, icone: "check-circle" },
      { ...dashboardData.tauxAbsenteeisme, icone: "warning" },
      { ...dashboardData.heuresTravaillees, icone: "clock-circle" },
      { ...dashboardData.heuresSupplementaires, icone: "plus-circle" },
      { ...dashboardData.congesPris, icone: "coffee" },
      { ...dashboardData.retardsCumules, icone: "exclamation-circle" }
    ].filter((kpi) => kpi != null && kpi.titre);

    return (
      <Row gutter={[12, 12]}>
        {kpis.map((kpi, index) => {
          const color = kpiColors[kpi.couleur] || kpiColors.info;
          const meta = getKpiMeta(kpi);

          return (
            <Col xs={24} sm={12} md={6} lg={4} xl={3} key={index} style={{ display: "flex" }}>
              <Card
                hoverable
                onClick={() => handleKpiClick(kpi)}
                style={{ 
                  borderRadius: "12px",
                  width: "100%",
                  height: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                bodyStyle={{
                  padding: 10,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      backgroundColor: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16
                    }}
                  >
                    {getKpiIcon(kpi.icone, color)}
                  </div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap" }}
                  >
                    {meta.title}
                  </Text>
                  <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.15, whiteSpace: "nowrap" }}>
                    {formatKPIValue(kpi.valeur, kpi.unite)}
                  </div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 10, lineHeight: 1.2, whiteSpace: "nowrap" }}
                  >
                    {meta.subtitle}
                  </Text>
                  {kpi.variation !== undefined && kpi.variation !== 0 && (
                    <Tag 
                      color={kpi.variation > 0 ? "success" : "error"}
                      style={{ 
                        borderRadius: 20,
                        border: "none",
                        padding: "0 8px",
                        fontWeight: "bold",
                        fontSize: 10,
                        lineHeight: "18px"
                      }}
                    >
                      {kpi.variation > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      <span style={{ marginLeft: 4 }}>{Math.abs(kpi.variation).toFixed(1)}%</span>
                    </Tag>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const renderCourbes = () => {
    const tendances = dashboardData?.tendances || [];

    if (tendances.length === 0) {
      return <Empty description="Aucune donnée de tendance disponible" />;
    }

    const data = tendances.map((tendance) => ({
      mois: tendance.mois,
      heures: Number(tendance.heuresTravaillees || 0),
      retards: Number(tendance.retards || 0),
      conges: Number(tendance.conges || 0)
    }));

    return (
      <div style={{ height: 400, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#64748b" }} />
            <RechartsTooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="heures"
              name="Heures travaillées"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="retards"
              name="Retards"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTopEmployes = () => {
    const tops = dashboardData?.topPerformers || dashboardData?.topEmployes || [];

    if (tops.length === 0) {
      return <Empty description="Aucune donnée disponible" />;
    }

    return (
      <div>
        {tops.slice(0, 5).map((employe, index) => (
          <div key={index} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Badge count={employe.rang || index + 1} style={{ backgroundColor: "#f59e0b" }} />
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#8b5cf6" }} />
                <div>
                  <Text strong>{employe.nomComplet || employe.nom || employe.employeNom}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {employe.matricule || employe.code} • {employe.departement || employe.service}
                  </Text>
                </div>
              </div>
              <Tag color="success" style={{ fontSize: "16px", fontWeight: "bold" }}>
                {employe.heures || employe.valeur || employe.totalHeures} h
              </Tag>
            </div>
            <Progress 
              percent={((employe.heures || employe.valeur || 0) / 168) * 100} 
              size="small" 
              strokeColor="#22c55e" 
            />
          </div>
        ))}
      </div>
    );
  };

  const renderRepartitionServices = () => {
    const data = dashboardData?.repartitionServices || 
                 dashboardData?.statsEffectif?.parDepartement ||
                 dashboardData?.effectifParDepartement;

    if (!data || Object.keys(data).length === 0) {
      return <Empty description="Aucune donnée disponible" />;
    }

    const chartData = Array.isArray(data) 
      ? data 
      : Object.entries(data).map(([name, value]) => ({ name, value }));

    const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#06b6d4"];

    return (
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderRetardsParService = () => {
    const data = dashboardData?.retardsParService || 
                 dashboardData?.statsPointage?.retardsParDepartement ||
                 dashboardData?.retardsParDepartement;

    if (!data || Object.keys(data).length === 0) {
      return <Empty description="Aucune donnée disponible" />;
    }

    const chartData = Array.isArray(data) 
      ? data 
      : Object.entries(data).map(([name, retards]) => ({ name, retards }));

    return (
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <RechartsTooltip />
            <Bar dataKey="retards" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "500px"
        }}
      >
        <Spin size="large" tip="Chargement du tableau de bord..." />
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
        action={
          <Button size="small" onClick={fetchDashboardData}>
            Réessayer
          </Button>
        }
        style={{ margin: "24px" }}
      />
    );
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* En-tête */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <div>
              <Text type="secondary" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Pilotage manager
              </Text>
              <Title level={2} style={{ margin: "8px 0 4px 0" }}>
                <BarChartOutlined style={{ marginRight: "12px", color: "#8b5cf6" }} />
                Tableau de Bord Manager
              </Title>
              <Text type="secondary">
                <CalendarOutlined style={{ marginRight: "8px" }} />
                {departementNom || departementId || "Département"} • Période du {getPeriodeDisplay()}
              </Text>
            </div>
          </Col>

          <Col>
            <Space wrap>
              <Button onClick={() => applyPreset("trois_derniers_mois")}>
                3 derniers mois
              </Button>
              <Button onClick={() => applyPreset("mois_courant")}>
                Mois en cours
              </Button>
              <Button onClick={() => applyPreset("mois_precedent")}>
                Mois précédent
              </Button>
              <RangePicker
                value={[dateDebut, dateFin]}
                onChange={(dates) => {
                  if (dates) {
                    setDateDebut(dates[0]);
                    setDateFin(dates[1]);
                  }
                }}
                format="DD/MM/YYYY"
                placeholder={["Date début", "Date fin"]}
                allowClear={false}
              />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={{ backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }}
              >
                Actualiser
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Cartes KPI */}
      <div style={{ marginBottom: "24px" }}>
        {renderKPICards()}
      </div>

      {/* Graphique d'évolution */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <RiseOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
            <span>Évolution des heures travaillées et des retards</span>
          </div>
        }
        style={{ marginBottom: "24px", borderRadius: "12px" }}
      >
        {renderCourbes()}
      </Card>

      {/* Top employés et répartition */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <TrophyOutlined style={{ marginRight: "8px", color: "#f59e0b" }} />
                <span>Top employés (heures travaillées)</span>
              </div>
            }
            style={{ height: "100%", borderRadius: "12px" }}
          >
            {renderTopEmployes()}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <TeamOutlined style={{ marginRight: "8px", color: "#8b5cf6" }} />
                <span>Répartition par service</span>
              </div>
            }
            style={{ height: "100%", borderRadius: "12px" }}
          >
            {renderRepartitionServices()}
          </Card>
        </Col>
      </Row>

      {/* Retards par service */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <WarningOutlined style={{ marginRight: "8px", color: "#ef4444" }} />
            <span>Retards par service</span>
          </div>
        }
        style={{ marginBottom: "24px", borderRadius: "12px" }}
      >
        {renderRetardsParService()}
      </Card>

      {/* Modal de détail KPI */}
      <Modal
        title={selectedKPI ? getKpiMeta(selectedKPI).title : "Détail"}
        open={kpiModalVisible}
        onCancel={() => setKpiModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setKpiModalVisible(false)}>
            Fermer
          </Button>
        ]}
      >
        {selectedKPI && (
          <div>
            <Statistic
              value={selectedKPI.valeur}
              suffix={selectedKPI.unite}
              valueStyle={{ fontSize: "32px", color: kpiColors[selectedKPI.couleur] }}
            />
            <div style={{ marginTop: "16px" }}>
              <Text type="secondary">{getKpiMeta(selectedKPI).subtitle}</Text>
            </div>
            {selectedKPI.variation !== undefined && (
              <div style={{ marginTop: "16px" }}>
                <Tag color={selectedKPI.variation > 0 ? "success" : "error"}>
                  {selectedKPI.variation > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  Variation : {Math.abs(selectedKPI.variation).toFixed(1)}%
                </Tag>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Footer */}
      <div style={{
        marginTop: "24px",
        padding: "16px",
        backgroundColor: "#f1f5f9",
        borderRadius: "12px",
        fontSize: "12px",
        color: "#475569",
        textAlign: "center"
      }}>
        <Text type="secondary">
          📊 Données en temps réel • Dernière mise à jour : {dayjs().format("DD/MM/YYYY HH:mm:ss")}
        </Text>
      </div>
    </div>
  );
};

export default TableauBordManager;
