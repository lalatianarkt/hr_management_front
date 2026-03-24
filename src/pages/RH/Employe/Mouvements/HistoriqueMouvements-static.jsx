// src/pages/RH/Employe/Mouvements/HistoriqueMouvements.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tooltip,
  Avatar,
  List,
  Timeline,
  Divider,
  Badge,
  Popconfirm,
  message,
  Tabs,
  Descriptions,
  InputNumber,
  Progress  // ← Ajout de l'import manquant
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  HistoryOutlined,
  TeamOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  SwapOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const HistoriqueMouvements = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMouvement, setSelectedMouvement] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form] = Form.useForm();

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
      {
        id: 1,
        nom: 'Dupont Jean',
        departement: 'IT',
        poste: 'Développeur Senior',
        salaire: 45000,
        dateEmbauche: '2020-03-15',
        historique: [
          {
            id: 1,
            type: 'arrivee',
            date: '2020-03-15',
            ancienPoste: '',
            nouveauPoste: 'Développeur Junior',
            ancienDepartement: '',
            nouveauDepartement: 'IT',
            ancienSalaire: 0,
            nouveauSalaire: 35000,
            motif: 'Embauche initiale',
            notes: 'Recrutement suite stage de fin d études'
          },
          {
            id: 2,
            type: 'promotion',
            date: '2021-06-01',
            ancienPoste: 'Développeur Junior',
            nouveauPoste: 'Développeur',
            ancienDepartement: 'IT',
            nouveauDepartement: 'IT',
            ancienSalaire: 35000,
            nouveauSalaire: 40000,
            motif: 'Performance exceptionnelle',
            notes: 'Promotion après évaluation annuelle positive'
          },
          {
            id: 3,
            type: 'augmentation_salaire',
            date: '2022-01-01',
            ancienPoste: 'Développeur',
            nouveauPoste: 'Développeur',
            ancienDepartement: 'IT',
            nouveauDepartement: 'IT',
            ancienSalaire: 40000,
            nouveauSalaire: 42000,
            motif: 'Augmentation annuelle',
            notes: 'Augmentation standard de 5%'
          },
          {
            id: 4,
            type: 'promotion',
            date: '2023-04-01',
            ancienPoste: 'Développeur',
            nouveauPoste: 'Développeur Senior',
            ancienDepartement: 'IT',
            nouveauDepartement: 'IT',
            ancienSalaire: 42000,
            nouveauSalaire: 45000,
            motif: 'Prise de responsabilités',
            notes: 'Promotion suite à la réussite du projet X'
          }
        ]
      },
      {
        id: 2,
        nom: 'Martin Marie',
        departement: 'IT',
        poste: 'Développeuse Frontend',
        salaire: 42000,
        dateEmbauche: '2021-09-01',
        historique: [
          {
            id: 5,
            type: 'arrivee',
            date: '2021-09-01',
            ancienPoste: '',
            nouveauPoste: 'Développeuse Frontend Junior',
            ancienDepartement: '',
            nouveauDepartement: 'IT',
            ancienSalaire: 0,
            nouveauSalaire: 38000,
            motif: 'Embauche CDI',
            notes: 'Première expérience professionnelle'
          },
          {
            id: 6,
            type: 'augmentation_salaire',
            date: '2022-09-01',
            ancienPoste: 'Développeuse Frontend Junior',
            nouveauPoste: 'Développeuse Frontend',
            ancienDepartement: 'IT',
            nouveauDepartement: 'IT',
            ancienSalaire: 38000,
            nouveauSalaire: 42000,
            motif: 'Fin période essai + performance',
            notes: 'Augmentation de 10.5%'
          }
        ]
      },
      {
        id: 3,
        nom: 'Bernard Pierre',
        departement: 'Finance',
        poste: 'Analyste Financier Senior',
        salaire: 52000,
        dateEmbauche: '2018-06-10',
        historique: [
          {
            id: 7,
            type: 'arrivee',
            date: '2018-06-10',
            ancienPoste: '',
            nouveauPoste: 'Assistant Comptable',
            ancienDepartement: '',
            nouveauDepartement: 'Finance',
            ancienSalaire: 0,
            nouveauSalaire: 32000,
            motif: 'Embauche',
            notes: ''
          },
          {
            id: 8,
            type: 'promotion',
            date: '2019-07-01',
            ancienPoste: 'Assistant Comptable',
            nouveauPoste: 'Analyste Financier',
            ancienDepartement: 'Finance',
            nouveauDepartement: 'Finance',
            ancienSalaire: 32000,
            nouveauSalaire: 40000,
            motif: 'Obtention diplôme + performance',
            notes: 'Promotion après obtention du DSCG'
          },
          {
            id: 9,
            type: 'augmentation_salaire',
            date: '2020-07-01',
            ancienPoste: 'Analyste Financier',
            nouveauPoste: 'Analyste Financier',
            ancienDepartement: 'Finance',
            nouveauDepartement: 'Finance',
            ancienSalaire: 40000,
            nouveauSalaire: 45000,
            motif: 'Augmentation méritocratique',
            notes: 'Augmentation de 12.5% pour performance exceptionnelle'
          },
          {
            id: 10,
            type: 'promotion',
            date: '2022-01-01',
            ancienPoste: 'Analyste Financier',
            nouveauPoste: 'Analyste Financier Senior',
            ancienDepartement: 'Finance',
            nouveauDepartement: 'Finance',
            ancienSalaire: 45000,
            nouveauSalaire: 52000,
            motif: 'Expérience et expertise',
            notes: 'Promotion vers poste senior avec encadrement juniors'
          }
        ]
      },
      {
        id: 4,
        nom: 'Sophie Laurent',
        departement: 'IT',
        poste: 'Directrice IT',
        salaire: 75000,
        dateEmbauche: '2019-01-15',
        historique: [
          {
            id: 11,
            type: 'arrivee',
            date: '2019-01-15',
            ancienPoste: '',
            nouveauPoste: 'Chef de Projet IT',
            ancienDepartement: '',
            nouveauDepartement: 'IT',
            ancienSalaire: 0,
            nouveauSalaire: 55000,
            motif: 'Recrutement cadre',
            notes: 'Expérience précédente chez concurrent'
          },
          {
            id: 12,
            type: 'promotion',
            date: '2021-03-01',
            ancienPoste: 'Chef de Projet IT',
            nouveauPoste: 'Directrice IT',
            ancienDepartement: 'IT',
            nouveauDepartement: 'IT',
            ancienSalaire: 55000,
            nouveauSalaire: 75000,
            motif: 'Restructuration département',
            notes: 'Promotion suite au départ de l ancien directeur'
          }
        ]
      }
    ];

    setEmployees(mockEmployees);
    // Tous les mouvements regroupés
    const allMouvements = mockEmployees.flatMap(emp => 
      emp.historique.map(mvt => ({ ...mvt, employeeNom: emp.nom, employeeId: emp.id }))
    ).sort((a, b) => moment(b.date).diff(moment(a.date)));
    
    setMouvements(allMouvements);
  }, []);

  // Gestion des mouvements
  const handleAddMouvement = (employee) => {
    setSelectedEmployee(employee);
    setSelectedMouvement(null);
    form.resetFields({
      employeeId: employee.id,
      date: moment()
    });
    setIsModalVisible(true);
  };

  const handleEditMouvement = (mouvement) => {
    setSelectedMouvement(mouvement);
    setSelectedEmployee(employees.find(emp => emp.id === mouvement.employeeId));
    form.setFieldsValue({
      ...mouvement,
      date: moment(mouvement.date)
    });
    setIsModalVisible(true);
  };

  const handleDeleteMouvement = (mouvementId) => {
    setEmployees(prev => prev.map(emp => ({
      ...emp,
      historique: emp.historique.filter(mvt => mvt.id !== mouvementId)
    })));
    
    setMouvements(prev => prev.filter(mvt => mvt.id !== mouvementId));
    message.success('Mouvement supprimé avec succès');
  };

  const handleSaveMouvement = () => {
    form.validateFields().then(values => {
      const mouvementData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        employeeNom: selectedEmployee.nom
      };

      if (selectedMouvement) {
        // Modification
        setEmployees(prev => prev.map(emp =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                historique: emp.historique.map(mvt =>
                  mvt.id === selectedMouvement.id ? { ...selectedMouvement, ...mouvementData } : mvt
                )
              }
            : emp
        ));
        
        setMouvements(prev => prev.map(mvt =>
          mvt.id === selectedMouvement.id ? { ...selectedMouvement, ...mouvementData } : mvt
        ));

        message.success('Mouvement modifié avec succès');
      } else {
        // Ajout
        const newMouvement = {
          id: Date.now(),
          ...mouvementData
        };

        setEmployees(prev => prev.map(emp =>
          emp.id === selectedEmployee.id
            ? {
                ...emp,
                historique: [...emp.historique, newMouvement],
                // Mise à jour des infos courantes si c'est le dernier mouvement
                ...(moment(newMouvement.date).isAfter(moment(emp.historique[0]?.date)) && {
                  poste: newMouvement.nouveauPoste || emp.poste,
                  departement: newMouvement.nouveauDepartement || emp.departement,
                  salaire: newMouvement.nouveauSalaire || emp.salaire
                })
              }
            : emp
        ));

        setMouvements(prev => [newMouvement, ...prev]);
        message.success('Mouvement enregistré avec succès');
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedMouvement(null);
      setSelectedEmployee(null);
    });
  };

  // Statistiques
  const stats = {
    totalMouvements: mouvements.length,
    promotions: mouvements.filter(m => m.type === 'promotion').length,
    mutations: mouvements.filter(m => m.type === 'mutation').length,
    augmentations: mouvements.filter(m => m.type === 'augmentation_salaire').length,
    mouvementsMois: mouvements.filter(m => moment(m.date).isSame(moment(), 'month')).length
  };

  // Colonnes pour le tableau des mouvements
  const columnsMouvements = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).diff(moment(b.date))
    },
    {
      title: 'Employé',
      dataIndex: 'employeeNom',
      key: 'employeeNom',
      render: (nom, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {nom}
        </Space>
      )
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
      }
    },
    {
      title: 'Changements',
      key: 'changements',
      render: (record) => (
        <Space direction="vertical" size="small">
          {record.ancienPoste && record.nouveauPoste && record.ancienPoste !== record.nouveauPoste && (
            <div>
              <strong>Poste:</strong> {record.ancienPoste} → {record.nouveauPoste}
            </div>
          )}
          {record.ancienDepartement && record.nouveauDepartement && record.ancienDepartement !== record.nouveauDepartement && (
            <div>
              <strong>Département:</strong> {record.ancienDepartement} → {record.nouveauDepartement}
            </div>
          )}
          {record.ancienSalaire && record.nouveauSalaire && record.ancienSalaire !== record.nouveauSalaire && (
            <div>
              <strong>Salaire:</strong> {record.ancienSalaire}€ → {record.nouveauSalaire}€
            </div>
          )}
        </Space>
      )
    },  
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      ellipsis: true
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
              onClick={() => handleEditMouvement(record)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEditMouvement(record)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Popconfirm
              title="Supprimer ce mouvement ?"
              onConfirm={() => handleDeleteMouvement(record.id)}
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

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <HistoryOutlined className="me-2" />
                Historique des Mouvements
              </h2>
              <p className="text-muted">
                Suivi des promotions, mutations et changements de carrière
              </p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setSelectedEmployee(null)}
            >
              Nouveau Mouvement
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-4">
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><HistoryOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalMouvements}</div>
              <div className="stat-label">Total mouvements</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><ArrowUpOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.promotions}</div>
              <div className="stat-label">Promotions</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><SwapOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.mutations}</div>
              <div className="stat-label">Mutations</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><DollarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.augmentations}</div>
              <div className="stat-label">Augmentations</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><CalendarOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.mouvementsMois}</div>
              <div className="stat-label">Ce mois</div>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className="stat-card">
            <div className="stat-icon"><TeamOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{employees.length}</div>
              <div className="stat-label">Employés actifs</div>
            </div>
          </div>
        </Col>
      </Row>

      <Tabs defaultActiveKey="mouvements">
        {/* Onglet 1: Tous les mouvements */}
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Tous les Mouvements
            </span>
          } 
          key="mouvements"
        >
          <Card
            title="Historique Complet des Mouvements"
            extra={
              <Button 
                type="primary" 
                icon={<FileTextOutlined />}
              >
                Exporter l'historique
              </Button>
            }
          >
            <Table
              columns={columnsMouvements}
              dataSource={mouvements}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        {/* Onglet 2: Par employé */}
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Par Employé
            </span>
          } 
          key="employes"
        >
          <Row gutter={16}>
            {employees.map(employee => (
              <Col span={12} key={employee.id} className="mb-4">
                <Card
                  title={
                    <Space>
                      <Avatar icon={<UserOutlined />} />
                      {employee.nom}
                    </Space>
                  }
                  extra={
                    <Button 
                      type="link" 
                      icon={<PlusOutlined />}
                      onClick={() => handleAddMouvement(employee)}
                    >
                      Ajouter
                    </Button>
                  }
                >
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Département">
                      {employee.departement}
                    </Descriptions.Item>
                    <Descriptions.Item label="Poste actuel">
                      {employee.poste}
                    </Descriptions.Item>
                    <Descriptions.Item label="Salaire actuel">
                      {employee.salaire}€
                    </Descriptions.Item>
                    <Descriptions.Item label="Date d'embauche">
                      {moment(employee.dateEmbauche).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  <Timeline>
                    {employee.historique
                      .sort((a, b) => moment(b.date).diff(moment(a.date)))
                      .map(mouvement => {
                        const typeInfo = typesMouvement.find(t => t.value === mouvement.type);
                        return (
                          <Timeline.Item
                            key={mouvement.id}
                            color={typeInfo?.color}
                            dot={typeInfo?.icon}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                <div><strong>{typeInfo?.label}</strong></div>
                                <div style={{ fontSize: '12px' }}>
                                  {mouvement.motif}
                                </div>
                                {mouvement.ancienPoste && mouvement.nouveauPoste && (
                                  <div style={{ fontSize: '12px', color: '#5c2458' }}>
                                    {mouvement.ancienPoste} → {mouvement.nouveauPoste}
                                  </div>
                                )}
                                {mouvement.ancienSalaire && mouvement.nouveauSalaire && (
                                  <div style={{ fontSize: '12px', color: '#5c2458' }}>
                                    {mouvement.ancienSalaire}€ → {mouvement.nouveauSalaire}€
                                  </div>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#5c2458' }}>
                                {moment(mouvement.date).format('DD/MM/YYYY')}
                              </div>
                            </div>
                          </Timeline.Item>
                        );
                      })}
                  </Timeline>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        {/* Onglet 3: Analyse */}
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              Analyse
            </span>
          } 
          key="analyse"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Répartition par Type de Mouvement">
                <List
                  dataSource={typesMouvement}
                  renderItem={type => {
                    const count = mouvements.filter(m => m.type === type.value).length;
                    const percentage = mouvements.length > 0 ? (count / mouvements.length * 100).toFixed(1) : 0;
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
            <Col span={12}>
              <Card title="Évolution par Année">
                <List
                  dataSource={[
                    { annee: '2024', mouvements: 8, promotions: 3 },
                    { annee: '2023', mouvements: 12, promotions: 4 },
                    { annee: '2022', mouvements: 10, promotions: 3 },
                    { annee: '2021', mouvements: 9, promotions: 2 }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={`Année ${item.annee}`}
                        description={
                          <div>
                            <div>{item.mouvements} mouvements totaux</div>
                            <div>{item.promotions} promotions</div>
                            <Progress 
                              percent={(item.mouvements / 15) * 100} 
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
          </Row>
        </TabPane>
      </Tabs>

      {/* Modal pour ajouter/modifier un mouvement */}
      <Modal
        title={
          <span>
            {selectedMouvement ? <EditOutlined /> : <PlusOutlined />}
            {selectedMouvement ? ' Modifier le mouvement' : ' Nouveau mouvement'}
            {selectedEmployee && ` - ${selectedEmployee.nom}`}
          </span>
        }
        open={isModalVisible}
        onOk={handleSaveMouvement}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedMouvement(null);
          setSelectedEmployee(null);
        }}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!selectedEmployee && (
            <Form.Item
              name="employeeId"
              label="Employé"
              rules={[{ required: true, message: 'Employé requis' }]}
            >
              <Select placeholder="Sélectionnez un employé">
                {employees.map(employee => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.nom} - {employee.departement}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date du mouvement"
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
                name="type"
                label="Type de mouvement"
                rules={[{ required: true, message: 'Type requis' }]}
              >
                <Select placeholder="Sélectionnez le type">
                  {typesMouvement.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Tag color={type.color} icon={type.icon}>
                        {type.label}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Poste</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ancienPoste"
                label="Ancien poste"
              >
                <Input placeholder="Poste avant le mouvement" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nouveauPoste"
                label="Nouveau poste"
              >
                <Input placeholder="Poste après le mouvement" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Département</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ancienDepartement"
                label="Ancien département"
              >
                <Input placeholder="Département avant le mouvement" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nouveauDepartement"
                label="Nouveau département"
              >
                <Input placeholder="Département après le mouvement" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Salaire</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ancienSalaire"
                label="Ancien salaire (€)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Salaire avant le mouvement"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nouveauSalaire"
                label="Nouveau salaire (€)"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Salaire après le mouvement"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="motif"
            label="Motif du mouvement"
            rules={[{ required: true, message: 'Motif requis' }]}
          >
            <Input placeholder="Raison du mouvement..." />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes complémentaires"
          >
            <TextArea
              rows={3}
              placeholder="Informations supplémentaires..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoriqueMouvements;
