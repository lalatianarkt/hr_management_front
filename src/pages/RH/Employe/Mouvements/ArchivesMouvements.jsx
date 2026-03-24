// src/pages/RH/Employe/Mouvements/ArchivesMouvements.jsx
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
  Descriptions,
  Popconfirm,
  message,
  Empty,
  Timeline,
  Upload
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
  SearchOutlined,
  DeleteOutlined,
  HistoryOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  RollbackOutlined,
  FolderOutlined,
  InboxOutlined,
  SaveOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ArchivesMouvements = () => {
  const [loading, setLoading] = useState(false);
  const [archives, setArchives] = useState([]);
  const [filteredArchives, setFilteredArchives] = useState([]);
  const [filters, setFilters] = useState({
    annee: 'all',
    type: 'all',
    departement: 'all',
    searchText: ''
  });
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);

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

  // Années disponibles
  const annees = ['2023', '2022', '2021', '2020', '2019', '2018'];

  // Données mockées d'archives
  useEffect(() => {
    const mockArchives = [
      {
        id: 1,
        employeeId: 1,
        employeeNom: 'Dupont Jean',
        type: 'promotion',
        date: '2023-06-15',
        ancienPoste: 'Développeur',
        nouveauPoste: 'Développeur Senior',
        ancienDepartement: 'IT',
        nouveauDepartement: 'IT',
        ancienSalaire: 40000,
        nouveauSalaire: 45000,
        motif: 'Performance exceptionnelle',
        notes: 'Promotion après évaluation positive',
        annee: 2023,
        dateArchivage: '2024-01-15',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 2,
        employeeId: 2,
        employeeNom: 'Martin Marie',
        type: 'augmentation_salaire',
        date: '2023-03-01',
        ancienPoste: 'Développeuse Frontend',
        nouveauPoste: 'Développeuse Frontend',
        ancienDepartement: 'IT',
        nouveauDepartement: 'IT',
        ancienSalaire: 38000,
        nouveauSalaire: 42000,
        motif: 'Augmentation annuelle',
        notes: 'Augmentation standard + prime performance',
        annee: 2023,
        dateArchivage: '2024-01-15',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 3,
        employeeId: 3,
        employeeNom: 'Bernard Pierre',
        type: 'mutation',
        date: '2022-11-20',
        ancienPoste: 'Analyste Financier',
        nouveauPoste: 'Responsable Analyse Financière',
        ancienDepartement: 'Finance',
        nouveauDepartement: 'Finance',
        ancienSalaire: 45000,
        nouveauSalaire: 52000,
        motif: 'Développement service',
        notes: 'Mutation avec prise de responsabilités',
        annee: 2022,
        dateArchivage: '2023-07-10',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 4,
        employeeId: 4,
        employeeNom: 'Sophie Laurent',
        type: 'arrivee',
        date: '2022-01-15',
        ancienPoste: '',
        nouveauPoste: 'Chef de Projet IT',
        ancienDepartement: '',
        nouveauDepartement: 'IT',
        ancienSalaire: 0,
        nouveauSalaire: 55000,
        motif: 'Recrutement cadre',
        notes: 'Expérience précédente chez concurrent',
        annee: 2022,
        dateArchivage: '2023-01-20',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 5,
        employeeId: 5,
        employeeNom: 'Thomas Legrand',
        type: 'depart',
        date: '2021-08-30',
        ancienPoste: 'Assistant RH',
        nouveauPoste: '',
        ancienDepartement: 'RH',
        nouveauDepartement: '',
        ancienSalaire: 28000,
        nouveauSalaire: 0,
        motif: 'Démission',
        notes: 'Départ pour reprise études',
        annee: 2021,
        dateArchivage: '2022-03-15',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 6,
        employeeId: 6,
        employeeNom: 'Nicolas Petit',
        type: 'changement_departement',
        date: '2020-05-10',
        ancienPoste: 'Chargé Marketing',
        nouveauPoste: 'Product Manager',
        ancienDepartement: 'Marketing',
        nouveauDepartement: 'IT',
        ancienSalaire: 35000,
        nouveauSalaire: 42000,
        motif: 'Reconversion professionnelle',
        notes: 'Formation interne réussie',
        annee: 2020,
        dateArchivage: '2021-06-20',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 7,
        employeeId: 7,
        employeeNom: 'Isabelle Moreau',
        type: 'promotion',
        date: '2019-11-05',
        ancienPoste: 'Comptable',
        nouveauPoste: 'Responsable Comptabilité',
        ancienDepartement: 'Finance',
        nouveauDepartement: 'Finance',
        ancienSalaire: 32000,
        nouveauSalaire: 38000,
        motif: 'Expérience et compétences',
        notes: 'Promotion interne',
        annee: 2019,
        dateArchivage: '2020-12-10',
        archivePar: 'Admin RH',
        statut: 'archive'
      },
      {
        id: 8,
        employeeId: 8,
        employeeNom: 'David Leroy',
        type: 'augmentation_salaire',
        date: '2018-09-15',
        ancienPoste: 'Développeur',
        nouveauPoste: 'Développeur',
        ancienDepartement: 'IT',
        nouveauDepartement: 'IT',
        ancienSalaire: 35000,
        nouveauSalaire: 37000,
        motif: 'Augmentation collective',
        notes: 'Augmentation sectorielle',
        annee: 2018,
        dateArchivage: '2019-10-05',
        archivePar: 'Admin RH',
        statut: 'archive'
      }
    ];

    setArchives(mockArchives);
    setFilteredArchives(mockArchives);
  }, []);

  // Application des filtres
  useEffect(() => {
    applyFilters();
  }, [filters, archives]);

  const applyFilters = () => {
    let filtered = [...archives];

    // Filtre par année
    if (filters.annee !== 'all') {
      filtered = filtered.filter(archive => archive.annee === parseInt(filters.annee));
    }

    // Filtre par type
    if (filters.type !== 'all') {
      filtered = filtered.filter(archive => archive.type === filters.type);
    }

    // Filtre par département
    if (filters.departement !== 'all') {
      filtered = filtered.filter(archive => 
        archive.nouveauDepartement === filters.departement || 
        archive.ancienDepartement === filters.departement
      );
    }

    // Recherche textuelle
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(archive =>
        archive.employeeNom.toLowerCase().includes(searchLower) ||
        archive.ancienPoste.toLowerCase().includes(searchLower) ||
        archive.nouveauPoste.toLowerCase().includes(searchLower) ||
        archive.motif.toLowerCase().includes(searchLower)
      );
    }

    setFilteredArchives(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewDetails = (archive) => {
    setSelectedArchive(archive);
    setIsDetailModalVisible(true);
  };

  const handleRestore = (archive) => {
    setSelectedArchive(archive);
    setIsRestoreModalVisible(true);
  };

  const confirmRestore = () => {
    // Simulation de restauration
    message.success(`Mouvement de ${selectedArchive.employeeNom} restauré avec succès`);
    setIsRestoreModalVisible(false);
    setSelectedArchive(null);
  };

  const handleDelete = (archiveId) => {
    setArchives(prev => prev.filter(archive => archive.id !== archiveId));
    message.success('Archive supprimée définitivement');
  };

  const handleBulkArchive = () => {
    // Simulation d'archivage en masse
    message.info('Archivage des mouvements de 2023 en cours...');
  };

  // Statistiques
  const stats = {
    total: filteredArchives.length,
    parAnnee: annees.reduce((acc, annee) => {
      acc[annee] = archives.filter(a => a.annee === parseInt(annee)).length;
      return acc;
    }, {}),
    types: typesMouvement.reduce((acc, type) => {
      acc[type.value] = archives.filter(a => a.type === type.value).length;
      return acc;
    }, {})
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Année',
      dataIndex: 'annee',
      key: 'annee',
      render: (annee) => (
        <Badge 
          count={annee} 
          style={{ backgroundColor: '#722ed1' }} 
        />
      ),
      width: 80,
      sorter: (a, b) => b.annee - a.annee
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
      width: 140
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeInfo = typesMouvement.find(t => t.value === type);
        return (
          <Tag color={typeInfo?.color} icon={typeInfo?.icon}>
            {typeInfo?.label}
          </Tag>
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
      title: 'Date Archivage',
      dataIndex: 'dateArchivage',
      key: 'dateArchivage',
      render: (date) => (
        <div style={{ fontSize: '12px' }}>
          {moment(date).format('DD/MM/YYYY')}
        </div>
      ),
      width: 100,
      sorter: (a, b) => moment(a.dateArchivage).diff(moment(b.dateArchivage))
    },
    {
      title: 'Archivé par',
      dataIndex: 'archivePar',
      key: 'archivePar',
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Restaurer">
            <Button 
              type="link" 
              icon={<RollbackOutlined />}
              onClick={() => handleRestore(record)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Supprimer définitivement">
            <Popconfirm
              title="Supprimer définitivement cette archive ?"
              description="Cette action est irréversible. Êtes-vous sûr ?"
              onConfirm={() => handleDelete(record.id)}
              okText="Oui"
              cancelText="Non"
              okType="danger"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
      width: 120
    }
  ];

  // Export des archives
  const exportArchives = () => {
    message.success('Export des archives en cours...');
  };

  const importArchives = () => {
    message.info('Fonction d\'import en développement');
  };

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FolderOutlined className="me-2" />
                Archives des Mouvements
              </h2>
              <p className="text-muted">
                Historique complet et conservation des mouvements antérieurs
              </p>
            </div>
            <Space>
              <Button 
                icon={<CloudUploadOutlined />}
                onClick={importArchives}
              >
                Importer
              </Button>
              <Button 
                icon={<CloudDownloadOutlined />}
                onClick={exportArchives}
              >
                Exporter
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={handleBulkArchive}
              >
                Archiver 2023
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Alertes informations */}
      <Alert
        message="Zone d'archivage"
        description="Cette section contient les mouvements historiques archivés. Les données peuvent être restaurées ou supprimées définitivement."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Statistiques */}
      <Row gutter={16} className="mb-4">
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><FolderOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total archives</div>
            </div>
          </div>
        </Col>
        {annees.slice(0, 4).map(annee => (
          <Col span={3} key={annee}>
            <div className="stat-card">
              <div className="stat-icon"><CalendarOutlined /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.parAnnee[annee] || 0}</div>
                <div className="stat-label">Année {annee}</div>
              </div>
            </div>
          </Col>
        ))}
        <Col span={5}>
          <div className="stat-card">
            <div className="stat-icon"><BarChartOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">75%</div>
              <div className="stat-label">Taux d'archivage</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filtres */}
      <Card 
        title={
          <Space>
            <FilterOutlined />
            Filtres des Archives
          </Space>
        }
        className="mb-4"
      >
        <Row gutter={16} align="bottom">
          <Col span={5}>
            <div className="mb-2">Année</div>
            <Select
              value={filters.annee}
              onChange={(value) => handleFilterChange('annee', value)}
              style={{ width: '100%' }}
              placeholder="Toutes années"
            >
              <Option value="all">Toutes années</Option>
              {annees.map(annee => (
                <Option key={annee} value={annee}>
                  {annee}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <div className="mb-2">Type</div>
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: '100%' }}
              placeholder="Tous types"
            >
              <Option value="all">Tous types</Option>
              {typesMouvement.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
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
          <Col span={7}>
            <div className="mb-2">Recherche</div>
            <Search
              placeholder="Rechercher dans les archives..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              onSearch={(value) => handleFilterChange('searchText', value)}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={2}>
            <Button 
              icon={<DownloadOutlined />}
              onClick={exportArchives}
              style={{ width: '100%' }}
            >
              Exporter
            </Button>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="archives">
        {/* Onglet 1: Archives complètes */}
        <TabPane 
          tab={
            <span>
              <FolderOutlined />
              Archives Complètes
            </span>
          } 
          key="archives"
        >
          {filteredArchives.length > 0 ? (
            <Card>
              <Table
                columns={columns}
                dataSource={filteredArchives}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} sur ${total} archives`
                }}
                scroll={{ x: 1000 }}
                loading={loading}
              />
            </Card>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aucune archive trouvée avec les critères sélectionnés"
            >
              <Button type="primary" onClick={() => setFilters({
                annee: 'all',
                type: 'all',
                departement: 'all',
                searchText: ''
              })}>
                Voir toutes les archives
              </Button>
            </Empty>
          )}
        </TabPane>

        {/* Onglet 2: Vue par année */}
        <TabPane 
          tab={
            <span>
              <CalendarOutlined />
              Par Année
            </span>
          } 
          key="parAnnee"
        >
          <Row gutter={16}>
            {annees.map(annee => {
              const archivesAnnee = archives.filter(a => a.annee === parseInt(annee));
              return (
                <Col span={8} key={annee} className="mb-3">
                  <Card 
                    title={`Année ${annee}`}
                    size="small"
                    extra={<Badge count={archivesAnnee.length} />}
                  >
                    {archivesAnnee.length > 0 ? (
                      <List
                        size="small"
                        dataSource={archivesAnnee.slice(0, 3)}
                        renderItem={archive => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar size="small" icon={<UserOutlined />} />}
                              title={archive.employeeNom}
                              description={
                                <div>
                                  <Tag color={typesMouvement.find(t => t.value === archive.type)?.color} size="small">
                                    {typesMouvement.find(t => t.value === archive.type)?.label}
                                  </Tag>
                                  <div style={{ fontSize: '11px', color: '#5c2458' }}>
                                    {moment(archive.date).format('DD/MM')}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                        footer={
                          archivesAnnee.length > 3 && (
                            <Button type="link" size="small">
                              Voir les {archivesAnnee.length - 3} autres...
                            </Button>
                          )
                        }
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Aucune archive"
                        imageStyle={{ height: 40 }}
                      />
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </TabPane>

        {/* Onglet 3: Statistiques historiques */}
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Statistiques Historiques
            </span>
          } 
          key="statistiques"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Évolution des Mouvements par Année">
                <List
                  dataSource={annees.map(annee => ({
                    annee,
                    count: stats.parAnnee[annee] || 0,
                    promotions: archives.filter(a => a.annee === parseInt(annee) && a.type === 'promotion').length
                  }))}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={`Année ${item.annee}`}
                        description={
                          <div>
                            <div>{item.count} mouvements totaux</div>
                            <div>{item.promotions} promotions</div>
                            <Progress 
                              percent={(item.count / 10) * 100} 
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
              <Card title="Répartition par Type">
                <List
                  dataSource={typesMouvement}
                  renderItem={type => {
                    const count = stats.types[type.value] || 0;
                    const percentage = archives.length > 0 ? (count / archives.length * 100).toFixed(1) : 0;
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Tag color={type.color} icon={type.icon}>
                              {type.label}
                            </Tag>
                          }
                          description={
                            <div>
                              <div>{count} mouvements</div>
                              <Progress 
                                percent={parseFloat(percentage)} 
                                size="small"
                                format={() => `${percentage}%`}
                              />
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Onglet 4: Chronologie */}
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Chronologie
            </span>
          } 
          key="chronologie"
        >
          <Card>
            <Timeline mode="alternate">
              {archives
                .sort((a, b) => moment(b.date).diff(moment(a.date)))
                .slice(0, 10)
                .map(archive => (
                  <Timeline.Item
                    key={archive.id}
                    color={typesMouvement.find(t => t.value === archive.type)?.color}
                    dot={typesMouvement.find(t => t.value === archive.type)?.icon}
                  >
                    <Card size="small">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{archive.employeeNom}</strong>
                          <div style={{ fontSize: '12px', color: '#5c2458' }}>
                            {archive.nouveauPoste} - {archive.nouveauDepartement}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5c2458' }}>
                            {archive.motif}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#5c2458' }}>
                          {moment(archive.date).format('DD/MM/YYYY')}
                        </div>
                      </div>
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal de détail */}
      <Modal
        title="Détail de l'Archive"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button 
            key="restore" 
            type="primary" 
            icon={<RollbackOutlined />}
            onClick={() => {
              setIsDetailModalVisible(false);
              handleRestore(selectedArchive);
            }}
          >
            Restaurer
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={700}
      >
        {selectedArchive && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Employé" span={2}>
              {selectedArchive.employeeNom}
            </Descriptions.Item>
            <Descriptions.Item label="Date du mouvement">
              {moment(selectedArchive.date).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={typesMouvement.find(t => t.value === selectedArchive.type)?.color}>
                {typesMouvement.find(t => t.value === selectedArchive.type)?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Poste">
              {selectedArchive.ancienPoste || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Nouveau Poste">
              {selectedArchive.nouveauPoste || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Département">
              {selectedArchive.ancienDepartement || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Nouveau Département">
              {selectedArchive.nouveauDepartement || 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Salaire">
              {selectedArchive.ancienSalaire > 0 ? `${selectedArchive.ancienSalaire}€` : 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Nouveau Salaire">
              {selectedArchive.nouveauSalaire > 0 ? `${selectedArchive.nouveauSalaire}€` : 'Non applicable'}
            </Descriptions.Item>
            <Descriptions.Item label="Date d'archivage">
              {moment(selectedArchive.dateArchivage).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Archivé par">
              {selectedArchive.archivePar}
            </Descriptions.Item>
            <Descriptions.Item label="Motif" span={2}>
              {selectedArchive.motif}
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {selectedArchive.notes || 'Aucune note'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal de restauration */}
      <Modal
        title="Restaurer l'Archive"
        open={isRestoreModalVisible}
        onCancel={() => setIsRestoreModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRestoreModalVisible(false)}>
            Annuler
          </Button>,
          <Button 
            key="restore" 
            type="primary" 
            icon={<RollbackOutlined />}
            onClick={confirmRestore}
          >
            Confirmer la restauration
          </Button>
        ]}
        width={500}
      >
        {selectedArchive && (
          <Alert
            message="Confirmation de restauration"
            description={
              <div>
                <p>Êtes-vous sûr de vouloir restaurer le mouvement suivant ?</p>
                <div style={{ background: '#f9f1f8', padding: '10px', borderRadius: '4px' }}>
                  <strong>{selectedArchive.employeeNom}</strong><br />
                  {typesMouvement.find(t => t.value === selectedArchive.type)?.label} - 
                  {moment(selectedArchive.date).format('DD/MM/YYYY')}<br />
                  <em>{selectedArchive.motif}</em>
                </div>
                <p className="mt-2">
                  Ce mouvement sera réintégré dans l'historique actif.
                </p>
              </div>
            }
            type="warning"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
};

export default ArchivesMouvements;
