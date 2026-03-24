// src/pages/RH/Employe/Conges/AbsenceConge.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  Dropdown,
  Tab,
  Tabs,
  ListGroup,
  InputGroup,
  FormControl
} from 'react-bootstrap';
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaUserCircle,
  FaHome,
  FaBriefcase,
  FaIdCard,
  FaInfoCircle,
  FaFilter,
  FaSync,
  FaPlus,
  FaEye,
  FaTimes,
  FaCheck,
  FaCalendarPlus,
  FaBed,
  FaUmbrellaBeach,
  FaStethoscope,
  FaUserMd,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaDownload,
  FaPrint,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
  FaCalendarCheck,
  FaCalendarTimes,
  FaCalendarMinus
} from 'react-icons/fa';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, 
         subMonths, isToday, isWeekend } from 'date-fns';
import { fr } from 'date-fns/locale';
import axiosInstance from '../../../utils/AxiosInstance';

const AbsenceConge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [absencesConges, setAbsencesConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employe, setEmploye] = useState(null);
  const [loadingEmploye, setLoadingEmploye] = useState(true);
  
  // État pour le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  
  // États pour les filtres
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'CONGE', 'ABSENCE'
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les modaux
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Charger les données initiales
  useEffect(() => {
    if (id) {
      fetchEmploye();
      fetchAbsencesConges();
    }
  }, [id, currentDate]);

  // Charger les absences et congés de l'employé
  const fetchAbsencesConges = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get(`/api/absences-conges/employe/${id}`);
      console.log("Absences et congés:", response.data);
      setAbsencesConges(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des absences et congés');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les informations de l'employé
  const fetchEmploye = async () => {
    if (!id) return;
    
    setLoadingEmploye(true);
    
    try {
      const response = await axiosInstance.get(`/api/employes/${id}`);
      setEmploye(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des informations de l\'employé:', err);
    } finally {
      setLoadingEmploye(false);
    }
  };

  // Formater la date
  const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : parseISO(date);
      return format(dateObj, formatStr, { locale: fr });
    } catch (e) {
      return date;
    }
  };

  // Obtenir l'icône selon le type d'absence
  const getTypeIcon = (type) => {
    switch (type) {
      case 'conge':
        return <FaUmbrellaBeach className="text-success" />;
      case 'absence':
        return <FaBed className="text-warning" />;
      default:
        return <FaQuestionCircle className="text-secondary" />;
    }
  };

  // Obtenir la couleur selon le type d'absence
  const getTypeColor = (type) => {
    switch (type) {
      case 'conge':
        return 'success';
      case 'absence':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Obtenir le libellé selon le type d'absence
  const getTypeLabel = (type) => {
    switch (type) {
      case 'conge':
        return 'Congé';
      case 'absence':
        return 'Absence';
      default:
        return 'Non spécifié';
    }
  };

  // Obtenir les absences pour une date spécifique
  const getAbsencesForDate = (date) => {
    if (!absencesConges.length) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return absencesConges.filter(absence => {
      const absenceDateStr = format(parseISO(absence.dateAbsence), 'yyyy-MM-dd');
      return absenceDateStr === dateStr && 
             (typeFilter === 'all' || absence.typeAbsence === typeFilter);
    });
  };

  // Obtenir les absences pour le mois en cours
  const getAbsencesForMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    return absencesConges.filter(absence => {
      const absenceDate = parseISO(absence.dateAbsence);
      return absenceDate >= start && absenceDate <= end &&
             (typeFilter === 'all' || absence.typeAbsence === typeFilter);
    });
  };

  // Générer les jours du mois
  const generateMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lundi
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Dimanche
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Aller au mois précédent
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Aller au mois suivant
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Aller au mois actuel
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Afficher les détails d'une absence
  const handleViewDetails = (absence) => {
    setSelectedAbsence(absence);
    setShowDetailsModal(true);
  };

  // Filtrer les absences
  const filteredAbsences = absencesConges.filter(absence => {
    const matchesType = typeFilter === 'all' || absence.typeAbsence === typeFilter;
    const matchesSearch = searchTerm === '' || 
      absence.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      absence.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      absence.departementNom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Statistiques
  const getStats = () => {
    const total = absencesConges.length;
    const conges = absencesConges.filter(a => a.typeAbsence === 'CONGE').length;
    const absences = absencesConges.filter(a => a.typeAbsence === 'ABSENCE').length;
    
    return { total, conges, absences };
  };

  const stats = getStats();

  if (loading || loadingEmploye) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Chargement des données...</span>
      </Container>
    );
  }

  const days = generateMonthDays();
  const monthName = format(currentDate, 'MMMM yyyy', { locale: fr });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <Container fluid className="py-4">
      {/* En-tête avec informations de l'employé */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3 mb-2">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/dashboard-RH/employees/${id}/personnel`)}
              size="sm"
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              Retour à la fiche
            </Button>
            <h1 className="h3 mb-0">Calendrier des Absences et Congés</h1>
          </div>
          
          {employe && (
            <Card className="border-0 bg-light">
              <Card.Body className="py-3">
                <Row className="align-items-center">
                  <Col md="auto" className="text-center mb-3 mb-md-0">
                    <div className="bg-primary text-white rounded-circle p-3 d-inline-block">
                      <FaUserCircle size={24} />
                    </div>
                  </Col>
                  <Col>
                    <h5 className="mb-1">
                      {employe.nom} {employe.prenom}
                      {employe.matricule && (
                        <Badge bg="secondary" className="ms-2">
                          {employe.matricule}
                        </Badge>
                      )}
                    </h5>
                    <p className="text-muted mb-0">
                      {employe.infosProfessionnelles?.poste?.nom || 'Poste non défini'} | 
                      {employe.infosProfessionnelles?.departement?.nom || 'Département non défini'}
                    </p>
                  </Col>
                  <Col md="auto">
                    <Button
                      variant="primary"
                      onClick={() => setShowAddModal(true)}
                      className="d-flex align-items-center"
                    >
                      <FaCalendarPlus className="me-2" />
                      Nouvelle Absence/Congé
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Messages d'alerte */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          <FaTimes className="me-2" />
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <div className="display-6 fw-bold text-primary">{stats.total}</div>
              <div className="text-muted">Total</div>
              <small className="text-muted">Absences et Congés</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <div className="display-6 fw-bold text-success">{stats.conges}</div>
              <div className="text-muted">Congés</div>
              <FaUmbrellaBeach className="text-success mt-2" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <div className="display-6 fw-bold text-warning">{stats.absences}</div>
              <div className="text-muted">Absences</div>
              <FaBed className="text-warning mt-2" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres et contrôles */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={goToPreviousMonth}
                  size="sm"
                >
                  <FaChevronLeft />
                </Button>
                
                <Button
                  variant="outline-primary"
                  onClick={goToCurrentMonth}
                  size="sm"
                  className="flex-grow-1"
                >
                  <FaCalendarDay className="me-2" />
                  {monthName}
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={goToNextMonth}
                  size="sm"
                >
                  <FaChevronRight />
                </Button>
              </div>
            </Col>
            
            <Col md={4}>
              <div className="d-flex gap-2">
                <Button
                  variant={viewMode === 'month' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('month')}
                  size="sm"
                  className="d-flex align-items-center"
                >
                  <FaCalendar className="me-2" />
                  Mois
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('week')}
                  size="sm"
                  className="d-flex align-items-center"
                >
                  <FaCalendarWeek className="me-2" />
                  Semaine
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('day')}
                  size="sm"
                  className="d-flex align-items-center"
                >
                  <FaCalendarDay className="me-2" />
                  Jour
                </Button>
              </div>
            </Col>
            
            <Col md={4}>
              <div className="d-flex gap-2 justify-content-end">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <FaFilter className="me-2" />
                    {typeFilter === 'all' ? 'Tous les types' : getTypeLabel(typeFilter)}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setTypeFilter('all')}>
                      Tous les types
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('CONGE')}>
                      <FaUmbrellaBeach className="me-2 text-success" />
                      Congés seulement
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('ABSENCE')}>
                      <FaBed className="me-2 text-warning" />
                      Absences seulement
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <Button
                  variant="outline-primary"
                  onClick={() => fetchAbsencesConges()}
                  size="sm"
                  className="d-flex align-items-center"
                >
                  <FaSync />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Calendrier */}
      {viewMode === 'month' && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-0">
            {/* En-tête des jours de la semaine */}
            <div className="calendar-header">
              <Row className="g-0">
                {weekDays.map((day, index) => (
                  <Col key={index} className="text-center py-3 border-bottom">
                    <div className="fw-bold text-muted">{day}</div>
                  </Col>
                ))}
              </Row>
            </div>
            
            {/* Jours du calendrier */}
            <div className="calendar-body">
              {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
                <Row key={weekIndex} className="g-0 calendar-week">
                  {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    const isWeekendDay = isWeekend(day);
                    const dayAbsences = getAbsencesForDate(day);
                    
                    return (
                      <Col 
                        key={dayIndex} 
                        className={`calendar-day border-end border-bottom ${
                          !isCurrentMonth ? 'calendar-day-outside' : ''
                        } ${isSelected ? 'calendar-day-selected' : ''} ${
                          isTodayDate ? 'calendar-day-today' : ''
                        } ${isWeekendDay ? 'calendar-day-weekend' : ''}`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="calendar-day-header">
                          <div className={`calendar-day-number ${
                            !isCurrentMonth ? 'text-muted' : ''
                          }`}>
                            {format(day, 'd')}
                          </div>
                          {isTodayDate && (
                            <Badge bg="primary" className="calendar-today-badge">
                              Aujourd'hui
                            </Badge>
                          )}
                        </div>
                        
                        <div className="calendar-day-content">
                          {dayAbsences.map((absence, idx) => (
                            <div 
                              key={idx} 
                              className={`calendar-event mb-1 p-1 rounded ${
                                absence.typeAbsence === 'CONGE' 
                                  ? 'calendar-event-conge' 
                                  : 'calendar-event-absence'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(absence);
                              }}
                              title={`${getTypeLabel(absence.typeAbsence)} - ${absence.nomComplet}`}
                            >
                              <div className="d-flex align-items-center">
                                {getTypeIcon(absence.typeAbsence)}
                                <small className="ms-1 text-truncate">
                                  {getTypeLabel(absence.typeAbsence)}
                                </small>
                              </div>
                            </div>
                          ))}
                          
                          {dayAbsences.length > 2 && (
                            <div className="text-center">
                              <Badge bg="secondary" pill>
                                +{dayAbsences.length - 2} autres
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Liste des absences pour la date sélectionnée */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaCalendarAlt className="me-2" />
              Absences et Congés pour le {formatDate(selectedDate, 'dd MMMM yyyy')}
            </h5>
            <Badge bg="primary" pill>
              {getAbsencesForDate(selectedDate).length}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {getAbsencesForDate(selectedDate).length === 0 ? (
            <div className="text-center py-4">
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <p className="text-muted">Aucune absence ou congé pour cette date</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {getAbsencesForDate(selectedDate).map((absence, index) => (
                <ListGroup.Item key={index} className="border-0 py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {getTypeIcon(absence.typeAbsence)}
                      </div>
                      <div>
                        <h6 className="mb-1">
                          {getTypeLabel(absence.typeAbsence)}
                          <Badge 
                            bg={getTypeColor(absence.typeAbsence)} 
                            className="ms-2"
                          >
                            {absence.typeAbsence}
                          </Badge>
                        </h6>
                        <p className="text-muted mb-0">
                          <FaIdCard className="me-2" />
                          {absence.nomComplet} ({absence.matricule})
                        </p>
                        <p className="text-muted mb-0 small">
                          <FaBriefcase className="me-2" />
                          {absence.nomPoste} | {absence.departementNom}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewDetails(absence)}
                      >
                        <FaEye className="me-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Résumé du mois */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <FaInfoCircle className="me-2" />
            Résumé du mois de {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <h6>Congés ce mois</h6>
                {getAbsencesForMonth().filter(a => a.typeAbsence === 'CONGE').length === 0 ? (
                  <p className="text-muted">Aucun congé ce mois</p>
                ) : (
                  <ListGroup variant="flush">
                    {getAbsencesForMonth()
                      .filter(a => a.typeAbsence === 'CONGE')
                      .slice(0, 5)
                      .map((conge, idx) => (
                        <ListGroup.Item key={idx} className="border-0 py-2">
                          <div className="d-flex justify-content-between">
                            <span>
                              <FaUmbrellaBeach className="me-2 text-success" />
                              {formatDate(conge.dateAbsence)}
                            </span>
                            <span className="text-muted">{conge.nomComplet}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <h6>Absences ce mois</h6>
                {getAbsencesForMonth().filter(a => a.typeAbsence === 'ABSENCE').length === 0 ? (
                  <p className="text-muted">Aucune absence ce mois</p>
                ) : (
                  <ListGroup variant="flush">
                    {getAbsencesForMonth()
                      .filter(a => a.typeAbsence === 'ABSENCE')
                      .slice(0, 5)
                      .map((absence, idx) => (
                        <ListGroup.Item key={idx} className="border-0 py-2">
                          <div className="d-flex justify-content-between">
                            <span>
                              <FaBed className="me-2 text-warning" />
                              {formatDate(absence.dateAbsence)}
                            </span>
                            <span className="text-muted">{absence.nomComplet}</span>
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal Détails de l'absence/congé */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {selectedAbsence && getTypeIcon(selectedAbsence.typeAbsence)}
            <span className="ms-2">
              Détails {selectedAbsence ? getTypeLabel(selectedAbsence.typeAbsence) : ''}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAbsence ? (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-2">
                    <label className="form-label text-muted">Date</label>
                    <p className="fw-bold">{formatDate(selectedAbsence.dateAbsence, 'dd MMMM yyyy')}</p>
                  </div>
                  
                  <div className="mb-2">
                    <label className="form-label text-muted">Type</label>
                    <div>
                      <Badge bg={getTypeColor(selectedAbsence.typeAbsence)}>
                        {getTypeLabel(selectedAbsence.typeAbsence)}
                      </Badge>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-2">
                    <label className="form-label text-muted">Employé</label>
                    <p className="fw-bold">{selectedAbsence.nomComplet}</p>
                  </div>
                  
                  <div className="mb-2">
                    <label className="form-label text-muted">Matricule</label>
                    <p>{selectedAbsence.matricule}</p>
                  </div>
                </Col>
              </Row>
              
              <div className="mb-3">
                <label className="form-label text-muted">Poste</label>
                <p>
                  <FaBriefcase className="me-2 text-muted" />
                  {selectedAbsence.nomPoste || 'Non spécifié'}
                </p>
              </div>
              
              <div className="mb-3">
                <label className="form-label text-muted">Département</label>
                <p>
                  <FaHome className="me-2 text-muted" />
                  {selectedAbsence.departementNom || 'Non spécifié'}
                </p>
              </div>
              
              <div className="alert alert-info">
                <FaInfoCircle className="me-2" />
                Ces données proviennent de la vue consolidée des absences et congés.
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">Aucune donnée disponible</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
          <Button variant="outline-primary">
            <FaPrint className="me-2" />
            Imprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS */}
      <style>{`
        .calendar-day {
          min-height: 120px;
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }
        
        .calendar-day:hover {
          background-color: #f9f1f8;
        }
        
        .calendar-day-outside {
          background-color: #f9f1f8;
          opacity: 0.6;
        }
        
        .calendar-day-selected {
          background-color: #e3f2fd;
          border: 2px solid #b053ad !important;
        }
        
        .calendar-day-today {
          background-color: #fff3e0;
        }
        
        .calendar-day-weekend {
          background-color: #f9f1f8;
        }
        
        .calendar-day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px;
          border-bottom: 1px solid #e1b2db;
        }
        
        .calendar-day-number {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .calendar-today-badge {
          font-size: 0.6rem;
          padding: 2px 6px;
        }
        
        .calendar-day-content {
          padding: 4px;
          max-height: 80px;
          overflow-y: auto;
        }
        
        .calendar-event {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .calendar-event:hover {
          transform: translateX(2px);
        }
        
        .calendar-event-conge {
          background-color: #d4edda;
          border-left: 3px solid #28a745;
        }
        
        .calendar-event-absence {
          background-color: #fff3cd;
          border-left: 3px solid #ffc107;
        }
        
        .calendar-header .col {
          background-color: #f9f1f8;
          font-weight: 600;
        }
        
        .calendar-week {
          min-height: 120px;
        }
        
        .list-group-item {
          border-left: none;
          border-right: none;
        }
        
        .list-group-item:first-child {
          border-top: none;
        }
        
        .list-group-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </Container>
  );
};

export default AbsenceConge;