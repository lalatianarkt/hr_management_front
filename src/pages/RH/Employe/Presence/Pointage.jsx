// src/pages/Presence/PointageManuel.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Alert,
  List,
  Tag,
  Timeline,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Badge,
  Divider,
  Spin,
  message as antdMessage,
  Table,
  DatePicker,
  Tabs,
  Empty
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  HistoryOutlined,
  BellOutlined,
  CalculatorOutlined,
  TeamOutlined,
  LoadingOutlined,
  LoginOutlined,
  LogoutOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PointageManuel = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [todayPointages, setTodayPointages] = useState([]);
  const [employeeAllPointages, setEmployeeAllPointages] = useState([]);
  const [filteredPointages, setFilteredPointages] = useState([]); // Nouveau state pour les pointages filtrés
  const [currentTime, setCurrentTime] = useState(moment());
  const [showRetardModal, setShowRetardModal] = useState(false);
  const [retardForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingPointages, setLoadingPointages] = useState(false);
  const [loadingAllPointages, setLoadingAllPointages] = useState(false);
  const [dateRange, setDateRange] = useState([moment().subtract(7, 'days'), moment()]);

  // Configuration API
  const API_BASE_URL = 'http://localhost:8080/api';
  const API_POINTAGES = `${API_BASE_URL}/pointages`;
  const API_EMPLOYES = `${API_BASE_URL}/employes`;

  // Mettre à jour l'heure uniquement lors d'actions utilisateur
  const touchRefreshTime = () => {
    setCurrentTime(moment());
  };

  // Récupérer la liste des employés depuis l'API
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Récupérer les employés
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await axios.get(API_EMPLOYES);
      
      const transformedEmployees = response.data.map(emp => ({
        id: emp.id || emp.matricule,
        nom: emp.nom || `${emp.prenom} ${emp.nom}`,
        departement: emp.departement || 'Non spécifié',
        heureNormale: emp.heureNormale || '08:00',
        poste: emp.poste || 'Employé',
        ...emp
      }));
      
      setEmployees(transformedEmployees);
      
      if (selectedEmployee) {
        const updatedEmployee = transformedEmployees.find(e => e.id === selectedEmployee.id);
        setSelectedEmployee(updatedEmployee || null);
      }
    } catch (error) {
      console.error('Erreur chargement employés:', error);
      antdMessage.error('Erreur lors du chargement des employés');
      
      const backupEmployees = [
        { id: 'EMP-20251124-62B184', nom: 'Dupont Jean', departement: 'IT', heureNormale: '09:00' },
        { id: 'EMP-20251125-ABC123', nom: 'Martin Marie', departement: 'IT', heureNormale: '09:00' },
        { id: 'EMP-20251126-DEF456', nom: 'Bernard Pierre', departement: 'Finance', heureNormale: '08:30' },
      ];
      setEmployees(backupEmployees);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Récupérer les pointages du jour pour un employé
  const fetchTodayPointages = async (employeeId) => {
    if (!employeeId) return;
    
    try {
      setLoadingPointages(true);
      const today = moment().format('YYYY-MM-DD');
      const response = await axios.get(`${API_POINTAGES}/employe/${employeeId}/date/${today}`);
      setTodayPointages(response.data || []);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
      setTodayPointages([]);
    } finally {
      setLoadingPointages(false);
    }
  };

  // =============== CORRIGÉ : Récupérer tous les pointages d'un employé ===============
  const fetchEmployeeAllPointages = async (employeeId) => {
    if (!employeeId) return;
    
    try {
      setLoadingAllPointages(true);
      console.log("Fetching pointages for employee:", employeeId);
      
      // Utiliser seulement l'endpoint de base qui existe dans votre backend
      const url = `${API_BASE_URL}/pointages/employe/${employeeId}`;
      console.log("API URL:", url);
      
      const response = await axios.get(url);
      console.log("API response:", response.data);
      
      // Stocker tous les pointages
      setEmployeeAllPointages(response.data || []);
      
      // Appliquer le filtre par date initial
      applyDateFilter(response.data || [], dateRange[0], dateRange[1]);
      
    } catch (error) {
      console.error('Erreur chargement historique pointages:', error);
      antdMessage.warning('Impossible de charger l\'historique des pointages');
      setEmployeeAllPointages([]);
      setFilteredPointages([]);
    } finally {
      setLoadingAllPointages(false);
    }
  };

  // =============== FILTRER LES POINTAGES PAR DATE (côté frontend) ===============
  const applyDateFilter = (pointages, startDate, endDate) => {
    if (!pointages.length || !startDate || !endDate) {
      setFilteredPointages(pointages);
      return;
    }
    
    const filtered = pointages.filter(pointage => {
      const pointageDate = moment(pointage.moment);
      return pointageDate.isBetween(
        moment(startDate).startOf('day'),
        moment(endDate).endOf('day'),
        null,
        '[]'
      );
    });
    
    setFilteredPointages(filtered);
  };

  // =============== GESTION DE LA SÉLECTION D'UN EMPLOYÉ ===============
  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee);
    touchRefreshTime();
    
    if (employeeId) {
      // Charger les pointages du jour
      fetchTodayPointages(employeeId);
      
      // Charger tous les pointages
      fetchEmployeeAllPointages(employeeId);
    } else {
      setTodayPointages([]);
      setEmployeeAllPointages([]);
      setFilteredPointages([]);
    }
  };

  // =============== GESTION DU CHANGEMENT DE PLAGE DE DATES ===============
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // Filtrer les données existantes côté frontend
      applyDateFilter(employeeAllPointages, dates[0], dates[1]);
    }
  };

  // FONCTION D'INSERTION DU POINTAGE
  const handleInsertPointage = async () => {
    if (!selectedEmployee) {
      antdMessage.warning('Veuillez sélectionner un employé');
      return;
    }

    touchRefreshTime();
    setLoading(true);
    
    const maintenant = moment();

    // Calcul des retards
    const heureNormale = moment(selectedEmployee.heureNormale, 'HH:mm');
    const retard = maintenant.isAfter(heureNormale);
    const minutesRetard = retard ? maintenant.diff(heureNormale, 'minutes') : 0;

    // Format ISO pour Java LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    const formatLocalDateTime = () => {
        const date = new Date();
        
        // Ajuster pour Madagascar (UTC+3)
        const madagascarOffset = 3 * 60 * 60 * 1000; // 3 heures en millisecondes
        const dateMadagascar = new Date(date.getTime() + madagascarOffset);
        
        // Format: YYYY-MM-DDTHH:mm:ss
        const pad = (n) => n.toString().padStart(2, '0');
        
        const annee = dateMadagascar.getUTCFullYear();
        const mois = pad(dateMadagascar.getUTCMonth() + 1);
        const jour = pad(dateMadagascar.getUTCDate());
        const heures = pad(dateMadagascar.getUTCHours());
        const minutes = pad(dateMadagascar.getUTCMinutes());
        const secondes = pad(dateMadagascar.getUTCSeconds());
        
        return `${annee}-${mois}-${jour}T${heures}:${minutes}:${secondes}`;
    };

