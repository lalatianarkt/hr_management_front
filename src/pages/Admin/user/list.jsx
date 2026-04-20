import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/AxiosInstance";

const getStatusLabel = (statut) => {
  if (statut === 1) return "Actif";
  if (statut === 2) return "En attente validation admin";
  if (statut === 3) return "Refusé";
  return "En attente validation email";
};

const getStatusClass = (statut) => {
  if (statut === 1) return "success";
  if (statut === 2) return "warning text-dark";
  if (statut === 3) return "danger";
  return "secondary";
};

const formatRoleLabel = (roleName) =>
  roleName?.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Role";

function UserListe() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const paginationStyles = {
    pageLink: {
      color: "#8e4f7f",
      borderColor: "rgba(181, 106, 160, 0.25)",
      minWidth: "42px",
      height: "42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "12px",
      margin: "0 2px",
      fontWeight: 600,
      background: "#fff",
      boxShadow: "none",
    },
    activePageLink: {
      background: "linear-gradient(135deg, #b56aa0 0%, #9b5b91 100%)",
      borderColor: "#b56aa0",
      color: "#fff",
    },
  };

  const fetchData = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    setError("");

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        axiosInstance.get(`/api/users/admin/list/paged?page=${page}&size=${size}`),
        axiosInstance.get("/api/typeUsers"),
      ]);

      if (usersResponse.data) {
        const {
          content,
          totalPages: totalPagesRes,
          totalElements: totalElementsRes,
          number,
        } = usersResponse.data;

        setUsers(Array.isArray(content) ? content : []);
        setTotalPages(totalPagesRes || 0);
        setTotalElements(totalElementsRes || 0);
        setCurrentPage(number || 0);
      } else {
        setUsers([]);
      }

      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchData(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    fetchData(0, newSize);
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.prenom} ${user.nom}${
        user.matricule ? ` (${user.matricule})` : ""
      } ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setDeletingId(user.idUser);
    setError("");

    try {
      await axiosInstance.delete(`/api/users/${user.idUser}`);

      const targetPage = users.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage;
      fetchData(targetPage, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || "La suppression de l'utilisateur a échoué.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    let newStatut;
    let actionMessage;

    if (user.statut === 1) {
      newStatut = 0;
      actionMessage = "désactiver";
    } else {
      newStatut = 1;
      actionMessage = "activer";
    }

    const confirmed = window.confirm(
      `Confirmer ${actionMessage} l'utilisateur ${user.prenom} ${user.nom}${
        user.matricule ? ` (${user.matricule})` : ""
      } ?`
    );

    if (!confirmed) return;

    setUpdatingStatusId(user.idUser);
    setError("");

    try {
      await axiosInstance.patch(`/api/users/${user.idUser}/statut`, { statut: newStatut });

      setUsers((prevUsers) =>
        prevUsers.map((currentUser) =>
          currentUser.idUser === user.idUser ? { ...currentUser, statut: newStatut } : currentUser
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "La mise à jour du statut a échoué.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const hasRole = (user, roleId) => Array.isArray(user.roleIds) && user.roleIds.includes(roleId);

  const handleRoleToggle = async (user, role, checked) => {
    const actionLabel = checked ? "attribuer" : "retirer";
    const confirmed = window.confirm(
      `Confirmer ${actionLabel} le rôle \"${formatRoleLabel(role.type)}\" pour ${user.prenom} ${user.nom}${
        user.matricule ? ` (${user.matricule})` : ""
      } ?`
    );

    if (!confirmed) return;

    const loadingKey = `${user.idUser}-${role.id}`;
    setActionLoadingKey(loadingKey);
    setError("");

    try {
      await axiosInstance.patch(`/api/users/${user.idUser}/roles`, {
        typeUserId: role.id,
        authorized: checked,
      });

      setUsers((prevUsers) =>
        prevUsers.map((currentUser) => {
          if (currentUser.idUser !== user.idUser) return currentUser;

          const currentRoleIds = Array.isArray(currentUser.roleIds) ? currentUser.roleIds : [];
          const currentRoleTypes = Array.isArray(currentUser.roleTypes) ? currentUser.roleTypes : [];

          const nextRoleIds = checked
            ? Array.from(new Set([...currentRoleIds, role.id]))
            : currentRoleIds.filter((roleId) => roleId !== role.id);

          const nextRoleTypes = checked
            ? Array.from(new Set([...currentRoleTypes, role.type]))
            : currentRoleTypes.filter((roleName) => roleName !== role.type);

          return {
            ...currentUser,
            roleIds: nextRoleIds,
            roleTypes: nextRoleTypes,
            typeUser: nextRoleTypes[0] || "Aucun rôle",
          };
        })
      );
    } catch (err) {
      setError(err.response?.data?.message || "La mise à jour des rôles a échoué.");
    } finally {
      setActionLoadingKey("");
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= 1) return null;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i} className={`page-item ${i === currentPage ? "active" : ""}`}>
          <button
            className="page-link"
            style={
              i === currentPage
                ? { ...paginationStyles.pageLink, ...paginationStyles.activePageLink }
                : paginationStyles.pageLink
            }
            onClick={() => handlePageChange(i)}
          >
            {i + 1}
          </button>
        </li>
      );
    }

    return items;
  };

  // Calcul de l'affichage des éléments
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="container-fluid">
      <div
        className="card shadow-sm border-0"
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          background: "linear-gradient(180deg, #fffefe 0%, #fffafc 100%)",
        }}
      >
        <div className="card-body p-4 p-lg-5">
          <div
            className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4"
            style={{
              paddingBottom: "18px",
              borderBottom: "1px solid rgba(122, 75, 115, 0.12)",
            }}
          >
            <div>
              <h3 className="mb-1" style={{ color: "#4d2142", fontWeight: 700 }}>
                Liste des utilisateurs
              </h3>
              <p className="mb-0" style={{ color: "#7b6b77" }}>
                Gère les rôles, active ou désactive les accès et supprime les utilisateurs.
              </p>
            </div>

            <button
              className="btn btn-outline-primary"
              onClick={() => fetchData(currentPage, pageSize)}
              disabled={loading}
              style={{
                borderRadius: "14px",
                padding: "10px 18px",
                fontWeight: 600,
                borderColor: "#b56aa0",
                color: "#8e4f7f",
                minWidth: "130px",
              }}
            >
              {loading ? "Chargement..." : "Actualiser"}
            </button>
          </div>

          {/* Indicateur du nombre d'éléments par page EN HAUT */}
          <div
            className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"
            style={{
              padding: "12px 16px",
              background: "#faf5f9",
              borderRadius: "16px",
              border: "1px solid rgba(181, 106, 160, 0.15)",
            }}
          >
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-table" style={{ color: "#8e4f7f", fontSize: "18px" }}></i>
                <span style={{ color: "#6f5c69", fontWeight: 500, fontSize: "0.9rem" }}>
                  Affichage :
                </span>
                <select
                  className="form-select form-select-sm"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={{
                    width: "80px",
                    borderRadius: "12px",
                    borderColor: "rgba(181, 106, 160, 0.3)",
                    fontWeight: 600,
                    color: "#6f355f",
                    background: "#fff",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span style={{ color: "#7a6b77", fontSize: "0.85rem" }}>
                  par page
                </span>
              </div>

              <div className="vr" style={{ color: "#d4b8cf" }} />

              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-people-fill" style={{ color: "#b56aa0", fontSize: "16px" }}></i>
                <span style={{ color: "#6f5c69", fontWeight: 500, fontSize: "0.9rem" }}>
                  {totalElements > 0 ? (
                    <>
                      <strong style={{ color: "#8e4f7f" }}>{startItem}</strong> à{" "}
                      <strong style={{ color: "#8e4f7f" }}>{endItem}</strong> sur{" "}
                      <strong style={{ color: "#b56aa0" }}>{totalElements}</strong> utilisateur
                      {totalElements > 1 ? "s" : ""}
                    </>
                  ) : (
                    `0 utilisateur`
                  )}
                </span>
              </div>
            </div>

            {!loading && users.length > 0 && (
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    background: "#fff",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    color: "#8e4f7f",
                    border: "1px solid rgba(181, 106, 160, 0.2)",
                  }}
                >
                  <i className="bi bi-check-circle-fill" style={{ fontSize: "12px", color: "#2e7d32" }}></i>
                  <span>Page {currentPage + 1} / {totalPages}</span>
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          <div
            className="table-responsive mt-3"
            style={{
              border: "1px solid rgba(122, 75, 115, 0.10)",
              borderRadius: "22px",
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: "0 8px 22px rgba(176, 83, 173, 0.05)",
            }}
          >
            {/* Conteneur avec SCROLL VERTICAL */}
            <div
              style={{
                maxHeight: "550px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table
                className="table align-middle mb-0"
                style={{
                  minWidth: "1180px",
                }}
              >
                <thead
                  style={{
                    background: "linear-gradient(180deg, #fbf1f7 0%, #f8edf5 100%)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Matricule
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Nom
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Prénom
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Département
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        minWidth: "360px",
                      }}
                    >
                      Rôles autorisés
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Statut
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#6f355f",
                        fontSize: "0.80rem",
                        letterSpacing: "0.08em",
                        minWidth: "170px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                          <span>Chargement des utilisateurs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <i className="bi bi-inbox" style={{ fontSize: "48px", color: "#d4b8cf" }}></i>
                        <p className="text-muted mt-2 mb-0">Aucun utilisateur trouvé.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user.idUser}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fffefe" : "#fff9fc",
                          borderBottom: "1px solid rgba(122, 75, 115, 0.08)",
                          opacity: user.statut !== 1 ? 0.82 : 1,
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <td style={{ padding: "20px", fontWeight: 700, color: "#6a405b", whiteSpace: "nowrap" }}>
                          {user.matricule || "-"}
                        </td>

                        <td style={{ padding: "20px", color: "#4b3341", fontWeight: 700 }}>{user.nom}</td>

                        <td style={{ padding: "20px", color: "#4b3341" }}>{user.prenom}</td>

                        <td style={{ padding: "20px", color: "#5f5460" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 12px",
                              borderRadius: "999px",
                              background: "#faf1f9",
                              color: "#7a4b73",
                              fontWeight: 500,
                              fontSize: "0.88rem",
                            }}
                          >
                            {user.departement || "Non assigné"}
                          </span>
                        </td>

                        <td style={{ padding: "20px" }}>
                          <div className="d-flex flex-wrap gap-2">
                            {roles.map((role) => {
                              const loadingKey = `${user.idUser}-${role.id}`;
                              const checked = hasRole(user, role.id);

                              return (
                                <label
                                  key={role.id}
                                  className="d-inline-flex align-items-center gap-2 m-0"
                                  style={{
                                    padding: "8px 14px",
                                    borderRadius: "999px",
                                    border: checked
                                      ? "1px solid rgba(181, 106, 160, 0.45)"
                                      : "1px solid rgba(122, 75, 115, 0.14)",
                                    background: checked ? "rgba(181, 106, 160, 0.12)" : "#ffffff",
                                    cursor: actionLoadingKey === loadingKey ? "wait" : "pointer",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <input
                                    className="form-check-input m-0"
                                    type="checkbox"
                                    checked={checked}
                                    disabled={actionLoadingKey === loadingKey}
                                    onChange={(e) => handleRoleToggle(user, role, e.target.checked)}
                                    title={`Autoriser le rôle ${role.type}`}
                                  />
                                  <span
                                    style={{
                                      fontSize: "0.90rem",
                                      color: "#513747",
                                      fontWeight: checked ? 700 : 500,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {formatRoleLabel(role.type)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </td>

                        <td style={{ padding: "20px" }}>
                          <span
                            className={`badge bg-${getStatusClass(user.statut)}`}
                            style={{
                              borderRadius: "999px",
                              padding: "9px 14px",
                              fontSize: "0.80rem",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getStatusLabel(user.statut)}
                          </span>
                        </td>

                        <td style={{ padding: "20px", textAlign: "center" }}>
                          <div className="d-flex justify-content-center align-items-center gap-2 flex-nowrap">
                            <button
                              className={`btn btn-sm ${user.statut === 1 ? "btn-outline-warning" : "btn-outline-success"}`}
                              onClick={() => handleToggleStatus(user)}
                              disabled={updatingStatusId === user.idUser}
                              style={{
                                minWidth: "88px",
                                height: "38px",
                                borderRadius: "12px",
                                padding: "0 12px",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                whiteSpace: "nowrap",
                              }}
                              title={user.statut === 1 ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                            >
                              {updatingStatusId === user.idUser ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <>
                                  <i
                                    className={`bi ${user.statut === 1 ? "bi-person-x-fill" : "bi-person-check-fill"}`}
                                    style={{ fontSize: "14px" }}
                                  ></i>
                                  <span>{user.statut === 1 ? "Désactiver" : "Activer"}</span>
                                </>
                              )}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingId === user.idUser}
                              style={{
                                minWidth: "42px",
                                height: "38px",
                                borderRadius: "12px",
                                padding: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Supprimer l'utilisateur"
                            >
                              {deletingId === user.idUser ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-trash3-fill" style={{ fontSize: "15px" }}></i>
                              )}
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

          {totalPages > 0 && (
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3 mt-4">
              <div
                className="d-flex align-items-center flex-wrap gap-2"
                style={{
                  color: "#6f5c69",
                  fontWeight: 500,
                }}
              >
                <label htmlFor="pageSizeSelectBottom" className="mb-0 small">
                  Afficher :
                </label>

                <select
                  id="pageSizeSelectBottom"
                  className="form-select form-select-sm"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={{
                    width: "82px",
                    borderRadius: "12px",
                    borderColor: "rgba(181, 106, 160, 0.24)",
                    padding: "8px 12px",
                    fontWeight: 600,
                    color: "#6f355f",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <span className="small">
                  Total : {totalElements} utilisateur{totalElements > 1 ? "s" : ""}
                </span>
              </div>

              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                    <button className="page-link" style={paginationStyles.pageLink} onClick={() => handlePageChange(0)}>
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>

                  <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      style={paginationStyles.pageLink}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  {renderPaginationItems()}

                  <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      style={paginationStyles.pageLink}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>

                  <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      style={paginationStyles.pageLink}
                      onClick={() => handlePageChange(totalPages - 1)}
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserListe;