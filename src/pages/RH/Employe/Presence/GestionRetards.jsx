// src/pages/RH/Employe/Presence/GestionRetards.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  List,
  Alert,
  Progress,
  Space,
  Tooltip,
  Badge,
  Popconfirm,
  message,
  Tabs,
  Divider,
  Switch
} from 'antd';
import {
  ExclamationCircleOutlined,
  BellOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  BarChartOutlined,
  HistoryOutlined,
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const GestionRetards = () => {
  const [loading, setLoading] = useState(false);
  const [retards, setRetards] = useState([]);
  const [seuils, setSeuils] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [selectedRetard, setSelectedRetard] = useState(null);
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();

  // Données mockées des employés
  const [employees] = useState([
    { id: 1, nom: 'Dupont Jean', departement: 'IT', email: 'j.dupont@entreprise.com' },
    { id: 2, nom: 'Martin Marie', departement: 'IT', email: 'm.martin@entreprise.com' },
    { id: 3, nom: 'Bernard Pierre', departement: 'Finance', email: 'p.bernard@entreprise.com' },
    { id: 4, nom: 'Sophie Laurent', departement: 'IT', email: 's.laurent@entreprise.com' },
    { id: 5, nom: 'Paul Durand', departement: 'Finance', email: 'p.durand@entreprise.com' }
  ]);

  // Types de motifs de retard
  const motifsRetard = [
    { value: 'transport', label: 'Problème de transport', color: 'orange' },
    { value: 'sante', label: 'Problème de santé', color: 'red' },
    { value: 'familial', label: 'Raison familiale', color: 'purple' },
    { value: 'meteo', label: 'Conditions météo', color: "#b053ad" },
    { value: 'autre', label: 'Autre raison', color: 'default' }
  ];

  // Génération des données mockées
  useEffect(() => {
    generateMockData();
    loadSeuils();
  }, []);

  const generateMockData = () => {
    // Données mockées pour les retards
    const mockRetards = [
      {
        id: 1,
        employeeId: 1,
        date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
        heureArrivee: '09:25',
        retardMinutes: 25,
        motif: 'transport',
        details: 'Problèmes de transport en commun',
        statut: 'non_justifie',
        justificatif: false,
        notifie: true
      },
      {
        id: 2,
        employeeId: 2,
        date: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        heureArrivee: '09:45',
        retardMinutes: 45,
        motif: 'sante',
        details: 'Rendez-vous médical urgent',
        statut: 'justifie',
        justificatif: true,
        notifie: true
      },
      {
        id: 3,
        employeeId: 3,
        date: moment().subtract(3, 'days').format('YYYY-MM-DD'),
        heureArrivee: '10:15',
        retardMinutes: 75,
        motif: 'familial',
        details: 'Problème familial imprévu',
        statut: 'en_attente',
        justificatif: false,
        notifie: true
      },
      {
        id: 4,
        employeeId: 1,
        date: moment().subtract(5, 'days').format('YYYY-MM-DD'),
        heureArrivee: '09:35',
        retardMinutes: 35,
        motif: 'transport',
        details: 'Embouteillages exceptionnels',
        statut: 'justifie',
        justificatif: true,
        notifie: true
      },
      {
        id: 5,
        employeeId: 4,
        date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        heureArrivee: '09:20',
        retardMinutes: 20,
        motif: 'meteo',
        details: 'Conditions météo difficiles',
        statut: 'non_justifie',
        justificatif: false,
        notifie: false
      }
    ];

    // Données mockées pour les notifications
    const mockNotifications = [
      {
        id: 1,
        employeeId: 1,
        type: 'retard',
        date: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm'),
        sujet: 'Retard signalé - 25 minutes',
        message: 'Bonjour, vous avez été signalé en retard ce matin. Merci de fournir un justificatif.',
        statut: 'envoyee',
        canal: 'email'
      },
      {
        id: 2,
        employeeId: 2,
        type: 'retard',
        date: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm'),
        sujet: 'Retard signalé - 45 minutes',
        message: 'Votre retard a été enregistré. Un justificatif est requis.',
        statut: 'envoyee',
        canal: 'email'
      },
      {
        id: 3,
        employeeId: 3,
        type: 'rappel_justificatif',
        date: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm'),
        sujet: 'Rappel - Justificatif de retard',
        message: 'Rappel : votre justificatif de retard est toujours attendu.',
        statut: 'envoyee',
        canal: 'email'
      }
    ];

    setRetards(mockRetards);
    setNotifications(mockNotifications);
  };

  const loadSeuils = () => {
    const defaultSeuils = {
      seuilAlerte: 15,
      seuilAvertissement: 30,
      seuilCritique: 60,
      notificationAuto: true,
      rappelJustificatif: true,
      delaiJustificatif: 48,
      managersNotifies: true
    };
    setSeuils(defaultSeuils);
    configForm.setFieldsValue(defaultSeuils);
  };

  // Statistiques des retards
  const stats = {
    totalRetards: retards.length,
    retardsMois: retards.filter(r => moment(r.date).isSame(moment(), 'month')).length,
    retardsSemaine: retards.filter(r => moment(r.date).isSame(moment(), 'week')).length,
    moyenneRetard: retards.length > 0 ? 
      (retards.reduce((sum, r) => sum + r.retardMinutes, 0) / retards.length).toFixed(1) : 0,
    tauxJustification: retards.length > 0 ? 
      ((retards.filter(r => r.statut === 'justifie').length / retards.length) * 100).toFixed(1) : 0
  };

  // Retards par employé pour le rapport
  const retardsParEmploye = employees.map(employee => {
    const retardsEmploye = retards.filter(r => r.employeeId === employee.id);
    return {
      ...employee,
      nombreRetards: retardsEmploye.length,
      totalMinutes: retardsEmploye.reduce((sum, r) => sum + r.retardMinutes, 0),
      moyenneRetard: retardsEmploye.length > 0 ? 
        (retardsEmploye.reduce((sum, r) => sum + r.retardMinutes, 0) / retardsEmploye.length).toFixed(1) : 0,
      dernierRetard: retardsEmploye.length > 0 ? 
        moment(retardsEmploye[0].date).format('DD/MM/YYYY') : 'Aucun'
    };
  }).filter(emp => emp.nombreRetards > 0);

  // Colonnes pour la liste des retards
  const columnsRetards = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Employé',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.nom : 'N/A';
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
      title: 'Heure Arrivée',
      dataIndex: 'heureArrivee',
      key: 'heureArrivee'
    },
    {
      title: 'Retard',
      dataIndex: 'retardMinutes',
      key: 'retardMinutes',
      render: (minutes) => {
        let color = 'green';
        if (minutes > seuils.seuilCritique) color = 'red';
        else if (minutes > seuils.seuilAvertissement) color = 'orange';
        else if (minutes > seuils.seuilAlerte) color = 'yellow';

        return (
          <Tag color={color}>
            {minutes} min
          </Tag>
        );
      },
      sorter: (a, b) => a.retardMinutes - b.retardMinutes
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      render: (motif) => {
        const motifObj = motifsRetard.find(m => m.value === motif);
        return (
          <Tag color={motifObj?.color}>
            {motifObj?.label}
          </Tag>
        );
      }
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut, record) => {
        const statuts = {
          justifie: { label: 'Justifié', color: 'green' },
          non_justifie: { label: 'Non justifié', color: 'red' },
          en_attente: { label: 'En attente', color: 'orange' }
        };
        const statutInfo = statuts[statut] || { label: statut, color: 'default' };
        
        return (
          <Space>
            <Tag color={statutInfo.color}>{statutInfo.label}</Tag>
            {record.justificatif && <Badge status="success" />}
          </Space>
        );
      }
    },
    {
      title: 'Notification',
      dataIndex: 'notifie',
      key: 'notifie',
      render: (notifie) => (
        <Tag color={notifie ? '#b053ad' : 'default'}>
          {notifie ? 'Notifié' : 'À notifier'}
        </Tag>
      )
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
              onClick={() => handleViewRetard(record)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEditRetard(record)}
            />
          </Tooltip>
          <Tooltip title="Envoyer notification">
            <Button 
              type="link" 
              icon={<BellOutlined />}
              onClick={() => handleNotify(record)}
              disabled={record.notifie}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Colonnes pour l'historique des notifications
  const columnsNotifications = [
    {
      title: 'Date/Heure',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Employé',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.nom : 'N/A';
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'retard' ? 'orange' : "#b053ad"}>
          {type === 'retard' ? 'Alerte retard' : 'Rappel justificatif'}
        </Tag>
      )
    },
    {
      title: 'Sujet',
      dataIndex: 'sujet',
      key: 'sujet'
    },
    {
      title: 'Canal',
      dataIndex: 'canal',
      key: 'canal',
      render: (canal) => (
        <Tag color={canal === 'email' ? '#b053ad' : 'green'}>
          {canal === 'email' ? 'Email' : 'SMS'}
        </Tag>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <Tag color={statut === 'envoyee' ? 'green' : 'orange'}>
          {statut === 'envoyee' ? 'Envoyée' : 'En attente'}
        </Tag>
      )
    }
  ];

  // Gestion des actions
  const handleViewRetard = (retard) => {
    setSelectedRetard(retard);
    setIsModalVisible(true);
  };

  const handleEditRetard = (retard) => {
    setSelectedRetard(retard);
    form.setFieldsValue({
      employeeId: retard.employeeId,
      date: moment(retard.date),
      heureArrivee: retard.heureArrivee,
      retardMinutes: retard.retardMinutes,
      motif: retard.motif,
      details: retard.details,
      statut: retard.statut,
      justificatif: retard.justificatif
    });
    setIsModalVisible(true);
  };

  const handleNotify = (retard) => {
    // Simuler l'envoi de notification via n8n
    const nouvelleNotification = {
      id: notifications.length + 1,
      employeeId: retard.employeeId,
      type: 'retard',
      date: moment().format('YYYY-MM-DD HH:mm'),
      sujet: `Retard signalé - ${retard.retardMinutes} minutes`,
      message: `Bonjour, vous avez été signalé en retard ce matin (${retard.retardMinutes} minutes). Merci de fournir un justificatif.`,
      statut: 'envoyee',
      canal: 'email'
    };

    setNotifications(prev => [nouvelleNotification, ...prev]);
    
    // Marquer le retard comme notifié
    setRetards(prev => prev.map(r => 
      r.id === retard.id ? { ...r, notifie: true } : r
    ));

    message.success('Notification envoyée avec succès');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (selectedRetard) {
        // Modification
        const updatedRetard = {
          ...selectedRetard,
          ...values,
          date: values.date.format('YYYY-MM-DD')
        };
        setRetards(prev => prev.map(r => 
          r.id === selectedRetard.id ? updatedRetard : r
        ));
        message.success('Retard modifié avec succès');
      } else {
        // Nouveau retard
        const newRetard = {
          id: retards.length + 1,
          ...values,
          date: values.date.format('YYYY-MM-DD'),
          notifie: false
        };
        setRetards(prev => [newRetard, ...prev]);
        message.success('Retard ajouté avec succès');
      }
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRetard(null);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedRetard(null);
  };

  const handleConfigOk = () => {
    configForm.validateFields().then(values => {
      setSeuils(values);
      setIsConfigModalVisible(false);
      message.success('Configuration des seuils mise à jour');
    });
  };

  const handleConfigCancel = () => {
    setIsConfigModalVisible(false);
    configForm.setFieldsValue(seuils);
  };

  // Génération du rapport managers
  const genererRapportManagers = () => {
    const rapport = {
      periode: moment().format('MMMM YYYY'),
      totalRetards: stats.totalRetards,
      employePlusRetards: retardsParEmploye.sort((a, b) => b.nombreRetards - a.nombreRetards)[0],
      tauxJustification: stats.tauxJustification,
      tendance: stats.retardsMois > stats.retardsSemaine * 4 ? 'hausse' : 'baisse'
    };
    
    message.info('Rapport généré pour les managers');
    return rapport;
  };

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <ExclamationCircleOutlined className="me-2" />
                Gestion des Retards
              </h2>
              <p className="text-muted">
                Suivi, notification et analyse des retards des collaborateurs
              </p>
            </div>
            <Space>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setIsConfigModalVisible(true)}
              >
                Configuration
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedRetard(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Ajouter un retard
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-4">
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><ClockCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalRetards}</div>
              <div className="stat-label">Total retards</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><CalendarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.retardsMois}</div>
              <div className="stat-label">Ce mois</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><HistoryOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.retardsSemaine}</div>
              <div className="stat-label">Cette semaine</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><BarChartOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.moyenneRetard} min</div>
              <div className="stat-label">Moyenne retard</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><CheckCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.tauxJustification}%</div>
              <div className="stat-label">Taux justification</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><BellOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{retards.filter(r => !r.notifie).length}</div>
              <div className="stat-label">À notifier</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alertes seuils */}
      <Alert
        message="Configuration des seuils d'alerte"
        description={
          <div>
            Seuil d'alerte: <strong>{seuils.seuilAlerte} min</strong> | 
            Seuil d'avertissement: <strong>{seuils.seuilAvertissement} min</strong> | 
            Seuil critique: <strong>{seuils.seuilCritique} min</strong>
          </div>
        }
        type="info"
        showIcon
        className="mb-4"
        action={
          <Button 
            size="small" 
            type="primary"
            onClick={() => setIsConfigModalVisible(true)}
          >
            Modifier
          </Button>
        }
      />

      <Tabs defaultActiveKey="retards">
        {/* Onglet 1: Liste des retards */}
        <TabPane 
          tab={
            <span>
              <ExclamationCircleOutlined />
              Liste des Retards
            </span>
          } 
          key="retards"
        >
          <Card>
            <Table
              columns={columnsRetards}
              dataSource={retards}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
              loading={loading}
            />
          </Card>
        </TabPane>

        {/* Onglet 2: Statistiques par employé */}
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Statistiques
            </span>
          } 
          key="statistiques"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Répartition par motif">
                <List
                  dataSource={motifsRetard}
                  renderItem={motif => {
                    const count = retards.filter(r => r.motif === motif.value).length;
                    const percentage = retards.length > 0 ? (count / retards.length * 100).toFixed(1) : 0;
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Tag color={motif.color}>{motif.label}</Tag>}
                          description={
                            <Progress 
                              percent={parseFloat(percentage)} 
                              size="small"
                              format={() => `${count} retards (${percentage}%)`}
                            />
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Retards par employé">
                <List
                  dataSource={retardsParEmploye}
                  renderItem={employe => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<UserOutlined />}
                        title={employe.nom}
                        description={`${employe.departement} - ${employe.nombreRetards} retards`}
                      />
                      <div className="text-end">
                        <div>Moyenne: {employe.moyenneRetard} min</div>
                        <div className="text-muted">Dernier: {employe.dernierRetard}</div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Onglet 3: Historique des notifications */}
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Historique Notifications
            </span>
          } 
          key="notifications"
        >
          <Card>
            <Table
              columns={columnsNotifications}
              dataSource={notifications}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: record => (
                  <div>
                    <strong>Message:</strong>
                    <p>{record.message}</p>
                  </div>
                )
              }}
            />
          </Card>
        </TabPane>

        {/* Onglet 4: Rapport managers */}
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Rapport Managers
            </span>
          } 
          key="rapport"
        >
          <Card 
            title="Rapport de synthèse pour les managers"
            extra={
              <Button 
                type="primary" 
                icon={<MailOutlined />}
                onClick={genererRapportManagers}
              >
                Générer le rapport
              </Button>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" title="Aperçu général">
                  <div className="stat-card mb-2">
                    <div className="stat-icon"><CalendarOutlined /></div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.retardsMois}</div>
                      <div className="stat-label">Total retards mensuel</div>
                    </div>
                  </div>
                  <div className="stat-card mb-2">
                    <div className="stat-icon"><CheckCircleOutlined /></div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.tauxJustification}%</div>
                      <div className="stat-label">Taux de justification</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><BarChartOutlined /></div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.moyenneRetard} min</div>
                      <div className="stat-label">Moyenne des retards</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Top retards">
                  <List
                    size="small"
                    dataSource={retardsParEmploye.slice(0, 3)}
                    renderItem={(employe, index) => (
                      <List.Item>
                        <Badge count={index + 1} style={{ backgroundColor: '#52c41a' }} />
                        <span className="ms-2">{employe.nom}</span>
                        <Tag className="ms-auto">{employe.nombreRetards} retards</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Recommandations">
                  <Alert
                    message="Actions recommandées"
                    description={
                      <div>
                        <div>• Renforcer la communication sur les horaires</div>
                        <div>• Vérifier les problèmes de transport récurrents</div>
                        <div>• Planifier des entretiens individuels</div>
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
      </Tabs>

      {/* Modal pour ajouter/modifier un retard */}
      <Modal
        title={
          <span>
            {selectedRetard ? <EditOutlined /> : <PlusOutlined />}
            {selectedRetard ? ' Modifier le retard' : ' Ajouter un retard'}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="Employé"
                rules={[{ required: true, message: 'Veuillez sélectionner un employé' }]}
              >
                <Select placeholder="Sélectionnez un employé">
                  {employees.map(employee => (
                    <Option key={employee.id} value={employee.id}>
                      {employee.nom} - {employee.departement}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date du retard"
                rules={[{ required: true, message: 'Veuillez sélectionner la date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="heureArrivee"
                label="Heure d'arrivée"
                rules={[{ required: true, message: 'Heure requise' }]}
              >
                <Input type="time" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="retardMinutes"
                label="Durée du retard (minutes)"
                rules={[{ required: true, message: 'Durée requise' }]}
              >
                <Input 
                  type="number" 
                  min={1}
                  max={480}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="motif"
                label="Motif du retard"
                rules={[{ required: true, message: 'Motif requis' }]}
              >
                <Select placeholder="Sélectionnez un motif">
                  {motifsRetard.map(motif => (
                    <Option key={motif.value} value={motif.value}>
                      {motif.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="details"
            label="Détails complémentaires"
          >
            <TextArea
              rows={3}
              placeholder="Précisez les circonstances du retard..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="statut"
                label="Statut"
                rules={[{ required: true, message: 'Statut requis' }]}
              >
                <Select>
                  <Option value="en_attente">En attente</Option>
                  <Option value="justifie">Justifié</Option>
                  <Option value="non_justifie">Non justifié</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="justificatif"
                label="Justificatif fourni"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal de configuration des seuils */}
      <Modal
        title={
          <span>
            <SettingOutlined className="me-2" />
            Configuration des Seuils d'Alerte
          </span>
        }
        open={isConfigModalVisible}
        onOk={handleConfigOk}
        onCancel={handleConfigCancel}
        width={600}
      >
        <Form
          form={configForm}
          layout="vertical"
        >
          <Alert
            message="Configuration des seuils de retard"
            description="Définissez les seuils qui déclencheront les alertes et notifications automatiques."
            type="info"
            showIcon
            className="mb-3"
          />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="seuilAlerte"
                label="Seuil d'alerte (minutes)"
                rules={[{ required: true, message: 'Seuil requis' }]}
              >
                <Input 
                  type="number" 
                  min={1}
                  max={120}
                  addonAfter="min"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="seuilAvertissement"
                label="Seuil d'avertissement (minutes)"
                rules={[{ required: true, message: 'Seuil requis' }]}
              >
                <Input 
                  type="number" 
                  min={1}
                  max={120}
                  addonAfter="min"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="seuilCritique"
                label="Seuil critique (minutes)"
                rules={[{ required: true, message: 'Seuil requis' }]}
              >
                <Input 
                  type="number" 
                  min={1}
                  max={240}
                  addonAfter="min"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item
            name="notificationAuto"
            label="Notification automatique"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="rappelJustificatif"
            label="Rappel automatique justificatif"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="delaiJustificatif"
            label="Délai pour justificatif (heures)"
          >
            <Input 
              type="number" 
              min={1}
              max={168}
              addonAfter="h"
            />
          </Form.Item>

          <Form.Item
            name="managersNotifies"
            label="Notification des managers"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionRetards;
