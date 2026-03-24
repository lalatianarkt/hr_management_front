// src/pages/RH/Employe/Mouvements/InventaireMouvements.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Avatar,
  List,
  Progress,
  Divider,
  Badge,
  Select,
  DatePicker,
  Input,
  Alert,
  Tabs,
  Modal,
  Form,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
  FilterOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  SwapOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;

const InventaireMouvements = () => {
  const [loading, setLoading] = useState(false);
  const [mouvements, setMouvements] = useState([]);
  const [filteredMouvements, setFilteredMouvements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [moment().startOf('year'), moment().endOf('year')],
    type: 'all',
    departement: 'all',
    searchText: ''
  });
  const [selectedMouvement, setSelectedMouvement] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Types de mouvements
  const typesMouvement = [
    { value: 'promotion', label: 'Promotion', color: 'green', icon: <ArrowUpOutlined /> },
    { value: 'mutation', label: 'Mutation', color: "#b053ad", icon: <SwapOutlined /> },
    { value: 'changement_departement', label: 'Changement Département', color: 'orange', icon: <BankOutlined /> },
    { value: 'augmentation_salaire', label: 'Augmentation Salaire', color: 'purple', icon: <DollarOutlined /> },
    { value: 'changement_poste', label: 'Changement de Poste', color: 'cyan', icon: <UserOutlined /> },
    { value: 'depart', label: 'Départ', color: 'red', icon: <TeamOutlined /> },
    { value: 'arrivee', label: 'Arrivée', color: 'green', icon: <UserOutlined /> }
  ];

  // Données mockées
  useEffect(() => {
    const mockEmployees = [
      { id: 1, nom: 'Dupont Jean', departement: 'IT' },
      { id: 2, nom: 'Martin Marie', departement: 'IT' },
      { id: 3, nom: 'Bernard Pierre', departement: 'Finance' },
      { id: 4, nom: 'Sophie Laurent', departement: 'IT' },
      { id: 5, nom: 'Thomas Legrand', departement: 'RH' },
      { id: 6, nom: 'Nicolas Petit', departement: 'Marketing' },
      { id: 7, nom: 'Isabelle Moreau', departement: 'Finance' },
      { id: 8, nom: 'David Leroy', departement: 'IT' }
    ];

    const mockMouvements = [
      {
        id: 1,
        employeeId: 1,
        employeeNom: 'Dupont Jean',
        type: 'promotion',
        date: '2024-01-15',
        ancienPoste: 'Développeur',
        nouveauPoste: 'Développeur Senior',
        ancienDepartement: 'IT',
        nouveauDepartement: 'IT',
        ancienSalaire: 42000,
        nouveauSalaire: 48000,
        motif: 'Performance exceptionnelle',
        notes: 'Promotion suite réussite projet majeur',
        impact: 'positif'
      },
      {
        id: 2,
        employeeId: 2,
        employeeNom: 'Martin Marie',
        type: 'augmentation_salaire',
        date: '2024-02-01',
        ancienPoste: 'Développeuse Frontend',
        nouveauPoste: 'Développeuse Frontend',
        ancienDepartement: 'IT',
        nouveauDepartement: 'IT',
        ancienSalaire: 42000,
        nouveauSalaire: 45000,
        motif: 'Augmentation annuelle',
        notes: 'Augmentation standard + prime performance',
        impact: 'positif'
      },
      {
        id: 3,
        employeeId: 3,
        employeeNom: 'Bernard Pierre',
        type: 'mutation',
        date: '2024-02-15',
        ancienPoste: 'Analyste Financier',
        nouveauPoste: 'Responsable Analyse Financière',
        ancienDepartement: 'Finance',
        nouveauDepartement: 'Finance',
        ancienSalaire: 52000,
        nouveauSalaire: 58000,
        motif: 'Développement service',
        notes: 'Mutation avec prise de responsabilités',
        impact: 'positif'
      },
      {
        id: 4,
        employeeId: 6,
        employeeNom: 'Nicolas Petit',
        type: 'changement_departement',
        date: '2024-03-01',
        ancienPoste: 'Chargé Marketing',
        nouveauPoste: 'Product Manager',
        ancienDepartement: 'Marketing',
        nouveauDepartement: 'IT',
        ancienSalaire: 38000,
        nouveauSalaire: 45000,
        motif: 'Reconversion professionnelle',
        notes: 'Formation interne réussie',
        impact: 'positif'
      },
      {
        id: 5,
        employeeId: 7,
        employeeNom: 'Isabelle Moreau',
        type: 'depart',
        date: '2024-03-15',
        ancienPoste: 'Comptable',
        nouveauPoste: '',
        ancienDepartement: 'Finance',
        nouveauDepartement: '',
        ancienSalaire: 35000,
        nouveauSalaire: 0,
        motif: 'Démission',
        notes: 'Départ pour autre entreprise',
        impact: 'negatif'
      },
      {
        id: 6,
        employeeId: 8,
        employeeNom: 'David Leroy',
        type: 'arrivee',
        date: '2024-04-01',
        ancienPoste: '',
        nouveauPoste: 'DevOps Engineer',
        ancienDepartement: '',
        nouveauDepartement: 'IT',
        ancienSalaire: 0,
        nouveauSalaire: 50000,
        motif: 'Nouvelle embauche',
        notes: 'Recrutement pour renforcer équipe DevOps',
        impact: 'positif'
      },
      {
        id: 7,
        employeeId: 4,
        employeeNom: 'Sophie Laurent',
        type: 'augmentation_salaire',
        date: '2024-04-15',
        ancienPoste: 'Directrice IT',
        nouveauPoste: 'Directrice IT',
        ancienDepartement: 'IT',
        nouveauDepartement: 'IT',
        ancienSalaire: 75000,
        nouveauSalaire: 80000,
        motif: 'Augmentation exceptionnelle',
        notes: 'Reconnaissance résultats département',
        impact: 'positif'
      },
      {
        id: 8,
        employeeId: 5,
        employeeNom: 'Thomas Legrand',
        type: 'changement_poste',
        date: '2024-05-01',
        ancienPoste: 'Assistant RH',
        nouveauPoste: 'Chargé Recrutement',
        ancienDepartement: 'RH',
        nouveauDepartement: 'RH',
        ancienSalaire: 30000,
        nouveauSalaire: 35000,
        motif: 'Évolution carrière',
        notes: 'Changement suite formation interne',
        impact: 'positif'
      }
    ];

    setEmployees(mockEmployees);
    setMouvements(mockMouvements);
    setFilteredMouvements(mockMouvements);
  }, []);

  // Application des filtres
  useEffect(() => {
    applyFilters();
  }, [filters, mouvements]);

  const applyFilters = () => {
    let filtered = [...mouvements];

    // Filtre par période
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(mouvement =>
        moment(mouvement.date).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
      );
    }

    // Filtre par type
    if (filters.type !== 'all') {
      filtered = filtered.filter(mouvement => mouvement.type === filters.type);
    }

    // Filtre par département
    if (filters.departement !== 'all') {
      filtered = filtered.filter(mouvement => 
        mouvement.nouveauDepartement === filters.departement || 
        mouvement.ancienDepartement === filters.departement
      );
    }

    // Recherche textuelle
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(mouvement =>
        mouvement.employeeNom.toLowerCase().includes(searchLower) ||
        mouvement.ancienPoste.toLowerCase().includes(searchLower) ||
        mouvement.nouveauPoste.toLowerCase().includes(searchLower) ||
        mouvement.motif.toLowerCase().includes(searchLower)
      );
    }

    setFilteredMouvements(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewDetails = (mouvement) => {
    setSelectedMouvement(mouvement);
    setIsDetailModalVisible(true);
  };

  // Statistiques
  const stats = {
    total: filteredMouvements.length,
    promotions: filteredMouvements.filter(m => m.type === 'promotion').length,
    mutations: filteredMouvements.filter(m => m.type === 'mutation').length,
    augmentations: filteredMouvements.filter(m => m.type === 'augmentation_salaire').length,
    arrivees: filteredMouvements.filter(m => m.type === 'arrivee').length,
    departs: filteredMouvements.filter(m => m.type === 'depart').length,
    coutTotal: filteredMouvements.reduce((sum, m) => sum + (m.nouveauSalaire - m.ancienSalaire), 0)
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).diff(moment(b.date)),
      width: 100
    },
    {
      title: 'Employé',
      dataIndex: 'employeeNom',
      key: 'employeeNom',
      render: (nom, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{nom}</div>
            <div style={{ fontSize: '11px', color: '#5c2458' }}>
              {record.nouveauDepartement}
            </div>
          </div>
        </Space>
      ),
      width: 150
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeInfo = typesMouvement.find(t => t.value === type);
        return (
          <Badge 
            color={typeInfo?.color} 
            text={typeInfo?.label}
            style={{ fontSize: '12px' }}
          />
        );
      },
      width: 120
    },
    {
      title: 'Poste',
      key: 'poste',
      render: (record) => (
        <div style={{ fontSize: '12px' }}>
          {record.ancienPoste && (
            <div style={{ textDecoration: 'line-through', color: '#5c2458' }}>
              {record.ancienPoste}
            </div>
          )}
          {record.nouveauPoste && (
            <div style={{ color: '#b053ad', fontWeight: '500' }}>
              {record.nouveauPoste}
            </div>
          )}
        </div>
      ),
      width: 150
    },
    {
      title: 'Salaire',
      key: 'salaire',
      render: (record) => (
        <div style={{ fontSize: '12px' }}>
          {record.ancienSalaire > 0 && (
            <div style={{ textDecoration: 'line-through', color: '#5c2458' }}>
              {record.ancienSalaire}€
            </div>
          )}
          {record.nouveauSalaire > 0 && (
            <div style={{ 
              color: record.nouveauSalaire > record.ancienSalaire ? '#52c41a' : '#f5222d',
              fontWeight: '500'
            }}>
              {record.nouveauSalaire}€
              {record.nouveauSalaire > record.ancienSalaire && (
                <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  (+{((record.nouveauSalaire - record.ancienSalaire) / record.ancienSalaire * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          )}
        </div>
      ),
      width: 120
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      render: (impact) => (
        <Tag color={impact === 'positif' ? 'green' : 'red'}>
          {impact === 'positif' ? 'Positif' : 'Négatif'}
        </Tag>
      ),
      width: 80
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      ellipsis: true,
      width: 150
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Tooltip title="Voir les détails">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
      width: 60
    }
  ];

  // Export des données
  const exportToExcel = () => {
    // Simulation d'export Excel
    console.log('Export Excel des mouvements:', filteredMouvements);
  };

  const exportToPDF = () => {
    // Simulation d'export PDF
    console.log('Export PDF des mouvements:', filteredMouvements);
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
                Inventaire des Mouvements
              </h2>
              <p className="text-muted">
                Vue d'ensemble et analyse des mouvements du personnel
              </p>
            </div>
            <Space>
              <Button 
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
              >
                Excel
              </Button>
              <Button 
                icon={<FilePdfOutlined />}
                onClick={exportToPDF}
              >
                PDF
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-4">
        <Col span={3}>
          <div className="stat-card">
            <div className="stat-icon"><BarChartOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total mouvements</div>
            </div>
          </div>
        </Col>
        <Col span={3}>
          <div className="stat-card">
            <div className="stat-icon"><ArrowUpOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.promotions}</div>
              <div className="stat-label">Promotions</div>
            </div>
          </div>
        </Col>
        <Col span={3}>
          <div className="stat-card">
            <div className="stat-icon"><DollarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.augmentations}</div>
              <div className="stat-label">Augmentations</div>
            </div>
          </div>
        </Col>
        <Col span={3}>
          <div className="stat-card">
            <div className="stat-icon"><UserOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.arrivees}</div>
              <div className="stat-label">Arrivées</div>
            </div>
          </div>
        </Col>
        <Col span={3}>
          <div className="stat-card">
            <div className="stat-icon"><TeamOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.departs}</div>
              <div className="stat-label">Départs</div>
            </div>
          </div>
        </Col>
        <Col span={3}>
          <div className="stat-card">
            <div className="stat-icon"><DollarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.coutTotal} €</div>
              <div className="stat-label">Coût additionnel</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><BarChartOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">
                {employees.length ? ((stats.arrivees + stats.departs) / employees.length * 100).toFixed(1) : 0}%
              </div>
              <div className="stat-label">Taux de rotation</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filtres */}
      <Card 
        title={
          <Space>
            <FilterOutlined />
            Filtres et Recherche
          </Space>
        }
        className="mb-4"
      >
        <Row gutter={16} align="bottom">
          <Col span={6}>
            <div className="mb-2">Période</div>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={4}>
            <div className="mb-2">Type</div>
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: '100%' }}
              placeholder="Tous types"
            >
              <Option value="all">Tous les types</Option>
              {typesMouvement.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <div className="mb-2">Département</div>
            <Select
              value={filters.departement}
              onChange={(value) => handleFilterChange('departement', value)}
              style={{ width: '100%' }}
              placeholder="Tous départements"
            >
              <Option value="all">Tous départements</Option>
              <Option value="IT">IT</Option>
              <Option value="Finance">Finance</Option>
              <Option value="RH">RH</Option>
              <Option value="Marketing">Marketing</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div className="mb-2">Recherche</div>
            <Search
              placeholder="Rechercher employé, poste, motif..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              onSearch={(value) => handleFilterChange('searchText', value)}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Button 
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
              style={{ width: '100%' }}
            >
              Exporter
            </Button>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="tableau">
        {/* Onglet 1: Tableau des mouvements */}
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Tableau des Mouvements
            </span>
          } 
          key="tableau"
        >
          <Card>
            <Table
              columns={columns}
              dataSource={filteredMouvements}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} sur ${total} mouvements`
              }}
              scroll={{ x: 1000 }}
              loading={loading}
            />
          </Card>
        </TabPane>

        {/* Onglet 2: Analyse par département */}
        <TabPane 
          tab={
            <span>
              <BankOutlined />
              Par Département
            </span>
          } 
          key="departements"
        >
          <Row gutter={16}>
            {['IT', 'Finance', 'RH', 'Marketing'].map(departement => {
              const mouvementsDept = filteredMouvements.filter(m => 
                m.nouveauDepartement === departement || m.ancienDepartement === departement
              );
              const arrivees = mouvementsDept.filter(m => m.type === 'arrivee').length;
              const departs = mouvementsDept.filter(m => m.type === 'depart').length;
              const promotions = mouvementsDept.filter(m => m.type === 'promotion').length;
              
              return (
                <Col span={6} key={departement} className="mb-3">
                  <Card 
                    title={departement}
                    size="small"
                    extra={<Badge count={mouvementsDept.length} />}
                  >
                    <List size="small">
                      <List.Item>
                        <span>Arrivées:</span>
                        <Badge count={arrivees} style={{ backgroundColor: '#52c41a' }} />
                      </List.Item>
                      <List.Item>
                        <span>Départs:</span>
                        <Badge count={departs} style={{ backgroundColor: '#f5222d' }} />
                      </List.Item>
                      <List.Item>
                        <span>Promotions:</span>
                        <Badge count={promotions} style={{ backgroundColor: '#b053ad' }} />
                      </List.Item>
                      <List.Item>
                        <Progress 
                          percent={((arrivees + promotions) / (mouvementsDept.length || 1) * 100).toFixed(1)} 
                          size="small"
                          status="active"
                        />
                      </List.Item>
                    </List>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </TabPane>

        {/* Onglet 3: Tendances */}
        <TabPane 
          tab={
            <span>
              <CalendarOutlined />
              Tendances
            </span>
          } 
          key="tendances"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Évolution Mensuelle">
                <List
                  dataSource={[
                    { mois: 'Janvier', mouvements: 3, promotions: 1 },
                    { mois: 'Février', mouvements: 4, promotions: 2 },
                    { mois: 'Mars', mouvements: 5, promotions: 1 },
                    { mois: 'Avril', mouvements: 3, promotions: 2 },
                    { mois: 'Mai', mouvements: 2, promotions: 1 }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.mois}
                        description={
                          <div>
                            <div>{item.mouvements} mouvements totaux</div>
                            <div>{item.promotions} promotions</div>
                            <Progress 
                              percent={(item.mouvements / 6) * 100} 
                              size="small"
                            />
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Indicateurs Clés">
                <Alert
                  message="Analyse des Mouvements"
                  description="Tendances et recommandations basées sur les données historiques"
                  type="info"
                  showIcon
                  className="mb-3"
                />
                
                <List size="small">
                  <List.Item>
                    <div className="d-flex justify-content-between w-100">
                      <span>Taux de promotion moyen:</span>
                      <Tag color="green">15%</Tag>
                    </div>
                  </List.Item>
                  <List.Item>
                    <div className="d-flex justify-content-between w-100">
                      <span>Rotation du personnel:</span>
                      <Tag color="orange">8%</Tag>
                    </div>
                  </List.Item>
                  <List.Item>
                    <div className="d-flex justify-content-between w-100">
                      <span>Augmentation salariale moyenne:</span>
                      <Tag color="#b053ad">7.2%</Tag>
                    </div>
                  </List.Item>
                  <List.Item>
                    <div className="d-flex justify-content-between w-100">
                      <span>Département le plus actif:</span>
                      <Tag color="purple">IT</Tag>
                    </div>
                  </List.Item>
                </List>

                <Divider />

                <h6>Recommandations</h6>
                <List
                  size="small"
                  dataSource={[
                    'Renforcer les programmes de formation IT',
                    'Étudier la rétention en département Finance',
                    'Planifier les recrutements Q3',
                    'Réviser la politique de promotion'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <div style={{ fontSize: '12px' }}>• {item}</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Modal de détail */}
      <Modal
        title="Détail du Mouvement"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={600}
      >
        {selectedMouvement && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Employé">
              {selectedMouvement.employeeNom}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {moment(selectedMouvement.date).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={typesMouvement.find(t => t.value === selectedMouvement.type)?.color}>
                {typesMouvement.find(t => t.value === selectedMouvement.type)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Poste">
              {selectedMouvement.ancienPoste || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Nouveau Poste">
              {selectedMouvement.nouveauPoste || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Département">
              {selectedMouvement.ancienDepartement || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Nouveau Département">
              {selectedMouvement.nouveauDepartement || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Salaire">
              {selectedMouvement.ancienSalaire > 0 ? `${selectedMouvement.ancienSalaire}€` : 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Nouveau Salaire">
              {selectedMouvement.nouveauSalaire > 0 ? `${selectedMouvement.nouveauSalaire}€` : 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Évolution Salariale">
              {selectedMouvement.ancienSalaire > 0 && selectedMouvement.nouveauSalaire > 0 ? (
                <Tag color={selectedMouvement.nouveauSalaire > selectedMouvement.ancienSalaire ? 'green' : 'red'}>
                  {((selectedMouvement.nouveauSalaire - selectedMouvement.ancienSalaire) / selectedMouvement.ancienSalaire * 100).toFixed(1)}%
                </Tag>
              ) : 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Motif">
              {selectedMouvement.motif}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {selectedMouvement.notes || 'Aucune note'}
            </Descriptions.Item>
            <Descriptions.Item label="Impact">
              <Tag color={selectedMouvement.impact === 'positif' ? 'green' : 'red'}>
                {selectedMouvement.impact === 'positif' ? 'Positif' : 'Négatif'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default InventaireMouvements;
