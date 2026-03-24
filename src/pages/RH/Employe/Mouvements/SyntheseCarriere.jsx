// src/pages/RH/Employe/SyntheseCarriere.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Timeline,
  Progress,
  Tag,
  Space,
  Avatar,
  Divider,
  List,
  Button,
  Modal
} from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  BankOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  StarOutlined
} from '@ant-design/icons';
import moment from 'moment';

const SyntheseCarriere = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Mêmes données que dans HistoriqueMouvements
    const mockEmployees = [
      {
        id: 1,
        nom: 'Dupont Jean',
        departement: 'IT',
        poste: 'Développeur Senior',
        salaire: 45000,
        dateEmbauche: '2020-03-15',
        email: 'j.dupont@entreprise.com',
        telephone: '+33 1 23 45 67 89',
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
          // ... autres mouvements
        ]
      },
      // ... autres employés
    ];

    setEmployees(mockEmployees);
    setSelectedEmployee(mockEmployees[0]);
  }, []);

  const calculateCarriereStats = (employee) => {
    const anciennete = moment().diff(moment(employee.dateEmbauche), 'years', true);
    const promotions = employee.historique.filter(m => m.type === 'promotion').length;
    const augmentations = employee.historique.filter(m => m.type === 'augmentation_salaire').length;
    const evolutionSalaire = employee.historique.length > 0 
      ? ((employee.salaire - employee.historique[employee.historique.length - 1].nouveauSalaire) / employee.historique[employee.historique.length - 1].nouveauSalaire * 100).toFixed(1)
      : 0;

    return {
      anciennete: anciennete.toFixed(1),
      promotions,
      augmentations,
      evolutionSalaire,
      totalMouvements: employee.historique.length
    };
  };

  const stats = selectedEmployee ? calculateCarriereStats(selectedEmployee) : null;

  const generateRapportPDF = () => {
    // Simulation génération PDF
    console.log('Génération du rapport PDF pour', selectedEmployee.nom);
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <UserOutlined className="me-2" />
              Synthèse de Carrière
            </h2>
            <Button 
              type="primary" 
              icon={<FilePdfOutlined />}
              onClick={generateRapportPDF}
            >
              Exporter le rapport
            </Button>
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <>
          {/* En-tête employé */}
          <Card className="mb-4">
            <Row gutter={16} align="middle">
              <Col span={4}>
                <Avatar size={80} icon={<UserOutlined />} />
              </Col>
              <Col span={20}>
                <Row>
                  <Col span={12}>
                    <h3>{selectedEmployee.nom}</h3>
                    <p className="text-muted">{selectedEmployee.poste} - {selectedEmployee.departement}</p>
                    <Space>
                      <Tag color="#b053ad">{selectedEmployee.email}</Tag>
                      <Tag color="green">{selectedEmployee.telephone}</Tag>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="stat-card">
                          <div className="stat-icon"><CalendarOutlined /></div>
                          <div className="stat-content">
                            <div className="stat-value">{stats.anciennete} ans</div>
                            <div className="stat-label">Ancienneté</div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="stat-card">
                          <div className="stat-icon"><ArrowUpOutlined /></div>
                          <div className="stat-content">
                            <div className="stat-value">{stats.promotions}</div>
                            <div className="stat-label">Promotions</div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="stat-card">
                          <div className="stat-icon"><DollarOutlined /></div>
                          <div className="stat-content">
                            <div className="stat-value">{selectedEmployee.salaire} €</div>
                            <div className="stat-label">Salaire actuel</div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>

          <Row gutter={16}>
            {/* Timeline de carrière */}
            <Col span={16}>
              <Card 
                title={
                  <Space>
                    <HistoryOutlined />
                    Parcours Professionnel
                  </Space>
                }
              >
                <Timeline mode="alternate">
                  {selectedEmployee.historique
                    .sort((a, b) => moment(a.date).diff(moment(b.date)))
                    .map((mouvement, index) => (
                      <Timeline.Item
                        key={mouvement.id}
                        color={
                          mouvement.type === 'promotion' ? 'green' :
                          mouvement.type === 'augmentation_salaire' ? 'purple' :
                          mouvement.type === 'arrivee' ? '#b053ad' : 'orange'
                        }
                        dot={
                          mouvement.type === 'promotion' ? <ArrowUpOutlined /> :
                          mouvement.type === 'augmentation_salaire' ? <DollarOutlined /> :
                          mouvement.type === 'arrivee' ? <UserOutlined /> : <BankOutlined />
                        }
                      >
                        <Card size="small">
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Date">
                              {moment(mouvement.date).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Événement">
                              <Tag color={
                                mouvement.type === 'promotion' ? 'green' :
                                mouvement.type === 'augmentation_salaire' ? 'purple' :
                                mouvement.type === 'arrivee' ? '#b053ad' : 'orange'
                              }>
                                {mouvement.type === 'promotion' ? 'Promotion' :
                                 mouvement.type === 'augmentation_salaire' ? 'Augmentation' :
                                 mouvement.type === 'arrivee' ? 'Arrivée' : 'Mutation'}
                              </Tag>
                            </Descriptions.Item>
                            {mouvement.nouveauPoste && (
                              <Descriptions.Item label="Poste">
                                {mouvement.nouveauPoste}
                              </Descriptions.Item>
                            )}
                            {mouvement.nouveauSalaire && (
                              <Descriptions.Item label="Salaire">
                                {mouvement.nouveauSalaire}€
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Motif">
                              {mouvement.motif}
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </Timeline.Item>
                    ))}
                </Timeline>
              </Card>
            </Col>

            {/* Statistiques et indicateurs */}
            <Col span={8}>
              <Card title="Indicateurs de Carrière" className="mb-4">
                <List>
                  <List.Item>
                    <Progress 
                      type="circle" 
                      percent={(stats.anciennete / 10) * 100} 
                      width={60}
                      format={() => `${stats.anciennete} ans`}
                    />
                    <div className="ms-3">
                      <div>Ancienneté</div>
                      <div className="text-muted">Dans l'entreprise</div>
                    </div>
                  </List.Item>
                  <List.Item>
                    <Progress 
                      type="circle" 
                      percent={(stats.promotions / 5) * 100} 
                      width={60}
                      format={() => `${stats.promotions}`}
                      status="success"
                    />
                    <div className="ms-3">
                      <div>Promotions</div>
                      <div className="text-muted">Évolutions de poste</div>
                    </div>
                  </List.Item>
                  <List.Item>
                    <Progress 
                      type="circle" 
                      percent={parseFloat(stats.evolutionSalaire)} 
                      width={60}
                      format={() => `${stats.evolutionSalaire}%`}
                      status="active"
                    />
                    <div className="ms-3">
                      <div>Évolution salariale</div>
                      <div className="text-muted">Depuis l'embauche</div>
                    </div>
                  </List.Item>
                </List>
              </Card>

              <Card title="Prochaines Étapes Possibles">
                <List
                  size="small"
                  dataSource={[
                    'Promotion vers Lead Developer',
                    'Formation management',
                    'Mutation vers autre département',
                    'Augmentation méritocratique'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <StarOutlined style={{ color: '#faad14' }} className="me-2" />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Modal de sélection d'employé */}
      <Modal
        title="Sélectionner un employé"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={employees}
          renderItem={employee => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setIsModalVisible(false);
                  }}
                >
                  Sélectionner
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={employee.nom}
                description={`${employee.poste} - ${employee.departement}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default SyntheseCarriere;
