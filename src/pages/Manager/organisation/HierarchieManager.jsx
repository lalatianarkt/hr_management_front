import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Badge, Button, Card, Empty, Spin, Tag, Tooltip } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CrownOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/AxiosInstance";

const getRangColor = (rang) => {
  if (rang >= 5) return "#7c3aed";
  if (rang === 4) return "#b053ad";
  if (rang === 3) return "#2563eb";
  if (rang === 2) return "#0f766e";
  return "#5c2458";
};

const getDepartmentName = () => sessionStorage.getItem("département") || "";

export default function HierarchieManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managerData, setManagerData] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [expanded, setExpanded] = useState(true);

  const fetchHierarchie = useCallback(async () => {
    const sessionDepartment = getDepartmentName();

    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/hierarchie/organigramme-compact/manager");
      const data = response.data;

      if (data?.manager) {
        setManagerData(data.manager);
        setDepartmentName(data.departement || sessionDepartment);
        return;
      }

      if (data?.status && data.status !== "success") {
        setError(data?.message || "Impossible de charger la vue hierarchique.");
        return;
      }

      setError("Impossible de charger la vue hierarchique.");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expiree. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas les droits pour acceder a ces donnees.");
      } else if (err.code === "ECONNABORTED") {
        setError("La requete a pris trop de temps. Veuillez reessayer.");
      } else {
        setError(err.response?.data?.message || "Impossible de charger la vue hierarchique du manager.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHierarchie();
  }, [fetchHierarchie]);

  const groupedSubordinates = useMemo(() => {
    const subordonnes = managerData?.subordonnesCompacts || [];

    return subordonnes.reduce((groups, employe) => {
      const key = employe.rang || 0;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(employe);
      return groups;
    }, {});
  }, [managerData]);

  const groupEntries = useMemo(
    () => Object.entries(groupedSubordinates).sort((a, b) => Number(b[0]) - Number(a[0])),
    [groupedSubordinates]
  );

  const selectedRanks = useMemo(() => groupEntries.map(([rank]) => rank), [groupEntries]);

  const getNiveauTagColor = (niveau) => {
    if (!niveau) return "default";
    if (niveau.includes("Chef")) return "#b053ad";
    if (niveau.includes("Superviseur")) return "green";
    if (niveau.includes("Agent")) return "orange";
    if (niveau.includes("Assistant")) return "cyan";
    if (niveau.includes("Directeur")) return "purple";
    return "default";
  };

  const getColor = (rang, type = "employe") => {
    if (type === "manager") return "#722ed1";
    if (rang >= 5) return "#722ed1";
    if (rang === 4) return "#b053ad";
    if (rang === 3) return "#52c41a";
    if (rang === 2) return "#fa8c16";
    return "#13c2c2";
  };

  const EmployeeAvatar = ({ employee, size = 56 }) => (
    <Tooltip
      title={
        <div style={{ maxWidth: "240px" }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>{employee.nomComplet}</div>
          <div style={{ fontSize: 12 }}>
            <div><strong>Poste:</strong> {employee.nomPoste || "Non specifie"}</div>
            <div><strong>Niveau:</strong> {employee.nomNiveau || "Non specifie"}</div>
            <div><strong>Rang:</strong> {employee.rang || 0}</div>
            {employee.matricule && <div><strong>Matricule:</strong> {employee.matricule}</div>}
          </div>
        </div>
      }
    >
      <Avatar
        size={size}
        style={{
          backgroundColor: getColor(employee.rang, employee.nomPoste === managerData?.nomPoste ? "manager" : "employe"),
          fontSize: size * 0.4,
          fontWeight: "bold",
        }}
      >
        {(employee.nomAbrege || employee.nomComplet || "?").charAt(0).toUpperCase()}
      </Avatar>
    </Tooltip>
  );

  const EmployeeCard = ({ employee, type }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px",
        background: "white",
        borderRadius: "10px",
        border: `2px solid ${getColor(employee.rang, type)}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "180px",
        position: "relative",
        margin: "8px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-10px",
          right: "-10px",
          background: getColor(employee.rang, type),
          borderRadius: "20px",
          padding: "2px 8px",
          color: "white",
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        {type === "manager" ? "MGR" : "EMP"}
      </div>

      <EmployeeAvatar employee={employee} size={56} />

      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            color: "#3a1438",
            marginBottom: "4px",
            wordBreak: "break-word",
          }}
        >
          {employee.nomComplet}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#8c5a88",
            marginBottom: "4px",
          }}
        >
          {type === "manager" ? `${employee.nomPoste || "Manager"} • Manager` : employee.nomPoste}
        </div>

        <Tag color={getNiveauTagColor(employee.nomNiveau)} style={{ fontSize: "9px", marginTop: "4px" }}>
          {employee.nomNiveau || "Niveau"}
        </Tag>
      </div>
    </div>
  );

  const RankRow = ({ rank, employees, isLast }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "10px",
          width: "100%",
        }}
      >
        <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg, transparent, #b053ad, transparent)" }} />
        <Tag color="#b053ad" style={{ fontWeight: "bold" }}>
          Rang {rank}
        </Tag>
        <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg, transparent, #b053ad, transparent)" }} />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          padding: "10px",
        }}
      >
        {employees.map((employee) => (
          <EmployeeCard key={`${employee.matricule}-${employee.nomComplet}`} employee={employee} type="employe" />
        ))}
      </div>

      {!isLast && <div style={{ width: "2px", height: "20px", backgroundColor: "#d9b3d4", margin: "10px auto" }} />}
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Spin size="large" tip="Chargement de la hiérarchie..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Erreur"
        description={error}
        showIcon
        action={
          <Button size="small" onClick={fetchHierarchie}>
            Reessayer
          </Button>
        }
      />
    );
  }

  if (!managerData) {
    return <Empty description="Aucune vue hiérarchique disponible" />;
  }

  const subordonnes = managerData.subordonnesCompacts || [];
  const managerDisplay = {
    ...managerData,
    nomAbrege: managerData.nomComplet,
  };

  return (
    <div style={{ padding: "8px 0 24px" }}>
      <div
        style={{
          marginBottom: "32px",
          padding: "16px 24px",
          background: "linear-gradient(135deg, #b053ad 0%, #722ed1 100%)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(114, 46, 209, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "180px",
            height: "180px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            transform: "rotate(25deg)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: "28px", color: "white" }} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "white" }}>
                {departmentName || "Departement"}
              </h2>
              <div style={{ display: "flex", gap: "18px", marginTop: "8px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CrownOutlined style={{ color: "white", fontSize: "14px" }} />
                  <span style={{ color: "white", fontSize: "14px", fontWeight: 500 }}>1 Manager</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UserOutlined style={{ color: "white", fontSize: "14px" }} />
                  <span style={{ color: "white", fontSize: "14px", fontWeight: 500 }}>
                    {subordonnes.length} Employe{subordonnes.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "8px 16px",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <TeamOutlined style={{ color: "white" }} />
            <span style={{ color: "white", fontWeight: "bold" }}>
              {subordonnes.length + 1} membres
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, #ffffff 0%, #faf5f9 100%)",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(176, 83, 173, 0.15)",
          border: "1px solid #e1b2db",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <EmployeeCard employee={managerDisplay} type="manager" />

          {subordonnes.length > 0 && (
            <div style={{ margin: "16px 0", textAlign: "center" }}>
              <Button
                type="text"
                size="small"
                icon={expanded ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                onClick={() => setExpanded((prev) => !prev)}
                style={{ color: "#b053ad" }}
              >
                {expanded ? "Masquer les employés" : `Afficher ${subordonnes.length} employés`}
              </Button>
            </div>
          )}

          {expanded && subordonnes.length > 0 && (
            <>
              <div style={{ width: "2px", height: "20px", backgroundColor: "#d9b3d4", margin: "4px 0" }} />

              <div
                style={{
                  width: "100%",
                  padding: "20px",
                  background: "#f9f1f8",
                  borderRadius: "12px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    padding: "0 10px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <TeamOutlined style={{ color: "#b053ad" }} />
                    <span style={{ fontWeight: "bold", color: "#3a1438" }}>
                      Equipe de {managerData.nomComplet}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {selectedRanks.map((rank) => (
                      <Tag key={rank} color="#b053ad" style={{ fontSize: "10px" }}>
                        {rank}
                      </Tag>
                    ))}
                  </div>
                </div>

                {groupEntries.map(([rank, employees], index) => (
                  <RankRow
                    key={rank}
                    rank={rank}
                    employees={employees}
                    isLast={index === groupEntries.length - 1}
                  />
                ))}
              </div>
            </>
          )}

          {subordonnes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f9f1f8",
                borderRadius: "12px",
                width: "100%",
                marginTop: "20px",
              }}
            >
              <TeamOutlined style={{ fontSize: "42px", color: "#b053ad", marginBottom: "16px" }} />
              <div style={{ fontSize: "16px", color: "#5c2458" }}>
                Aucun collaborateur rattache a ce manager
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
