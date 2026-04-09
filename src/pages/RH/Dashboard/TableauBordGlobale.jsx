import React, { useState, useEffect } from "react";
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
  ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined,
  UserOutlined, TrophyOutlined, BellOutlined, HistoryOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

dayjs.locale("fr");

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const TableauBordGlobale = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UNIQUEMENT deux dates : dateDebut et dateFin
  // Par dÃ©faut : 3Ã¨me dernier mois au dernier mois
  const [dateDebut, setDateDebut] = useState(() => 
    dayjs().subtract(3, 'month').startOf('month')
  );
  const [dateFin, setDateFin] = useState(() => 
    dayjs().subtract(1, 'month').endOf('month')
  );
  
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [kpiModalVisible, setKpiModalVisible] = useState(false);

  // Couleurs pour les KPI
  const kpiColors = {
    success: "var(--status-success)",
    warning: "var(--status-warning)",
    danger: "var(--status-error)",
    info: "var(--status-info)",
    accent: "var(--status-accent)"
  };

  // Charger les donnÃ©es Ã  chaque changement de dates
  useEffect(() => {
    if (dateDebut && dateFin) {
      fetchDashboardData();
    }
  }, [dateDebut, dateFin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Utilisateur non authentifiÃ©. Veuillez vous reconnecter.');
      }

      // UNIQUEMENT l'endpoint /periode avec les deux dates
      const url = `/api/dashboard/periode?dateDebut=${dateDebut.format("YYYY-MM-DD")}&dateFin=${dateFin.format("YYYY-MM-DD")}`;

      const response = await axiosInstance.get(url);
      
      console.log("DonnÃ©es dashboard:", response.data);
      
      setDashboardData(response.data);
      
      message.success("DonnÃ©es actualisÃ©es");
      
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem('token');
        const errorMsg = 'Session expirÃ©e. Veuillez vous reconnecter.';
        setError(errorMsg);
        setTimeout(() => {
          navigate(`/?message=${encodeURIComponent(errorMsg)}`);
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExport = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        message.error('Session expirÃ©e. Veuillez vous reconnecter.');
        return;
      }

      // Export avec les deux dates
      const url = `/api/dashboard/export?dateDebut=${dateDebut.format("YYYY-MM-DD")}&dateFin=${dateFin.format("YYYY-MM-DD")}`;

      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `tableau_bord_${dateDebut.format("YYYY-MM")}_${dateFin.format("YYYY-MM")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success("Export rÃ©ussi");
      
    } catch (err) {
      console.error("Erreur export:", err);
      
      // if (err.response?.status === 401 || err.response?.status === 403) {
      //   sessionStorage.removeItem('token');
      //   message.error('Session expirÃ©e. Veuillez vous reconnecter.');
      //   setTimeout(() => {
      //     navigate('/?message=' + encodeURIComponent('Session expirÃ©e. Veuillez vous reconnecter.'));
      //   }, 2000);
      // } else {
      //   message.error("Erreur lors de l'export");
      // }
    }
  };

  const handleKpiClick = (kpi) => {
    setSelectedKPI(kpi);
    setKpiModalVisible(true);
  };

  // Presets de dates
  const applyPreset = (preset) => {
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
      case "trimestre_courant":
        newDateDebut = dayjs().startOf('quarter');
        newDateFin = dayjs().endOf('quarter');
        break;
      default:
        return;
    }
    
    setDateDebut(newDateDebut);
    setDateFin(newDateFin);
  };

  // Format d'affichage de la pÃ©riode
  const getPeriodeDisplay = () => {
    if (dateDebut && dateFin) {
      return `${dateDebut.format("DD/MM/YYYY")} - ${dateFin.format("DD/MM/YYYY")}`;
    }
    return "";
  };

  // Rendu des cartes KPI
  const renderKPICards = () => {
    if (!dashboardData) return null;

    const kpis = [
      { ...dashboardData.effectifTotal, icone: 'team' },
      { ...dashboardData.tauxPresence, icone: 'check-circle' },
      { ...dashboardData.tauxAbsenteeisme, icone: 'warning' },
      { ...dashboardData.congesPris, icone: 'coffee' },
      { ...dashboardData.heuresTravaillees, icone: 'clock-circle' },
      { ...dashboardData.masseSalariale, icone: 'dollar' },
      { ...dashboardData.heuresSupplementaires, icone: 'plus-circle' },
      { ...dashboardData.retardsCumules, icone: 'exclamation-circle' }
    ].filter(kpi => kpi != null && kpi.titre);

    return (
      <Row gutter={[20, 20]}>
        {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              className="kpi-card-premium"
              hoverable
              onClick={() => handleKpiClick(kpi)}
              bodyStyle={{ padding: '20px' }}
              style={{ height: "100%", borderRadius: '20px' }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <div className="icon-wrapper-premium" style={{
                  backgroundColor: `${kpiColors[kpi.couleur] || kpiColors.info}15`,
                  color: kpiColors[kpi.couleur] || kpiColors.info
                }}>
                  {getKpiIcon(kpi.icone, kpiColors[kpi.couleur] || kpiColors.info)}
                </div>
                <div style={{ marginLeft: 16 }}>
                  <Text strong style={{ fontSize: "14px", color: "var(--color-text-muted)", display: 'block' }}>
                    {kpi.titre}
                  </Text>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--color-dark)' }}>
                    {formatKPIValue(kpi.valeur, kpi.unite)}
                  </Title>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  {kpi.variation !== undefined && kpi.variation !== 0 && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Tag color={kpi.variation > 0 ? "success" : "error"} style={{
                        borderRadius: '20px',
                        border: 'none',
                        padding: '2px 10px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {kpi.variation > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        <span style={{ marginLeft: 4 }}>{Math.abs(kpi.variation).toFixed(1)}%</span>
                      </Tag>
                    </div>
                  )}
                </div>
                <Tooltip title={kpi.description}>
                  <InfoCircleOutlined style={{ color: '#e1b2db', cursor: 'help' }} />
                </Tooltip>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Rendu des alertes
  const renderAlertes = () => {
    if (!dashboardData?.alertes || dashboardData.alertes.length === 0) {
      return (
        <Alert
          message="Aucune alerte"
          description="Tous les indicateurs sont dans les normes"
          type="success"
          showIcon
        />
      );
    }

    return (
      <Collapse defaultActiveKey={['0']} ghost>
        {dashboardData.alertes.map((alerte, index) => (
          <Panel
            header={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Badge
                  status={alerte.niveau === 'eleve' ? 'error' : alerte.niveau === 'moyen' ? 'warning' : 'default'}
                  style={{ marginRight: 8 }}
                />
                <Text strong>{alerte.titre}</Text>
              </div>
            }
            key={index}
            extra={<Tag color={getAlerteColor(alerte.niveau)}>{alerte.niveau}</Tag>}
          >
            <p>{alerte.message}</p>
            <p style={{ marginTop: 8, fontStyle: "italic" }}>
              <strong>Action recommandÃ©e:</strong> {alerte.actionRecommandee}
            </p>
            <p style={{ marginTop: 4, fontSize: "12px", color: "#5c2458" }}>
              DÃ©tectÃ©e le {dayjs(alerte.dateDetection).format("DD/MM/YYYY")}
            </p>
          </Panel>
        ))}
      </Collapse>
    );
  };

  // Rendu des tops employÃ©s
  const renderTopEmployes = () => {
    const tops = [
      ...(dashboardData?.topAbsenteeisme || []),
      ...(dashboardData?.topPerformers || [])
    ];

    if (tops.length === 0) {
      return <Empty description="Aucune donnÃ©e disponible" />;
    }

    const columns = [
      {
        title: "Rang",
        dataIndex: "rang",
        key: "rang",
        width: 60,
        render: (rang) => (
          <div style={{ textAlign: "center" }}>
            <Badge
              count={rang}
              style={{
                backgroundColor: rang <= 3 ? "var(--bg-primary)" : "var(--color-border)",
                color: rang <= 3 ? "white" : "var(--color-text-main)"
              }}
            />
          </div>
        )
      },
      {
        title: "EmployÃ©",
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
              <div style={{ fontWeight: "500" }}>{text}</div>
              <div style={{ fontSize: "12px", color: "#5c2458" }}>
                {record.matricule} à {record.departement}
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Indicateur",
        dataIndex: "indicateur",
        key: "indicateur",
        width: 120,
        render: (indicateur) => (
          <Tag color={indicateur === "heures_travaillees" ? "var(--bg-primary)" : "var(--status-error)"}>
            {indicateur === "heures_travaillees" ? "Performant" : "AbsentÃ©isme"}
          </Tag>
        )
      },
      {
        title: "Valeur",
        dataIndex: "valeur",
        key: "valeur",
        width: 100,
        render: (valeur, record) => (
          <div style={{ textAlign: "right" }}>
            <Text strong>{valeur.toFixed(1)}</Text>
            <div style={{ fontSize: "11px", color: "#5c2458" }}>
              {record.indicateur === "heures_travaillees" ? "heures" : "jours"}
            </div>
          </div>
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

  // Rendu des demandes de congÃ©s en attente
  const renderDemandesConges = () => {
    const demandes = dashboardData?.demandesCongesEnAttente || [];

    if (demandes.length === 0) {
      return (
        <Alert
          message="Aucune demande en attente"
          description="Toutes les demandes de congÃ©s sont traitÃ©es"
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
                  style={{ backgroundColor: demande.statut === 'en_attente' ? 'var(--status-warning)' : 'var(--bg-primary)' }}
                >
                  {demande.employeNom?.charAt(0) || "?"}
                </Avatar>
              }
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>{demande.employeNom}</Text>
                  <Tag size="small" color={demande.statut === 'en_attente' ? 'var(--status-warning)' : 'var(--bg-primary)'}>
                    {demande.statut}
                  </Tag>
                </div>
              }
              description={
                <div>
                  <div>{demande.departement} à {demande.dureeJours} jours</div>
                  <div style={{ fontSize: "11px", color: "#5c2458" }}>
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

  // Rendu des tendances
  const renderTendances = () => {
    const tendances = dashboardData?.tendances || [];
    const seriesParDepartement = getDepartementSeriesData(dashboardData);

    if (tendances.length === 0 && seriesParDepartement.length === 0) {
      return <Empty description="Aucune donnÃ©e de tendance disponible" />;
    }

    const data = tendances.map(t => ({
      mois: t.mois,
      presence: t.tauxPresence,
      effectif: t.effectif,
      conges: t.congesPris,
      heures: t.heuresTravaillees
    }));

    return (
      <div>
        {tendances.length > 0 && (
          <div style={{ height: 200 }}>
            <div style={{ display: "flex", height: "100%", alignItems: "flex-end", gap: "8px" }}>
              {data.slice(-6).map((item, index) => (
                <div key={index} style={{ flex: 1, textAlign: "center" }}>
                  <Tooltip title={`${item.presence.toFixed(1)}% prÃ©sence`}>
                    <div
                      style={{
                        height: `${(item.presence / 100) * 100}px`,
                        backgroundColor: item.presence >= 95 ? "#52c41a" :
                          item.presence >= 90 ? "#fa8c16" : "#f5222d",
                        borderRadius: "4px 4px 0 0",
                        marginBottom: "4px"
                      }}
                    />
                  </Tooltip>
                  <div style={{ fontSize: "10px", color: "#5c2458", marginTop: "4px" }}>
                    {item.mois}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px", fontSize: "12px", color: "#5c2458", textAlign: "center" }}>
              Ã‰volution du taux de prÃ©sence sur les 6 derniers mois
            </div>
          </div>
        )}

        <div style={{ height: 260, marginTop: 16 }}>
          {seriesParDepartement.length === 0 ? (
            <Empty description="Aucune statistique par dÃ©partement pour heures, congÃ©s et retards" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesParDepartement} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="departement"
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      if (name === "Heures travaillÃ©es") return [`${value} h`, name];
                      if (name === "CongÃ©s pris") return [`${value} jours`, name];
                      if (name === "Retards") return [`${value} h`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="heuresTravaillees"
                    name="Heures travaillÃ©es"
                    stroke="#1890ff"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="congesPris"
                    name="CongÃ©s pris"
                    stroke="#722ed1"
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
              <div style={{ marginTop: 8, fontSize: "12px", color: "#5c2458", textAlign: "center" }}>
                Heures travaillÃ©es, congÃ©s pris et retards par dÃ©partement
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  // Rendu des statistiques par département
  const renderStatsDepartement = () => {
    const stats = dashboardData?.statsEffectif?.parDepartement || {};

    if (Object.keys(stats).length === 0) {
      return <Empty description="Aucune statistique par département" />;
    }

    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const data = Object.entries(stats).map(([dept, count]) => ({
      name: dept,
      value: count
    }));

    const palette = [
      "#8b5cf6", "#f97316", "#22c55e", "#3b82f6",
      "#ec4899", "#f59e0b", "#10b981", "#ef4444"
    ];

    return (
      <div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={2}
                stroke="white"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name) => {
                  const percentage = total > 0 ? (Number(value) / total) * 100 : 0;
                  return [`${value} employés • ${percentage.toFixed(1)}%`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          {data.map((item, index) => (
            <Col xs={24} sm={12} key={index}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: palette[index % palette.length],
                  display: "inline-block"
                }} />
                <Text>{item.name}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

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
            RÃ©essayer
          </Button>
        }
        style={{ margin: "24px" }}
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* En-tÃªte */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <BarChartOutlined style={{ marginRight: 12, color: "#b053ad" }} />
              Tableau de Bord RH
            </Title>
            {/* Affichage des deux dates */}
            <Text type="secondary" style={{ fontSize: "16px", fontWeight: "500" }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              PÃ©riode du {getPeriodeDisplay()}
            </Text>
          </Col>
          <Col>
            <Space>
              {/* Boutons de preset rapides */}
              <Button onClick={() => applyPreset("trois_derniers_mois")}>
                3 derniers mois
              </Button>
              <Button onClick={() => applyPreset("mois_courant")}>
                Mois en cours
              </Button>
              <Button onClick={() => applyPreset("mois_precedent")}>
                Mois prÃ©cÃ©dent
              </Button>
              
              {/* SÃ©lecteur de dates personnalisÃ©es */}
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

              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Actualiser
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
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
            <TrophyOutlined style={{ marginRight: 8, color: "#b053ad" }} />
            Indicateurs ClÃ©s de Performance
            <Text type="secondary" style={{ marginLeft: 12, fontSize: "14px" }}>
              {dayjs().format("HH:mm")}
            </Text>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        {renderKPICards()}
      </Card>

      {/* DeuxiÃ¨me ligne : Alertes et Demandes CongÃ©s */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <BellOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                Alertes & Notifications
                <Badge
                  count={dashboardData?.alertes?.length || 0}
                  style={{ marginLeft: 8 }}
                />
              </div>
            }
            style={{ height: "100%" }}
          >
            {renderAlertes()}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <CoffeeOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                Demandes de CongÃ©s en Attente
                <Badge
                  count={dashboardData?.demandesCongesEnAttente?.length || 0}
                  style={{ marginLeft: 8 }}
                />
              </div>
            }
            style={{ height: "100%" }}
          >
            {renderDemandesConges()}
          </Card>
        </Col>
      </Row>

      {/* TroisiÃ¨me ligne : Tops EmployÃ©s et Tendances */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <TeamOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                Top EmployÃ©s
              </div>
            }
            style={{ height: "100%" }}
          >
            {renderTopEmployes()}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <HistoryOutlined style={{ marginRight: 8, color: "#13c2c2" }} />
                Tendances
              </div>
            }
            style={{ height: "100%" }}
          >
            {renderTendances()}
          </Card>
        </Col>
      </Row>

      {/* QuatriÃ¨me ligne : RÃ©partition et Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <PieChartOutlined style={{ marginRight: 8, color: "#eb2f96" }} />
                RÃ©partition par DÃ©partement
              </div>
            }
            style={{ height: "100%" }}
          >
            {renderStatsDepartement()}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <InfoCircleOutlined style={{ marginRight: 8, color: "#b053ad" }} />
                Statistiques Globales
              </div>
            }
            style={{ height: "100%" }}
          >
            <Descriptions column={1} size="small">
              {dashboardData?.statsEffectif && (
                <>
                  <Descriptions.Item label="Effectif total">
                    {dashboardData.statsEffectif.totalEmployes} employÃ©s
                  </Descriptions.Item>
                  <Descriptions.Item label="EmployÃ©s actifs">
                    {dashboardData.statsEffectif.employesActifs} employÃ©s
                  </Descriptions.Item>
                  <Descriptions.Item label="Nouveaux employÃ©s (mois)">
                    {dashboardData.statsEffectif.nouveauxEmployesMois} employÃ©s
                  </Descriptions.Item>
                </>
              )}
              {dashboardData?.statsPresence && (
                <>
                  <Descriptions.Item label="Taux de prÃ©sence">
                    {dashboardData.statsPresence.tauxPresenceGlobal?.toFixed(1)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Heures travaillÃ©es moyennes">
                    {dashboardData.statsPresence.heuresTravailleesMoyennes?.toFixed(1)}h/mois
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Modal de dÃ©tail KPI */}
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
            <Statistic
              value={selectedKPI.valeur}
              suffix={selectedKPI.unite}
              valueStyle={{ fontSize: "32px", color: kpiColors[selectedKPI.couleur] }}
            />
            <p style={{ marginTop: 16 }}>{selectedKPI.description}</p>
            {selectedKPI.variation !== undefined && (
              <Alert
                message={`Variation: ${selectedKPI.variation > 0 ? "+" : ""}${selectedKPI.variation.toFixed(1)}%`}
                type={selectedKPI.variation > 0 ? "success" : "error"}
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      {/* Footer info */}
      <div style={{
        marginTop: 24,
        padding: "16px",
        backgroundColor: "#f9f1f8",
        border: "1px solid #f9f1f8",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#5c2458"
      }}>
        <Row justify="space-between">
          <Col>
            <Text>DerniÃ¨re mise Ã  jour: {dayjs().format("DD/MM/YYYY HH:mm:ss")}</Text>
          </Col>
          <Col>
            <Text>DonnÃ©es pour la pÃ©riode du {getPeriodeDisplay()}</Text>
          </Col>
        </Row>
      </div>
    </div>
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
  if (unit === "kâ‚¬/mois") {
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  }
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

const getAlerteColor = (niveau) => {
  switch (niveau) {
    case "eleve": return "var(--status-error)";
    case "moyen": return "var(--status-warning)";
    case "faible": return "var(--bg-primary)";
    default: return "default";
  }
};

const getDepartmentColor = (department) => {
  if (!department) return "var(--color-border)";

  const colors = {
    'Ressources Humaines': 'var(--bg-primary)',
    'DÃ©veloppement Informatique': 'var(--bg-accent)',
    'Ventes et Marketing': 'var(--color-orange)',
    'ComptabilitÃ© GÃ©nÃ©rale': 'var(--status-success)',
    'Maintenance et Logistique': 'var(--status-warning)',
    'Direction': 'var(--bg-primary)',
    'Administration': 'var(--bg-primary)',
    'IT': 'var(--bg-accent)',
    'RH': 'var(--bg-primary)',
    'Marketing': 'var(--color-orange)',
    'Finance': 'var(--status-success)',
    'Logistique': 'var(--status-warning)',
    'Direction GÃ©nÃ©rale': 'var(--bg-primary)'
  };

  for (const [key, color] of Object.entries(colors)) {
    if (department.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }

  const colorsList = [
    'var(--bg-primary)', 'var(--bg-accent)', 'var(--color-orange)',
    '#b053ad', '#ec4899', '#b053ad'
  ];

  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colorsList[Math.abs(hash) % colorsList.length];
};

const getDepartementSeriesData = (dashboardData) => {
  const heuresParDepartement =
    dashboardData?.statsPointage?.heuresParDepartement ||
    dashboardData?.heuresTravailleesParDepartement ||
    {};

  const retardsParDepartement =
    dashboardData?.statsPointage?.retardsParDepartement ||
    dashboardData?.retardsParDepartement ||
    dashboardData?.statsPointage?.heuresRetardsParDepartement ||
    {};

  const congesParDepartement =
    dashboardData?.statsAbsencesConges?.congesParDepartement ||
    dashboardData?.statsAbsencesConges?.congesPrisParDepartement ||
    dashboardData?.congesParDepartement ||
    {};

  const departments = new Set([
    ...Object.keys(heuresParDepartement || {}),
    ...Object.keys(retardsParDepartement || {}),
    ...Object.keys(congesParDepartement || {})
  ]);

  return Array.from(departments).map((departement) => ({
    departement,
    heuresTravaillees: Number(heuresParDepartement?.[departement] || 0),
    congesPris: Number(congesParDepartement?.[departement] || 0),
    retards: Number(retardsParDepartement?.[departement] || 0)
  }));
};

// Ajouter l'icÃ´ne PieChartOutlined
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


