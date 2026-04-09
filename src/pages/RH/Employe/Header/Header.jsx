import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../../../components/SidebarContext";
import axiosInstance from "../../../utils/AxiosInstance";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  // État pour la gestion des rôles
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleSwitching, setRoleSwitching] = useState(false);
  const roleDropdownRef = useRef(null);

  const getNomComplet = () => {
    try {
      const nomComplet = sessionStorage.getItem("nomComplet");
      if (!nomComplet) {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.nomComplet || "Utilisateur";
        }
      }
      return nomComplet || "Utilisateur";
    } catch (error) {
      console.error("Erreur lecture nom utilisateur:", error);
      return "Utilisateur";
    }
  };

  const getDepartementPoste = () => {
    try {
      const departement = sessionStorage.getItem("departement") || "";
      const poste = sessionStorage.getItem("poste") || "";
      if (departement && poste) return `${departement} - ${poste}`;
      if (departement) return departement;
      if (poste) return poste;
      return "—";
    } catch (error) {
      console.error("Erreur lecture departement/poste:", error);
      return "—";
    }
  };

  // Récupérer les rôles au chargement
  useEffect(() => {
    const storedRoles = sessionStorage.getItem('userRoles');
    const storedCurrentRole = sessionStorage.getItem('currentRole');
    const hasMultipleRoles = sessionStorage.getItem('hasMultipleRoles') === 'true';
    
    if (storedRoles && hasMultipleRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setRoles(parsedRoles);
        setCurrentRole(storedCurrentRole || (parsedRoles[0]?.type || ''));
      } catch (error) {
        console.error("Erreur lors du parsing des rôles:", error);
      }
    } else if (storedCurrentRole) {
      setCurrentRole(storedCurrentRole);
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/notifications/utilisateur`);
      
      if (response.data) {
        const notificationsData = Array.isArray(response.data) ? response.data : 
                                 (response.data.content ? response.data.content : []);
        setNotifications(notificationsData);
        
        // Compter les notifications non lues (estLu = false)
        const unread = notificationsData.filter((notif) => !notif.estLu).length;
        setUnreadCount(unread);
        console.log("Notifications recuperees:", notificationsData);
      }
    } catch (error) {
      console.error("Erreur lors de la recuperation des notifications:", error);
      if (error.response?.status === 401) {
        console.log("Session expiree");
      }
    } finally {
      setLoading(false);
    }
  };

  // Compter les notifications non lues via le compteur
  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get(`/api/notifications/utilisateur/count-non-lues`);
      
      if (response.data && response.data.count !== undefined) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Erreur lors du comptage des notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Utiliser le nouveau endpoint pour marquer comme lue
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      
      // Mettre à jour l'état local
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, estLu: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put(`/api/notifications/utilisateur/read-all`);
      
      // Mettre à jour l'état local
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, estLu: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications:", error);
      // Fallback: mettre à jour localement quand même
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, estLu: true }))
      );
      setUnreadCount(0);
    }
  };

  // Changer de rôle
  const switchRole = async (roleType) => {
    if (roleType === currentRole) {
      setShowRoleDropdown(false);
      return;
    }
    
    setRoleSwitching(true);
    
    try {
      const token = sessionStorage.getItem('token');
      const userId = sessionStorage.getItem('userId');
      
      const response = await axiosInstance.post(
        '/api/users/switch-role',
        { userId, roleType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === 200) {
        // Mettre à jour le token et le rôle
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('currentRole', response.data.role);
        setCurrentRole(response.data.role);
        
        // Rediriger vers le nouveau dashboard
        window.location.href = response.data.path;
      }
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      alert('Erreur lors du changement de rôle');
    } finally {
      setRoleSwitching(false);
      setShowRoleDropdown(false);
    }
  };

  // Gestion du clic en dehors des dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (roleType) => {
    switch (roleType?.toLowerCase()) {
      case 'admin':
        return 'bi-shield-lock-fill';
      case 'manager':
        return 'bi-person-badge-fill';
      case 'rh':
        return 'bi-people-fill';
      case 'it':
        return 'bi-pc-display';
      default:
        return 'bi-person-fill';
    }
  };

  // Fonction pour obtenir le libellé du rôle
  const getRoleLibelle = (roleType) => {
    switch (roleType?.toLowerCase()) {
      case 'admin':
        return 'Administrateur';
      case 'manager':
        return 'Manager';
      case 'rh':
        return 'Ressources Humaines';
      case 'it':
        return 'Informatique';
      default:
        return roleType || 'Utilisateur';
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUnreadCount(); // Utiliser le compteur pour économiser la bande passante
      fetchNotifications(); // Rafraîchir la liste complète périodiquement
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "à l'instant";
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return date.toLocaleDateString();
  };

  const buildNotificationLink = (lien) => {
    if (!lien) return "";
    const clean = lien.startsWith("/") ? lien : `/${lien}`;
    return `/dashboard-RH${clean}`;
  };

  // Extraire le titre de la notification (depuis le message ou depuis un champ dédié)
  const getNotificationTitle = (notification) => {
    // Si le message est long, prendre les premiers mots comme titre
    const message = notification.message || "";
    if (message.length > 50) {
      return message.substring(0, 50) + "...";
    }
    return message;
  };

  // Extraire le message principal
  const getNotificationMessage = (notification) => {
    return notification.message || "";
  };

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
      { match: /^\/dashboard-RH\/parametrage\/rubriques$/, items: ["Accueil", "Configuration", "Rubriques paie"] },
      { match: /^\/dashboard-RH\/parametrage\/horaire$/, items: ["Accueil", "Configuration", "Horaires"] },
      { match: /^\/dashboard-RH\/parametrage\/conger-irsa$/, items: ["Accueil", "Configuration", "Conges & IRSA"] },
      { match: /^\/dashboard-RH\/parametrage\/pointage$/, items: ["Accueil", "Configuration", "Pointage"] },
      { match: /^\/dashboard-RH\/parametrage\/export$/, items: ["Accueil", "Configuration", "Export"] },
    ];

    const matchedRoute = routes.find((route) => route.match.test(pathname));
    return matchedRoute?.items || ["Accueil"];
  };

  const breadcrumbItems = getBreadcrumbItems(location.pathname);
  const nomComplet = getNomComplet();
  const departementPoste = getDepartementPoste();
  const hasMultipleRoles = roles.length > 1;

  return (
    <nav className="app-header">
      <div className="container-fluid d-flex align-items-center justify-content-between px-0">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link nav-link p-2 me-3"
            onClick={(e) => {
              e.preventDefault();
              toggleSidebar();
            }}
            style={{ borderRadius: "12px", background: "var(--surface-bg)" }}
          >
            <i className="bi bi-list fs-4" style={{ color: "var(--bg-primary)" }}></i>
          </button>

          <div className="d-none d-lg-block border-start-0 ps-0 ms-0 ms-lg-3 ps-lg-3 border-lg-start">
            <h5 className="m-0 fw-bold" style={{ color: "var(--color-heading)", fontSize: "15px" }}>
              Portail RH
            </h5>
            <div className="m-0 small text-muted" style={{ fontSize: "10px" }}>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={`${item}-${index}`}>
                  {index === 0 ? (
                    <Link to="/dashboard-RH" className="text-decoration-none" style={{ color: "var(--color-text-muted)" }}>
                      {item}
                    </Link>
                  ) : (
                    <span>{item}</span>
                  )}
                  {index < breadcrumbItems.length - 1 && <span className="mx-1">{">"}</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Role Switcher - Afficher seulement si plusieurs rôles */}
          {hasMultipleRoles && (
            <div className="position-relative" ref={roleDropdownRef}>
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                disabled={roleSwitching}
                style={{ 
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  border: "1px solid var(--color-border)"
                }}
              >
                <i className={`${getRoleIcon(currentRole)} me-1`}></i>
                <span>{getRoleLibelle(currentRole)}</span>
                <i className="bi bi-chevron-down ms-1" style={{ fontSize: "12px" }}></i>
              </button>

              {showRoleDropdown && (
                <div 
                  className="dropdown-menu show"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '220px',
                    zIndex: 1050,
                    padding: '8px 0'
                  }}
                >
                  <div className="px-3 py-2 border-bottom">
                    <small className="text-muted">Changer de rôle</small>
                  </div>
                  {roles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => switchRole(role.type)}
                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                      style={{ 
                        backgroundColor: currentRole === role.type ? '#f8f9fa' : 'transparent',
                        fontWeight: currentRole === role.type ? 'bold' : 'normal'
                      }}
                    >
                      <i className={`${getRoleIcon(role.type)} fs-6`}></i>
                      <span className="flex-grow-1">{role.libelle || getRoleLibelle(role.type)}</span>
                      {currentRole === role.type && (
                        <i className="bi bi-check text-success"></i>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Affichage du rôle actuel même si un seul rôle */}
          {!hasMultipleRoles && currentRole && (
            <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1">
              <i className={`${getRoleIcon(currentRole)} me-1 text-primary`} style={{ fontSize: "14px" }}></i>
              <span className="small fw-medium" style={{ fontSize: "12px" }}>
                {getRoleLibelle(currentRole)}
              </span>
            </div>
          )}

          {/* Profil utilisateur */}
          <div className="d-flex align-items-center p-1 p-sm-2 rounded-pill bg-light" style={{ border: "1px solid var(--color-border)" }}>
            <img
              src="/assets/img/no_profile_pic.jpg"
              className="rounded-circle shadow-sm"
              alt="User"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
            <div className="ms-2 me-2 d-none d-md-block">
              <div className="fw-bold" style={{ fontSize: "12px", lineHeight: "1.2", color: "var(--color-heading)" }}>
                {nomComplet || "Utilisateur"}
              </div>
              <div className="text-muted" style={{ fontSize: "10px" }}>{departementPoste}</div>
            </div>
          </div>

          {/* Notifications */}
          <div className="position-relative ms-1" ref={notificationRef}>
            <button
              className="btn btn-link text-muted position-relative"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ padding: "8px" }}
            >
              <i className="bi bi-bell-fill fs-5"></i>
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "10px", padding: "3px 6px" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3"
                style={{
                  width: "380px",
                  maxHeight: "480px",
                  zIndex: 1000,
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h6 className="mb-0 fw-bold">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ms-2 badge bg-primary rounded-pill" style={{ fontSize: "10px" }}>
                        {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </h6>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={markAllAsRead}
                      style={{ fontSize: "12px", color: "var(--bg-primary)" }}
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {loading && notifications.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-muted" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-bell-slash fs-1 text-muted"></i>
                      <p className="text-muted small mt-2">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isUnread = !notification.estLu;
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 border-bottom ${isUnread ? "bg-light" : ""}`}
                          onClick={() => isUnread && markAsRead(notification.id)}
                          style={{
                            cursor: isUnread ? "pointer" : "default",
                            transition: "background-color 0.2s",
                            ...(isUnread && {
                              borderLeft: "3px solid var(--bg-primary)",
                            }),
                          }}
                        >
                          <div className="d-flex">
                            <div className="me-3">
                              {isUnread ? (
                                <i className="bi bi-envelope-fill text-primary"></i>
                              ) : (
                                <i className="bi bi-envelope-open-fill text-muted"></i>
                              )}
                            </div>

                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1 me-2">
                                  <p className={`mb-1 small fw-bold ${isUnread ? "text-dark" : "text-muted"}`}>
                                    {getNotificationTitle(notification)}
                                  </p>
                                  <p className="mb-1 small text-muted" style={{ wordBreak: "break-word" }}>
                                    {getNotificationMessage(notification)}
                                  </p>
                                </div>

                                <div className="text-end">
                                  {isUnread ? (
                                    <span className="badge bg-primary rounded-pill" style={{ fontSize: "8px" }}>
                                      Nouveau
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary rounded-pill" style={{ fontSize: "8px" }}>
                                      Lu
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="d-flex justify-content-between align-items-center mt-1">
                                <small className="text-muted" style={{ fontSize: "10px" }}>
                                  {formatRelativeTime(notification.createdAt)}
                                </small>
                                {notification.lien && (
                                  <Link 
                                    to={buildNotificationLink(notification.lien)} 
                                    className="text-decoration-none small"
                                    style={{ fontSize: "10px", color: "var(--bg-primary)" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isUnread) markAsRead(notification.id);
                                    }}
                                  >
                                    Ouvrir l'action
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-top text-center">
                  <Link to="/dashboard-RH/notifications" className="text-decoration-none small" style={{ color: "var(--bg-primary)" }}>
                    Voir toutes les notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
