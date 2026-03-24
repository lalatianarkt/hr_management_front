import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Card,
  Badge
} from 'react-bootstrap';
import {
  Search,
  X,
  Filter
} from 'react-feather';
import axiosInstance from '../../../utils/AxiosInstance'; 
import RubriqueFormuleModal from './RubriqueFormule';

function RubriqueModal({ show, onHide, title = "Rubriques de Paie", employeId }) {
  const [rubriques, setRubriques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormuleModal, setShowFormuleModal] = useState(false);
  const [selectedRubriqueId, setSelectedRubriqueId] = useState(null);

  useEffect(() => {
    if (show) {
      fetchRubriques();
    }
  }, [show]);

  const fetchRubriques = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get('/api/rubriques-paie/actif');
      setRubriques(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rubriques:', error);
      
      if (error.response) {
        setError(`Erreur ${error.response.status}: ${error.response.data?.message || 'Erreur lors du chargement des rubriques'}`);
      } else if (error.request) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError('Erreur lors du chargement des rubriques');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRubriques = rubriques.filter(rubrique => {
    return (
      rubrique.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rubrique.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
  };

  const handleRowClick = (rubriqueId) => {
    setSelectedRubriqueId(rubriqueId);
    setShowFormuleModal(true);
  };

  const handleCloseFormuleModal = () => {
    setShowFormuleModal(false);
    setSelectedRubriqueId(null);
  };

  const formatFormule = (rubrique) => {
    if (!rubrique.formule) return null;
    const { formule } = rubrique;
    const hasBase = !!formule.base;
    const hasTaux = !!formule.taux;
    const hasNombre = !!formule.nombre;
    const hasMontantFixe = !!formule.montantFixe;

    if (hasBase && hasTaux && hasNombre) return "base × taux × nombre";
    if (hasBase && hasTaux) return "base × taux";
    if (hasBase && hasNombre) return "base × nombre";
    if (hasBase) return "base";
    if (hasMontantFixe) return "montant fixe";
    if (hasTaux && hasNombre) return "taux × nombre";
    if (hasTaux) return "taux";
    if (hasNombre) return "nombre";
    return null;
  };

  const getTypeColor = (typeLibelle) => {
    if (!typeLibelle) return 'secondary';
    const libelleLower = typeLibelle.toLowerCase();
    if (libelleLower.includes('patronale')) return 'secondary';
    if (libelleLower.includes('gain') || libelleLower.includes('avantage')) return 'success';
    if (libelleLower.includes('retenue') || libelleLower.includes('déduction')) return 'danger';
    if (libelleLower.includes('exceptionnel')) return 'warning';
    return 'info';
  };

  const getBrandBadgeColor = (variant) => {
    switch (variant) {
      case 'success': return '#10b981';
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#b053ad';
      default: return '#6b7280';
    }
  };

  if (!show) return null;

  return (
    <div className="modal_perso shadow-lg">
      <Card 
        className="modal-dialog-custom" 
        style={{ 
          maxWidth: '95%', 
          width: '1000px', 
          border: 'none', 
          background: '#ffffff', 
          borderRadius: '20px', 
          overflow: 'hidden' 
        }}
      >
        {/* Header - Brand Purple */}
        <div 
          className="modal-header d-flex justify-content-between align-items-center p-3" 
          style={{ 
            background: '#b053ad',
            borderBottom: 'none' 
          }}
        >
          <h5 className="m-0 fw-bold text-white">{title}</h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onHide}
            aria-label="Fermer"
          ></button>
        </div>

        {/* Body */}
        <div 
          className="modal-body p-4" 
          style={{ 
            maxHeight: '75vh', 
            overflowY: 'auto', 
            background: '#f9f1f8' 
          }}
        >
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          {/* Search Bar */}
          <Card 
            className="mb-4 border-0 shadow-sm" 
            style={{ 
              borderRadius: '12px',
              background: '#ffffff'
            }}
          >
            <div className="p-3">
              <InputGroup>
                <InputGroup.Text className="bg-transparent border-0 text-muted">
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="bg-transparent border-0"
                  placeholder="Rechercher par code ou libellé..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ boxShadow: 'none', fontSize: '15px' }}
                />
                {searchTerm && (
                  <Button 
                    variant="link" 
                    className="text-muted p-0 border-0" 
                    onClick={resetFilters}
                    style={{ background: 'transparent' }}
                  >
                    <X size={18} />
                  </Button>
                )}
              </InputGroup>
            </div>
          </Card>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner 
                animation="border" 
                style={{ color: '#b053ad' }}
              />
              <p className="mt-3 text-muted">Chargement des rubriques...</p>
            </div>
          ) : (
            <div 
              className="card border-0 shadow-sm" 
              style={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                background: '#ffffff'
              }}
            >
              <Table hover responsive className="mb-0">
                <thead 
                  style={{ 
                    background: '#f9f1f8',
                    borderBottom: '2px solid #e1b2db'
                  }}
                >
                  <tr>
                    <th 
                      className="border-0 px-4 py-3 fw-semibold" 
                      style={{ 
                        color: '#5c2458',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Code
                    </th>
                    <th 
                      className="border-0 px-4 py-3 fw-semibold" 
                      style={{ 
                        color: '#5c2458',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Libellé
                    </th>
                    <th 
                      className="border-0 px-4 py-3 fw-semibold" 
                      style={{ 
                        color: '#5c2458',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Formule
                    </th>
                    <th 
                      className="border-0 px-4 py-3 text-center fw-semibold" 
                      style={{ 
                        color: '#5c2458',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredRubriques.length > 0 ? (
                    filteredRubriques.map((rubrique) => (
                      <tr 
                        key={rubrique.id} 
                        onClick={() => handleRowClick(rubrique.id)} 
                        style={{ 
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3e2f1'
                        }}
                      >
                        <td className="px-4 py-3">
                          <span 
                            className="fw-bold" 
                            style={{ 
                              color: '#b053ad',
                              fontSize: '0.95rem'
                            }}
                          >
                            {rubrique.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div 
                            className="fw-semibold" 
                            style={{ 
                              color: '#3a1438',
                              fontSize: '0.95rem'
                            }}
                          >
                            {rubrique.libelle}
                          </div>
                          {rubrique.commentaire && (
                            <div 
                              className="small mt-1" 
                              style={{ color: '#5c2458' }}
                            >
                              {rubrique.commentaire}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="small fst-italic" 
                            style={{ color: '#6b7280' }}
                          >
                            {formatFormule(rubrique) || "Aucune formule"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            style={{ 
                              backgroundColor: getBrandBadgeColor(getTypeColor(rubrique.type?.libelle)),
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                            pill
                          >
                            {rubrique.type?.libelle}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <Filter 
                          size={40} 
                          className="mb-3" 
                          style={{ opacity: 0.25, color: '#6b7280' }}
                        />
                        <p className="text-muted mb-0">Aucune rubrique trouvée</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="modal-footer p-3 d-flex justify-content-between align-items-center" 
          style={{ 
            background: '#ffffff',
            borderTop: '1px solid #e1b2db'
          }}
        >
          <small 
            className="fw-medium" 
            style={{ color: '#5c2458' }}
          >
            {filteredRubriques.length} rubrique{filteredRubriques.length > 1 ? 's' : ''} affichée{filteredRubriques.length > 1 ? 's' : ''}
          </small>
          <Button 
            onClick={onHide}
            style={{
              background: '#b053ad',
              border: 'none',
              borderRadius: '10px',
              padding: '0.5rem 1.5rem',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Fermer
          </Button>
        </div>
      </Card>

      <RubriqueFormuleModal
        show={showFormuleModal}
        onHide={handleCloseFormuleModal}
        rubriqueId={selectedRubriqueId}
        employeId={employeId}
      />
    </div>
  );
}

export default RubriqueModal;