import React, { useState, useEffect } from 'react';
import { useDashboardStats } from './hooks/useDashboardStats';
import "../../../assets/css/DashboardRH.css";

const TableauBordConges = () => {
  const { stats, loading, error, refreshData } = useDashboardStats();
  const [selectedPeriod, setSelectedPeriod] = useState('annee');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon"><i className="bi bi-exclamation-triangle"></i></div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="no-data">
        <h3>Aucune donnée disponible</h3>
        <p>Il n'y a pas encore de statistiques à afficher.</p>
      </div>
    );
  }

  const { 
    statistiquesGenerales, 
    topEmployes, 
    repartitionParType, 
    demandesRecentess 
  } = stats.data;

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Obtenir le libellé du statut
  const getStatutLibelle = (statut) => {
    switch(statut) {
      case 0: return 'En attente';
      case 1: return 'Approuvé';
      case 2: return 'Rejeté';
      case 3: return 'Annulé';
      default: return 'Inconnu';
    }
  };

  // Filtrer les types de congé avec des demandes
  const typesAvecDemandes = repartitionParType?.filter(type => type.count > 0) || [];

  // Filtrer les employés avec des demandes
  const employesAvecDemandes = topEmployes?.filter(emp => emp.nombreDemandes > 0) || [];

  return (
    <div className="tableau-bord-container">
      {/* Header du dashboard */}
      <div className="dashboard-header">
        <h1>Tableau de bord Congés & Absences</h1>
        <div className="dashboard-subtitle">
          <span>Période : {new Date().getFullYear()}</span>
          <span className="last-update">
            Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon"><i className="bi bi-clipboard-data"></i></div>
          <div className="stat-content">
            <h3>Total Demandes</h3>
            <div className="stat-value">{statistiquesGenerales.totalDemandes}</div>
            <div className="stat-trend">Toutes statuts confondus</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon"><i className="bi bi-hourglass-split"></i></div>
          <div className="stat-content">
            <h3>En Attente</h3>
            <div className="stat-value">{statistiquesGenerales.demandesEnAttente}</div>
            <div className="stat-trend">Nécessitent votre attention</div>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon"><i className="bi bi-check-circle"></i></div>
          <div className="stat-content">
            <h3>Approuvées</h3>
            <div className="stat-value">{statistiquesGenerales.demandesApprouvees}</div>
            <div className="stat-trend">{statistiquesGenerales.tauxApprobation}% de taux</div>
          </div>
        </div>

        <div className="stat-card average">
          <div className="stat-icon"><i className="bi bi-clock"></i></div>
          <div className="stat-content">
            <h3>Durée Moyenne</h3>
            <div className="stat-value">{statistiquesGenerales.joursMoyens.toFixed(1)} jours</div>
            <div className="stat-trend">Par demande</div>
          </div>
        </div>
      </div>

      {/* Graphiques et tableaux */}
      <div className="dashboard-content">
        {/* Section gauche : Graphiques */}
        <div className="dashboard-left">
          {/* Graphique de répartition par type */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Répartition par Type de Congé</h3>
              <div className="chart-summary">
                <span>{typesAvecDemandes.length} types utilisés</span>
              </div>
            </div>
            
            {typesAvecDemandes.length > 0 ? (
              <div className="donut-chart-container">
                <div className="donut-chart">
                  {typesAvecDemandes.map((type, index) => {
                    const segmentSize = 360 * (type.pourcentage / 100);
                    const rotation = typesAvecDemandes
                      .slice(0, index)
                      .reduce((acc, t) => acc + (360 * t.pourcentage / 100), 0);
                    
                    return (
                      <div 
                        key={type.typeConge.id}
                        className="donut-segment"
                        style={{
                          backgroundColor: type.color,
                          transform: `rotate(${rotation}deg)`,
                          clipPath: `conic-gradient(${type.color} 0deg ${segmentSize}deg, transparent ${segmentSize}deg 360deg)`
                        }}
                      ></div>
                    );
                  })}
                  <div className="donut-center">
                    <div className="center-value">{typesAvecDemandes.length}</div>
                    <div className="center-label">Types</div>
                  </div>
                </div>
                <div className="donut-legend">
                  {typesAvecDemandes.map(type => (
                    <div key={type.typeConge.id} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <div className="legend-text">
                        <span className="legend-type">{type.typeConge.intitule}</span>
                        <span className="legend-details">
                          {type.count} ({type.pourcentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-chart-data">
                <p>Aucune demande par type de congé</p>
              </div>
            )}
          </div>

          {/* Top employés */}
          <div className="table-container">
            <div className="table-header">
              <h3>Employés les Plus Actifs</h3>
              <span className="table-subtitle">Par nombre de demandes</span>
            </div>
            
            {employesAvecDemandes.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Demandes</th>
                    <th>Jours totaux</th>
                    <th>Moyenne</th>
                    <th>Taux app.</th>
                  </tr>
                </thead>
                <tbody>
                  {employesAvecDemandes.map(employe => (
                    <tr key={employe.employeId}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {employe.prenom.charAt(0)}{employe.nom.charAt(0)}
                          </div>
                          <div className="employee-details">
                            <div className="employee-name">
                              {employe.prenom} {employe.nom}
                            </div>
                            <div className="employee-matricule">
                              {employe.matricule}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge count">{employe.nombreDemandes}</span>
                      </td>
                      <td>
                        <span className="badge jours">
                          {employe.totalJoursArrondi} j
                        </span>
                      </td>
                      <td>
                        <span className="badge moyenne">
                          {employe.moyenneJoursArrondie.toFixed(1)} j/dem.
                        </span>
                      </td>
                      <td>
                        <div className="approval-rate">
                          <div className="rate-bar">
                            <div 
                              className="rate-fill"
                              style={{ width: `${employe.tauxApprobationArrondi}%` }}
                            ></div>
                          </div>
                          <span className="rate-value">
                            {employe.tauxApprobationArrondi}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-table-data">
                <p>Aucun employé n'a encore fait de demande</p>
              </div>
            )}
          </div>
        </div>

        {/* Section droite : Demandes récentes */}
        <div className="dashboard-right">
          <div className="table-container">
            <div className="table-header">
              <h3>🆕 Demandes Récentes</h3>
              <span className="table-subtitle">Dernières demandes soumises</span>
            </div>
            
            {demandesRecentess && demandesRecentess.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Type</th>
                    <th>Période</th>
                    <th>Statut</th>
                    <th>Jours</th>
                  </tr>
                </thead>
                <tbody>
                  {demandesRecentess.map(demande => (
                    <tr key={demande.id}>
                      <td>
                        <div className="employee-info-small">
                          <div className="employee-avatar-small">
                            {demande.employe.prenom.charAt(0)}{demande.employe.nom.charAt(0)}
                          </div>
                          <div className="employee-name-small">
                            {demande.employe.prenom} {demande.employe.nom}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="type-badge">
                          {demande.typeConge?.intitule || 'Autre'}
                        </span>
                      </td>
                      <td>
                        <div className="date-range">
                          {formatDate(demande.dateDebut)} - {formatDate(demande.dateFin)}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${getStatutLibelle(demande.statut).toLowerCase().replace(' ', '-')}`}>
                          {getStatutLibelle(demande.statut)}
                        </span>
                      </td>
                      <td>
                        <span className="jours-badge">{demande.nbJours}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-table-data">
                <p>Aucune demande récente</p>
              </div>
            )}
          </div>

          {/* Résumé des statuts */}
          <div className="summary-card">
            <h3>Résumé des Statuts</h3>
            <div className="status-summary">
              <div className="status-item approved">
                <div className="status-label">Approuvées</div>
                <div className="status-value">{statistiquesGenerales.demandesApprouvees}</div>
                <div className="status-bar" 
                  style={{ 
                    width: `${(statistiquesGenerales.demandesApprouvees / statistiquesGenerales.totalDemandes) * 100 || 0}%` 
                  }}
                ></div>
              </div>
              <div className="status-item pending">
                <div className="status-label">En attente</div>
                <div className="status-value">{statistiquesGenerales.demandesEnAttente}</div>
                <div className="status-bar" 
                  style={{ 
                    width: `${(statistiquesGenerales.demandesEnAttente / statistiquesGenerales.totalDemandes) * 100 || 0}%` 
                  }}
                ></div>
              </div>
              <div className="status-item refused">
                <div className="status-label">Rejetées</div>
                <div className="status-value">{statistiquesGenerales.demandesRefusees}</div>
                <div className="status-bar" 
                  style={{ 
                    width: `${(statistiquesGenerales.demandesRefusees / statistiquesGenerales.totalDemandes) * 100 || 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="insights-card">
            <h3>Insights</h3>
            <ul className="insights-list">
              <li className="insight-item">
                <span className="insight-icon"><i className="bi bi-bar-chart"></i></span>
                <span className="insight-text">
                  Mois le plus actif : <strong>{statistiquesGenerales.moisPlusActif}</strong>
                </span>
              </li>
              <li className="insight-item">
                <span className="insight-icon"><i className="bi bi-people"></i></span>
                <span className="insight-text">
                  {employesAvecDemandes.length} employé(s) ont fait des demandes
                </span>
              </li>
              <li className="insight-item">
                <span className="insight-icon"><i className="bi bi-bullseye"></i></span>
                <span className="insight-text">
                  Taux d'approbation : {statistiquesGenerales.tauxApprobation}%
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="dashboard-footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <span className="footer-label">Demandes ce mois</span>
            <span className="footer-value">
              {statistiquesGenerales.demandesEnAttente + statistiquesGenerales.demandesApprouvees}
            </span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Jours moyens</span>
            <span className="footer-value">{statistiquesGenerales.joursMoyens.toFixed(1)}</span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Taux approbation</span>
            <span className="footer-value">{statistiquesGenerales.tauxApprobation}%</span>
          </div>
        </div>
        <div className="footer-actions">
          <button className="btn-export">
            <i className="bi bi-download me-1"></i>
            Exporter rapport
          </button>
          <button className="btn-refresh" onClick={refreshData}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableauBordConges;
