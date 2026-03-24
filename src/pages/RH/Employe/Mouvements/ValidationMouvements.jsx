import React, { useEffect, useState } from "react";
import SelectPosteWithoutDepartement from "./SelectPosteWithoutDepartement";
import SelectNiveauHierarchique from './SelectNiveauHierarchique';
import SelectPosteHierarchique from "./SelectPosteHierarchique";
import axios from "axios";
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
  Progress,
  Spin,
  Empty,
  Steps
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
  FileTextOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { type } from "@testing-library/user-event/dist/type";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

export default function ValidationMouvements() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [typesMouvement, setTypesMouvement] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMouvement, setSelectedMouvement] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // États pour le nouveau flux
  const [selectedEmployeForMouvement, setSelectedEmployeForMouvement] = useState(null);
  const [selectedTypeMouvement, setSelectedTypeMouvement] = useState(null);
  const [employeDetails, setEmployeDetails] = useState(null);
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [selectedNiveau, setSelectedNiveau] = useState(null);
  // AJOUT: États pour les sélections dans le formulaire
  // const [selectedDepartement, setSelectedDepartement] = useState(null);
  const [selectedPoste, setSelectedPoste] = useState(null);

  // Icônes par défaut pour les types de mouvements
  const defaultIcons = {
    promotion: <ArrowUpOutlined />,
    mutation: <SwapOutlined />,
    changement_departement: <BankOutlined />,
    augmentation_salaire: <DollarOutlined />,
    changement_poste: <UserOutlined />,
    depart: <TeamOutlined />,
    arrivee: <UserOutlined />
  };

  // Couleurs par défaut pour les types de mouvements
  const defaultColors = {
    promotion: 'green',
    mutation: "#b053ad",
    changement_departement: 'orange',
    augmentation_salaire: 'purple',
    changement_poste: 'cyan',
    depart: 'red',
    arrivee: 'green'
  };

  // Charger tous les types de mouvements depuis l'API
  const fetchTypesMouvement = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/type-mouvements');
      const data = await response.json();
      console.log("data type mvt : ", data);
      if (Array.isArray(data)) {
        const typesFormatted = data.map(type => ({
          id: type.id, // ⬅️ AJOUTER L'ID ORIGINAL ICI
          value: type.type?.toLowerCase() || type.id,
          label: type.type || 'Type inconnu',
          color: defaultColors[type.type?.toLowerCase()] || 'default',
          icon: defaultIcons[type.type?.toLowerCase()] || <HistoryOutlined />
        }));
        setTypesMouvement(typesFormatted);
      } else {
        // setTypesMouvement(getDefaultTypes());
        console.log("erruer de récupération des types de mouvement");
      }
    } catch (error) {
      console.error("Erreur chargement types de mouvement:", error);
    //   setTypesMouvement(getDefaultTypes());
    }
  };

  // Charger tous les employés avec leurs informations
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/employes/allEmpWithInfos');
    //   console.log("ato", response);
      const data = await response.json();
      console.log("data : ", data);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement employés:", error);
      message.error("Erreur lors du chargement des employés");
    }
  }; 

   // Charger les détails d'un employé spécifique
    const fetchEmployeDetails = async (employeId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/employes/${employeId}`);
            const data = await response.json();
            setEmployeDetails(data);
            return data;
        } catch (error) {
            console.error("Erreur chargement détails employé:", error);
            message.error("Erreur lors du chargement des détails de l'employé");
            return null;
        }
    };

  // Charger tous les mouvements
  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/mouvements');
      const data = await response.json();

      console.log("Données reçues de l'API:", data);
      
      const mouvementsData = Array.isArray(data) ? data : [];
      
      // CORRECTION : Utiliser dateDemande au lieu de date pour le tri
      setMouvements(mouvementsData.sort((a, b) => 
        moment(b.dateDemande || 0).diff(moment(a.dateDemande || 0))
      ));
    } catch (error) {
      console.error("Erreur chargement mouvements:", error);
      setMouvements([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger toutes les données
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTypesMouvement(),
        fetchEmployees(), 
        fetchMouvements()
      ]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleValidateMouvement = async (mouvementId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/demande-mouvements/${mouvementId}/validate`, {
      method: 'PUT',
    });
    if (response.ok) {
      message.success('Mouvement validé avec succès');
      fetchAllData();
    }
  } catch (error) {
    message.error('Erreur lors de la validation');
  }
};

