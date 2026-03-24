import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../../../assets/css/ReglesConges.css";

const ReglesConges = () => {
    const [regles, setRegles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // État pour le formulaire d'ajout/modification
    const [formData, setFormData] = useState({
        ancienneteRequis: 0,
        soldeMensuel: 2.08, // 25 jours / 12 mois = 2.08
        isWeekEndInclus: false,
        limiteReportAnnuel: 10 // Nouveau nom correspondant à la table
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentRegleId, setCurrentRegleId] = useState(null);

    // Charger les règles existantes
    useEffect(() => {
        chargerRegles();
    }, []);

    const chargerRegles = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/regles-conges');
            setRegles(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des règles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : 
                   type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Préparer les données selon le nouveau format
            const donneesAEnvoyer = {
                ancienneteRequis: formData.ancienneteRequis,
                soldeMensuel: formData.soldeMensuel,
                isWeekEndInclus: formData.isWeekEndInclus,
                limiteReportAnnuel: formData.limiteReportAnnuel
            };

            if (isEditing) {
                // Mettre à jour la règle existante
                await axios.put(`http://localhost:8080/api/regles-conges/${currentRegleId}`, donneesAEnvoyer);
            } else {
                // Créer une nouvelle règle
                await axios.post('http://localhost:8080/api/regles-conges', donneesAEnvoyer);
            }
            
            // Réinitialiser le formulaire et recharger les règles
            resetForm();
            chargerRegles();
            
            alert(isEditing ? 'Règle mise à jour avec succès!' : 'Règle créée avec succès!');
        } catch (err) {
            setError('Erreur lors de la sauvegarde');
            console.error(err);
        }
    };

    const handleEdit = (regle) => {
        // Adapter selon le format de données reçu du backend
        setFormData({
            ancienneteRequis: regle.anciennete_requis || regle.ancienneteRequis || 0,
            soldeMensuel: regle.solde_mensuel || regle.soldeMensuel || 2.08,
            isWeekEndInclus: regle.is_week_end_inclus || regle.isWeekEndInclus || false,
            limiteReportAnnuel: regle.limite_report_annuel || regle.limiteReportAnnuel || 10
        });
        setIsEditing(true);
        setCurrentRegleId(regle.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette règle?')) {
            try {
                await axios.delete(`http://localhost:8080/api/regles-conges/${id}`);
                chargerRegles();
                alert('Règle supprimée avec succès!');
            } catch (err) {
                setError('Erreur lors de la suppression');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            ancienneteRequis: 0,
            soldeMensuel: 2.08,
            isWeekEndInclus: false,
            limiteReportAnnuel: 10
        });
        setIsEditing(false);
        setCurrentRegleId(null);
    };

    const calculerSoldeAnnuel = (soldeMensuel) => {
        // Calcul du solde annuel : solde mensuel × 12 mois
        return (soldeMensuel * 12).toFixed(1);
    };

    const formatAnciennete = (mois) => {
        if (mois === 0) return "Dès l'embauche";
        if (mois < 12) return `${mois} mois`;
        
        const annees = Math.floor(mois / 12);
        const moisRestants = mois % 12;
        
        if (moisRestants === 0) return `${annees} an${annees > 1 ? 's' : ''}`;
        return `${annees} an${annees > 1 ? 's' : ''} ${moisRestants} mois`;
    };

    return (
        <div className="regles-conges-container">
            <div className="header">
                <h1>Gestion des Règles de Congés</h1>
                <p className="subtitle">
                    Configurez les règles d'acquisition mensuelle et de report des congés
                </p>
            </div>

            {error && (
                <div className="error-alert">
                    <span className="error-icon">!</span>
                    {error}
                </div>
            )}

            <div className="content-grid">
                {/* Formulaire */}
                <div className="form-section card">
                    <h2>{isEditing ? 'Modifier la règle' : 'Nouvelle règle d\'acquisition'}</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="ancienneteRequis">
                                    Ancienneté requise (mois)
                                    <span className="help-text">
                                        Nombre de mois avant d'avoir droit aux congés
                                        <br/>0 = dès l'embauche
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="ancienneteRequis"
                                    name="ancienneteRequis"
                                    value={formData.ancienneteRequis}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="1"
                                    required
                                />
                                <div className="info-text">
                                    {formData.ancienneteRequis === 0 
                                        ? "Acquisition dès l'embauche" 
                                        : `Acquisition après ${formatAnciennete(formData.ancienneteRequis)}`}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="soldeMensuel">
                                    Solde mensuel (jours)
                                    <span className="help-text">
                                        Jours de congés acquis par mois travaillé
                                        <br/>Standard : 2.08 jours/mois (25 jours/an)
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="soldeMensuel"
                                    name="soldeMensuel"
                                    value={formData.soldeMensuel}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                                <div className="info-box">
                                    <strong>Solde annuel estimé:</strong> 
                                    {calculerSoldeAnnuel(formData.soldeMensuel)} jours
                                    <br/>
                                    <small>({formData.soldeMensuel} × 12 mois)</small>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="limiteReportAnnuel">
                                    Limite de report annuel (jours)
                                    <span className="help-text">
                                        Maximum de jours pouvant être reportés d'une année sur l'autre
                                        <br/>0 = pas de report autorisé
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id="limiteReportAnnuel"
                                    name="limiteReportAnnuel"
                                    value={formData.limiteReportAnnuel}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="1"
                                    required
                                />
                                <div className="info-text">
                                    {formData.limiteReportAnnuel === 0 
                                        ? "Aucun report autorisé" 
                                        : `Maximum ${formData.limiteReportAnnuel} jours reportables`}
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isWeekEndInclus"
                                        checked={formData.isWeekEndInclus}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkbox-custom"></span>
                                    Inclure les week-ends dans le calcul des congés
                                </label>
                                <span className="help-text">
                                    Si coché, les samedis et dimanches seront comptés comme jours de congé
                                    <br/><strong>Recommandé : DÉCOCHÉ</strong> pour ne compter que les jours ouvrés
                                </span>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                {isEditing ? 'Mettre à jour' : 'Créer la règle'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-cancel">
                                {isEditing ? 'Annuler modification' : 'Réinitialiser'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Liste des règles */}
                <div className="list-section card">
                    <div className="section-header">
                        <h2>Règles configurées</h2>
                        <span className="badge">{regles.length} règle(s)</span>
                    </div>

                    {loading ? (
                        <div className="loading">Chargement des règles...</div>
                    ) : regles.length === 0 ? (
                        <div className="no-data">
                            <p>Aucune règle configurée</p>
                            <p className="hint">Commencez par créer votre première règle d'acquisition</p>
                        </div>
                    ) : (
                        <div className="regles-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ancienneté</th>
                                        <th>Mensuel</th>
                                        <th>Annuel</th>
                                        <th>Limite Report</th>
                                        <th>Week-end</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regles.map(regle => {
                                        const soldeAnnuel = calculerSoldeAnnuel(
                                            regle.solde_mensuel || regle.soldeMensuel
                                        );
                                        const anciennete = regle.anciennete_requis || regle.ancienneteRequis;
                                        const limiteReport = regle.limite_report_annuel || regle.limiteReportAnnuel;
                                        const weekEndInclus = regle.is_week_end_inclus || regle.isWeekEndInclus;
                                        
                                        return (
                                            <tr key={regle.id}>
                                                <td>
                                                    <div className="value-cell">
                                                        <div className="value-label">
                                                            {formatAnciennete(anciennete)}
                                                        </div>
                                                        <span className="unit">({anciennete} mois)</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="value-cell">
                                                        <strong>{regle.solde_mensuel || regle.soldeMensuel}</strong>
                                                        <span className="unit">j/mois</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="value-cell">
                                                        <strong className="annual-total">{soldeAnnuel}</strong>
                                                        <span className="unit">j/an</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="value-cell">
                                                        <strong className={limiteReport === 0 ? 'no-report' : 'with-report'}>
                                                            {limiteReport}
                                                        </strong>
                                                        <span className="unit">jours</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${weekEndInclus ? 'included' : 'excluded'}`}>
                                                        {weekEndInclus ? 'Inclus' : 'Exclus'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            onClick={() => handleEdit(regle)}
                                                            className="btn-edit"
                                                            title="Modifier"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(regle.id)}
                                                            className="btn-delete"
                                                            title="Supprimer"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Informations de calcul */}
                    <div className="info-section">
                        <h3>Comment fonctionne l'acquisition mensuelle ?</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <h4>Acquisition progressive</h4>
                                <p>
                                    Les congés sont acquis chaque mois proportionnellement au temps travaillé.
                                    <br/><strong>Exemple :</strong> 2.08 jours/mois = 25 jours/an
                                </p>
                            </div>
                            <div className="info-item">
                                <h4>Report annuel</h4>
                                <p>
                                    Les congés non utilisés peuvent être reportés jusqu'à la limite configurée.
                                    <br/><strong>Exemple :</strong> Limite de 10 jours = max 10 jours reportables
                                </p>
                            </div>
                            <div className="info-item">
                                <h4>Ancienneté</h4>
                                <p>
                                    Permet de définir un délai avant l'acquisition des congés.
                                    <br/><strong>Exemple :</strong> 3 mois = pas de congés pendant la période d'essai
                                </p>
                            </div>
                        </div>
                        
                        <div className="calculation-example">
                            <h4>Exemple de calcul</h4>
                            <div className="example-grid">
                                <div className="example-item">
                                    <strong>Règle :</strong> 2.08 jours/mois, ancienneté 0, report 10 jours
                                </div>
                                <div className="example-item">
                                    <strong>Janvier :</strong> Employé acquiert 2.08 jours
                                </div>
                                <div className="example-item">
                                    <strong>Décembre :</strong> Total annuel = 25 jours (2.08 × 12)
                                </div>
                                <div className="example-item">
                                    <strong>Report :</strong> Si 15 jours restants → 10 jours reportés (limite)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReglesConges;
