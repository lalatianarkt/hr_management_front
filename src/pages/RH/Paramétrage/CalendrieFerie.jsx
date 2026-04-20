import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Modal,
  OverlayTrigger,
  Pagination,
  Spinner,
  Table,
  Tooltip
} from 'react-bootstrap';
import { Calendar, ChevronDown, ChevronUp, Edit2, Plus, RefreshCw, Trash2 } from 'react-feather';
import { format } from 'date-fns';
import axiosInstance from '../../utils/AxiosInstance';

const CalendrierFerieList = () => {
  const [feries, setFeries] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFerie, setSelectedFerie] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('dateFerie');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeries();
  }, []);

  const fetchFeries = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosInstance.get('/api/calendrier-ferie');
      setFeries(response.data);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des données';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ferie = null) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (ferie) {
      setIsEditMode(true);
      setSelectedFerie({ ...ferie });
    } else {
      setIsEditMode(false);
      setSelectedFerie({
        id: null,
        dateFerie: format(new Date(), 'yyyy-MM-dd'),
        libelle: '',
        estActif: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFerie(null);
  };

  const openDeleteConfirm = (ferie) => {
    setSelectedFerie(ferie);
    setShowDeleteModal(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteModal(false);
    setSelectedFerie(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const formattedDate = selectedFerie?.dateFerie
        ? format(new Date(selectedFerie.dateFerie), 'yyyy-MM-dd')
        : '';
      
      if (isEditMode) {
        await axiosInstance.put(`/api/calendrier-ferie/${selectedFerie.id}`, {
          dateFerie: formattedDate,
          libelle: selectedFerie.libelle,
          estActif: selectedFerie.estActif
        });
        setSuccessMessage('Jour férié modifié avec succès.');
      } else {
        await axiosInstance.post('/api/calendrier-ferie', {
          dateFerie: formattedDate,
          libelle: selectedFerie.libelle,
          estActif: selectedFerie.estActif
        });
        setSuccessMessage('Jour férié ajouté avec succès.');
      }
      handleCloseDialog();
      fetchFeries();
    } catch (error) {
      console.error('Erreur:', error);
      const message = error.response?.data?.message || error.response?.data || 'Erreur lors de l’enregistrement.';
      setErrorMessage(typeof message === 'string' ? message : 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await axiosInstance.delete(`/api/calendrier-ferie/${id}`);
      setSuccessMessage('Jour férié supprimé avec succès.');
      closeDeleteConfirm();
      fetchFeries();
    } catch (error) {
      console.error('Erreur:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (ferie) => {
    setLoading(true);
    try {
      if (ferie.estActif) {
        await axiosInstance.patch(`/api/calendrier-ferie/${ferie.id}/deactivate`);
        setSuccessMessage('Jour férié désactivé.');
      } else {
        const formattedDate = ferie?.dateFerie ? format(new Date(ferie.dateFerie), 'yyyy-MM-dd') : '';
        await axiosInstance.put(`/api/calendrier-ferie/${ferie.id}`, {
          dateFerie: formattedDate,
          libelle: ferie.libelle,
          estActif: true
        });
        setSuccessMessage('Jour férié réactivé.');
      }
      fetchFeries();
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la modification';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedFeries = useMemo(() => {
    return [...feries].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      if (orderBy === 'dateFerie') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [feries, orderBy, order]);

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const totalPages = Math.max(1, Math.ceil(sortedFeries.length / rowsPerPage));
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pagedFeries = sortedFeries.slice(startIndex, endIndex);

  const sortIcon = (property) => {
    if (orderBy !== property) return null;
    return order === 'asc' ? <ChevronUp size={14} className="ms-1" /> : <ChevronDown size={14} className="ms-1" />;
  };

  return (
    <Container fluid className="py-4 calendrier-ferie-page">
      <Card className="border-0 shadow-sm calendrier-ferie-card">
        <Card.Header className="page-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="calendrier-ferie-icon">
              <Calendar size={18} />
            </span>
            <h1 className="h4 mb-0">Gestion des jours fériés</h1>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              onClick={fetchFeries}
              disabled={loading}
              className="d-flex align-items-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : <RefreshCw size={16} />}
              Actualiser
            </Button>
            <Button
              variant="primary"
              onClick={() => handleOpenDialog()}
              disabled={loading}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={16} />
              Ajouter
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {errorMessage && (
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}

          <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
            <small className="text-muted">
              {sortedFeries.length === 0
                ? 'Aucun jour férié'
                : `Affichage de ${Math.min(startIndex + 1, sortedFeries.length)}-${Math.min(
                    endIndex,
                    sortedFeries.length
                  )} sur ${sortedFeries.length}`}
            </small>

            <div className="d-flex align-items-center gap-2">
              <small className="text-muted d-none d-md-inline">Lignes par page</small>
              <DropdownButton
                title={rowsPerPage}
                size="sm"
                variant="outline-secondary"
                align="end"
              >
                {[5, 10, 25].map((n) => (
                  <Dropdown.Item
                    key={n}
                    active={rowsPerPage === n}
                    onClick={() => {
                      setRowsPerPage(n);
                      setPage(0);
                    }}
                  >
                    {n}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </div>
          </div>

          <div className="table-responsive calendrier-ferie-table-wrapper">
            <Table className="table align-middle calendrier-ferie-table mb-0" hover>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="user-select-none"
                    style={{ cursor: 'pointer', width: 90 }}
                    onClick={() => handleSort('id')}
                  >
                    ID {sortIcon('id')}
                  </th>
                  <th
                    scope="col"
                    className="user-select-none"
                    style={{ cursor: 'pointer', width: 180 }}
                    onClick={() => handleSort('dateFerie')}
                  >
                    Date {sortIcon('dateFerie')}
                  </th>
                  <th
                    scope="col"
                    className="user-select-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('libelle')}
                  >
                    Libellé {sortIcon('libelle')}
                  </th>
                  <th scope="col" style={{ width: 130 }}>
                    Statut
                  </th>
                  <th scope="col" className="text-end" style={{ width: 260 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedFeries.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="text-muted">Aucun jour férié trouvé</div>
                    </td>
                  </tr>
                ) : (
                  pagedFeries.map((ferie) => (
                    <tr key={ferie.id}>
                      <td className="fw-semibold">{ferie.id}</td>
                      <td>{formatDate(ferie.dateFerie)}</td>
                      <td className="fw-medium">{ferie.libelle}</td>
                      <td>
                        <Badge bg={ferie.estActif ? 'success' : 'secondary'} className="fw-normal">
                          {ferie.estActif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-edit-ferie-${ferie.id}`}>Modifier</Tooltip>}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenDialog(ferie)}
                              disabled={loading}
                              className="px-2"
                            >
                              <Edit2 size={14} />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-delete-ferie-${ferie.id}`}>Supprimer</Tooltip>}
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteConfirm(ferie)}
                              disabled={loading}
                              className="px-2"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </OverlayTrigger>

                          <Button
                            size="sm"
                            variant={ferie.estActif ? 'outline-warning' : 'outline-success'}
                            onClick={() => handleToggleActif(ferie)}
                            disabled={loading}
                            className="calendrier-ferie-toggle-btn"
                          >
                            {ferie.estActif ? 'Désactiver' : 'Activer'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <Pagination className="mb-0">
              <Pagination.First
                disabled={page <= 0}
                onClick={() => setPage(0)}
              />
              <Pagination.Prev
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active>{page + 1}</Pagination.Item>
              <Pagination.Next
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
              <Pagination.Last
                disabled={page >= totalPages - 1}
                onClick={() => setPage(totalPages - 1)}
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      {/* Modal ajout/modification */}
      <Modal show={openDialog} onHide={handleCloseDialog} centered>
        <Modal.Header 
          closeButton 
          closeLabel="Fermer"
          className="border-0"
          style={{ 
            backgroundColor: '#f8f9fa',
            // borderBottom: '3px solid #3ce17c',
            padding: '1rem 1.5rem'
          }}
        >
          <Modal.Title style={{ color: '#f6f2f3', fontWeight: 600 }}>
            {isEditMode ? (
              <>
                <Edit2 size={18} className="me-2" />
                Modifier le jour férié
              </>
            ) : (
              <>
                <Plus size={18} className="me-2" />
                Ajouter un jour férié
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date fériée</Form.Label>
              <Form.Control
                type="date"
                value={selectedFerie?.dateFerie ? format(new Date(selectedFerie.dateFerie), 'yyyy-MM-dd') : ''}
                onChange={(e) => setSelectedFerie((prev) => ({ ...prev, dateFerie: e.target.value }))}
                disabled={loading || isEditMode}
                required
              />
              {isEditMode && (
                <Form.Text className="text-muted">
                  La date n’est pas modifiable après création.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Libellé</Form.Label>
              <Form.Control
                type="text"
                value={selectedFerie?.libelle || ''}
                onChange={(e) => setSelectedFerie((prev) => ({ ...prev, libelle: e.target.value }))}
                disabled={loading}
                placeholder="Ex: Nouvel an"
                required
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Check
                type="switch"
                id="ferie-actif-switch"
                label="Actif"
                checked={!!selectedFerie?.estActif}
                onChange={(e) => setSelectedFerie((prev) => ({ ...prev, estActif: e.target.checked }))}
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDialog} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || !selectedFerie?.libelle || !selectedFerie?.dateFerie}
          >
            {loading ? <Spinner size="sm" /> : isEditMode ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal show={showDeleteModal} onHide={closeDeleteConfirm} centered>
        <Modal.Header closeButton closeLabel="Fermer" className="modal-header-custom">
          <Modal.Title>Supprimer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <div className="mb-2">
            Confirmez-vous la suppression de ce jour férié ?
          </div>
          {selectedFerie && (
            <div className="text-muted">
              {selectedFerie?.libelle} — {formatDate(selectedFerie?.dateFerie)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteConfirm} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(selectedFerie?.id)}
            disabled={loading || !selectedFerie?.id}
          >
            {loading ? <Spinner size="sm" /> : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .calendrier-ferie-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f3e9f7;
          color: #b053ad;
          border: 1px solid #e1b2db;
        }

        .calendrier-ferie-table thead th {
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .calendrier-ferie-toggle-btn {
          min-width: 110px;
          font-weight: 600;
          white-space: nowrap;
        }
      `}</style>
    </Container>
  );
};

export default CalendrierFerieList;