const handleRejectMouvement = async (mouvementId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/demande-mouvements/${mouvementId}/reject`, {
      method: 'PUT',
    });
    if (response.ok) {
      message.success('Mouvement rejeté avec succès');
      fetchAllData();
    }
  } catch (error) {
    message.error('Erreur lors du rejet');
  }
};

// Fonction utilitaire pour obtenir les infos d'un type de mouvement
  const getTypeInfo = (typeValue) => {
    const typeInfo = typesMouvement.find(t => t.value === typeValue);
    return typeInfo || { 
      label: typeValue || 'Non spécifié', 
      color: 'default', 
      icon: <HistoryOutlined /> 
    };
  };

  // Regrouper les mouvements par employé pour l'onglet "Par employé"
  const mouvementsParEmploye = employees.map(employe => {
    const mouvementsEmploye = mouvements.filter(mvt => mvt.employe_id === employe.id);
    return {
      ...employe,
      historique: mouvementsEmploye.sort((a, b) => moment(b.date).diff(moment(a.date)))
    };
  });

  // Statistiques
  const stats = {
    totalMouvements: mouvements.length,
    totalEmployes: employees.length,
    promotions: mouvements.filter(m => m.type === 'promotion').length,
    mutations: mouvements.filter(m => m.type === 'mutation').length,
    augmentations: mouvements.filter(m => m.type === 'augmentation_salaire').length,
    mouvementsMois: mouvements.filter(m => moment(m.date).isSame(moment(), 'month')).length,
    nouveauxEmployes: mouvements.filter(m => m.type === 'arrivee' && moment(m.date).isSame(moment(), 'month')).length
  };

  // Étape 1: Sélection de l'employé
    const handleSelectEmploye = async (employeId) => {
    const employeeData = employees.find(emp => emp.employe.id === employeId);
    if (employeeData) {
        setSelectedEmployeForMouvement(employeeData);
        // Charger les détails complets de l'employé
        const details = await fetchEmployeDetails(employeId);
        setEmployeDetails(details);
        setCurrentStep(1);
    }
    };

    

    

  // Colonnes pour le tableau des mouvements
  const columnsMouvements = [
  {
    title: 'Date Demande',
    dataIndex: 'dateDemande',
    key: 'dateDemande',
    render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-',
    sorter: (a, b) => moment(a.dateDemande || 0).diff(moment(b.dateDemande || 0)),
    defaultSortOrder: 'descend'
  },
  {
    title: 'Employé',
    dataIndex: 'employeDemandeur',
    key: 'employe',
    render: (employeDemandeur) => {
      return (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {employeDemandeur ? `${employeDemandeur.nom} ${employeDemandeur.prenom}` : 'Employé inconnu'}
        </Space>
      );
    }
  },
  {
    title: 'Type',
    dataIndex: 'typeMouvement',
    key: 'type',
    render: (typeMouvement) => {
      const typeValue = typeMouvement?.type;
      const typeInfo = getTypeInfo(typeValue);
      return (
        <Tag color={typeInfo.color} icon={typeInfo.icon}>
          {typeInfo.label}
        </Tag>
      );
    },
    filters: typesMouvement.map(type => ({
      text: type.label,
      value: type.value,
    })),
    onFilter: (value, record) => {
      const recordType = record.typeMouvement?.type;
      return recordType === value;
    },
  },
  {
    title: 'Changements',
    key: 'changements',
    width: 350,
    render: (record) => (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Poste */}
        {(record.ancienPoste || record.nouveauPoste) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ minWidth: '70px' }}>Poste:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#f9f1f8', 
                borderRadius: '4px',
                textDecoration: record.ancienPoste !== record.nouveauPoste ? 'line-through' : 'none',
                fontSize: '12px'
              }}>
                {record.ancienPoste || 'Non spécifié'}
              </span>
              {record.ancienPoste !== record.nouveauPoste && record.nouveauPoste && (
                <>
                  <ArrowRightOutlined style={{ color: '#b053ad', fontSize: '10px' }} />
                  <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#e6f7ff', 
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {record.nouveauPoste}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Département */}
        {(record.ancienDepartement || record.nouveauDepartement) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ minWidth: '70px' }}>Département:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#f9f1f8', 
                borderRadius: '4px',
                textDecoration: record.ancienDepartement !== record.nouveauDepartement ? 'line-through' : 'none',
                fontSize: '12px'
              }}>
                {record.ancienDepartement || 'Non spécifié'}
              </span>
              {record.ancienDepartement !== record.nouveauDepartement && record.nouveauDepartement && (
                <>
                  <ArrowRightOutlined style={{ color: '#b053ad', fontSize: '10px' }} />
                  <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#e6f7ff', 
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {record.nouveauDepartement}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Salaire */}
        {(record.ancienSalaire !== record.nouveauSalaire) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ minWidth: '70px' }}>Salaire:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#f9f1f8', 
                borderRadius: '4px',
                textDecoration: 'line-through',
                fontSize: '12px'
              }}>
                {record.ancienSalaire ? `${record.ancienSalaire.toLocaleString()}Ar` : '0Ar'}
              </span>
              <ArrowRightOutlined style={{ color: '#52c41a', fontSize: '10px' }} />
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: '#f6ffed', 
                borderRadius: '4px',
                fontWeight: 'bold',
                color: '#52c41a',
                fontSize: '12px'
              }}>
                {record.nouveauSalaire ? `${record.nouveauSalaire.toLocaleString()}Ar` : '0Ar'}
              </span>
            </div>
          </div>
        )}

        {/* Commentaire */}
        {/* Commentaire */}
        {record.commentaire && (
          <div style={{ fontSize: '11px', color: '#5c2458', fontStyle: 'italic', marginTop: '4px', padding: '4px', backgroundColor: '#f9f1f8', borderRadius: '4px' }}>
            Commentaire: {record.commentaire}
          </div>
        )}

        {/* Motif */}
        {record.motif && (
          <div style={{ fontSize: '11px', color: '#5c2458', fontStyle: 'italic', marginTop: '2px' }}>
            Motif: {record.motif}
          </div>
        )}
      </Space>
    )
  },
  {
    title: 'Statut',
    dataIndex: 'statut',
    key: 'statut',
    render: (statut) => {
      const statusConfig = {
        1: { text: 'En attente', color: 'orange' },
        0: { text: 'Validé', color: 'green' },
        2: { text: 'Rejeté', color: 'red' }
      };
      const config = statusConfig[statut] || { text: 'Inconnu', color: 'default' };
      return (
        <Tag color={config.color}>
          {config.text}
        </Tag>
      );
    },
    filters: [
      { text: 'En attente', value: 0 },
      { text: 'Validé', value: 1 },
      { text: 'Rejeté', value: 2 }
    ],
    onFilter: (value, record) => record.statut === value,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (record) => (
      <Space size="small">
        <Tooltip title="Valider">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            // onClick={() => handleEditMouvement(record)}
          />
        </Tooltip>
        {record.statut === 0 && (
          <>
            <Tooltip title="Valider">
              <Button 
                type="link" 
                style={{ color: '#52c41a' }}
                icon={<CheckOutlined />}
                onClick={() => handleValidateMouvement(record.id)}
              />
            </Tooltip>
            <Tooltip title="Rejeter">
              <Button 
                type="link" 
                danger 
                icon={<CloseOutlined />}
                onClick={() => handleRejectMouvement(record.id)}
              />
            </Tooltip>
          </>
        )}
      </Space>
    )
  }
];

  if (loading && mouvements.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Chargement de l'historique des mouvements...</p>
      </div>
    );
  }

  const hasData = mouvements.length > 0;
  const hasEmployees = employees.length > 0;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <HistoryOutlined className="me-2" />
                Mouvements dans l'entreprise
              </h2>
              <p className="text-muted">
                Tableau de bord complet des mouvements de tous les employés
              </p>
            </div>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchAllData}
                loading={loading}
              >
                Actualiser
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {!hasEmployees ? (
        <Card>
          <Empty
            description={
              <div>
                <h3>Aucun employé enregistré</h3>
                <p className="text-muted">
                  Aucun employé n'est disponible. Vous devez d'abord créer des employés.
                </p>
              </div>
            }
          />
        </Card>
      ) : !hasData ? (
        <Card>
          <Empty
            description={
              <div>
                <h3>Aucun mouvement enregistré</h3>
                <p className="text-muted">
                  Aucun mouvement n'a été enregistré pour les employés. 
                </p>
              </div>
            }
          >
          </Empty>
        </Card>
      ) : (
        <>
          {/* Statistiques */}
          <Row gutter={16} className="mb-4">
            <Col span={4}>
              <div className="stat-card">
                <div className="stat-icon"><TeamOutlined /></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalEmployes}</div>
                  <div className="stat-label">Total employés</div>
                </div>
              </div>
            </Col>
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
                  <div className="stat-label">Mouvements ce mois</div>
                </div>
              </div>
            </Col>
          </Row>

          <Tabs defaultActiveKey="mouvements">
            <TabPane 
              tab={<span><HistoryOutlined />Tous les Mouvements<Badge count={mouvements.length} style={{ marginLeft: 8 }} /></span>} 
              key="mouvements"
            >
              <Card
                title={`Historique Complet des Mouvements (${mouvements.length})`}
                extra={
                  <Space>
                    <Button icon={<FileTextOutlined />}>Exporter</Button>
                    {/* <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMouvement}>
                      Nouveau Mouvement
                    </Button> */}
                  </Space>
                }
              >
                <Table
                  columns={columnsMouvements}
                  dataSource={mouvements}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                  loading={loading}
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
            <Row gutter={[16, 16]}>
                {mouvementsParEmploye.map(employee => {
                const infosPro = employee.infosProfessionnelles;
                const poste = infosPro?.poste?.nom || 'Non spécifié';
                const departement = infosPro?.poste?.departement?.nom || 'Non spécifié';
                const salaire = infosPro?.salaire || 'Non spécifié';
                const dateEmbauche = infosPro?.dateEmbauche ? moment(infosPro.dateEmbauche).format('DD/MM/YYYY') : 'Non spécifié';
                const statut = employee.employe.statut === 0 ? 'Actif' : 'Inactif';
                
                return (
                    <Col xs={24} lg={12} xl={8} key={employee.employe.id}>
                    <Card
                        title={
                        <Space>
                            <Avatar 
                            style={{ 
                                backgroundColor: employee.employe.statut === 0 ? '#52c41a' : '#f5222d' 
                            }} 
                            icon={<UserOutlined />} 
                            />
                            <div>
                            <div style={{ fontWeight: 'bold' }}>
                                {employee.employe.nom} {employee.employe.prenom}
                            </div>
                            <div style={{ fontSize: '12px', color: '#5c2458' }}>
                                {employee.employe.id}
                            </div>
                            </div>
                        </Space>
                        }
                        extra={
                        <Space>
                            <Badge 
                            status={employee.employe.statut === 0 ? "success" : "error"} 
                            text={statut} 
                            />
                            <Button 
                            type="primary" 
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleSelectEmploye(employee.employe.id)}
                            >
                            Mouvement
                            </Button>
                        </Space>
                        }
                        style={{ height: '100%' }}
                        actions={[
                        <Tooltip title="Voir profil complet" key="profile">
                            <EyeOutlined />
                        </Tooltip>,
                        <Tooltip title="Modifier l'employé" key="edit">
                            <EditOutlined />
                        </Tooltip>,
                        <Tooltip title="Historique complet" key="history">
                            <HistoryOutlined />
                        </Tooltip>
                        ]}
                    >
                        {/* Informations principales */}
                        <Descriptions size="small" column={1} bordered>
                        <Descriptions.Item label="Département" span={1}>
                            <Tag color="#b053ad">
                            <BankOutlined /> {departement}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Poste actuel">
                            <Tag color="purple">
                            <UserOutlined /> {poste}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Salaire actuel">
                            {salaire !== 'Non spécifié' ? (
                            <Tag color="green">
                                <DollarOutlined /> {salaire}Ar
                            </Tag>
                            ) : (
                            <Tag color="default">Non spécifié</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Date d'embauche">
                            {dateEmbauche !== 'Non spécifié' ? (
                            <Tag color="orange">
                                <CalendarOutlined /> {dateEmbauche}
                            </Tag>
                            ) : (
                            <Tag color="default">Non spécifié</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mouvements">
                            <Badge 
                            count={employee.historique.length} 
                            showZero 
                            style={{ backgroundColor: employee.historique.length > 0 ? '#b053ad' : '#e1b2db' }}
                            />
                            {employee.historique.length > 0 && (
                            <span style={{ marginLeft: 8, fontSize: '12px', color: '#5c2458' }}>
                                ({employee.historique.filter(m => m.type === 'promotion').length} promotions)
                            </span>
                            )}
                        </Descriptions.Item>
                        </Descriptions>

                        {/* Statistiques rapides */}
                        {employee.historique.length > 0 && (
                        <>
                            <Divider />
                            <Row gutter={8} style={{ marginBottom: 12 }}>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                                    {employee.historique.filter(m => m.type === 'promotion').length}
                                </div>
                                <div style={{ fontSize: '10px', color: '#5c2458' }}>Promotions</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b053ad' }}>
                                    {employee.historique.filter(m => m.type === 'mutation').length}
                                </div>
                                <div style={{ fontSize: '10px', color: '#5c2458' }}>Mutations</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                                    {employee.historique.filter(m => m.type === 'augmentation_salaire').length}
                                </div>
                                <div style={{ fontSize: '10px', color: '#5c2458' }}>Augmentations</div>
                                </div>
                            </Col>
                            </Row>
                        </>
                        )}

                        {/* Derniers mouvements */}
                        {employee.historique.length > 0 ? (
                        <>
                            <Divider orientation="left" style={{ fontSize: '12px', margin: '12px 0' }}>
                            Derniers mouvements
                            </Divider>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <Timeline size="small">
                                {employee.historique.slice(0, 3).map(mouvement => {
                                const typeInfo = getTypeInfo(mouvement.type);
                                return (
                                    <Timeline.Item
                                    key={mouvement.id}
                                    color={typeInfo.color}
                                    dot={typeInfo.icon}
                                    >
                                    <div style={{ fontSize: '11px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{typeInfo.label}</div>
                                        <div style={{ color: '#5c2458' }}>{moment(mouvement.date).format('DD/MM/YY')}</div>
                                        {mouvement.motif && (
                                        <div style={{ color: '#5c2458', fontStyle: 'italic' }}>
                                            {mouvement.motif.length > 30 
                                            ? `${mouvement.motif.substring(0, 30)}...` 
                                            : mouvement.motif
                                            }
                                        </div>
                                        )}
                                    </div>
                                    </Timeline.Item>
                                );
                                })}
                            </Timeline>
                            {employee.historique.length > 3 && (
                                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                <Button 
                                    type="link" 
                                    size="small" 
                                    style={{ fontSize: '11px' }}
                                    onClick={() => {
                                    // Fonction pour voir tous les mouvements
                                    message.info(`Voir tous les ${employee.historique.length} mouvements de ${employee.employe.nom}`);
                                    }}
                                >
                                    Voir les {employee.historique.length - 3} autres mouvements
                                </Button>
                                </div>
                            )}
                            </div>
                        </>
                        ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                            <span style={{ fontSize: '12px' }}>
                                Aucun mouvement enregistré
                            </span>
                            }
                            style={{ margin: '20px 0' }}
                        >
                            <Button 
                            type="dashed" 
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={() => handleSelectEmploye(employee.employe.id)}
                            >
                            Ajouter un mouvement
                            </Button>
                        </Empty>
                        )}

                        {/* Indicateur d'ancienneté */}
                        {infosPro?.dateEmbauche && (
                        <div style={{ 
                            marginTop: 12, 
                            padding: '8px', 
                            backgroundColor: '#f6ffed', 
                            border: '1px solid #b7eb8f',
                            borderRadius: '4px'
                        }}>
                            <div style={{ fontSize: '11px', color: '#389e0d', textAlign: 'center' }}>
                            <CalendarOutlined /> Ancienneté: {moment().diff(moment(infosPro.dateEmbauche), 'years')} an(s)
                            </div>
                        </div>
                        )}
                    </Card>
                    </Col>
                );
                })}
            </Row>
            </TabPane>                          

            <TabPane tab={<span><BarChartOutlined />Analyse</span>} key="analyse">
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
                              avatar={<Tag color={type.color} icon={type.icon}>{type.label}</Tag>}
                              description={<div><div>{count} mouvements</div><Progress percent={parseFloat(percentage)} size="small" format={() => `${percentage}%`} /></div>}
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Top Employés avec le plus de mouvements">
                    <List
                      dataSource={mouvementsParEmploye.filter(emp => emp.historique.length > 0).sort((a, b) => b.historique.length - a.historique.length).slice(0, 5)}
                      renderItem={(employee, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#b053ad' }} icon={<UserOutlined />} />}
                            title={employee.nom}
                            description={<div><div>{employee.historique.length} mouvements</div><Progress percent={(employee.historique.length / Math.max(...mouvementsParEmploye.map(emp => emp.historique.length)) * 100)} size="small" /></div>}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </>
      )}
      
    </div>
  );
} 
