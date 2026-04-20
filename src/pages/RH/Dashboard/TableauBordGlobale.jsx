import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import axiosInstance from "../../utils/AxiosInstance";
import {
  Card, Row, Col, Statistic, Progress, Table, Tag, Button,
  Select, DatePicker, Space, Alert, Spin, Typography, Badge,
  Avatar, List, Divider, Tooltip, Modal, Descriptions,
  Collapse, Radio, Timeline, Empty, message, Popover, Switch
} from "antd";
import {
  TeamOutlined, CheckCircleOutlined, WarningOutlined,
  ClockCircleOutlined, CoffeeOutlined, DollarOutlined,
  PlusCircleOutlined, ExclamationCircleOutlined,
  BarChartOutlined, CalendarOutlined, DownloadOutlined,
  EyeOutlined, FilterOutlined, ReloadOutlined,
  InfoCircleOutlined,
  UserOutlined, TrophyOutlined, BellOutlined, HistoryOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

dayjs.locale("fr");

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const palette = [
  "#8b5cf6", "#f97316", "#22c55e", "#3b82f6",
  "#ec4899", "#f59e0b", "#10b981", "#ef4444"
];

const DashboardContent = React.memo(function DashboardContent({
  dashboardData,
  periodeDisplay,
  dateDebut,
  dateFin,
  onApplyPreset,
  onRangeChange,
  onRefresh,
  onExport,
  kpiCards,
  topEmployes,
  demandesConges,
  retardsCourbe,
  repartitionDepartement,
  retardsParDepartement
}) {
  return (
    <div style={{ padding: "24px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1e293b" }}>
              <BarChartOutlined style={{ marginRight: 12, color: "#8b5cf6" }} />
              Tableau de Bord RH
            </Title>
            <Text type="secondary" style={{ fontSize: "16px", fontWeight: "500", display: "block", marginTop: 8 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Période du {periodeDisplay} • {dashboardData?.effectifTotal?.valeur ?? "..."} employés actifs
            </Text>
          </Col>
          <Col>
            <Space>
              <Button onClick={() => onApplyPreset("trois_derniers_mois")}>3 derniers mois</Button>
              <Button onClick={() => onApplyPreset("mois_courant")}>Mois en cours</Button>
              <Button onClick={() => onApplyPreset("mois_precedent")}>Mois précédent</Button>

              <RangePicker
                value={[dateDebut, dateFin]}
                onChange={onRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Date début", "Date fin"]}
                allowClear={false}
              />

              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                Actualiser
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={onExport}
                style={{ backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }}
              >
                Exporter
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* KPIs */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <TrophyOutlined style={{ marginRight: 8, color: "#8b5cf6" }} />
            Indicateurs Clés de Performance
            <Text type="secondary" style={{ marginLeft: 12, fontSize: "14px" }}>
              {dayjs().format("HH:mm")}
            </Text>
          </div>
        }
        size="small"
        style={{ marginBottom: 20, borderRadius: 12 }}
      >
        {kpiCards}
      </Card>

      {/* Deuxième ligne : Tops Employés et Demandes de congés */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <TrophyOutlined style={{ marginRight: 8, color: "#f59e0b" }} />
                Top Employés (Heures travaillées)
              </div>
            }
            style={{ height: "100%", borderRadius: 12 }}
          >
            {topEmployes}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <ClockCircleOutlined style={{ marginRight: 8, color: "#3b82f6" }} />
                Demandes de congés en attente
              </div>
            }
            style={{ height: "100%", borderRadius: 12 }}
          >
            {demandesConges}
          </Card>
        </Col>
      </Row>

      {/* Troisième ligne : Évolution des retards + Répartition par département (côte à côte) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <ExclamationCircleOutlined style={{ marginRight: 8, color: "#ef4444" }} />
                Évolution des retards (3 derniers mois)
              </div>
            }
            style={{ height: "100%", borderRadius: 12 }}
          >
            {retardsCourbe}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <PieChartOutlined style={{ marginRight: 8, color: "#ec4899" }} />
                Répartition par Département
              </div>
            }
            style={{ height: "100%", borderRadius: 12 }}
          >
            {repartitionDepartement}
          </Card>
        </Col>
      </Row>

      {/* Quatrième ligne : Retards par département */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <ClockCircleOutlined style={{ marginRight: 8, color: "#ef4444" }} />
                Retards par Département
              </div>
            }
            style={{ borderRadius: 12 }}
          >
            {retardsParDepartement}
          </Card>
        </Col>
      </Row>

      {/* Footer info */}
      <div
        style={{
          marginTop: 24,
          padding: "16px",
          backgroundColor: "#f1f5f9",
          borderRadius: "12px",
          fontSize: "12px",
          color: "#475569"
        }}
      >
        <Row justify="space-between">
          <Col>
            <Text>📅 Période d'analyse : {periodeDisplay}</Text>
          </Col>
          <Col>
            <Text>🕐 Dernière mise à jour: {dayjs().format("DD/MM/YYYY HH:mm:ss")}</Text>
          </Col>
        </Row>
      </div>
    </div>
  );
});

const TableauBordGlobale = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dates pour les 3 derniers mois
  const [dateDebut, setDateDebut] = useState(() => 
    dayjs().subtract(3, 'month').startOf('month')
  );
  const [dateFin, setDateFin] = useState(() => 
    dayjs().subtract(1, 'month').endOf('month')
  );
  
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [kpiModalVisible, setKpiModalVisible] = useState(false);

  const kpiColors = React.useMemo(() => ({
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    accent: "#8b5cf6"
  }), []);

  const fetchDashboardData = React.useCallback(async (startDate = dateDebut, endDate = dateFin) => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/api/dashboard/periode", {
        params: {
          dateDebut: dayjs(startDate).format("YYYY-MM-DD"),
          dateFin: dayjs(endDate).format("YYYY-MM-DD"),
        },
      });

      setDashboardData(response.data);
    } catch (e) {
      const messageErreur =
        e?.response?.data?.message ||
        e?.message ||
        "Erreur lors du chargement du tableau de bord";
      setError(messageErreur);
      message.error(messageErreur);
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin]);

  useEffect(() => {
    fetchDashboardData(dateDebut, dateFin);
  }, [dateDebut, dateFin, fetchDashboardData]);

  const handleRefresh = React.useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = React.useCallback(async () => {
    message.info("Export non implémenté pour le moment");
  }, []);

  const handleKpiClick = React.useCallback((kpi) => {
    // Rend l'ouverture du modal immédiate (évite un "paint" retardé jusqu'au prochain event souris).
    flushSync(() => {
      setSelectedKPI(kpi);
      setKpiModalVisible(true);
    });
  }, []);

  const handleModalAfterOpenChange = React.useCallback((open) => {
    if (!open) return;
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }, []);

  const applyPreset = React.useCallback((preset) => {
    let newDateDebut, newDateFin;
    
    switch(preset) {
      case "trois_derniers_mois":
        newDateDebut = dayjs().subtract(3, 'month').startOf('month');
        newDateFin = dayjs().subtract(1, 'month').endOf('month');
        break;
      case "mois_courant":
        newDateDebut = dayjs().startOf('month');
        newDateFin = dayjs().endOf('month');
        break;
      case "mois_precedent":
        newDateDebut = dayjs().subtract(1, 'month').startOf('month');
        newDateFin = dayjs().subtract(1, 'month').endOf('month');
        break;
      default:
        return;
    }
    
    setDateDebut(newDateDebut);
    setDateFin(newDateFin);
  }, []);

  const periodeDisplay = React.useMemo(() => {
    if (dateDebut && dateFin) {
      return `${dateDebut.format("DD/MM/YYYY")} - ${dateFin.format("DD/MM/YYYY")}`;
    }
    return "";
  }, [dateDebut, dateFin]);

  const handleRangeChange = React.useCallback((dates) => {
    if (dates) {
      setDateDebut(dates[0]);
      setDateFin(dates[1]);
    }
  }, []);

  // Rendu des cartes KPI
  const renderKPICards = () => {
    if (!dashboardData) return null;

    const kpis = [
      { ...dashboardData.effectifTotal, icône: 'team' },
      { ...dashboardData.tauxPresence, icône: 'check-circle' },
      { ...dashboardData.tauxAbsenteeisme, icône: 'warning' },
      { ...dashboardData.congesPris, icône: 'coffee' },
      { ...dashboardData.heuresTravaillees, icône: 'clock-circle' },
      { ...dashboardData.masseSalariale, icône: 'dollar' },
      { ...dashboardData.heuresSupplementaires, icône: 'plus-circle' },
      { ...dashboardData.retardsCumules, icône: 'exclamation-circle' }
    ].filter(kpi => kpi != null && kpi.titre);

    return (
      <Row gutter={[12, 12]}>
          {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} md={6} lg={4} xl={3} key={index} style={{ display: "flex" }}>
            <Card
              className="kpi-card-premium"
              hoverable
              size="small"
              onClick={() => handleKpiClick(kpi)}
                bodyStyle={{
                  padding: 10,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center"
                }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 12,
                aspectRatio: "1 / 1",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: 6 }}>
                  <div
                    className="icon-wrapper-premium"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${kpiColors[kpi.couleur] || kpiColors.info}15`,
                      color: kpiColors[kpi.couleur] || kpiColors.info
                    }}
                    >
                      {getKpiIcon(kpi.icône, kpiColors[kpi.couleur] || kpiColors.info)}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Text
                        strong
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          display: "block",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {kpi.titre}
                      </Text>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          fontWeight: 800,
                          fontSize: 14,
                          lineHeight: 1.15,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {formatKPIValue(kpi.valeur, kpi.unite)}
                      </Title>
                    </div>
                </div>
                <Tooltip title={kpi.description}>
                  <InfoCircleOutlined style={{ color: "#c084fc", cursor: "help", fontSize: 14 }} />
                </Tooltip>
              </div>

            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Rendu de la courbe des retards
  const renderRetardsCourbe = () => {
    const evolution = dashboardData?.evolutionRetards3DerniersMois || [];
    const retardsData = evolution.map((item) => ({
      mois: item.mois,
      retards: item.nombreRetards,
      tauxRetard: item.tauxRetard,
    }));
    
    if (retardsData.length === 0) {
      return <Empty description="Aucune donnée de retard disponible" />;
    }

    return (
      <div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retardsData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="mois" 
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Nb retards', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Taux (%)', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 11 } }}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 12 }}
                formatter={(value, name) => {
                  if (name === "retards") return [`${value} retards`, "Nombre de retards"];
                  if (name === "tauxRetard") return [`${value}%`, "Taux de retard"];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="retards" 
                stroke="#ef4444" 
                strokeWidth={2.5}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
                name="Nb retards"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="tauxRetard" 
                stroke="#f59e0b" 
                strokeWidth={2.5}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
                name="Taux (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 12, padding: 8, backgroundColor: '#fef2f2', borderRadius: 6 }}>
          <Text style={{ fontSize: 12, color: '#dc2626' }}>
            {(() => {
              const variation = dashboardData?.variationRetards3DerniersMoisPourcentage ?? 0;
              if (variation === 0) return "Stabilité des retards sur 3 mois";
              if (variation < 0) return `📉 Baisse de ${Math.abs(variation).toFixed(0)}% des retards en 3 mois`;
              return `📈 Hausse de ${Math.abs(variation).toFixed(0)}% des retards en 3 mois`;
            })()}
          </Text>
        </div>
      </div>
    );
  };

  // Rendu des tops Employés (uniquement ceux qui ont le plus travaillé)
  const renderTopEmployes = () => {
    const tops = dashboardData?.topPerformers || [];

    if (tops.length === 0) {
      return <Empty description="Aucune donnée disponible" />;
    }

    const maxValeur = Math.max(
      ...tops.map((t) => Number(t?.valeur ?? t?.heures ?? 0)),
      1
    );

    const columns = [
      {
        title: "Rang",
        dataIndex: "rang",
        key: "rang",
        width: 50,
        render: (rang) => (
          <div style={{ textAlign: "center" }}>
            <Badge
              count={rang}
              style={{
                backgroundColor: rang <= 3 ? "#f59e0b" : "#cbd5e1",
                color: rang <= 3 ? "white" : "#475569"
              }}
            />
          </div>
        )
      },
      {
        title: "Employé",
        dataIndex: "nomComplet",
        key: "employe",
        render: (text, record) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size="small"
              style={{
                backgroundColor: getDepartmentColor(record.departement),
                marginRight: 8
              }}
              icon={<UserOutlined />}
            />
            <div>
              <div style={{ fontWeight: "500", fontSize: 13 }}>{text}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                {record.departement}
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Heures",
        dataIndex: "heures",
        key: "heures",
        width: 70,
        render: (_, record) => {
          const heures = record?.valeur ?? record?.heures ?? 0;
          return (
            <Tag color="#22c55e" style={{ fontSize: "12px", fontWeight: "bold" }}>
              {Math.round(Number(heures) * 10) / 10} h
            </Tag>
          );
        }
      },
      {
        title: "Perf",
        key: "performance",
        width: 80,
        render: (_, record) => (
          <Progress 
            percent={Math.round(((record?.valeur ?? record?.heures ?? 0) / maxValeur) * 100)} 
            size="small" 
            strokeColor="#22c55e"
            showInfo={false}
          />
        )
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={tops}
        rowKey={(record, index) => `${record.matricule}-${index}`}
        size="small"
        pagination={{ pageSize: 5 }}
      />
    );
  };

  // Rendu des demandes de Congés en attente
  const renderDemandesConges = () => {
    const demandes = dashboardData?.demandesCongesEnAttente || [];

    if (demandes.length === 0) {
      return (
        <Alert
          message="Aucune demande en attente"
          description="Toutes les demandes de congés sont traitées"
          type="success"
          showIcon
        />
      );
    }

    return (
      <List
        size="small"
        dataSource={demandes.slice(0, 5)}
        renderItem={(demande, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              avatar={
                <Avatar
                  size="small"
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  {demande.employeNom?.charAt(0) || "?"}
                </Avatar>
              }
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: 13 }}>{demande.employeNom}</Text>
                  <Tag size="small" color="#f59e0b" style={{ fontSize: 11 }}>
                    En attente
                  </Tag>
                </div>
              }
              description={
                <div>
                  <div style={{ fontSize: 12 }}>{demande.departement} • {demande.dureeJours} jours</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {dayjs(demande.dateDebut).format("DD/MM")} - {dayjs(demande.dateFin).format("DD/MM/YYYY")}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // Rendu de la répartition par département (sans les retards)
  const renderRepartitionDepartement = () => {
    const stats = dashboardData?.statsEffectif?.parDepartement || {};

    if (Object.keys(stats).length === 0) {
      return <Empty description="Aucune statistique par département" />;
    }

    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const data = Object.entries(stats).map(([dept, count]) => ({
      name: dept,
      value: count
    }));

    return (
      <div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={35}
                  paddingAngle={2}
                  stroke="white"
                  label={({ name, value }) => `${name.split(' ')[0]} ${value}`}
                  labelLine={false}
                >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name) => {
                  const percentage = total > 0 ? (Number(value) / total) * 100 : 0;
                  return [`${value} employés (${percentage.toFixed(1)}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 8 }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: '2px 0', fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: palette[index % palette.length],
                  display: "inline-block"
                }} />
                <Text style={{ fontSize: 12 }}>{item.name}</Text>
              </div>
              <Text strong style={{ fontSize: 12 }}>{item.value}</Text>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des retards par département
  const renderRetardsParDepartement = () => {
    const retardsData = dashboardData?.statsPointage?.retardsParDepartement || {};

    if (Object.keys(retardsData).length === 0) {
      return <Empty description="Aucune donnée de retard" />;
    }

    const totalHeuresRetard = Object.values(retardsData).reduce((sum, val) => sum + Number(val || 0), 0);
    const data = Object.entries(retardsData).map(([dept, heures]) => ({
      name: dept,
      value: Number(heures || 0),
      pourcentage: totalHeuresRetard > 0 ? ((Number(heures || 0) / totalHeuresRetard) * 100).toFixed(1) : "0.0"
    })).sort((a, b) => b.value - a.value);

    return (
      <div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <RechartsTooltip
                formatter={(value, _name, props) => [`${Number(value).toFixed(2)} h (${props?.payload?.pourcentage ?? "0.0"}%)`, "Heures de retard"]}
              />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            Total des heures de retard : {totalHeuresRetard.toFixed(2)} h
          </Text>
        </div>
      </div>
    );
  };

  // Évite de re-render les charts/tableaux à chaque clic KPI (le modal change seulement `selectedKPI`).
  const memoKpiCards = React.useMemo(() => renderKPICards(), [dashboardData, handleKpiClick, kpiColors]);
  const memoTopEmployes = React.useMemo(() => renderTopEmployes(), [dashboardData]);
  const memoDemandesConges = React.useMemo(() => renderDemandesConges(), [dashboardData]);
  const memoRetardsCourbe = React.useMemo(() => renderRetardsCourbe(), [dashboardData]);
  const memoRepartitionDepartement = React.useMemo(() => renderRepartitionDepartement(), [dashboardData]);
  const memoRetardsParDepartement = React.useMemo(() => renderRetardsParDepartement(), [dashboardData]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "500px"
      }}>
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
    <>
      <DashboardContent
        dashboardData={dashboardData}
        periodeDisplay={periodeDisplay}
        dateDebut={dateDebut}
        dateFin={dateFin}
        onApplyPreset={applyPreset}
        onRangeChange={handleRangeChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        kpiCards={memoKpiCards}
        topEmployes={memoTopEmployes}
        demandesConges={memoDemandesConges}
        retardsCourbe={memoRetardsCourbe}
        repartitionDepartement={memoRepartitionDepartement}
        retardsParDepartement={memoRetardsParDepartement}
      />

      {/* Modal de détail KPI */}
      <Modal
        title={selectedKPI?.titre}
        open={kpiModalVisible}
        forceRender
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
            <p style={{ marginTop: 16 }}>{selectedKPI.description}</p>
          </div>
        )}
      </Modal>
    </>
  );
};

