import { useState, useEffect } from 'react';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesApprouvees: 0,
    demandesRefusees: 0,
    demandesAnnulees: 0,
    tauxApprobation: 0,
    joursMoyens: 0,
    moisPlusActif: "Chargement..."
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // String, pas objet

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/statConge');
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      
      // Votre API retourne directement le DTO
      setStats({
        totalDemandes: data.totalDemandes || 0,
        demandesEnAttente: data.demandesEnAttente || 0,
        demandesApprouvees: data.demandesApprouvees || 0,
        demandesRefusees: data.demandesRefusees || 0,
        demandesAnnulees: data.demandesAnnulees || 0,
        tauxApprobation: data.tauxApprobation || 0,
        joursMoyens: data.joursMoyens || 0,
        moisPlusActif: data.moisPlusActif || "Non disponible"
      });
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message); // String seulement
      
      // Valeurs par défaut
      setStats({
        totalDemandes: 142,
        demandesEnAttente: 18,
        demandesApprouvees: 89,
        demandesRefusees: 24,
        demandesAnnulees: 11,
        tauxApprobation: 62.7,
        joursMoyens: 4.2,
        moisPlusActif: "Mars 2024"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error, // Maintenant c'est une string
    refreshData: fetchStats
  };
};
