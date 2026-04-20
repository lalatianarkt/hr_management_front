import React from "react";
import HeaderCommon from "../../../../components/HeaderCommon";

export default function Header() {
  const getBreadcrumbItems = (pathname) => {
    const routes = [
      { match: /^\/dashboard-RH\/?$/, items: ["Accueil"] },
      { match: /^\/dashboard-RH\/employees$/, items: ["Accueil", "Gestion Listes", "Salaries"] },
      { match: /^\/dashboard-RH\/employees\/[^/]+\/mouvements$/, items: ["Accueil", "Gestion Listes", "Salaries", "Mouvements"] },
      { match: /^\/dashboard-RH\/employees\/[^/]+\/personnel$/, items: ["Accueil", "Gestion Listes", "Salaries", "Fiche personnelle"] },
      { match: /^\/dashboard-RH\/employees\/[^/]+\/documents$/, items: ["Accueil", "Gestion Listes", "Salaries", "Documents"] },
      { match: /^\/dashboard-RH\/departements$/, items: ["Accueil", "Gestion Listes", "Departements"] },
      { match: /^\/dashboard-RH\/managers$/, items: ["Accueil", "Gestion Listes", "Managers"] },
      { match: /^\/dashboard-RH\/organisation\/listManager$/, items: ["Accueil", "Organisation", "Liste managers"] },
      { match: /^\/dashboard-RH\/organisation\/department$/, items: ["Accueil", "Organisation", "Departements"] },
      { match: /^\/dashboard-RH\/organisation\/assignEmp$/, items: ["Accueil", "Organisation", "Assignation employes"] },
      { match: /^\/dashboard-RH\/organisation\/mouvement$/, items: ["Accueil", "Organisation", "Mouvements"] },
      { match: /^\/dashboard-RH\/organisation\/mouvement\/validation$/, items: ["Accueil", "Organisation", "Validation mouvements"] },
      { match: /^\/dashboard-RH\/organisation\/hierarchie$/, items: ["Accueil", "Organisation", "Vue hierarchique"] },
      { match: /^\/dashboard-RH\/conge$/, items: ["Accueil", "Gestion Listes", "Conges"] },
      { match: /^\/dashboard-RH\/conge\/soldeAnnuel$/, items: ["Accueil", "Gestion Listes", "Conges", "Solde RH"] },
      { match: /^\/dashboard-RH\/paie\/edition$/, items: ["Accueil", "Gestion Paie & Finance", "Edition paie"] },
      { match: /^\/dashboard-RH\/paie\/bulletin\/departement$/, items: ["Accueil", "Gestion Paie & Finance", "Bulletins"] },
      { match: /^\/dashboard-RH\/paie\/heureTravaillee$/, items: ["Accueil", "Gestion Paie & Finance", "Heures travaillees"] },
      { match: /^\/dashboard-RH\/paie\/bulletin\/departement\/[^/]+$/, items: ["Accueil", "Gestion Paie & Finance", "Bulletins", "départements", "Détails département"] },
      { match: /^\/dashboard-RH\/paie\/bulletin\/departement\/employe\/[^/]+$/, items: ["Accueil", "Gestion Paie & Finance", "Bulletins", "départements", "Employés"] },
      { match: /^\/dashboard-RH\/parametrage\/rubriques$/, items: ["Accueil", "Configuration", "Rubriques paie"] },
      { match: /^\/dashboard-RH\/parametrage\/horaire$/, items: ["Accueil", "Configuration", "Horaires"] },
      { match: /^\/dashboard-RH\/parametrage\/conger-irsa$/, items: ["Accueil", "Configuration", "Conges & IRSA"] },
      { match: /^\/dashboard-RH\/parametrage\/pointage$/, items: ["Accueil", "Configuration", "Pointage"] },
      { match: /^\/dashboard-RH\/parametrage\/export$/, items: ["Accueil", "Configuration", "Export"] },
    ];

    const matchedRoute = routes.find((route) => route.match.test(pathname));
    return matchedRoute?.items || ["Accueil"];
  };

  return (
    <HeaderCommon
      portalTitle="Portail RH"
      basePath="/dashboard-RH"
      getBreadcrumbItems={getBreadcrumbItems}
      buildSwitchRolePayload={(roleType) => ({
        userId: sessionStorage.getItem("userId"),
        roleType,
      })}
    />
  );
}
