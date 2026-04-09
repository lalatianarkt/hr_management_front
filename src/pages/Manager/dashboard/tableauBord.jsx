import React, { useEffect, useState } from "react";
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
  message
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CoffeeOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  RiseOutlined,
  TeamOutlined,
  WarningOutlined
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
  YAxis
} from "recharts";

dayjs.locale("fr");

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
    const stored = sessionStorage.getItem("departement") || sessionStorage.getItem("dÃ©partement");
    if (stored) return stored;
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return "DÃ©partement";
    const user = JSON.parse(userStr);
    return (
      user?.departement?.nom ||
      user?.infosPro?.departement?.nom ||
      user?.infosPro?.poste?.departement?.nom ||
      "DÃ©partement"
    );
  } catch (error) {
    return "DÃ©partement";
  }
};

const TableauBordManager = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [kpiModalVisible, setKpiModalVisible] = useState(false);

  const [dateDebut, setDateDebut] = useState(() =>
    dayjs().subtract(1, "month").startOf("month")
  );
  const [dateFin, setDateFin] = useState(() =>
    dayjs().subtract(1, "month").endOf("month")
  );

  const departementId = getDepartementId();
  const departementNom = getDepartementNom();

  const kpiColors = {
    success: "var(--status-success)",
    warning: "var(--status-warning)",
    danger: "var(--status-error)",
    info: "var(--status-info)",
    accent: "var(--status-accent)"
  };

  useEffect(() => {
    if (dateDebut && dateFin) {
      fetchDashboardData();
    }
  }, [dateDebut, dateFin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const url = `/api/dashboard/manager?dateDebut=${dateDebut.format(
        "YYYY-MM-DD"
      )}&dateFin=${dateFin.format("YYYY-MM-DD")}`;

      const response = await axiosInstance.get(url);
      setDashboardData(response.data);
      message.success("DonnÃ©es actualisÃ©es");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const applyPreset = (preset) => {
    let newDateDebut;
    let newDateFin;

    switch (preset) {
      case "mois_courant":
        newDateDebut = dayjs().startOf("month");
        newDateFin = dayjs().endOf("month");
        break;
      case "mois_precedent":
        newDateDebut = dayjs().subtract(1, "month").startOf("month");
        newDateFin = dayjs().subtract(1, "month").endOf("month");
        break;
      case "trimestre_courant":
        newDateDebut = dayjs().startOf("quarter");
        newDateFin = dayjs().endOf("quarter");
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
      { ...dashboardData.congesPris, icone: "coffee" },
      { ...dashboardData.heuresTravaillees, icone: "clock-circle" },
      { ...dashboardData.heuresSupplementaires, icone: "plus-circle" },
      { ...dashboardData.retardsCumules, icone: "exclamation-circle" },
      { ...dashboardData.evaluation, icone: "rise" }
    ].filter((kpi) => kpi != null && kpi.titre);

    return (
      <Row gutter={[20, 20]}>
        {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              className="kpi-card-premium"
              hoverable
              onClick={() => handleKpiClick(kpi)}
              bodyStyle={{ padding: "20px" }}
              style={{ height: "100%", borderRadius: "20px" }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <div
                  className="icon-wrapper-premium"
                  style={{
                    backgroundColor: `${kpiColors[kpi.couleur] || kpiColors.info}15`,
                    color: kpiColors[kpi.couleur] || kpiColors.info
                  }}
                >
                  {getKpiIcon(kpi.icone, kpiColors[kpi.couleur] || kpiColors.info)}
                </div>
                <div style={{ marginLeft: 16 }}>
                  <Text
                    strong
                    style={{
                      fontSize: "14px",
                      color: "var(--color-text-muted)",
                      display: "block"
                    }}
                  >
                    {kpi.titre}
                  </Text>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: "var(--color-dark)" }}>
                    {formatKPIValue(kpi.valeur, kpi.unite)}
                  </Title>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  {kpi.variation !== undefined && kpi.variation !== 0 && (
                    <Tag
                      color={kpi.variation > 0 ? "success" : "error"}
                      style={{
                        borderRadius: "20px",
                        border: "none",
                        padding: "2px 10px",
                        fontWeight: "bold",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {kpi.variation > 0 ? "+" : ""}
                      {Math.abs(kpi.variation).toFixed(1)}
                    </Tag>
                  )}
                </div>
                <InfoCircleOutlined style={{ color: "#e1b2db" }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderCourbes = () => {
    const tendances = dashboardData?.tendances || [];
    if (tendances.length === 0) {
      return <Empty description="Aucune donnée de tendance disponible" />;
    }

    const data = tendances.map((t) => ({
      mois: t.mois,
      heures: Number(t.heuresTravaillees || 0),
      retards: Number(t.retards || 0)
    }));

    return (
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="mois"
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <RechartsTooltip
              formatter={(value, name) => {
                if (name === "Heures travaillées") return [`${value} h`, name];
                if (name === "Retards") return [`${value} h`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="heures"
              name="Heures travaillées"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="retards"
              name="Retards"
              stroke="#f5222d"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "500px" }}>
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
            RÃ©essayer
          </Button>
        }
        style={{ margin: "24px" }}
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <BarChartOutlined style={{ marginRight: 12, color: "#b053ad" }} />
              Tableau de Bord Manager
            </Title>
            <Text type="secondary" style={{ fontSize: "16px", fontWeight: "500" }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {departementNom} â€¢ PÃ©riode du {getPeriodeDisplay()}
            </Text>
          </Col>
          <Col>
            <Space>
              <Button onClick={() => applyPreset("mois_courant")}>Mois en cours</Button>
              <Button onClick={() => applyPreset("mois_precedent")}>Mois prÃ©cÃ©dent</Button>
              <Button onClick={() => applyPreset("trimestre_courant")}>Trimestre</Button>
              <RangePicker
                value={[dateDebut, dateFin]}
                onChange={(dates) => {
                  if (dates) {
                    setDateDebut(dates[0]);
                    setDateFin(dates[1]);
                  }
                }}
                format="DD/MM/YYYY"
                placeholder={["Date dÃ©but", "Date fin"]}
                allowClear={false}
              />
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Actualiser
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <TeamOutlined style={{ marginRight: 8, color: "#b053ad" }} />
            Indicateurs du dÃ©partement
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        {renderKPICards()}
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <BarChartOutlined style={{ marginRight: 8, color: "#13c2c2" }} />
            Heures travaillées & retards
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        {renderCourbes()}
      </Card>

      <Modal
        title={selectedKPI?.titre}
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
            <Title level={3}>{formatKPIValue(selectedKPI.valeur, selectedKPI.unite)}</Title>
            <Text>{selectedKPI.description}</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

const getKpiIcon = (iconName, color) => {
  const icons = {
    team: <TeamOutlined style={{ color }} />,
    "check-circle": <CheckCircleOutlined style={{ color }} />,
    warning: <WarningOutlined style={{ color }} />,
    "clock-circle": <ClockCircleOutlined style={{ color }} />,
    coffee: <CoffeeOutlined style={{ color }} />,
    "plus-circle": <PlusCircleOutlined style={{ color }} />,
    "exclamation-circle": <ExclamationCircleOutlined style={{ color }} />,
    rise: <RiseOutlined style={{ color }} />
  };
  return icons[iconName] || <BarChartOutlined style={{ color }} />;
};

const formatKPIValue = (value, unit) => {
  if (typeof value === "number") {
    if (unit === "%") {
      return `${value.toFixed(1)}${unit}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString("fr-FR");
  }
  return value;
};

export default TableauBordManager;
