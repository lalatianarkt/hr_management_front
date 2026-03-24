// src/components/FormuleModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const FormuleModal = ({ 
  show, 
  onHide, 
  rubrique,
  onSave,
  onDelete
}) => {
  const [formuleData, setFormuleData] = useState({
    base: '',
    montantFixe: '',
    nombre: '',
    taux: ''
  });
  
  const [abreviations, setAbreviations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const baseInputRef = useRef(null);
  const suggestionListRef = useRef(null);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (rubrique && rubrique.formule) {
      setFormuleData({
        base: rubrique.formule.base || '',
        montantFixe: rubrique.formule.montantFixe || '',
        nombre: rubrique.formule.nombre || '',
        taux: rubrique.formule.taux || ''
      });
    } else {
      setFormuleData({ base: '', montantFixe: '', nombre: '', taux: '' });
    }
  }, [rubrique]);

  // Charger les abréviations disponibles
  const fetchAbreviations = async (searchTerm = '') => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/abreviations/search/available', {
        params: {
          term: searchTerm,
          limit: 10
        }
      });
      setAbreviations(response.data);
    } catch (error) {
      console.error('Erreur chargement abréviations:', error);
      setAbreviations([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les abréviations au démarrage
  useEffect(() => {
    if (show) {
      fetchAbreviations();
    }
  }, [show]);

  // Gérer le changement de base avec suggestions
  const handleBaseChange = (value) => {
    setFormuleData(prev => ({...prev, base: value}));
    
    if (value.trim() !== '') {
      fetchAbreviations(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Sélectionner une suggestion
  const handleSuggestionClick = (abreviation) => {
    setFormuleData(prev => ({...prev, base: abreviation}));
    setShowSuggestions(false);
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionListRef.current && 
          !suggestionListRef.current.contains(event.target) &&
          baseInputRef.current && 
          !baseInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer la sauvegarde
  const handleSave = () => {
    if (!formuleData.base.trim()) {
      alert('La base de calcul est obligatoire');
      return;
    }
    
    onSave(formuleData);
    setShowSuggestions(false);
  };

  // Gérer l'annulation
  const handleCancel = () => {
    onHide();
    setShowSuggestions(false);
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <i className="bi bi-calculator me-2"></i>
              {rubrique?.formule ? 'Modifier la formule' : 'Ajouter une formule'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleCancel}
            ></button>
          </div>
          
          <div className="modal-body">
            {rubrique && (
              <>
                <div className="mb-4">
                  <h6 className="fw-bold">{rubrique.libelle}</h6>
                  <p className="text-muted small mb-0">Code: {rubrique.code}</p>
                  <p className="text-muted small">Type: {rubrique.type?.libelle || '-'}</p>
                </div>
                
                <form>
                  {/* Base de calcul avec suggestions */}
                  <div className="mb-3">
                    <label className="form-label">Base de calcul <span className="text-danger">*</span></label>
                    
                    <div className="position-relative" ref={baseInputRef}>
                      <input
                        type="text"
                        className="form-control"
                        value={formuleData.base || ''}
                        onChange={(e) => handleBaseChange(e.target.value)}
                        onFocus={() => formuleData.base?.trim() && setShowSuggestions(true)}
                        placeholder="Ex: SALAIRE_BASE, BRUT, NET, HEURES_SUP, PRIME, ou une abréviation"
                        required
                        list="baseSuggestions"
                      />
                      
                      {/* Liste déroulante HTML5 native */}
                      <datalist id="baseSuggestions">
                        <option value="SALAIRE_BASE">Salaire de base</option>
                        <option value="BRUT">Salaire brut</option>
                        <option value="NET">Salaire net</option>
                        <option value="HEURES_SUP">Heures supplémentaires</option>
                        <option value="PRIME">Prime</option>
                        <option value="FIXE">Montant fixe uniquement</option>
                        {abreviations.map(abrev => (
                          <option key={abrev.id} value={abrev.abreviation}>
                            {abrev.libelle}
                          </option>
                        ))}
                      </datalist>
                      
                      {/* Suggestions personnalisées */}
                      {showSuggestions && abreviations.length > 0 && (
                        <div 
                          ref={suggestionListRef}
                          className="position-absolute top-100 start-0 end-0 bg-white border rounded shadow-sm z-3 mt-1"
                          style={{ maxHeight: '200px', overflowY: 'auto' }}
                        >
                          <div className="border-bottom bg-light p-2">
                            <small className="text-muted">Abréviations disponibles</small>
                          </div>
                          
                          {abreviations.map(abrev => (
                            <div
                              key={abrev.id}
                              className="suggestion-item px-3 py-2 border-bottom"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSuggestionClick(abrev.abreviation)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong className="text-primary">{abrev.abreviation}</strong>
                                  <span className="ms-2">{abrev.libelle}</span>
                                </div>
                                {abrev.description && (
                                  <small className="text-muted">
                                    {abrev.description.substring(0, 30)}...
                                  </small>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {loading && (
                        <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                          <div className="spinner-border spinner-border-sm text-secondary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <small className="text-muted">
                      Entrez une base existante ou une abréviation personnalisée. Tapez pour rechercher.
                    </small>
                  </div>
                  
                  {/* Montant fixe et Taux */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Montant fixe</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="0.00"
                          value={formuleData.montantFixe || ''}
                          onChange={(e) => setFormuleData(prev => ({...prev, montantFixe: e.target.value}))}
                        />
                        <small className="text-muted">
                          Montant fixe à ajouter (optionnel)
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Taux (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="0.00"
                          value={formuleData.taux || ''}
                          onChange={(e) => setFormuleData(prev => ({...prev, taux: e.target.value}))}
                        />
                        <small className="text-muted">
                          Pourcentage appliqué à la base (optionnel)
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nombre (multiplicateur) */}
                  <div className="mb-3">
                    <label className="form-label">Nombre (multiplicateur)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="1.00"
                      value={formuleData.nombre || ''}
                      onChange={(e) => setFormuleData(prev => ({...prev, nombre: e.target.value}))}
                    />
                    <small className="text-muted">
                      Ex: Nombre d'heures, jours, unités, etc. (optionnel)
                    </small>
                  </div>
                  
                  {/* Aide sur les opérateurs */}
                  <div className="alert alert-info">
                    <small>
                      <strong>Exemples :</strong><br/>
                      • Salaire de base × 5% : Base = SALAIRE_BASE, Taux = 5<br/>
                      • Prime fixe : Base = FIXE, Montant fixe = 100<br/>
                      • Heures supplémentaires : Base = HEURES_SUP, Nombre = heures, Taux = taux horaire<br/>
                      • Salaire net + prime : Base = NET, Montant fixe = montant de la prime
                    </small>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-between mt-4">
                    <div>
                      {rubrique?.formule && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette formule?')) {
                              onDelete();
                            }
                          }}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Supprimer
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={handleCancel}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                      >
                        <i className="bi bi-save me-2"></i>
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormuleModal;
