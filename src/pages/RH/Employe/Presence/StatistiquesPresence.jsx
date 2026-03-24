// src/pages/RH/Employe/Presence/StatistiquesPresence.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Select,
  DatePicker,
  Progress,
  Tag,
  List,
  Avatar,
  Tooltip,
  Button,
  Space,
  Divider,
  Alert,
  Tabs,
  Badge,
  Radio
} from 'antd';
import {
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  TrophyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const StatistiquesPresence = () => {
  const [loading, setLoading] = useState(false);
  const [periode, setPeriode] = useState('month');
  const [dateRange, setDateRange] = useState([
    moment().startOf('month'),
    moment().endOf('month')
  ]);
  const [selectedDepartement, setSelectedDepartement] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  // Données mockées des employés
  const [employees] = useState([
    { 
      id: 1, 
      nom: 'Dupont Jean', 
      departement: 'IT', 
      tauxHoraire: 45,
      dateEmbauche: '2022-01-15',
      poste: 'Développeur Senior'
    },
    { 
      id: 2, 
      nom: 'Martin Marie', 
      departement: 'IT', 
      tauxHoraire: 42,
      dateEmbauche: '2022-03-20',
      poste: 'Développeuse Frontend'
    },
    { 
      id: 3, 
      nom: 'Bernard Pierre', 
      departement: 'Finance', 
      tauxHoraire: 38,
      dateEmbauche: '2021-11-10',
      poste: 'Analyste Financier'
    },
    { 
      id: 4, 
      nom: 'Sophie Laurent', 
      departement: 'IT', 
      tauxHoraire: 55,
      dateEmbauche: '2020-08-05',
      poste: 'Directrice IT'
    },
    { 
      id: 5, 
      nom: 'Paul Durand', 
      departement: 'Finance', 
      tauxHoraire: 50,
      dateEmbauche: '2021-05-15',
      poste: 'Directeur Finance'
    },
    { 
      id: 6, 
      nom: 'Thomas Legrand', 
      departement: 'RH', 
      tauxHoraire: 35,
      dateEmbauche: '2023-02-01',
      poste: 'Assistant RH'
    }
  ]);

  // Données mockées des statistiques
  const [statistiques, setStatistiques] = useState({});
  const [donneesPaie, setDonneesPaie] = useState([]);
  const [comparatifDepartements, setComparatifDepartements] = useState([]);

  // Génération des données mockées
  useEffect(() => {
    generateMockData();
  }, [periode, dateRange]);

  const generateMockData = () => {
    setLoading(true);

    // Simuler un chargement
    setTimeout(() => {
      // Statistiques principales
      const mockStats = {
        // Taux de présence
        tauxPresence: 92.5,
        tauxAbsenteisme: 7.5,
        joursTravailles: 18,
        joursAbsence: 2,
        
        // Retards
        totalRetards: 8,
        moyenneRetard: 12.5,
        employePlusRetard: 'Dupont Jean',
        
        // Heures
        heuresTotales: 145,
        heuresSupplementaires: 24,
        moyenneHeuresSemaine: 36.25,
        
        // Pour la paie
        coutTotalPresence: 65250,
        coutHeuresSupplementaires: 10800,
        economieAbsences: 3750
      };

      // Données pour la paie
      const mockDonneesPaie = employees.map(employee => {
        const heuresBase = 151.67; // Moyenne mensuelle
        const heuresSupplementaires = Math.floor(Math.random() * 20);
        const absences = Math.floor(Math.random() * 3);
        const retards = Math.floor(Math.random() * 5);
        
        return {
          id: employee.id,
          nom: employee.nom,
          departement: employee.departement,
          tauxHoraire: employee.tauxHoraire,
          heuresBase,
          heuresSupplementaires,
          absences,
          retards,
          salaireBase: heuresBase * employee.tauxHoraire,
          majorationHeures: heuresSupplementaires * employee.tauxHoraire * 1.25,
          deductionAbsences: absences * 8 * employee.tauxHoraire,
          salaireNet: (heuresBase * employee.tauxHoraire) + 
                     (heuresSupplementaires * employee.tauxHoraire * 1.25) - 
                     (absences * 8 * employee.tauxHoraire)
        };
      });

      // Comparatif par département
      const mockComparatif = [
        {
          departement: 'IT',
          effectif: 3,
          tauxPresence: 94.2,
          tauxAbsenteisme: 5.8,
          moyenneHeures: 38.5,
          heuresSupplementaires: 28,
          coutTotal: 45200,
          performance: 'Élevée'
        },
        {
          departement: 'Finance',
          effectif: 2,
          tauxPresence: 91.8,
          tauxAbsenteisme: 8.2,
          moyenneHeures: 37.2,
          heuresSupplementaires: 18,
          coutTotal: 33200,
          performance: 'Moyenne'
        },
        {
          departement: 'RH',
          effectif: 1,
          tauxPresence: 96.0,
          tauxAbsenteisme: 4.0,
          moyenneHeures: 35.0,
          heuresSupplementaires: 8,
          coutTotal: 12250,
          performance: 'Élevée'
        }
      ];

      // Données pour les évaluations
      const mockEvaluations = employees.map(employee => {
        const presenceScore = 90 + Math.floor(Math.random() * 10);
        const ponctualiteScore = 85 + Math.floor(Math.random() * 15);
        const engagementScore = 88 + Math.floor(Math.random() * 12);
        
        return {
          id: employee.id,
          nom: employee.nom,
          departement: employee.departement,
          poste: employee.poste,
          scores: {
            presence: presenceScore,
            ponctualite: ponctualiteScore,
            engagement: engagementScore,
            moyenne: Math.round((presenceScore + ponctualiteScore + engagementScore) / 3)
          },
          evaluation: presenceScore >= 95 ? 'Excellent' : 
                     presenceScore >= 90 ? 'Très bon' : 
                     presenceScore >= 85 ? 'Bon' : 'À améliorer',
          recommandations: presenceScore < 90 ? [
            'Améliorer la ponctualité',
            'Réduire les absences non planifiées'
          ] : [
            'Maintenir les bonnes performances'
          ]
        };
      });

      setStatistiques(mockStats);
      setDonneesPaie(mockDonneesPaie);
      setComparatifDepartements(mockComparatif);
      setLoading(false);
    }, 1000);
  };

  // Colonnes pour le tableau de paie
  const columnsPaie = [
    {
      title: 'Employé',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom, record) => (
        <Space>
          <UserOutlined />
          {nom}
          <Tag color={record.departement === 'IT' ? '#b053ad' : record.departement === 'Finance' ? 'green' : 'orange'}>
            {record.departement}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Taux Horaire',
      dataIndex: 'tauxHoraire',
      key: 'tauxHoraire',
      render: (taux) => `${taux}€`,
      sorter: (a, b) => a.tauxHoraire - b.tauxHoraire
    },
    {
      title: 'Heures Base',
      dataIndex: 'heuresBase',
      key: 'heuresBase',
      render: (heures) => `${heures}h`
    },
    {
      title: 'Heures Supp.',
      dataIndex: 'heuresSupplementaires',
      key: 'heuresSupplementaires',
      render: (heures) => (
        <Tag color={heures > 0 ? 'orange' : 'default'}>
          {heures > 0 ? `+${heures}h` : '0h'}
        </Tag>
      )
    },
    {
      title: 'Absences',
      dataIndex: 'absences',
      key: 'absences',
      render: (absences) => (
        <Badge 
          count={absences} 
          style={{ 
            backgroundColor: absences > 2 ? '#ff4d4f' : '#faad14'
          }} 
        />
      )
    },
    {
      title: 'Salaire Base',
      dataIndex: 'salaireBase',
      key: 'salaireBase',
      render: (salaire) => `${salaire.toFixed(2)}€`
    },
    {
      title: 'Majoration HS',
      dataIndex: 'majorationHeures',
      key: 'majorationHeures',
      render: (majoration) => `${majoration.toFixed(2)}€`
    },
    {
      title: 'Déduction Absences',
      dataIndex: 'deductionAbsences',
      key: 'deductionAbsences',
      render: (deduction) => (
        <span style={{ color: '#ff4d4f' }}>
          -{deduction.toFixed(2)}€
        </span>
      )
    },
    {
      title: 'Salaire Net',
      dataIndex: 'salaireNet',
      key: 'salaireNet',
      render: (salaire) => (
        <strong style={{ color: '#52c41a' }}>
          {salaire.toFixed(2)}€
        </strong>
      ),
      sorter: (a, b) => a.salaireNet - b.salaireNet
    }
  ];

  // Colonnes pour les évaluations
  const columnsEvaluations = [
    {
      title: 'Employé',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{nom}</div>
            <div style={{ fontSize: '12px', color: '#5c2458' }}>
              {record.poste} - {record.departement}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Score Présence',
      dataIndex: ['scores', 'presence'],
      key: 'presence',
      render: (score) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score >= 95 ? 'success' : score >= 85 ? 'normal' : 'exception'}
          format={percent => `${percent}%`}
        />
      ),
      sorter: (a, b) => a.scores.presence - b.scores.presence
    },
    {
      title: 'Score Ponctualité',
      dataIndex: ['scores', 'ponctualite'],
      key: 'ponctualite',
      render: (score) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score >= 95 ? 'success' : score >= 85 ? 'normal' : 'exception'}
          format={percent => `${percent}%`}
        />
      )
    },
    {
      title: 'Score Engagement',
      dataIndex: ['scores', 'engagement'],
      key: 'engagement',
      render: (score) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score >= 95 ? 'success' : score >= 85 ? 'normal' : 'exception'}
          format={percent => `${percent}%`}
        />
      )
    },
    {
      title: 'Moyenne',
      dataIndex: ['scores', 'moyenne'],
      key: 'moyenne',
      render: (moyenne) => (
        <Tag 
          color={
            moyenne >= 95 ? 'green' : 
            moyenne >= 90 ? '#b053ad' : 
            moyenne >= 85 ? 'orange' : 'red'
          }
        >
          {moyenne}%
        </Tag>
      ),
      sorter: (a, b) => a.scores.moyenne - b.scores.moyenne
    },
    {
      title: 'Évaluation',
      dataIndex: 'evaluation',
      key: 'evaluation',
      render: (evaluation) => (
        <Tag 
          color={
            evaluation === 'Excellent' ? 'green' : 
            evaluation === 'Très bon' ? '#b053ad' : 
            evaluation === 'Bon' ? 'orange' : 'red'
          }
        >
          {evaluation}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="Voir le détail de l'évaluation">
          <Button type="link" icon={<EyeOutlined />} />
        </Tooltip>
      )
    }
  ];

  // Fonction d'export
  const handleExport = (type) => {
    // Simulation d'export
    console.log(`Export ${type} pour la période:`, dateRange);
  };

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <BarChartOutlined className="me-2" />
                Statistiques de Présence
              </h2>
              <p className="text-muted">
                Tableaux de bord, indicateurs paie et données pour les évaluations
              </p>
            </div>
            <Space>
              <Button 
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('excel')}
              >
                Export Excel
              </Button>
              <Button 
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
              >
                Rapport PDF
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div className="mb-2">Période d'analyse</div>
            <Select 
              value={periode}
              onChange={setPeriode}
              style={{ width: '100%' }}
            >
              <Option value="week">Semaine</Option>
              <Option value="month">Mois</Option>
              <Option value="quarter">Trimestre</Option>
              <Option value="year">Année</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div className="mb-2">Plage de dates</div>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={6}>
            <div className="mb-2">Département</div>
            <Select 
              value={selectedDepartement}
              onChange={setSelectedDepartement}
              style={{ width: '100%' }}
            >
              <Option value="all">Tous les départements</Option>
              <Option value="IT">IT</Option>
              <Option value="Finance">Finance</Option>
              <Option value="RH">RH</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div className="mb-2">Mode d'affichage</div>
            <Radio.Group 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="overview">Vue d'ensemble</Radio.Button>
              <Radio.Button value="details">Détails</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Indicateurs principaux */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><CheckCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.tauxPresence}%</div>
              <div className="stat-label">Taux de presence</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><WarningOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.tauxAbsenteisme}%</div>
              <div className="stat-label">Absenteisme</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><CalendarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.joursTravailles}</div>
              <div className="stat-label">Jours travailles</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><ClockCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.heuresSupplementaires}h</div>
              <div className="stat-label">Heures supp</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><DollarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.coutTotalPresence} EUR</div>
              <div className="stat-label">Cout presence</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><TrophyOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.economieAbsences} EUR</div>
              <div className="stat-label">Economies</div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="stat-card">
            <div className="stat-icon"><BarChartOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{statistiques.tauxPresence}%</div>
              <div className="stat-label">Performance globale</div>
            </div>
          </div>
        </Col>
      </Row>


      <Tabs defaultActiveKey="tableauBord">
        {/* Tableau de bord mensuel */}
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Tableau de Bord
            </span>
          } 
          key="tableauBord"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Comparatif par Département" loading={loading}>
                <List
                  dataSource={comparatifDepartements}
                  renderItem={dept => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<TeamOutlined />}
                        title={dept.departement}
                        description={`${dept.effectif} employés`}
                      />
                      <div className="text-end">
                        <div>
                          <Progress 
                            percent={dept.tauxPresence} 
                            size="small" 
                            status="active"
                            format={percent => `${percent}% présence`}
                          />
                        </div>
                        <div className="text-muted small">
                          {dept.heuresSupplementaires}h supp. | {dept.coutTotal}€
                        </div>
                        <Tag color={dept.performance === 'Élevée' ? 'green' : 'orange'}>
                          {dept.performance}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Indicateurs Clés pour la Paie" loading={loading}>
                <Table
                  columns={columnsPaie}
                  dataSource={donneesPaie}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>
                          <strong>Totaux</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>
                            {donneesPaie.reduce((sum, item) => sum + item.heuresSupplementaires, 0)}h
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong>
                            {donneesPaie.reduce((sum, item) => sum + item.absences, 0)}
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} colSpan={3}>
                          <strong style={{ color: '#52c41a' }}>
                            {donneesPaie.reduce((sum, item) => sum + item.salaireNet, 0).toFixed(2)}€
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Indicateurs pour la paie */}
        <TabPane 
          tab={
            <span>
              <DollarOutlined />
              Indicateurs Paie
            </span>
          } 
          key="paie"
        >
          <Card title="Synthèse pour la Paie" loading={loading}>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" title="Coûts de Main d'Œuvre">
                  <div className="stat-card mb-2">
                    <div className="stat-icon"><DollarOutlined /></div>
                    <div className="stat-content">
                      <div className="stat-value">{statistiques.coutTotalPresence} €</div>
                      <div className="stat-label">Coût total présence</div>
                    </div>
                  </div>
                  <div className="stat-card mb-2">
                    <div className="stat-icon"><DollarOutlined /></div>
                    <div className="stat-content">
                      <div className="stat-value">{statistiques.coutHeuresSupplementaires} €</div>
                      <div className="stat-label">Majoration heures supp.</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><DollarOutlined /></div>
                    <div className="stat-content">
                      <div className="stat-value">{statistiques.economieAbsences} €</div>
                      <div className="stat-label">Économie absences</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Analyse des Coûts">
                  <List size="small">
                    <List.Item>
                      <span>Coût moyen par heure:</span>
                      <span>
                        <strong>
                          {((statistiques.coutTotalPresence + statistiques.coutHeuresSupplementaires) / statistiques.heuresTotales).toFixed(2)}€
                        </strong>
                      </span>
                    </List.Item>
                    <List.Item>
                      <span>Coût d'absence moyen:</span>
                      <span>
                        <strong>
                          {(statistiques.economieAbsences / (statistiques.joursAbsence || 1)).toFixed(2)}€
                        </strong>
                      </span>
                    </List.Item>
                    <List.Item>
                      <span>Productivité horaire estimée:</span>
                      <span>
                        <Tag color="green">125%</Tag>
                      </span>
                    </List.Item>
                  </List>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Recommandations Paie">
                  <Alert
                    message="Optimisations possibles"
                    description={
                      <div>
                        <div>• Réduire les heures supplémentaires de 15%</div>
                        <div>• Planifier les absences à l'avance</div>
                        <div>• Mettre en place le télétravail</div>
                      </div>
                    }
                    type="info"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>

        {/* Taux d'absentéisme */}
        <TabPane 
          tab={
            <span>
              <WarningOutlined />
              Absentéisme
            </span>
          } 
          key="absenteisme"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Analyse de l'Absentéisme" loading={loading}>
                <List
                  dataSource={employees}
                  renderItem={employee => {
                    const absences = Math.floor(Math.random() * 4);
                    const tauxAbsence = (absences / 22 * 100).toFixed(1);
                    
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<UserOutlined />}
                          title={employee.nom}
                          description={employee.departement}
                        />
                        <div className="text-end">
                          <div>
                            <Badge 
                              count={absences} 
                              showZero 
                              style={{ 
                                backgroundColor: absences > 2 ? '#ff4d4f' : 
                                               absences > 0 ? '#faad14' : '#52c41a'
                              }} 
                            />
                            <span className="ms-2">jours d'absence</span>
                          </div>
                          <div className="text-muted small">
                            Taux: {tauxAbsence}%
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Tendances et Patterns" loading={loading}>
                <Alert
                  message="Taux d'absentéisme global"
                  description={`Le taux d'absentéisme est de ${statistiques.tauxAbsenteisme}%, ce qui est dans la moyenne sectorielle.`}
                  type="info"
                  showIcon
                  className="mb-3"
                />
                
                <List size="small">
                  <List.Item>
                    <List.Item.Meta
                      title="Jours préférés pour les absences"
                      description="Lundi et Vendredi"
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      title="Département le plus touché"
                      description="Finance (8.2%)"
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      title="Coût mensuel de l'absentéisme"
                      description={`${statistiques.economieAbsences}€`}
                    />
                  </List.Item>
                </List>

                <Divider />

                <h5>Actions de réduction</h5>
                <List
                  size="small"
                  dataSource={[
                    'Mise en place de télétravail',
                    'Flexibilité horaire',
                    'Programme de bien-être',
                    'Entretiens individuels'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} className="me-2" />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Données pour les évaluations */}
        <TabPane 
          tab={
            <span>
              <TrophyOutlined />
              Données Évaluations
            </span>
          } 
          key="evaluations"
        >
          <Card 
            title="Données pour les Évaluations de Performance" 
            loading={loading}
            extra={
              <Button type="primary" icon={<DownloadOutlined />}>
                Exporter pour les RH
              </Button>
            }
          >
            <Table
              columns={columnsEvaluations}
              dataSource={employees.map(emp => ({
                id: emp.id,
                nom: emp.nom,
                departement: emp.departement,
                poste: emp.poste,
                scores: {
                  presence: 90 + Math.floor(Math.random() * 10),
                  ponctualite: 85 + Math.floor(Math.random() * 15),
                  engagement: 88 + Math.floor(Math.random() * 12),
                  moyenne: 0
                },
                evaluation: '',
                recommandations: []
              })).map(item => ({
                ...item,
                scores: {
                  ...item.scores,
                  moyenne: Math.round((item.scores.presence + item.scores.ponctualite + item.scores.engagement) / 3)
                },
                evaluation: item.scores.moyenne >= 95 ? 'Excellent' : 
                           item.scores.moyenne >= 90 ? 'Très bon' : 
                           item.scores.moyenne >= 85 ? 'Bon' : 'À améliorer'
              }))}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
            />

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Légende des Scores" size="small">
                  <List size="small">
                    <List.Item>
                      <Tag color="green">95-100%</Tag>
                      <span>Excellent - Performance exceptionnelle</span>
                    </List.Item>
                    <List.Item>
                      <Tag color="#b053ad">90-94%</Tag>
                      <span>Très bon - Au-dessus des attentes</span>
                    </List.Item>
                    <List.Item>
                      <Tag color="orange">85-89%</Tag>
                      <span>Bon - Respect des objectifs</span>
                    </List.Item>
                    <List.Item>
                      <Tag color="red">0-84%</Tag>
                      <span>À améliorer - Sous les objectifs</span>
                    </List.Item>
                  </List>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Recommandations Globales" size="small">
                  <Alert
                    message="Points d'amélioration collectifs"
                    description={
                      <div>
                        <div>• Formation à la gestion du temps</div>
                        <div>• Programme de reconnaissance</div>
                        <div>• Amélioration des outils de reporting</div>
                      </div>
                    }
                    type="warning"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StatistiquesPresence;
