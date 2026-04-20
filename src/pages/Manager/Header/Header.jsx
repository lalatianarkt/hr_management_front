import React from "react";
import HeaderCommon from "../../../components/HeaderCommon";

export default function Header() {
  const getBreadcrumbItems = (pathname) => {
    const routes = [
      { match: /^\/dashboard-Manager\/?$/, items: ["Accueil"] },
      { match: /^\/dashboard-Manager\/emp\/liste$/, items: ["Accueil", "Gestion", "Employés", "Liste des employés"] },
      { match: /^\/dashboard-Manager\/conge\/validation$/, items: ["Accueil", "Gestion", "Congés", "Validation des congés"] },
      { match: /^\/dashboard-Manager\/mouvements\/validation$/, items: ["Accueil", "Gestion", "Mouvements", "Validation des mouvements"] },
      { match: /^\/dashboard-Manager\/organisation\/hierarchie$/, items: ["Accueil", "Organisation", "Vue hiérarchique"] },
    ];

    const matchedRoute = routes.find((route) => route.match.test(pathname));
    return matchedRoute?.items || ["Accueil"];
  };

  return (
    <HeaderCommon
      portalTitle="Portail Manager"
      basePath="/dashboard-Manager"
      getBreadcrumbItems={getBreadcrumbItems}
      buildSwitchRolePayload={(roleType) => ({ roleType })}
    />
  );
}
