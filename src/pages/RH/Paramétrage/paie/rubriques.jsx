import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tag, PlusCircle, Search, CheckCircle, XCircle, Eye, Edit, Trash2, Calculator, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../../utils/AxiosInstance'; 

const RubriquesPaiePage = () => {
  const [rubriques, setRubriques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [modesCalcul, setModesCalcul] = useState([]);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(null); // 'activate' | 'deactivate' | null
  
  const [showModal, setShowModal] = useState(false);
  const [currentRubrique, setCurrentRubrique] = useState(null);
  const [modalType, setModalType] = useState('');
  const [showFormuleSection, setShowFormuleSection] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categorie: 'TOUS',
    type: 'TOUS',
    actif: 'TOUS',
    imposable: 'TOUS',
    cotisations: 'TOUS',
    deductibleIrsa: 'TOUS'
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const urlPage = parseInt(searchParams.get('page')) || 1;
  const urlSize = parseInt(searchParams.get('size')) || 10;
  const urlSearch = searchParams.get('search') || '';
  const urlType = searchParams.get('type') || 'TOUS';
  const urlCategorie = searchParams.get('categorie') || 'TOUS';
  const urlActif = searchParams.get('actif') || 'TOUS';
  const urlImposable = searchParams.get('imposable') || 'TOUS';
  const urlCotisations = searchParams.get('cotisations') || 'TOUS';
  const urlDeductibleIrsa = searchParams.get('deductibleIrsa') || 'TOUS';
  const urlSortBy = searchParams.get('sortBy') || 'ordre';
  const urlDirection = searchParams.get('direction') || 'asc';
  
  const [currentPage, setCurrentPage] = useState(Math.max(0, urlPage - 1));
  const [pageSize, setPageSize] = useState(urlSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState(urlSortBy);
  const [sortDirection, setSortDirection] = useState(urlDirection);

  useEffect(() => {
    setSearchTerm(urlSearch);
    setFilters({
      categorie: urlCategorie,
      type: urlType,
      actif: urlActif,
      imposable: urlImposable,
      cotisations: urlCotisations,
      deductibleIrsa: urlDeductibleIrsa
    });
  }, []);

  const updateURL = () => {
    const params = new URLSearchParams();
    
    params.set('page', currentPage + 1);
    params.set('size', pageSize);
    params.set('sortBy', sortBy);
    params.set('direction', sortDirection);
    
    if (searchTerm && searchTerm !== '') {
      params.set('search', searchTerm);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'TOUS') {
        params.set(key, value);
      }
    });
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        await Promise.all([
          fetchCategories(),
          fetchTypes(),
          fetchModesCalcul(),
        ]);
        
        await fetchRubriquesWithSearch();
        
        setLoading(false);
      } catch (err) {
        setError('Erreur de chargement des données');
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const fetchModesCalcul = async () => {
    try {
      const response = await axiosInstance.get('/api/modes-calcul');
      setModesCalcul(response.data);
    } catch (err) {
      console.error("Erreur chargement modes de calcul:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories-rub');
      setCategories(response.data);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axiosInstance.get('/api/rubrique-types');
      setTypes(response.data);
    } catch (err) {
      console.error("Erreur chargement types:", err);
    }
  };

  const fetchRubriquesWithSearch = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('size', pageSize);
      params.append('sortBy', sortBy);
      params.append('direction', sortDirection);
      
      if (searchTerm && searchTerm !== '') {
        params.append('search', searchTerm);
      }
      
      if (filters.type && filters.type !== 'TOUS') {
        params.append('typeId', filters.type);
      }
      
      if (filters.imposable && filters.imposable !== 'TOUS') {
        params.append('estImposable', filters.imposable === 'OUI' ? 'true' : 'false');
      }
      
      if (filters.cotisations && filters.cotisations !== 'TOUS') {
        params.append('estSoumisCotisations', filters.cotisations === 'OUI' ? 'true' : 'false');
      }

      if (filters.deductibleIrsa && filters.deductibleIrsa !== 'TOUS') {
        params.append('estDeductibleIrsa', filters.deductibleIrsa === 'OUI' ? 'true' : 'false');
      }
      
      if (filters.actif && filters.actif !== 'TOUS') {
        params.append('estActif', filters.actif === 'ACTIF' ? 'true' : 'false');
      }

      if (filters.categorie && filters.categorie !== 'TOUS') {
        params.append('categorieId', filters.categorie);
      }
      
      const url = `/api/rubriques-paie/search?${params.toString()}`;
      
      const response = await axiosInstance.get(url);
      const data = response.data;
      
      setRubriques(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      
      setLoading(false);
      updateURL();
      
    } catch (err) {
      console.error("Erreur recherche:", err);
      setError('Erreur de recherche: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubriquesWithSearch();
  }, [currentPage, pageSize, sortBy, sortDirection, filters]);

  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const handleSearchWithDelay = (value) => {
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(0);
      fetchRubriquesWithSearch();
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(0);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    setPageSize(10);
    setSearchTerm('');
    setFilters({
      categorie: 'TOUS',
      type: 'TOUS',
      actif: 'TOUS',
      imposable: 'TOUS',
      cotisations: 'TOUS',
      deductibleIrsa: 'TOUS'
    });
    setSortBy('ordre');
    setSortDirection('asc');
    
    navigate('?page=1&size=10&sortBy=ordre&direction=asc', { replace: true });
    fetchRubriquesWithSearch();
  };

  const extractId = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    if (obj.id) return obj.id;
    return null;
  };

  const extractLibelle = (obj) => {
    if (!obj) return '-';
    if (typeof obj === 'string') return obj;
    if (obj.libelle) return obj.libelle;
    return '-';
  };

  const rubriquesById = useMemo(() => {
    return new Map(rubriques.map(rubrique => [rubrique.id, rubrique]));
  }, [rubriques]);

  const selectedRubriques = useMemo(() => {
    return selectedIds.map(id => rubriquesById.get(id)).filter(Boolean);
  }, [selectedIds, rubriquesById]);

  const selectedActiveIds = useMemo(() => {
    return selectedRubriques.filter(rubrique => rubrique.estActif).map(rubrique => rubrique.id);
  }, [selectedRubriques]);

  const selectedInactiveIds = useMemo(() => {
    return selectedRubriques.filter(rubrique => !rubrique.estActif).map(rubrique => rubrique.id);
  }, [selectedRubriques]);

  const effectiveSelectionMode = selectionMode ?? 'activate';
  const selectableRubriques = useMemo(() => {
    return rubriques.filter(rubrique => {
      return effectiveSelectionMode === 'deactivate' ? !!rubrique.estActif : !rubrique.estActif;
    });
  }, [rubriques, effectiveSelectionMode]);

  const allSelectableSelected = useMemo(() => {
    return selectableRubriques.length > 0 && selectableRubriques.every(rubrique => selectedIds.includes(rubrique.id));
  }, [selectableRubriques, selectedIds]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const idsToSelect = selectableRubriques.map(rubrique => rubrique.id);
      setSelectedIds(idsToSelect);
      if (!selectionMode) {
        setSelectionMode(effectiveSelectionMode);
      }
    } else {
      setSelectedIds([]);
      setSelectionMode(null);
    }
  };

  const handleSelectOne = (rubrique) => {
    const rowMode = rubrique?.estActif ? 'deactivate' : 'activate';

    if (selectionMode && selectionMode !== rowMode && !selectedIds.includes(rubrique.id)) {
      return;
    }

    if (!selectionMode && selectedIds.length === 0) {
      setSelectionMode(rowMode);
    }

    if (selectedIds.includes(rubrique.id)) {
      const nextIds = selectedIds.filter(selectedId => selectedId !== rubrique.id);
      setSelectedIds(nextIds);
      if (nextIds.length === 0) {
        setSelectionMode(null);
      }
    } else {
      setSelectedIds([...selectedIds, rubrique.id]);
    }
  };

  const handleActivateSelected = async () => {
    if (selectedInactiveIds.length === 0) {
      alert('Sélectionnez des rubriques inactives à activer.');
      return;
    }

    if (!window.confirm(`Activer ${selectedInactiveIds.length} rubrique(s) ?`)) return;
    const countToActivate = selectedInactiveIds.length;

    try {
      await Promise.all(
        selectedInactiveIds.map(id =>
          axiosInstance.put(`/api/rubriques-paie/${id}/activate`)
        )
      );
      fetchRubriquesWithSearch();
      setSelectedIds([]);
      setSelectionMode(null);
      alert(`${countToActivate} rubrique(s) activée(s)`);
    } catch (err) {
      alert('Erreur lors de l\'activation');
    }
  };

  const handleDeactivateSelected = async () => {
    if (selectedActiveIds.length === 0) {
      alert('Sélectionnez des rubriques actives à désactiver.');
      return;
    }

    if (!window.confirm(`Désactiver ${selectedActiveIds.length} rubrique(s) ?`)) return;
    const countToDeactivate = selectedActiveIds.length;

    try {
      await Promise.all(
        selectedActiveIds.map(id =>
          axiosInstance.put(`/api/rubriques-paie/${id}/deactivate`)
        )
      );
      fetchRubriquesWithSearch();
      setSelectedIds([]);
      setSelectionMode(null);
      alert(`${countToDeactivate} rubrique(s) désactivée(s)`);
    } catch (err) {
      alert('Erreur lors de la désactivation');
    }
  };
  const openEditModal = (rubrique) => {
    setCurrentRubrique({ 
      ...rubrique,
      categorieId: extractId(rubrique.categorie),
      typeId: extractId(rubrique.type),
      modeCalcul: rubrique.modeCalcul || '',
      formuleData: rubrique.formule ? {
        base: rubrique.formule.base || '',
        montantFixe: rubrique.formule.montantFixe || '',
        nombre: rubrique.formule.nombre || '',
        taux: rubrique.formule.taux || ''
      } : {
        base: '',
        montantFixe: '',
        nombre: '',
        taux: ''
      }
    });
    setModalType('edit');
    setShowModal(true);
    setShowFormuleSection(false);
  };

  const openViewModal = (rubrique) => {
    setCurrentRubrique(rubrique);
    setModalType('view');
    setShowModal(true);
  };

  const openCreateModal = async () => {
    try {
      const nextOrdreResponse = await axiosInstance.get('/api/rubriques-paie/next-ordre');
      const nextOrdre = nextOrdreResponse.data.nextOrdre;
      
      setCurrentRubrique({
        code: '',
        libelle: '',
        plafondMensuel: '',
        estImposable: false,
        estSoumisCotisations: false,
        compteComptable: null,
        ordre: nextOrdre,
        estActif: false,
        plafondAnnuel: null,
        commentaire: '',
        categorieId: '',
        typeId: '',
        modeCalcul: '',
        estDeductibleIrsa: false,
        formuleData: {
          base: '',
          montantFixe: '',
          nombre: '',
          taux: ''
        }
      });
      setModalType('create');
      setShowModal(true);
    } catch (err) {
      alert('Erreur lors de la création');
    }
  };

  const saveRubrique = async () => {
    try {
      const rubriqueData = {
        ...currentRubrique,
        categorie: currentRubrique.categorieId ? { id: currentRubrique.categorieId } : null,
        type: currentRubrique.typeId ? { id: currentRubrique.typeId } : null,
        modeCalcul: currentRubrique.modeCalcul || null,
        estDeductibleIrsa: currentRubrique.estDeductibleIrsa || false,
      };
      
      if (currentRubrique.formuleData && 
          (currentRubrique.formuleData.base || 
           currentRubrique.formuleData.montantFixe || 
           currentRubrique.formuleData.nombre || 
           currentRubrique.formuleData.taux)) {
        
        rubriqueData.formule = {
          base: currentRubrique.formuleData.base || null,
          montantFixe: currentRubrique.formuleData.montantFixe ? parseFloat(currentRubrique.formuleData.montantFixe) : null,
          nombre: currentRubrique.formuleData.nombre ? parseFloat(currentRubrique.formuleData.nombre) : null,
          taux: currentRubrique.formuleData.taux ? parseFloat(currentRubrique.formuleData.taux) : null
        };
      } else if (currentRubrique.formuleData && 
                 !currentRubrique.formuleData.base && 
                 !currentRubrique.formuleData.montantFixe && 
                 !currentRubrique.formuleData.nombre && 
                 !currentRubrique.formuleData.taux) {
        rubriqueData.formule = null;
      }
      
      delete rubriqueData.categorieId;
      delete rubriqueData.typeId;
      delete rubriqueData.formuleData;
      console.log("data to send : ", rubriqueData);
      
      if (modalType === 'create') {
        await axiosInstance.post('/api/rubriques-paie', rubriqueData);
        alert('Rubrique créée avec succès');
      } else {
        await axiosInstance.put(`/api/rubriques-paie/${currentRubrique.id}`, rubriqueData);
        alert('Rubrique modifiée avec succès');
      }
      setShowModal(false);
      fetchRubriquesWithSearch();
    } catch (err) {
      alert('Erreur de sauvegarde: ' + (err.response?.data?.message || err.message));
    }
  };

  const rubriquesActivesCount = rubriques.filter(r => r.estActif).length;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'bi-arrow-down-up';
    return sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  };

  const formatFormule = (formule) => {
    if (!formule) return '';
    
    const parts = [];
    if (formule.base && formule.base !== 'FIXE') {
      parts.push(formule.base);
    }
    if (formule.taux) {
      parts.push(`× ${formule.taux}%`);
    }
    if (formule.montantFixe) {
      parts.push(`+ ${formule.montantFixe}`);
    }
    if (formule.nombre && formule.nombre !== 1) {
      parts.push(`× ${formule.nombre}`);
    }
    
    return parts.join(' ');
  };

  if (loading) return <div className="text-center p-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid p-4 rubriques-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 rubriques-header">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center rubriques-title">
            <Tag className="me-2" size={26} />
            Rubriques de paie
          </h1>
          <p className="rubriques-subtitle mb-0">
            {totalElements} rubriques trouvées • {rubriquesActivesCount} actives
          </p>
        </div>

        <button
          className="btn rubriques-btn-primary d-flex align-items-center gap-2"
          onClick={openCreateModal}
        >
          <PlusCircle size={18} />
          Nouvelle rubrique
        </button>
      </div>
      {/* manomboka  */}
      <div className="card mb-4 rubriques-filters">
        <div className="card-body">
          {/* Ligne 1: Recherche et filtres principaux */}
          <div className="row g-3 align-items-end rubriques-filters-main">
            <div className="col-12 col-lg-4">
              <div className="input-group rubriques-search">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par code ou libellé"
                  value={searchTerm}
                  onChange={(e) => handleSearchWithDelay(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleSearchWithDelay('')}
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="TOUS">Tous types</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <select
                className="form-select"
                value={filters.categorie}
                onChange={(e) => handleFilterChange("categorie", e.target.value)}
              >
                <option value="TOUS">Toutes catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <select
                className="form-select"
                value={filters.actif}
                onChange={(e) => handleFilterChange("actif", e.target.value)}
              >
                <option value="TOUS">Statut</option>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <button
                className="btn btn-outline-primary rubriques-advanced-toggle w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter size={16} />
                {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="d-none d-md-inline">Filtres avancés</span>
              </button>
            </div>
          </div>
    {/* Ligne 2: Filtres avancés (conditionnel) */}
    {showAdvancedFilters && (
      <div className="rubriques-advanced-panel mt-3">
      <div className="row g-3 rubriques-advanced">
        <div className="col-12 col-sm-6 col-lg-2">
          <label className="form-label small text-muted mb-1">Imposable</label>
          <select 
            className="form-select form-select-sm"
            value={filters.imposable}
            onChange={(e) => handleFilterChange('imposable', e.target.value)}
          >
            <option value="TOUS">Tous</option>
            <option value="OUI">Oui</option>
            <option value="NON">Non</option>
          </select>
        </div>
        
        <div className="col-12 col-sm-6 col-lg-2">
          <label className="form-label small text-muted mb-1">Cotisations</label>
          <select 
            className="form-select form-select-sm"
            value={filters.cotisations}
            onChange={(e) => handleFilterChange('cotisations', e.target.value)}
          >
            <option value="TOUS">Tous</option>
            <option value="OUI">Oui</option>
            <option value="NON">Non</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-2">
          <label className="form-label small text-muted mb-1">Déductible IRSA</label>
          <select 
            className="form-select form-select-sm"
            value={filters.deductibleIrsa}
            onChange={(e) => handleFilterChange('deductibleIrsa', e.target.value)}
          >
            <option value="TOUS">Tous</option>
            <option value="OUI">Oui</option>
            <option value="NON">Non</option>
          </select>
        </div>
        
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-wrap align-items-end justify-content-lg-end gap-2 h-100 rubriques-advanced-actions">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setFilters({
                  categorie: 'TOUS',
                  type: 'TOUS',
                  actif: 'TOUS',
                  imposable: 'TOUS',
                  cotisations: 'TOUS',
                  deductibleIrsa: 'TOUS'
                });
              }}
            >
              Réinitialiser filtres
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={fetchRubriquesWithSearch}
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
      </div>
    )}

    <div className="rubriques-bulk-bar mt-3">
      <button
        className="btn btn-sm rubriques-bulk-btn rubriques-bulk-btn-success"
        onClick={handleActivateSelected}
        disabled={selectedInactiveIds.length === 0}
      >
        <CheckCircle size={15} />
        <span>Activer</span>
      </button>

      <button
        className="btn btn-sm rubriques-bulk-btn rubriques-bulk-btn-warning"
        onClick={handleDeactivateSelected}
        disabled={selectedActiveIds.length === 0}
      >
        <XCircle size={15} />
        <span>Désactiver</span>
      </button>

      {selectedIds.length > 0 && (
        <span className="rubriques-selected-pill">
          {selectedIds.length} {selectionMode === 'deactivate' ? 'active(s)' : 'inactive(s)'} sélectionnée(s)
        </span>
      )}
    </div>

    {/* Ligne 3: Pagination et infos */}
    <div className="row mt-3 align-items-center rubriques-meta">
      <div className="col-md-4 col-sm-6 mb-2 mb-md-0">
        <div className="d-flex align-items-center">
          <span className="me-2 small">Afficher :</span>
          <select 
            className="form-select form-select-sm w-auto"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="ms-2 small">éléments</span>
        </div>
      </div>
      
      <div className="col-md-4 col-sm-12 text-center mb-2 mb-md-0">
        <div className="text-muted small">
          {selectedIds.length > 0 && (
            <span className="text-primary fw-bold">
              {selectedIds.length} rubrique(s) sélectionnée(s)
            </span>
          )}
        </div>
      </div>
      
      <div className="col-md-4 col-sm-6 text-end">
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={handleRefresh}
          >
            Réinitialiser
          </button>
          <button 
            className="btn btn-sm btn-primary"
            onClick={fetchRubriquesWithSearch}
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

      <div className="card rubriques-table-card">
        <div className="card-body p-0">
          <div className="table-responsive rubriques-table-wrapper">
            <table className="table table-hover mb-0 rubriques-table">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={allSelectableSelected}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th>
                    <button 
                      className="btn btn-link p-0 border-0 text-decoration-none text-dark"
                      onClick={() => handleSort('code')}
                    >
                      Code <i className={`bi ${getSortIcon('code')} ms-1`}></i>
                    </button>
                  </th>
                  <th>
                    <button 
                      className="btn btn-link p-0 border-0 text-decoration-none text-dark"
                      onClick={() => handleSort('libelle')}
                    >
                      Libellé <i className={`bi ${getSortIcon('libelle')} ms-1`}></i>
                    </button>
                  </th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th className="text-center">Imposable</th>
                  <th className="text-center">Cotisations</th>
                  <th className="text-center">Déductible IRSA</th>
                  <th>Mode calcul</th>
                  <th>Formule</th>
                  <th className="text-center">Actif</th>
                  <th>
                    <button 
                      className="btn btn-link p-0 border-0 text-decoration-none text-dark"
                      onClick={() => handleSort('ordre')}
                    >
                      Ordre <i className={`bi ${getSortIcon('ordre')} ms-1`}></i>
                    </button>
                  </th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rubriques.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center text-muted py-4">
                      Aucune rubrique trouvée
                    </td>
                  </tr>
                ) : (
                  rubriques.map((rubrique) => (
                    <tr 
                      key={rubrique.id}
                      className={!rubrique.estActif ? 'rubrique-inactive-row' : ''}
                    >
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedIds.includes(rubrique.id)}
                            disabled={
                              selectionMode &&
                              selectionMode !== (rubrique.estActif ? 'deactivate' : 'activate') &&
                              !selectedIds.includes(rubrique.id)
                            }
                            onChange={() => handleSelectOne(rubrique)}
                          />
                        </div>
                      </td>
                      
                      <td>
                        <strong>{rubrique.code}</strong>
                      </td>
                      <td>
                        {rubrique.libelle}
                        {rubrique.commentaire && (
                          <small className="text-muted d-block">
                            {rubrique.commentaire.substring(0, 50)}...
                          </small>
                        )}
                      </td>
                      
                      <td>
                        <span className={`badge rubriques-type-badge rubriques-type-${(extractId(rubrique.type) || '').toLowerCase()}`}>
                          {extractLibelle(rubrique.type)}
                        </span>
                      </td>
                      <td>
                        <small>{extractLibelle(rubrique.categorie)}</small>
                      </td>
                      
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={rubrique.estImposable || false}
                            readOnly
                            onClick={() => openEditModal(rubrique)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={rubrique.estSoumisCotisations || false}
                            readOnly
                            onClick={() => openEditModal(rubrique)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>

                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={rubrique.estDeductibleIrsa || false}
                            readOnly
                            onClick={() => openEditModal(rubrique)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      
                      <td>
                        {rubrique.modeCalcul ? (
                          <span className="badge rubriques-mode-badge">
                            {rubrique.modeCalcul}
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      
                      <td>
                        {rubrique.formule ? (
                          <div className="d-flex align-items-center rubrique-formule-box">
                            <Calculator className="me-2 rubrique-formule-icon" size={16} />
                            <span className="rubrique-formule-text" title={formatFormule(rubrique.formule)}>
                              {formatFormule(rubrique.formule)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted small">Aucune formule</span>
                        )}
                      </td>
                      
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={rubrique.estActif || false}
                            onChange={async (e) => {
                              try {
                                if (e.target.checked) {
                                  if (!window.confirm(`Activer la rubrique "${rubrique.code}" ?`)) return;
                                  await axiosInstance.patch(`/api/rubriques-paie/${rubrique.id}/activate`);
                                } else {
                                  if (!window.confirm(`Désactiver la rubrique "${rubrique.code}" ?`)) return;
                                  await axiosInstance.patch(`/api/rubriques-paie/${rubrique.id}/deactivate`);
                                }
                                fetchRubriquesWithSearch();
                              } catch (err) {
                                alert('Erreur de modification');
                              }
                            }}
                          />
                        </div>
                      </td>
                      
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-outline-secondary rubriques-ordre-btn"
                          onClick={() => openEditModal(rubrique)}
                          title="Modifier l'ordre"
                        >
                          {rubrique.ordre || '0'}
                        </button>
                      </td>
                      
                      <td className="text-end">
                        <div className="btn-group btn-group-sm rubriques-table-actions">
                          <button
                            className="btn rubriques-action-btn rubriques-action-view"
                            onClick={() => openViewModal(rubrique)}
                            title="Voir détails"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            className="btn rubriques-action-btn rubriques-action-edit"
                            onClick={() => openEditModal(rubrique)}
                            title="Modifier"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            className="btn rubriques-action-btn rubriques-action-delete"
                            onClick={async () => {
                              if (window.confirm(`Supprimer la rubrique ${rubrique.code} ?`)) {
                                try {
                                  await axiosInstance.delete(`/api/rubriques-paie/${rubrique.id}`);
                                  fetchRubriquesWithSearch();
                                } catch (err) {
                                  alert('Erreur de suppression');
                                }
                              }
                            }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                Affichage de {rubriques.length} rubrique(s)
              </small>
            </div>
            
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Précédent
                  </button>
                </li>
                
                {currentPage > 2 && (
                  <>
                    <li className="page-item">
                      <button className="page-link" onClick={() => handlePageChange(0)}>
                        1
                      </button>
                    </li>
                    {currentPage > 3 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                  </>
                )}
                
                {getPageNumbers().map(page => (
                  <li 
                    key={page} 
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(page)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                
                {currentPage < totalPages - 3 && (
                  <>
                    {currentPage < totalPages - 4 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className="page-item">
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(totalPages - 1)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}
                
                <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
            
            <div>
              <div className="btn-group">
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length === 0}
                >
                  Désélectionner tout
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 text-center mt-2">
            <div className="text-muted">
              Page {currentPage + 1} sur {totalPages} • {totalElements} éléments au total
            </div>
          </div>
        </div>
      </div>

      {/* MODAL avec modal_perso */}
      {showModal && (
        <div className="modal_perso rubriques-modal">
          <div className="modal-dialog-custom">
            <div className="modal-content-custom" style={{ 
              background: 'white', 
              border: '1px solid #e1b2db',
              color: '#3a1438',
              borderRadius: '8px'
            }}>
              <div className="modal-header-custom" style={{ 
                background: 'linear-gradient(135deg, #b053ad 0%, #764ba2 100%)',
                borderBottom: '1px solid #e1b2db',
                padding: '1.2rem 1.5rem',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}>
                <h5 className="modal-title m-0" style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 600,
                  color: 'white'
                }}>
                  <Tag size={20} className="me-2" />
                  {modalType === 'create' ? 'Nouvelle rubrique' : 
                   modalType === 'edit' ? 'Modifier rubrique' : 'Détails rubrique'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  aria-label="Fermer"
                  style={{ fontSize: '0.8rem', opacity: 0.8 }}
                ></button>
              </div>
              
              <div className="modal-body-custom" style={{ 
                maxHeight: '70vh', 
                overflowY: 'auto', 
                background: 'white'
              }}>
                <RubriqueForm 
                  rubrique={currentRubrique}
                  onChange={setCurrentRubrique}
                  readOnly={modalType === 'view'}
                  categories={categories}
                  types={types}
                  modesCalcul={modesCalcul}
                  showFormuleSection={showFormuleSection}
                  setShowFormuleSection={setShowFormuleSection}
                />
              </div>
              
              <div className="modal-footer-custom" style={{ 
                background: 'white', 
                borderTop: '1px solid #e1b2db',
                padding: '1.2rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px'
              }}>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Annuler
                  </button>
                </div>
                
                <div className="d-flex gap-2">
                  {modalType !== 'view' && (
                    <button
                      type="button"
                      className="btn btn-link p-0 border-0 text-decoration-none rubriques-sort-btn"
                      onClick={saveRubrique}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      {modalType === 'create' ? 'Créer' : 'Enregistrer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ajoutez ce composant RubriqueForm ici
const RubriqueForm = ({ 
  rubrique, 
  onChange, 
  readOnly, 
  categories, 
  types,
  modesCalcul, 
  showFormuleSection,
  setShowFormuleSection
}) => {
  const [abreviations, setAbreviations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleChange = (field, value) => {
    onChange({
      ...rubrique,
      [field]: value
    });
  };

  const handleFormuleChange = (field, value) => {
    onChange({
      ...rubrique,
      formuleData: {
        ...rubrique.formuleData,
        [field]: value
      }
    });
    
    if (field === 'base' && value.trim() !== '') {
      fetchAbreviations(value);
    }
  };

  const fetchAbreviations = async (searchTerm = '') => {
    try {
      setLoadingSuggestions(true);
      const response = await axiosInstance.get('/api/abreviations/search/available', {
        params: {
          term: searchTerm,
          limit: 10
        }
      });
      setAbreviations(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur chargement abréviations:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (showFormuleSection && rubrique.formuleData?.base) {
      fetchAbreviations(rubrique.formuleData.base);
    }
  }, [showFormuleSection]);

  const handleSuggestionClick = (abreviation) => {
    handleFormuleChange('base', abreviation);
    setShowSuggestions(false);
  };

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label fw-bold">
            Code <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={rubrique.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            readOnly={readOnly}
            placeholder="Ex: SB, HS25, CNPS"
          />
          <small className="text-muted">Code unique pour identifier la rubrique</small>
        </div>
        
        <div className="mb-3">
          <label className="form-label fw-bold">
            Libellé <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={rubrique.libelle || ''}
            onChange={(e) => handleChange('libelle', e.target.value)}
            readOnly={readOnly}
            placeholder="Ex: Salaire de base, Heures supplémentaires 25%"
          />
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={rubrique.typeId || ''}
                onChange={(e) => handleChange('typeId', e.target.value)}
                disabled={readOnly}
              >
                <option value="">Sélectionner...</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Catégorie <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={rubrique.categorieId || ''}
                onChange={(e) => handleChange('categorieId', e.target.value)}
                disabled={readOnly}
              >
                <option value="">Sélectionner...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Ordre
              </label>
              <input
                type="number"
                className="form-control"
                value={rubrique.ordre || ''}
                onChange={(e) => handleChange('ordre', parseInt(e.target.value) || 0)}
                readOnly={readOnly}
                min="1"
              />
              <small className="text-muted">Ordre d'affichage dans le bulletin</small>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Mode de calcul
              </label>
              <select
                className="form-select"
                value={rubrique.modeCalcul || ''}
                onChange={(e) => handleChange('modeCalcul', e.target.value)}
                disabled={readOnly}
              >
                <option value="">Sélectionnez un mode...</option>
                {modesCalcul.map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Mode de calcul spécifique de la rubrique
              </small>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label fw-bold">
            Compte comptable
          </label>
          <input
            type="number"
            className="form-control"
            value={rubrique.compteComptable || ''}
            onChange={(e) => handleChange('compteComptable', e.target.value ? parseInt(e.target.value) : null)}
            readOnly={readOnly}
            placeholder="Ex: 6411"
          />
        </div>
      </div>
      
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-4">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rubrique.estImposable || false}
                onChange={(e) => handleChange('estImposable', e.target.checked)}
                disabled={readOnly}
                id="estImposable"
              />
              <label className="form-check-label" htmlFor="estImposable">
                Imposable
              </label>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rubrique.estSoumisCotisations || false}
                onChange={(e) => handleChange('estSoumisCotisations', e.target.checked)}
                disabled={readOnly}
                id="estSoumisCotisations"
              />
              <label className="form-check-label" htmlFor="estSoumisCotisations">
                Soumis aux cotisations
              </label>
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rubrique.estDeductibleIrsa || false}
                onChange={(e) => handleChange('estDeductibleIrsa', e.target.checked)}
                disabled={readOnly}
                id="estDeductibleIrsa"
              />
              <label className="form-check-label" htmlFor="estDeductibleIrsa">
                Déductible IRSA
              </label>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={rubrique.estActif || false}
                onChange={(e) => handleChange('estActif', e.target.checked)}
                disabled={readOnly}
                id="estActif"
              />
              <label className="form-check-label" htmlFor="estActif">
                Actif
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0 fw-bold">
              Paramètres
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-bold">Plafond mensuel</label>
                <input
                  type="text"
                  className="form-control"
                  value={rubrique.plafondMensuel || ''}
                  onChange={(e) => handleChange('plafondMensuel', e.target.value)}
                  readOnly={readOnly}
                  placeholder="(en heures ou en Ariary)"
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label fw-bold">Plafond annuel (Ar)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={rubrique.plafondAnnuel || ''}
                  onChange={(e) => handleChange('plafondAnnuel', e.target.value ? parseFloat(e.target.value) : null)}
                  readOnly={readOnly}
                  placeholder="Ex: 600000.00"
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label fw-bold">Commentaire</label>
                <textarea
                  className="form-control"
                  rows="1"
                  value={rubrique.commentaire || ''}
                  onChange={(e) => handleChange('commentaire', e.target.value)}
                  readOnly={readOnly}
                  placeholder="Notes internes..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">
              <Calculator className="me-2" size={18} />
              Formule de calcul (Optionnelle)
            </h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowFormuleSection(!showFormuleSection)}
            >
              {showFormuleSection ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          
          {showFormuleSection && (
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Base de calcul</label>
                    
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        value={rubrique.formuleData?.base || ''}
                        onChange={(e) => handleFormuleChange('base', e.target.value)}
                        onFocus={() => rubrique.formuleData?.base && fetchAbreviations(rubrique.formuleData.base)}
                        readOnly={readOnly}
                        placeholder="Ex: SALAIRE_BASE, BRUT, NET, HEURES_SUP, PRIME, ou une abréviation"
                        list="baseSuggestions"
                      />
                      
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
                      
                      {showSuggestions && abreviations.length > 0 && !readOnly && (
                        <div 
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
                      
                      {loadingSuggestions && (
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
                </div>
                
                <div className="row">
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Montant fixe</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        placeholder="0.00"
                        value={rubrique.formuleData?.montantFixe || ''}
                        onChange={(e) => handleFormuleChange('montantFixe', e.target.value)}
                        readOnly={readOnly}
                      />
                      <small className="text-muted">
                        Montant fixe à ajouter
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Taux (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        placeholder="0.00"
                        value={rubrique.formuleData?.taux || ''}
                        onChange={(e) => handleFormuleChange('taux', e.target.value)}
                        readOnly={readOnly}
                      />
                      <small className="text-muted">
                        Pourcentage appliqué
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Nombre</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        placeholder="1.00"
                        value={rubrique.formuleData?.nombre || ''}
                        onChange={(e) => handleFormuleChange('nombre', e.target.value)}
                        readOnly={readOnly}
                      />
                      <small className="text-muted">
                        Multiplicateur
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="alert alert-info p-2 mb-0 w-100">
                      <small>
                        <strong>Exemple :</strong><br/>
                        Base × Taux% × Nombre + Montant fixe
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getTypeColor = (typeId) => {
  const colors = {
    'GAIN': 'success',
    'RETENUE': 'danger',
    'TOTAL': 'info',
    'EXCEPTIONNEL': 'warning'
  };
  return colors[typeId] || 'secondary';
};

export default RubriquesPaiePage;
