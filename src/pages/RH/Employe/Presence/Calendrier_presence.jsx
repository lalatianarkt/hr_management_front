// src/pages/Presence/Calendrier.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/fr';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Badge,
  List,
  Tag,
  Tooltip,
  Alert
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const localizer = momentLocalizer(moment);

moment.locale('fr');

const CalendrierPresence = () => {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();

  // Données mockées pour les employés
  useEffect(() => {
    const mockEmployees = [
      { id: 1, nom: 'Dupont Jean', departement: 'IT' },
      { id: 2, nom: 'Martin Marie', departement: 'IT' },
      { id: 3, nom: 'Bernard Pierre', departement: 'Finance' },
      { id: 4, nom: 'Sophie Laurent', departement: 'IT' },
      { id: 5, nom: 'Paul Durand', departement: 'Finance' }
    ];
    setEmployees(mockEmployees);

    // Événements mockés
    const mockEvents = [
      {
        id: 1,
        title: 'Dupont Jean - Présent',
        start: new Date(2024, 5, 15, 9, 0),
        end: new Date(2024, 5, 15, 17, 0),
        employeeId: 1,
        type: 'present',
        notes: 'Travail normal'
      },
      {
        id: 2,
        title: 'Martin Marie - Absent',
        start: new Date(2024, 5, 16, 0, 0),
        end: new Date(2024, 5, 16, 23, 59),
        employeeId: 2,
        type: 'absent',
        notes: 'Congé maladie'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#b053ad';
    let borderColor = '#b053ad';

    switch (event.type) {
      case 'present':
        backgroundColor = '#52c41a';
        borderColor = '#52c41a';
        break;
      case 'absent':
        backgroundColor = '#f5222d';
        borderColor = '#f5222d';
        break;
      case 'late':
        backgroundColor = '#faad14';
        borderColor = '#faad14';
        break;
      case 'remote':
        backgroundColor = '#b053ad';
        borderColor = '#b053ad';
        break;
      default:
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    form.setFieldsValue({
      employeeId: event.employeeId,
      type: event.type,
      start: moment(event.start),
      end: moment(event.end),
      notes: event.notes
    });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const eventData = {
        ...values,
        start: values.start.toDate(),
        end: values.end.toDate(),
        title: `${employees.find(emp => emp.id === values.employeeId)?.nom} - ${getTypeLabel(values.type)}`
      };

      if (selectedEvent) {
        // Modification
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...selectedEvent, ...eventData }
            : event
        ));
      } else {
        // Nouvel événement
        const newEvent = {
          id: Date.now(),
          ...eventData
        };
        setEvents([...events, newEvent]);
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedEvent(null);
  };

  const getTypeLabel = (type) => {
    const types = {
      present: 'Présent',
      absent: 'Absent',
      late: 'Retard',
      remote: 'Télétravail',
      vacation: 'Congés'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      present: 'green',
      absent: 'red',
      late: 'orange',
      remote: "#b053ad",
      vacation: 'purple'
    };
    return colors[type] || 'default';
  };

  // Statistiques
  const todayPresence = events.filter(event => 
    moment(event.start).isSame(moment(), 'day') && event.type === 'present'
  ).length;

  const todayAbsent = events.filter(event => 
    moment(event.start).isSame(moment(), 'day') && event.type === 'absent'
  ).length;

  return (
    <div className="container-fluid">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <CalendarOutlined className="me-2" />
                Calendrier de Présence
              </h2>
              <p className="text-muted">
                Gérez et visualisez les présences de vos collaborateurs
              </p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}
            >
              Ajouter une présence
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><CheckCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{todayPresence}</div>
              <div className="stat-label">Présents aujourd'hui</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><CloseCircleOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{todayAbsent}</div>
              <div className="stat-label">Absents aujourd'hui</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><TeamOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">{employees.length}</div>
              <div className="stat-label">Total collaborateurs</div>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-icon"><UserOutlined /></div>
            <div className="stat-content">
              <div className="stat-value">
                {employees.length ? ((todayPresence / employees.length) * 100).toFixed(1) : 0}%
              </div>
              <div className="stat-label">Taux de présence</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Légende */}
      <Alert
        message="Légende des présences"
        description={
          <div className="d-flex gap-3 flex-wrap">
            <Tag color="green">Présent</Tag>
            <Tag color="red">Absent</Tag>
            <Tag color="orange">Retard</Tag>
            <Tag color="#b053ad">Télétravail</Tag>
            <Tag color="purple">Congés</Tag>
          </div>
        }
        type="info"
        className="mb-4"
        showIcon
      />

      <Row gutter={16}>
        {/* Calendrier */}
        <Col span={18}>
          <Card>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
                date: "Date",
                time: "Heure",
                event: "Événement",
                noEventsInRange: "Aucun événement dans cette période"
              }}
            />
          </Card>
        </Col>

        {/* Liste des événements du jour */}
        <Col span={6}>
          <Card 
            title={
              <span>
                <TeamOutlined className="me-2" />
                Présences aujourd'hui
              </span>
            }
            className="h-100"
          >
            <List
              dataSource={events.filter(event => 
                moment(event.start).isSame(moment(), 'day')
              )}
              renderItem={event => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        color={getTypeColor(event.type)} 
                        text={getTypeLabel(event.type)}
                      />
                    }
                    title={event.title.split(' - ')[0]}
                    description={
                      <div>
                        <div>
                          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                        </div>
                        {event.notes && (
                          <div className="text-muted small">
                            <Tooltip title={event.notes}>
                              <ExclamationCircleOutlined className="me-1" />
                              Note
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'Aucune présence enregistrée aujourd\'hui' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal pour ajouter/modifier les présences */}
      <Modal
        title={selectedEvent ? "Modifier la présence" : "Ajouter une présence"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'present',
            start: moment().set({ hour: 9, minute: 0 }),
            end: moment().set({ hour: 17, minute: 0 })
          }}
        >
          <Form.Item
            name="employeeId"
            label="Collaborateur"
            rules={[{ required: true, message: 'Veuillez sélectionner un collaborateur' }]}
          >
            <Select placeholder="Sélectionnez un collaborateur">
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.nom} - {employee.departement}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Type de présence"
            rules={[{ required: true, message: 'Veuillez sélectionner le type' }]}
          >
            <Select>
              <Option value="present">Présent</Option>
              <Option value="absent">Absent</Option>
              <Option value="late">Retard</Option>
              <Option value="remote">Télétravail</Option>
              <Option value="vacation">Congés</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start"
                label="Date et heure de début"
                rules={[{ required: true, message: 'Veuillez sélectionner la date de début' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end"
                label="Date et heure de fin"
                rules={[{ required: true, message: 'Veuillez sélectionner la date de fin' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes (optionnel)"
          >
            <TextArea
              rows={3}
              placeholder="Ajoutez des notes ou des commentaires..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendrierPresence;
