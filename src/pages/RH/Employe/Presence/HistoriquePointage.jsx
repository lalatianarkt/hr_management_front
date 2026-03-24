// src/pages/RH/Employe/Presence/HistoriquePointage.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  DatePicker,
  Select,
  Input,
  Tag,
  Modal,
  Form,
  Space,
  Tooltip,
  Alert,
  List,
  Badge,
  Popconfirm,
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  UserOutlined,
  CalendarOutlined,
  ReloadOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const HistoriquePointage = () => {
  const [loading, setLoading] = useState(false);
  const [pointages, setPointages] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // États pour les filtres
  const [filters, setFilters] = useState({
    dateRange: [moment().startOf('month'), moment().endOf('month')],
    employee: 'all',
    type: 'all',
    statut: 'all',
    searchText: ''
  });

  // Données mockées des employés
  const [employees] = useState([
    { id: 1, nom: 'Dupont Jean', departement: 'IT' },
    { id: 2, nom: 'Martin Marie', departement: 'IT' },
    { id: 3, nom: 'Bernard Pierre', departement: 'Finance' },
    { id: 4, nom: 'Sophie Laurent', departement: 'IT' },
    { id: 5, nom: 'Paul Durand', departement: 'Finance' }
  ]);

  // Génération des données mockées
  useEffect(() => {
    generateMockData();
  }, []);

  // Filtrage des données quand les filtres changent
  useEffect(() => {
    applyFilters();
  }, [filters, pointages]);

  const generateMockData = () => {
    const mockData = [];
    const startDate = moment().subtract(30, 'days');
    
    employees.forEach(employee => {
      for (let i = 0; i < 30; i++) {
        const date = moment(startDate).add(i, 'days');
        if (date.day() !== 0 && date.day() !== 6) { // Exclure weekends
          const heureArrivee = moment().set({
            hour: 8 + Math.floor(Math.random() * 2),
            minute: Math.floor(Math.random() * 60)
          });
          
          const heureDepart = moment(heureArrivee).add(8 + Math.floor(Math.random() * 2), 'hours');
          
          const retard = Math.random() > 0.7 ? Math.floor(Math.random() * 45) : 0;
          const typePointage = Math.random() > 0.1 ? 'normal' : 'erreur';
          
          // Pointage d'arrivée
          mockData.push({
            id: `${employee.id}-${i}-arrivee`,
            employeeId: employee.id,
            type: 'arrivee',
            date: date.format('YYYY-MM-DD'),
            heure: heureArrivee.format('HH:mm'),
            datetime: heureArrivee.valueOf(),
            statut: retard > 0 ? 'retard' : 'normal',
            retardMinutes: retard,
            notes: retard > 0 ? 'Trafic dense' : '',
            typePointage: typePointage,
            correction: typePointage === 'erreur'
          });

          // Pointage de départ
          mockData.push({
            id: `${employee.id}-${i}-depart`,
            employeeId: employee.id,
            type: 'depart',
            date: date.format('YYYY-MM-DD'),
            heure: heureDepart.format('HH:mm'),
            datetime: heureDepart.valueOf(),
            statut: 'normal',
            retardMinutes: 0,
            notes: '',
            typePointage: typePointage,
            correction: typePointage === 'erreur'
          });
        }
      }
    });
    
    setPointages(mockData.sort((a, b) => b.datetime - a.datetime));
  };

  const applyFilters = () => {
    let filtered = [...pointages];

    // Filtre par période
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(record => 
        moment(record.date).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
      );
    }

    // Filtre par employé
    if (filters.employee !== 'all') {
      filtered = filtered.filter(record => record.employeeId === parseInt(filters.employee));
    }

    // Filtre par type
    if (filters.type !== 'all') {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    // Filtre par statut
    if (filters.statut !== 'all') {
      filtered = filtered.filter(record => record.statut === filters.statut);
    }

    // Recherche textuelle
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return (
          employee.nom.toLowerCase().includes(searchLower) ||
          employee.departement.toLowerCase().includes(searchLower) ||
          record.notes.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (value) => {
    handleFilterChange('searchText', value);
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: [moment().startOf('month'), moment().endOf('month')],
      employee: 'all',
      type: 'all',
      statut: 'all',
      searchText: ''
    });
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Heure',
      dataIndex: 'heure',
      key: 'heure',
      render: (heure, record) => (
        <Space>
          <span>{heure}</span>
          {record.correction && (
            <Badge count="!" style={{ backgroundColor: '#ff4d4f' }} />
          )}
        </Space>
      )
    },
    {
      title: 'Employé',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return (
          <Space>
            <UserOutlined />
            {employee ? employee.nom : 'N/A'}
          </Space>
        );
      }
    },
    {
      title: 'Département',
      key: 'departement',
      render: (record) => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return employee ? employee.departement : 'N/A';
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'arrivee' ? '#b053ad' : 'green'}>
          {type === 'arrivee' ? 'Arrivée' : 'Départ'}
        </Tag>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut, record) => {
        const colors = {
          normal: 'green',
          retard: 'orange',
          absent: 'red',
          erreur: 'red'
        };
        const labels = {
          normal: 'Normal',
          retard: `Retard (${record.retardMinutes}min)`,
          absent: 'Absent',
          erreur: 'Erreur'
        };
        return (
          <Tag color={colors[statut] || 'default'}>
            {labels[statut] || statut}
          </Tag>
        );
      }
    },
    {
      title: 'Type Pointage',
      dataIndex: 'typePointage',
      key: 'typePointage',
      render: (type) => (
        <Tag color={type === 'normal' ? 'green' : 'red'}>
          {type === 'normal' ? 'Normal' : 'À corriger'}
        </Tag>
      )
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Popconfirm
              title="Êtes-vous sûr de vouloir supprimer ce pointage ?"
              onConfirm={() => handleDelete(record)}
              okText="Oui"
              cancelText="Non"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Gestion des actions
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      date: moment(record.date),
      heure: record.heure,
      type: record.type,
      statut: record.statut,
      notes: record.notes
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    setPointages(prev => prev.filter(p => p.id !== record.id));
    message.success('Pointage supprimé avec succès');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (selectedRecord) {
        const updatedRecord = {
          ...selectedRecord,
          date: values.date.format('YYYY-MM-DD'),
          heure: values.heure,
          type: values.type,
          statut: values.statut,
          notes: values.notes,
          typePointage: 'normal', // Marqué comme corrigé
          correction: false
        };

        setPointages(prev => prev.map(item =>
          item.id === selectedRecord.id ? updatedRecord : item
        ));

        message.success('Pointage modifié avec succès');
      }
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRecord(null);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedRecord(null);
  };

  // Export Excel (simulé)
  const exportToExcel = () => {
    message.info('Export Excel - Pour activer cette fonctionnalité, installez la bibliothèque xlsx');
  };

  // Export PDF (simulé)
  const exportToPDF = () => {
    message.info('Export PDF - Fonctionnalité en cours de développement');
  };

  // Statistiques
  const stats = {
    total: filteredData.length,
    arrivees: filteredData.filter(p => p.type === 'arrivee').length,
    departs: filteredData.filter(p => p.type === 'depart').length,
    retards: filteredData.filter(p => p.statut === 'retard').length,
    corrections: filteredData.filter(p => p.correction).length
  };

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <HistoryOutlined className="me-2" />
                Historique des Pointages
              </h2>
              <p className="text-muted">
                Consultation et gestion de l'historique complet des pointages
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
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
              >
                Réinitialiser
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <Row gutter={16} className="mb-4">
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><HistoryOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total pointages</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><CheckCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.arrivees}</div>
              <div className="stat-label">Arrivees</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><ClockCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.departs}</div>
              <div className="stat-label">Departs</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><WarningOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.retards}</div>
              <div className="stat-label">Retards</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><EditOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.corrections}</div>
              <div className="stat-label">A corriger</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><CalendarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{filters.dateRange ? moment(filters.dateRange[1]).diff(filters.dateRange[0], 'days') + 1 : 0}</div>
              <div className="stat-label">Periode</div>
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
            <Form.Item label="Période">
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Employé">
              <Select
                value={filters.employee}
                onChange={(value) => handleFilterChange('employee', value)}
                placeholder="Tous"
              >
                <Option value="all">Tous les employés</Option>
                {employees.map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Type">
              <Select
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
                placeholder="Tous"
              >
                <Option value="all">Tous</Option>
                <Option value="arrivee">Arrivée</Option>
                <Option value="depart">Départ</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Statut">
              <Select
                value={filters.statut}
                onChange={(value) => handleFilterChange('statut', value)}
                placeholder="Tous"
              >
                <Option value="all">Tous</Option>
                <Option value="normal">Normal</Option>
                <Option value="retard">Retard</Option>
                <Option value="erreur">Erreur</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Recherche avancée">
              <Search
                placeholder="Rechercher par nom, département, notes..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Alertes pour les corrections */}
      {stats.corrections > 0 && (
        <Alert
          message={`${stats.corrections} pointage(s) nécessite(nt) une correction`}
          description="Les pointages marqués d'un point d'exclamation rouge doivent être vérifiés et corrigés."
          type="warning"
          showIcon
          className="mb-4"
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleFilterChange('statut', 'erreur')}
            >
              Voir les corrections
            </Button>
          }
        />
      )}

      {/* Tableau principal */}
      <Card 
        title={`Historique des Pointages (${filteredData.length} résultats)`}
        extra={
          <Space>
            <Button 
              icon={<ExportOutlined />}
              onClick={exportToExcel}
            >
              Exporter
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} pointages`
          }}
          scroll={{ x: 1200 }}
          loading={loading}
          rowClassName={(record) => record.correction ? 'row-correction' : ''}
        />
      </Card>

      {/* Modal pour voir/modifier les détails */}
      <Modal
        title={
          <Space>
            {selectedRecord?.correction ? (
              <Badge status="error" />
            ) : (
              <EyeOutlined />
            )}
            {selectedRecord ? 'Détails du Pointage' : 'Nouveau Pointage'}
          </Space>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={selectedRecord?.correction ? "Corriger" : "Enregistrer"}
        cancelText="Annuler"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Date requise' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="heure"
                label="Heure"
                rules={[{ required: true, message: 'Heure requise' }]}
              >
                <Input type="time" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type de pointage"
                rules={[{ required: true, message: 'Type requis' }]}
              >
                <Select>
                  <Option value="arrivee">Arrivée</Option>
                  <Option value="depart">Départ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="statut"
                label="Statut"
                rules={[{ required: true, message: 'Statut requis' }]}
              >
                <Select>
                  <Option value="normal">Normal</Option>
                  <Option value="retard">Retard</Option>
                  <Option value="absent">Absent</Option>
                  <Option value="erreur">Erreur</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Notes supplémentaires..."
            />
          </Form.Item>

          {selectedRecord && (
            <Alert
              message="Informations complémentaires"
              description={
                <List size="small">
                  <List.Item>
                    <List.Item.Meta
                      title="Employé"
                      description={
                        employees.find(emp => emp.id === selectedRecord.employeeId)?.nom
                      }
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      title="Département"
                      description={
                        employees.find(emp => emp.id === selectedRecord.employeeId)?.departement
                      }
                    />
                  </List.Item>
                  {selectedRecord.retardMinutes > 0 && (
                    <List.Item>
                      <List.Item.Meta
                        title="Retard"
                        description={`${selectedRecord.retardMinutes} minutes`}
                      />
                    </List.Item>
                  )}
                  {selectedRecord.correction && (
                    <List.Item>
                      <List.Item.Meta
                        title="Statut"
                        description={<Tag color="red">Nécessite correction</Tag>}
                      />
                    </List.Item>
                  )}
                </List>
              }
              type="info"
              showIcon
            />
          )}
        </Form>
      </Modal>

      <style jsx>{`
        :global(.row-correction) {
          background-color: #fff2f0;
        }
        :global(.row-correction:hover) {
          background-color: #ffe6e6;
        }
      `}</style>
    </div>
  );
};

export default HistoriquePointage;