// Format: "15/01/2024 17:30:00" (heure locale Madagascar)
    try {
      const pointageData = {
        employe: { 
          id: selectedEmployee.id 
        },
        moment: formatLocalDateTime()
      };

      console.log('Envoi pointage:', pointageData);

      const response = await axios.post(API_POINTAGES, pointageData);
      
      console.log('Réponse serveur:', response.data);
      
      antdMessage.success(`Pointage enregistré à ${maintenant.format('HH:mm:ss')}`);
      
      // Rafraîchir les pointages du jour
      await fetchTodayPointages(selectedEmployee.id);
      
      // Rafraîchir également l'historique complet
      await fetchEmployeeAllPointages(selectedEmployee.id);
      
    } catch (error) {
      console.error('Erreur insertion pointage:', error);
      
      if (error.response) {
        antdMessage.error(`Erreur serveur: ${error.response.data?.message || error.response.data?.error || 'Erreur inconnue'}`);
      } else if (error.request) {
        antdMessage.error('Serveur non accessible. Vérifiez votre connexion.');
      } else {
        antdMessage.error(`Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Déterminer le type de pointage suivant
  const getNextPointageType = () => {
    if (todayPointages.length === 0) {
      return 'IN';
    }
    
    const pointagesValides = todayPointages.filter(p => p.statut === 1);
    if (pointagesValides.length === 0) return 'IN';
    
    const dernierPointage = pointagesValides
      .sort((a, b) => new Date(b.moment) - new Date(a.moment))[0];
    
    return dernierPointage?.typeAction === 'IN' ? 'OUT' : 'IN';
  };

  // Soumission du motif de retard
  const handleRetardSubmit = async (values) => {
    try {
      console.log('Notification retard envoyée:', {
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.nom,
        motif: values.motif,
        details: values.details,
        minutesRetard: todayPointages.find(p => p.typeAction === 'IN')?.minutesRetard
      });

      antdMessage.success('Motif de retard enregistré');
      setShowRetardModal(false);
      retardForm.resetFields();
      
    } catch (error) {
      antdMessage.error('Erreur enregistrement motif retard');
    }
  };

  // Calcul des heures travaillées aujourd'hui
  const calculerHeuresTravailees = (employeeId) => {
    if (!employeeId || todayPointages.length < 2) return '--:--';
    
    const pointagesValides = todayPointages.filter(p => p.statut === 1);
    const arrivee = pointagesValides.find(p => p.typeAction === 'IN');
    const depart = pointagesValides.find(p => p.typeAction === 'OUT');

    if (!arrivee || !depart) return '--:--';

    const duree = moment.duration(
      moment(depart.moment).diff(moment(arrivee.moment))
    );
    const heures = Math.floor(duree.asHours());
    const minutes = duree.minutes();
    
    return `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Statut actuel de l'employé
  const getStatutEmploye = (employeeId) => {
    const pointagesEmploye = todayPointages.filter(p => 
      p.statut === 1 && 
      p.employe?.id === employeeId
    );
    
    const arrivee = pointagesEmploye.find(p => p.typeAction === 'IN');
    const depart = pointagesEmploye.find(p => p.typeAction === 'OUT');

    if (!arrivee) return { statut: 'absent', label: 'Non pointé', color: 'red', icon: 'default' };
    if (arrivee && !depart) {
      if (arrivee.minutesRetard > 0) {
        return { 
          statut: 'retard', 
          label: `En retard (+${arrivee.minutesRetard}min)`, 
          color: 'orange',
          icon: 'warning'
        };
      }
      return { statut: 'present', label: 'Présent', color: 'green', icon: 'success' };
    }
    if (arrivee && depart) return { statut: 'parti', label: 'Parti', color: "#b053ad", icon: 'processing' };
    
    return { statut: 'inconnu', label: 'Statut inconnu', color: 'default', icon: 'default' };
  };

  // Colonnes pour le tableau d'historique des pointages
  const pointagesColumns = [
    {
      title: 'Date',
      dataIndex: 'moment',
      key: 'date',
      render: (text) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.moment) - new Date(b.moment),
    },
    {
      title: 'Heure',
      dataIndex: 'moment',
      key: 'heure',
      render: (text) => moment(text).format('HH:mm:ss'),
    },
    {
      title: 'Type',
      dataIndex: 'typeAction',
      key: 'type',
      render: (text) => {
        if (text === 'IN ' || text === 'Entrée' || text === 'entrée') {
          return (
            <Tag color="green" style={{ fontWeight: 'bold' }}>
              Entrée
            </Tag>
          );
        } else if (text === 'OUT' || text === 'Sortie' || text === 'sortie') {
          return (
            <Tag color="#b053ad" style={{ fontWeight: 'bold' }}>
              Sortie
            </Tag>
          );
        } else {
          return (
            <Tag color="default">
              {text || 'Inconnu'}
            </Tag>
          );
        }
      },
      filters: [
        { text: 'Entrée', value: 'IN' },
        { text: 'Sortie', value: 'OUT' },
      ],
      onFilter: (value, record) => {
        // Gérer différentes façons d'écrire le type
        const type = record.typeAction?.toUpperCase();
        return type === value;
      },
    },
    {
      title: 'Retard (min)',
      dataIndex: 'minutesRetard',
      key: 'retard',
      render: (text) => text > 0 ? <Tag color="orange">{text} min</Tag> : '-',
      sorter: (a, b) => (a.minutesRetard || 0) - (b.minutesRetard || 0),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text) => (
        <Tag color={text === 1 ? 'green' : text === 0 ? 'yellow' : 'default'}>
          {text === 1 ? 'Validé' : text === 0 ? 'En cours' : 'Inconnu'}
        </Tag>
      ),
    },
  ];

  // Pointages du jour pour l'historique
  const pointagesDuJour = todayPointages
    .filter(p => p.statut === 1)
    .sort((a, b) => new Date(b.moment) - new Date(a.moment));

  const statutActuel = selectedEmployee ? getStatutEmploye(selectedEmployee.id) : null;

  return (
    <div className="container-fluid pointage-page">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <ClockCircleOutlined className="me-2" />
                Pointage Manuel
              </h2>
              <p className="text-muted">
                Système de pointage manuel - Le système détecte automatiquement arrivée/départ
              </p>
            </div>
            <div className="text-end">
              <div className="fw-bold">{currentTime.format('DD/MM/YYYY')}</div>
              <div className="h4 text-primary">{currentTime.format('HH:mm:ss')}</div>
            </div>
          </div>
        </div>
      </div>

      <Row gutter={16}>
        {/* Colonne principale - Pointage */}
        <Col span={16}>
          <Card title="Sélection du Collaborateur" className="mb-4">
            <Form layout="vertical">
              <Form.Item label="Choisir un collaborateur">
                <Select
                  placeholder="Sélectionnez votre nom"
                  value={selectedEmployee?.id}
                  onChange={handleEmployeeSelect}
                  size="large"
                  loading={loadingEmployees}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {employees.map(emp => (
                    <Option key={emp.id} value={emp.id}>
                      {emp.nom} - {emp.departement} ({emp.id})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>

            {selectedEmployee && (
              <>
                <Card 
                  type="inner" 
                  title={
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Pointage - {selectedEmployee.nom}</span>
                      {statutActuel && (
                        <Badge 
                          status={statutActuel.icon}
                          text={statutActuel.label}
                          className="fw-bold"
                        />
                      )}
                    </div>
                  }
                  className="mt-3"
                  loading={loadingPointages}
                >
                  <div className="text-center">
                    <div className="next-action mb-3">
                      <div className="text-muted">Prochain pointage :</div>
                      <div className="h4" style={{ color: getNextPointageType() === 'IN' ? '#52c41a' : '#b053ad' }}>
                        {getNextPointageType() === 'IN' ? 'ARRIVÉE' : 'DÉPART'}
                      </div>
                      <div className="text-muted small">
                        Le système détecte automatiquement si c'est une arrivée ou un départ
                      </div>
                    </div>
                    
                    <Button
                      type="default"
                      size="middle"
                      icon={getNextPointageType() === 'IN' ? <LoginOutlined /> : <LogoutOutlined />}
                      onClick={handleInsertPointage}
                      disabled={loading}
                      className="unified-btn"
                    >
                      {loading ? (
                        <>
                          <Spin indicator={<LoadingOutlined style={{ color: 'white' }} spin />} /> 
                          <span className="ms-2">Enregistrement...</span>
                        </>
                      ) : (
                        `Pointer Maintenant`
                      )}
                    </Button>

                    <div className="text-muted mt-3">
                      {getNextPointageType() === 'IN' 
                        ? `Heure normale d'arrivée: ${selectedEmployee.heureNormale}`
                        : 'Cliquez pour pointer votre départ'}
                    </div>

                    <Divider />
                    <div className="stat-card">
                      <div className="stat-icon"><CalculatorOutlined /></div>
                      <div className="stat-content">
                        <div className="stat-value">
                          {calculerHeuresTravailees(selectedEmployee.id)}
                        </div>
                        <div className="stat-label">Heures travaillées aujourd'hui</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* TABULATION POUR LES POINTAGES */}
                <Card 
                  title={
                    <span>
                      <FileTextOutlined className="me-2" />
                      Historique des Pointages - {selectedEmployee.nom}
                    </span>
                  }
                  className="mt-4"
                >
                  <Tabs defaultActiveKey="today">
                    <TabPane 
                      tab={
                        <span>
                          <ClockCircleOutlined />
                          Aujourd'hui
                        </span>
                      } 
                      key="today"
                    >
                      {pointagesDuJour.length > 0 ? (
                        <Timeline>
                          {pointagesDuJour.map((pointage, index) => {
                            const isRetard = pointage.typeAction === 'IN' && pointage.minutesRetard > 0;
                            
                            return (
                              <Timeline.Item
                                key={index}
                                color={pointage.typeAction === 'IN' ? 'green' : "#b053ad"}
                                dot={isRetard ? <ExclamationCircleOutlined style={{ color: 'orange' }} /> : null}
                              >
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{selectedEmployee.nom}</strong>
                                    <Tag color={pointage.typeAction === 'IN' ? 'green' : "#b053ad"} className="ms-2">
                                      {pointage.typeAction === 'IN' ? 'ARRIVÉE' : 'DÉPART'}
                                    </Tag>
                                    {isRetard && (
                                      <Tag color="orange" className="ms-2">
                                        Retard: {pointage.minutesRetard}min
                                      </Tag>
                                    )}
                                  </div>
                                  <div className="text-muted">
                                    {moment(pointage.moment).format('HH:mm:ss')}
                                  </div>
                                </div>
                              </Timeline.Item>
                            );
                          })}
                        </Timeline>
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Aucun pointage enregistré aujourd'hui"
                        />
                      )}
                    </TabPane>
                    
                    <TabPane 
                      tab={
                        <span>
                          <CalendarOutlined />
                          Historique complet
                        </span>
                      } 
                      key="history"
                    >
                      <div className="mb-3">
                        <RangePicker
                          value={dateRange}
                          onChange={handleDateRangeChange}
                          format="DD/MM/YYYY"
                          allowClear={false}
                          style={{ width: '100%', marginBottom: '16px' }}
                        />
                        <div className="text-muted small">
                          Filtrage appliqué côté frontend sur {employeeAllPointages.length} pointages au total
                        </div>
                      </div>
                      
                      <Spin spinning={loadingAllPointages}>
                        <Table
                          columns={pointagesColumns}
                          dataSource={filteredPointages}
                          rowKey="id"
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total: ${total} pointages (${employeeAllPointages.length} au total)`,
                          }}
                          size="small"
                          locale={{
                            emptyText: (
                              <Empty
                                description={
                                  <span>
                                    Aucun pointage trouvé pour cette période
                                  </span>
                                }
                              />
                            )
                          }}
                          summary={() => (
                            filteredPointages.length > 0 && (
                              <Table.Summary fixed>
                                <Table.Summary.Row>
                                  <Table.Summary.Cell index={0} colSpan={2}>
                                    <strong>Total (période):</strong>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={2}>
                                    <strong>{filteredPointages.length} pointages</strong>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={3}>
                                    <strong>
                                      {filteredPointages.filter(p => p.minutesRetard > 0).length} retards
                                    </strong>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={4}>
                                    <Tag color="green">
                                      {filteredPointages.filter(p => p.statut === 1).length} validés
                                    </Tag>
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                              </Table.Summary>
                            )
                          )}
                        />
                      </Spin>
                    </TabPane>
                  </Tabs>
                </Card>
              </>
            )}
          </Card>
        </Col>

        {/* Colonne latérale - Vue d'ensemble */}
        <Col span={8}>
          <Card 
            title={
              <span>
                <TeamOutlined className="me-2" />
                Statut de l'Équipe
                <Tag className="ms-2">{employees.length} employés</Tag>
              </span>
            }
            className="mb-4"
            loading={loadingEmployees}
          >
            <List
              dataSource={employees}
              renderItem={employee => {
                const statut = getStatutEmploye(employee.id);
                return (
                  <List.Item 
                    actions={[
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleEmployeeSelect(employee.id)}
                        icon={<SearchOutlined />}
                        className="unified-btn"
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<UserOutlined style={{ color: statut.color }} />}
                      title={employee.nom}
                      description={
                        <div>
                          <div><small>{employee.departement}</small></div>
                          <Tag color={statut.color} size="small">
                            {statut.label}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>

          {pointagesDuJour.filter(p => p.typeAction === 'IN' && p.minutesRetard > 0).length > 0 && (
            <Card 
              title={
                <span>
                  <BellOutlined className="me-2" />
                  Alertes Retards
                </span>
              }
              className="mb-4"
            >
              <Alert
                message="Retards détectés aujourd'hui"
                description={
                  <div>
                    {pointagesDuJour
                      .filter(p => p.typeAction === 'IN' && p.minutesRetard > 0)
                      .map((pointage, index) => {
                        const employee = employees.find(e => e.id === pointage.employe?.id);
                        return (
                          <div key={index} className="mb-2">
                            <strong>{employee?.nom || pointage.employe?.id}</strong> 
                            <span className="ms-2">- {pointage.minutesRetard} minutes de retard</span>
                          </div>
                        );
                      })
                    }
                  </div>
                }
                type="warning"
                showIcon
              />
            </Card>
          )}

          <Card title="Statistiques du Jour">
            <Row gutter={16}>
              <Col span={8}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <CheckCircleOutlined />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {employees.filter(emp =>
                        ['present', 'retard'].includes(getStatutEmploye(emp.id).statut)
                      ).length}
                    </div>
                    <div className="stat-label">Presents</div>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <HistoryOutlined />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{pointagesDuJour.length}</div>
                    <div className="stat-label">Pointages</div>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <ClockCircleOutlined />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{currentTime.format('HH:mm:ss')}</div>
                    <div className="stat-label">Derniere mise a jour</div>
                  </div>
                </div>
              </Col>
            </Row>
            <Divider />
            <div className="text-center">
              <Button 
                type="link" 
                onClick={() => {
                  touchRefreshTime();
                  fetchEmployees();
                }}
                loading={loadingEmployees}
                className="unified-btn"
              >
                Actualiser la liste des employes
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal pour motif de retard */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined className="me-2" />
            Notification de Retard
          </span>
        }
        open={showRetardModal}
        onOk={() => retardForm.submit()}
        onCancel={() => setShowRetardModal(false)}
        okText="Enregistrer le motif"
        cancelText="Ignorer"
      >
        <Alert
          message="Retard détecté"
          description={
            selectedEmployee && (
              <>
                <strong>{selectedEmployee.nom}</strong> a 
                <strong className="text-warning"> {todayPointages.find(p => p.typeAction === 'IN')?.minutesRetard || 0} minutes</strong> de retard.
                <br />
                Heure normale: {selectedEmployee.heureNormale}
                <br />
                Heure réelle: {moment(todayPointages.find(p => p.typeAction === 'IN')?.moment).format('HH:mm')}
              </>
            )
          }
          type="warning"
          showIcon
          className="mb-3"
        />
        
        <Form
          form={retardForm}
          layout="vertical"
          onFinish={handleRetardSubmit}
          initialValues={{ motif: 'transport' }}
        >
          <Form.Item
            name="motif"
            label="Motif du retard"
            rules={[{ required: true, message: 'Veuillez sélectionner un motif' }]}
          >
            <Select placeholder="Sélectionnez le motif">
              <Option value="transport">Problème de transport</Option>
              <Option value="sante">Problème de santé</Option>
              <Option value="familial">Raison familiale</Option>
              <Option value="reunion">Réunion imprévue</Option>
              <Option value="autre">Autre raison</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="details"
            label="Détails supplémentaires"
          >
            <TextArea
              rows={3}
              placeholder="Précisez les détails de votre retard..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PointageManuel;
