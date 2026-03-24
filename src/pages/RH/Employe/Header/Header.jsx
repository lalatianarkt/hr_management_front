import React, { useState, useEffect, useRef } from "react";
import { useSidebar } from "../../../../components/SidebarContext";
import axiosInstance from "../../../utils/AxiosInstance";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const getNomComplet = () => {
    try {
      const nomComplet = sessionStorage.getItem('nomComplet');
      if (!nomComplet) {
        const userStr = sessionStorage.getItem('user');
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

  // Récupérer les notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/notifications/utilisateur');

      if (response.data) {
        setNotifications(response.data);
        // Compter les notifications non lues (status === 0)
        const unread = response.data.filter(notif => notif.status === 0).length;
        setUnreadCount(unread);
        console.log("Notifications récupérées:", response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      if (error.response?.status === 401) {
        console.log("Session expirée");
      }
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/lire`);
      
      // Mettre à jour l'état local
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, status: 1 } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/api/notifications/lire-tous');
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, status: 1 }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications:", error);
      // Option de fallback : mettre à jour localement même si l'API échoue
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, status: 1 }))
      );
      setUnreadCount(0);
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
    
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fermer le panneau des notifications quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formater la date relative (ex: "il y a 5 minutes")
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'à l\'instant';
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return date.toLocaleDateString();
  };

  const nomComplet = getNomComplet();

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
            style={{ borderRadius: '12px', background: 'var(--surface-bg)' }}
          >
            <i className="bi bi-list fs-4" style={{ color: 'var(--bg-primary)' }}></i>
          </button>

          <div className="d-none d-lg-block border-start-0 ps-0 ms-0 ms-lg-3 ps-lg-3 border-lg-start">
            <h5 className="m-0 fw-bold" style={{ color: 'var(--color-heading)', fontSize: '15px' }}>Portail RH</h5>
            <p className="m-0 small text-muted" style={{ fontSize: '10px' }}>Système de Gestion Administrative</p>
          </div>
        </div>

        <div className="d-flex align-items-center">
          {/* Bouton de notifications */}
          <div className="position-relative me-2 me-sm-3" ref={notificationRef}>
            <button 
              className="btn btn-link text-muted position-relative"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ padding: '8px' }}
            >
              <i className="bi bi-bell-fill fs-5"></i>
              {unreadCount > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '10px', padding: '3px 6px' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Panneau des notifications */}
            {showNotifications && (
              <div 
                className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3"
                style={{ 
                  width: '360px', 
                  maxHeight: '480px',
                  zIndex: 1000,
                  border: '1px solid var(--color-border)'
                }}
              >
                {/* En-tête des notifications */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h6 className="mb-0 fw-bold">
                    Notifications 
                    {unreadCount > 0 && (
                      <span className="ms-2 badge bg-primary rounded-pill" style={{ fontSize: '10px' }}>
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </h6>
                  {unreadCount > 0 && (
                    <button 
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={markAllAsRead}
                      style={{ fontSize: '12px', color: 'var(--bg-primary)' }}
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                {/* Liste des notifications */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 border-bottom ${notification.status === 0 ? 'bg-light' : ''}`}
                        onClick={() => notification.status === 0 && markAsRead(notification.id)}
                        style={{ 
                          cursor: notification.status === 0 ? 'pointer' : 'default',
                          transition: 'background-color 0.2s',
                          ...(notification.status === 0 && {
                            borderLeft: '3px solid var(--bg-primary)'
                          })
                        }}
                      >
                        <div className="d-flex">
                          {/* Icône de status */}
                          <div className="me-3">
                            {notification.status === 0 ? (
                              <i className="bi bi-envelope-fill text-primary"></i>
                            ) : (
                              <i className="bi bi-envelope-open-fill text-muted"></i>
                            )}
                          </div>
                          
                          {/* Contenu de la notification */}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <p className={`mb-1 small fw-bold ${notification.status === 0 ? 'text-dark' : 'text-muted'}`}>
                                  {notification.titre || notification.title}
                                </p> 
                                <p className="mb-1 small text-muted">{notification.message}</p>
                              </div>

                              {notification.status === 0 && (
                                <span className="badge bg-primary rounded-pill" style={{ fontSize: '8px' }}>
                                  Nouveau
                                </span>
                              )}

                              {notification.status === 1 && (
                                <span className="badge bg-secondary rounded-pill" style={{ fontSize: '8px' }}>
                                  Lu
                                </span>
                              )}
                            </div>

                            <small className="text-muted" style={{ fontSize: '10px' }}>
                              {formatRelativeTime(notification.createdAt || notification.dateCreation)}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pied de page des notifications */}
                <div className="p-2 border-top text-center">
                  <a 
                    href="/notifications" 
                    className="text-decoration-none small"
                    style={{ color: 'var(--bg-primary)' }}
                  >
                    Voir toutes les notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center p-1 p-sm-2 rounded-pill bg-light" style={{ border: '1px solid var(--color-border)' }}>
            <img
              src="/assets/img/no_profile_pic.jpg"
              className="rounded-circle shadow-sm"
              alt="User"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
            <div className="ms-2 me-2 d-none d-md-block">
              <div className="fw-bold" style={{ fontSize: '12px', lineHeight: '1.2', color: 'var(--color-heading)' }}>RH Admin</div>
              <div className="text-muted" style={{ fontSize: '10px' }}>{nomComplet}</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}