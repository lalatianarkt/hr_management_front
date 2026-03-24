// src/utils/etatCivilEnum.js
export const ETAT_CIVIL = {
  CELIBATAIRE: "CELIBATAIRE",
  MARIE: "MARIE",
  DIVORCE: "DIVORCE",
  VEUF: "VEUF"
};

export const ETAT_CIVIL_OPTIONS = [
  { value: ETAT_CIVIL.CELIBATAIRE, label: "Célibataire" },
  { value: ETAT_CIVIL.MARIE, label: "Marié(e)" },
  { value: ETAT_CIVIL.DIVORCE, label: "Divorcé(e)" },
  { value: ETAT_CIVIL.VEUF, label: "Veuf/Veuve" }
];

// Fonction pour obtenir le label à partir de la valeur
export const getEtatCivilLabel = (value) => {
  const option = ETAT_CIVIL_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : "Inconnu";
};