// ==================== FONCTIONS UTILITAIRES ====================

const getKpiIcon = (iconName, color) => {
  const icons = {
    team: <TeamOutlined style={{ color }} />,
    'check-circle': <CheckCircleOutlined style={{ color }} />,
    warning: <WarningOutlined style={{ color }} />,
    'clock-circle': <ClockCircleOutlined style={{ color }} />,
    coffee: <CoffeeOutlined style={{ color }} />,
    dollar: <DollarOutlined style={{ color }} />,
    'plus-circle': <PlusCircleOutlined style={{ color }} />,
    'exclamation-circle': <ExclamationCircleOutlined style={{ color }} />
  };
  return icons[iconName] || <BarChartOutlined style={{ color }} />;
};

const formatKPIValue = (value, unit) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (unit === "%") {
      return `${value.toFixed(1)}${unit}`;
    }
    if (unit === "Ar") {
      const millions = value / 1_000_000;
      if (millions >= 1) {
        return `${millions.toFixed(1).replace(".", ",")}M ${unit}`;
      }
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString("fr-FR");
  }
  return value;
};

const getDepartmentColor = (department) => {
  if (!department) return "#cbd5e1";

  const colors = {
    'Ressources Humaines': '#8b5cf6',
    'Développement Informatique': '#3b82f6',
    'Ventes et Marketing': '#f59e0b',
    'Comptabilité Générale': '#22c55e',
    'Maintenance et Logistique': '#ef4444',
    'Direction': '#8b5cf6',
    'Administration': '#8b5cf6',
    'IT': '#3b82f6',
    'RH': '#8b5cf6',
    'Marketing': '#f59e0b',
    'Finance': '#22c55e',
    'Logistique': '#ef4444'
  };

  for (const [key, color] of Object.entries(colors)) {
    if (department.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }

  const colorsList = ['#8b5cf6', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colorsList[Math.abs(hash) % colorsList.length];
};

// Ajouter l'icône PieChartOutlined
const PieChartOutlined = (props) => (
  <svg
    {...props}
    viewBox="64 64 896 896"
    fill="currentColor"
    height="1em"
    width="1em"
  >
    <path d="M864 518H506V160c0-4.4-3.6-8-8-8h-26c-4.4 0-8 3.6-8 8v370c0 4.4 3.6 8 8 8h360c4.4 0 8-3.6 8-8v-26c0-4.4-3.6-8-8-8zM864 160H548c-4.4 0-8 3.6-8 8v84c0 4.4 3.6 8 8 8h316c4.4 0 8-3.6 8-8v-84c0-4.4-3.6-8-8-8zM864 290H548c-4.4 0-8 3.6-8 8v84c0 4.4 3.6 8 8 8h316c4.4 0 8-3.6 8-8v-84c0-4.4-3.6-8-8-8zM864 420H548c-4.4 0-8 3.6-8 8v84c0 4.4 3.6 8 8 8h316c4.4 0 8-3.6 8-8v-84c0-4.4-3.6-8-8-8zM864 550H548c-4.4 0-8 3.6-8 8v84c0 4.4 3.6 8 8 8h316c4.4 0 8-3.6 8-8v-84c0-4.4-3.6-8-8-8z" />
  </svg>
);

export default TableauBordGlobale;
