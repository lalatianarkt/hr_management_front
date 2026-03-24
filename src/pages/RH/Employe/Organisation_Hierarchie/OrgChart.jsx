// src/pages/RH/Organisation/OrgChartCompact.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/AxiosInstance"; 
import { 
  Card, Avatar, Tooltip, Spin, Alert, Empty, 
  Select, Row, Col, Tag, Button, Input, 
  Badge, Popover, Divider 
} from "antd";
import { 
  UserOutlined, TeamOutlined, CrownOutlined, 
  FilterOutlined, SearchOutlined, DownOutlined,
  RightOutlined, InfoCircleOutlined, 
  UsergroupAddOutlined, ArrowRightOutlined,
  ApartmentOutlined, NodeIndexOutlined,
  ArrowDownOutlined, ArrowUpOutlined,
  EnvironmentOutlined, RiseOutlined,
  FallOutlined, SortAscendingOutlined,
  AlignLeftOutlined
} from "@ant-design/icons";
import "../../../../assets/css/OrgChart.css";

const { Option } = Select;
const { Search } = Input;

const OrgChartCompact = () => {
  const [organigrammeData, setOrganigrammeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartement, setSelectedDepartement] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState({});
  const [stats, setStats] = useState({ totalDepartements: 0, totalManagers: 0, totalEmployes: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [sortOrder, setSortOrder] = useState('desc');

  // Charger les données
  useEffect(() => {
    fetchOrganigramme();
  }, []);

  const fetchOrganigramme = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/hierarchie/organigramme-compact");
      
      if (response.data.status === "success") {
        setOrganigrammeData(response.data);
        
        // Initialiser tous les noeuds comme développés
        const initialExpanded = {};
        response.data.hierarchie?.forEach(dep => {
          initialExpanded[dep.nomDepartement] = true;
          dep.managers?.forEach(manager => {
            initialExpanded[manager.nomComplet] = true;
          });
        });
        setExpandedNodes(initialExpanded);
        
        // Mettre à jour les stats
        if (response.data.statistiques) {
          setStats({
            totalDepartements: response.data.statistiques.totalDepartements || 0,
            totalManagers: response.data.statistiques.totalManagers || 0,
            totalEmployes: response.data.statistiques.totalEmployes || 0
          });
        }
      } else {
        setError(response.data.message || "Erreur de données");
      }
    } catch (err) {
      console.error("Erreur:", err);
      // MODIFICATION: Gestion améliorée des erreurs
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas les droits pour accéder à ces données.");
      } else if (err.code === 'ECONNABORTED') {
        setError("La requête a pris trop de temps. Veuillez réessayer.");
      } else {
        setError(err.response?.data?.message || "Impossible de se connecter au serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle l'expansion d'un noeud
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Développer/réduire tous les noeuds
  const toggleAllNodes = (expand) => {
    const newExpanded = { ...expandedNodes };
    Object.keys(newExpanded).forEach(key => {
      newExpanded[key] = expand;
    });
    setExpandedNodes(newExpanded);
  };

  // Zoom avant/arrière
  const handleZoomIn = () => setZoom(Math.min(zoom + 20, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 20, 60));

  // Changer l'ordre de tri
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Grouper les employés par rang avec l'ordre spécifié
  const groupEmployeesByRank = (employees) => {
    if (!employees) return {};
    
    const groups = {};
    employees.forEach(emp => {
      const rang = emp.rang || 0;
      if (!groups[rang]) {
        groups[rang] = [];
      }
      groups[rang].push(emp);
    });
    
    // Trier les rangs selon l'ordre choisi
    const sortedGroups = {};
    const sortedKeys = Object.keys(groups)
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return parseInt(a) - parseInt(b);
        } else {
          return parseInt(b) - parseInt(a);
        }
      });
    
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  };

  // Obtenir tous les rangs uniques d'un manager dans l'ordre choisi
  const getUniqueRanks = (manager) => {
    if (!manager || !manager.subordonnesCompacts) return [];
    
    const ranks = new Set();
    manager.subordonnesCompacts.forEach(emp => {
      ranks.add(emp.rang || 0);
    });
    
    return Array.from(ranks).sort((a, b) => {
      if (sortOrder === 'asc') {
        return a - b;
      } else {
        return b - a;
      }
    });
  };

  // Composant pour l'avatar d'un employé
  const EmployeeAvatar = ({ employee, size = 32, showTooltip = true }) => {
    const getInitial = () => {
      if (employee.nomAbrege) {
        return employee.nomAbrege.charAt(0);
      }
      if (employee.nomComplet) {
        return employee.nomComplet.charAt(0);
      }
      return "?";
    };

    const getColor = () => {
      const rang = employee.rang || 0;
      if (rang >= 5) return '#722ed1';
      if (rang === 4) return '#b053ad';
      if (rang === 3) return '#52c41a';
      if (rang === 2) return '#fa8c16';
      return '#13c2c2';
    };

    const avatar = (
      <Avatar
        size={size}
        style={{ 
          backgroundColor: getColor(),
          fontSize: size * 0.4,
          fontWeight: 'bold',
          cursor: 'pointer',
          border: selectedNode === employee.nomComplet ? '3px solid #ffd700' : 'none',
          boxShadow: selectedNode === employee.nomComplet ? '0 0 10px rgba(255,215,0,0.5)' : 'none'
        }}
        onClick={() => setSelectedNode(employee.nomComplet)}
      >
        {getInitial()}
      </Avatar>
    );

    if (!showTooltip) return avatar;

    return (
      <Tooltip
        title={
          <div style={{ maxWidth: '250px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {employee.nomComplet || employee.nomAbrege}
            </div>
            <div style={{ fontSize: '12px' }}>
              <div><strong>Poste:</strong> {employee.nomPoste || 'Non spécifié'}</div>
              <div><strong>Niveau:</strong> {employee.nomNiveau || 'Non spécifié'}</div>
              <div><strong>Rang:</strong> {employee.rang || '0'}</div>
              {employee.matricule && (
                <div><strong>Matricule:</strong> {employee.matricule}</div>
              )}
            </div>
          </div>
        }
        placement="top"
      >
        {avatar}
      </Tooltip>
    );
  };

  // Composant pour une carte d'employé
  const EmployeeCard = ({ employee, type, onClick }) => {
    const getTitle = () => {
      return employee.nomComplet;
    };

    const getSubtitle = () => {
      if (type === 'manager') return `${employee.nomPoste} • Manager`;
      return employee.nomPoste;
    };

    const getColor = () => {
      if (type === 'manager') return '#722ed1';
      return '#52c41a';
    };

    return (
      <div
        onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px',
          background: 'white',
          borderRadius: '10px',
          border: `2px solid ${selectedNode === getTitle() ? '#ffd700' : getColor()}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          width: '180px',
          transition: 'all 0.3s',
          position: 'relative',
          margin: '8px'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: getColor(),
          borderRadius: '20px',
          padding: '2px 8px',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {type === 'manager' ? 'MGR' : 'EMP'}
        </div>

        <EmployeeAvatar employee={employee} size={56} showTooltip={false} />

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '14px',
            color: '#3a1438',
            marginBottom: '4px',
            wordBreak: 'break-word'
          }}>
            {getTitle()}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#8c5a88',
            marginBottom: '4px'
          }}>
            {getSubtitle()}
          </div>
          
          <Tag color={getNiveauTagColor(employee.nomNiveau)} style={{ fontSize: '9px', marginTop: '4px' }}>
            {employee.nomNiveau}
          </Tag>
        </div>
      </div>
    );
  };

  // Composant pour une ligne de rang (employés du même rang)
  const RankRow = ({ rank, employees, managerName, onEmployeeClick, isLast }) => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '10px',
          width: '100%'
        }}>
          <div style={{
            height: '2px',
            flex: 1,
            background: 'linear-gradient(90deg, transparent, #b053ad, transparent)'
          }} />
          <Tag color="#b053ad" style={{ fontWeight: 'bold' }}>
            Rang {rank}
          </Tag>
          <div style={{
            height: '2px',
            flex: 1,
            background: 'linear-gradient(90deg, transparent, #b053ad, transparent)'
          }} />
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          padding: '10px'
        }}>
          {employees.map((employee, idx) => (
            <EmployeeCard
              key={idx}
              employee={employee}
              type="employe"
              onClick={() => onEmployeeClick(employee.nomComplet)}
            />
          ))}
        </div>

        {!isLast && (
          <div style={{
            width: '2px',
            height: '20px',
            backgroundColor: '#d9b3d4',
            margin: '10px auto'
          }} />
        )}
      </div>
    );
  };

  // Composant pour un manager avec ses employés organisés par rang
  const ManagerWithRanks = ({ manager, onEmployeeClick }) => {
    const isExpanded = expandedNodes[manager.nomComplet] !== false;
    const uniqueRanks = getUniqueRanks(manager);
    const employeesByRank = groupEmployeesByRank(manager.subordonnesCompacts || []);
    const rankKeys = Object.keys(employeesByRank);
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginBottom: '30px'
      }}>
        <EmployeeCard
          employee={manager}
          type="manager"
          onClick={() => onEmployeeClick(manager.nomComplet)}
        />

        {manager.subordonnesCompacts?.length > 0 && (
          <div style={{ margin: '16px 0', textAlign: 'center' }}>
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              onClick={() => toggleNode(manager.nomComplet)}
              style={{ color: '#b053ad' }}
            >
              {isExpanded ? 'Masquer les employés' : `Afficher ${manager.subordonnesCompacts.length} employés`}
            </Button>
          </div>
        )}

        {isExpanded && manager.subordonnesCompacts?.length > 0 && (
          <>
            <div style={{
              width: '2px',
              height: '20px',
              backgroundColor: '#d9b3d4',
              margin: '4px 0'
            }} />

            <div style={{
              width: '100%',
              padding: '20px',
              background: '#f9f1f8',
              borderRadius: '12px',
              marginTop: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 10px'
              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TeamOutlined style={{ color: '#b053ad' }} />
                  <span style={{ fontWeight: 'bold', color: '#3a1438' }}>
                    Équipe de {manager.nomComplet}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {sortOrder === 'asc' ? (
                    <RiseOutlined style={{ color: '#b053ad', fontSize: '12px' }} />
                  ) : (
                    <FallOutlined style={{ color: '#b053ad', fontSize: '12px' }} />
                  )}
                  <span style={{ fontSize: '11px', color: '#5c2458' }}>
                    {sortOrder === 'asc' ? 'Rangs croissants' : 'Rangs décroissants'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    {uniqueRanks.map(rank => (
                      <Tag key={rank} color="#b053ad" style={{ fontSize: '10px' }}>
                        {rank}
                      </Tag>
                    ))}
                  </div>
                </div>

              </div>

              {[...rankKeys].reverse().map((rank, index, array) => (
                <RankRow
                  key={rank}
                  rank={rank}
                  employees={employeesByRank[rank]}
                  managerName={manager.nomComplet}
                  onEmployeeClick={onEmployeeClick}
                  isLast={index === rankKeys.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Composant pour un département
  const DepartementSection = ({ departement }) => {
    const totalEmployes = departement.managers?.reduce(
      (sum, m) => sum + (m.subordonnesCompacts?.length || 0), 0
    ) || 0;
    
    const totalManagers = departement.managers?.length || 0;
    
    const allRanks = new Set();
    departement.managers?.forEach(manager => {
      manager.subordonnesCompacts?.forEach(emp => {
        allRanks.add(emp.rang || 0);
      });
    });
    
    const uniqueRanks = Array.from(allRanks).sort((a, b) => {
      if (sortOrder === 'asc') {
        return a - b;
      } else {
        return b - a;
      }
    });
    
    return (
      <div style={{
        marginBottom: '48px',
        padding: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5f9 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(176, 83, 173, 0.15)',
        border: '1px solid #e1b2db'
      }}>
        <div style={{
          marginBottom: '32px',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #b053ad 0%, #722ed1 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'rotate(25deg)'
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <EnvironmentOutlined style={{ fontSize: '32px', color: 'white' }} />
              </div>
              
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px'
                }}>
                  {departement.nomDepartement}
                </h2>
                
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginTop: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TeamOutlined style={{ color: 'white', fontSize: '14px' }} />
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
                      {totalManagers} Manager{totalManagers > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserOutlined style={{ color: 'white', fontSize: '14px' }} />
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
                      {totalEmployes} Employé{totalEmployes > 1 ? 's' : ''}
                    </span>
                  </div>

                  {uniqueRanks.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {sortOrder === 'asc' ? (
                        <RiseOutlined style={{ color: 'white', fontSize: '14px' }} />
                      ) : (
                        <FallOutlined style={{ color: 'white', fontSize: '14px' }} />
                      )}
                      <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
                        Rangs: {uniqueRanks.join(' → ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CrownOutlined style={{ color: 'white' }} />
              <span style={{ color: 'white', fontWeight: 'bold' }}>
                {totalManagers + totalEmployes} membres
              </span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px'
        }}>
          {departement.managers && departement.managers.length > 0 ? (
            departement.managers.map((manager, idx) => (
              <ManagerWithRanks
                key={idx}
                manager={manager}
                onEmployeeClick={setSelectedNode}
              />
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              background: '#f9f1f8',
              borderRadius: '12px'
            }}>
              <UsergroupAddOutlined style={{ fontSize: '48px', color: '#b053ad', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', color: '#5c2458' }}>
                Aucun manager dans ce département
              </div>
              <div style={{ fontSize: '14px', color: '#8c5a88', marginTop: '8px' }}>
                La structure hiérarchique n'est pas encore définie
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper functions
  const getNiveauTagColor = (niveau) => {
    if (!niveau) return 'default';
    if (niveau.includes('Chef')) return '#b053ad';
    if (niveau.includes('Superviseur')) return 'green';
    if (niveau.includes('Agent')) return 'orange';
    if (niveau.includes('Assistant')) return 'cyan';
    if (niveau.includes('Directeur')) return 'purple';
    return 'default';
  };

  // Filtrer les départements
  const hierarchie = organigrammeData?.hierarchie || [];
  const departements = hierarchie.map(dep => dep.nomDepartement);
  
  const departementsFiltres = selectedDepartement === "all" 
    ? hierarchie 
    : hierarchie.filter(dep => dep.nomDepartement === selectedDepartement);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '500px' 
      }}>
        <Spin size="large" tip="Chargement de l'organigramme..." />
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
        style={{ margin: '20px' }}
        action={
          <Button size="small" onClick={fetchOrganigramme}>
            Réessayer
          </Button>
        }
      />
    );
  }

  if (!organigrammeData?.hierarchie || hierarchie.length === 0) {
    return (
      <Empty 
        description="Aucune donnée d'organigramme disponible" 
        style={{ margin: '100px 0' }}
      >
        <Button type="primary" onClick={fetchOrganigramme}>
          Actualiser
        </Button>
      </Empty>
    );
  }

  return (
    <div className="org-chart-compact-container" style={{ padding: '20px', maxWidth: '100%' }}>
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        marginBottom: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#3a1438' }}>
              <ApartmentOutlined style={{ marginRight: '12px', color: '#b053ad' }} />
              Organigramme Hiérarchique
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#5c2458' }}>
              Structure par département avec alignement par rang
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button.Group>
              <Button 
                size="small" 
                onClick={handleZoomOut}
                icon={<span>-</span>}
              >
                Zoom
              </Button>
              <Button size="small">
                {zoom}%
              </Button>
              <Button 
                size="small" 
                onClick={handleZoomIn}
                icon={<span>+</span>}
              />
            </Button.Group>
            
            <Button 
              size="small" 
              onClick={() => toggleAllNodes(true)}
              icon={<ArrowDownOutlined />}
            >
              Développer tout
            </Button>
            <Button 
              size="small" 
              onClick={() => toggleAllNodes(false)}
              icon={<ArrowUpOutlined />}
            >
              Réduire tout
            </Button>

            <Button
              size="small"
              type={sortOrder === 'desc' ? 'primary' : 'default'}
              icon={sortOrder === 'asc' ? <RiseOutlined /> : <FallOutlined />}
              onClick={toggleSortOrder}
            >
              {sortOrder === 'asc' ? 'Croissant ↑' : 'Décroissant ↓'}
            </Button>
          </div>
        </div>
        
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col span={16}>
            <Search
              placeholder="Rechercher un département, manager ou employé..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrer par département"
              value={selectedDepartement}
              onChange={setSelectedDepartement}
              suffixIcon={<FilterOutlined />}
              size="large"
            >
              <Option value="all">Tous les départements</Option>
              {departements.map((dep, idx) => (
                <Option key={idx} value={dep}>{dep}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        <Row gutter={24} style={{ marginTop: '20px' }}>
          <Col span={6}>
            <div style={{ 
              background: '#f9f1f8', 
              padding: '16px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Avatar size={48} icon={<TeamOutlined />} style={{ background: '#b053ad' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3a1438' }}>
                  {stats.totalDepartements}
                </div>
                <div style={{ color: '#5c2458' }}>Départements</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ 
              background: '#f9f1f8', 
              padding: '16px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Avatar size={48} icon={<CrownOutlined />} style={{ background: '#722ed1' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3a1438' }}>
                  {stats.totalManagers}
                </div>
                <div style={{ color: '#5c2458' }}>Managers</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ 
              background: '#f9f1f8', 
              padding: '16px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Avatar size={48} icon={<UserOutlined />} style={{ background: '#52c41a' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3a1438' }}>
                  {stats.totalEmployes}
                </div>
                <div style={{ color: '#5c2458' }}>Employés</div>
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ 
              background: '#f9f1f8', 
              padding: '16px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Avatar 
                size={48} 
                icon={sortOrder === 'asc' ? <RiseOutlined /> : <FallOutlined />} 
                style={{ background: '#fa8c16' }} 
              />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3a1438' }}>
                  {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                </div>
                <div style={{ color: '#5c2458' }}>
                  {sortOrder === 'asc' ? 'Rangs ↑' : 'Rangs ↓'}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        minHeight: '500px',
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: '800px'
      }}>
        <div style={{ 
          transform: `scale(${zoom/100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s'
        }}>
          {departementsFiltres.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Empty 
                description={
                  searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucun département trouvé"
                } 
              />
              {searchTerm && (
                <Button 
                  type="link" 
                  onClick={() => setSearchTerm("")}
                  style={{ marginTop: '16px' }}
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div>
              {departementsFiltres.map((departement, idx) => (
                <DepartementSection 
                  key={idx} 
                  departement={departement} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedNode && (
        <div style={{ 
          marginTop: '24px',
          padding: '20px',
          background: '#f9f1f8',
          borderRadius: '8px',
          border: '1px solid #e1b2db'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <InfoCircleOutlined style={{ color: '#b053ad', fontSize: '20px' }} />
              <span style={{ fontWeight: 'bold', color: '#3a1438' }}>
                Élément sélectionné : {selectedNode}
              </span>
            </div>
            <Button 
              type="text" 
              size="small" 
              onClick={() => setSelectedNode(null)}
            >
              Fermer
            </Button>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <Button type="primary" size="small">Voir détails</Button>
            <Button size="small">Voir subordonnés</Button>
            <Button size="small">Contacter</Button>
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '32px', 
        padding: '20px', 
        background: '#f9f1f8', 
        borderRadius: '12px',
        border: '1px solid #f9f1f8'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#3a1438'
        }}>
          <InfoCircleOutlined style={{ marginRight: '8px' }} />
          Légende - Organisation par Rang {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
        </div>
        
        <Row gutter={24}>
          <Col span={4}>
            <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 500, color: '#5c2458' }}>
              Types de cartes :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#722ed1', borderRadius: '4px' }} />
                <span style={{ fontSize: '12px' }}>Manager (MGR)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#52c41a', borderRadius: '4px' }} />
                <span style={{ fontSize: '12px' }}>Employé (EMP)</span>
              </div>
            </div>
          </Col>
          
          <Col span={5}>
            <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 500, color: '#5c2458' }}>
              Organisation des rangs :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sortOrder === 'asc' ? <RiseOutlined /> : <FallOutlined />}
                <span style={{ fontSize: '12px' }}>
                  {sortOrder === 'asc' 
                    ? 'Du rang le plus petit au plus grand ↑' 
                    : 'Du rang le plus grand au plus petit ↓'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '2px', background: '#b053ad' }} />
                <span style={{ fontSize: '12px' }}>Séparateurs de rangs</span>
              </div>
            </div>
          </Col>
          
          <Col span={5}>
            <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 500, color: '#5c2458' }}>
              Alignement :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlignLeftOutlined />
                <span style={{ fontSize: '12px' }}>Même rang = même ligne</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⬅️➡️</span>
                <span style={{ fontSize: '12px' }}>Alignement horizontal</span>
              </div>
            </div>
          </Col>
          
          <Col span={5}>
            <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 500, color: '#5c2458' }}>
              Interactions :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⬇️/⬆️</span>
                <span style={{ fontSize: '12px' }}>Afficher/Masquer équipe</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🖱️</span>
                <span style={{ fontSize: '12px' }}>Clic pour sélectionner</span>
              </div>
            </div>
          </Col>
          
          <Col span={5}>
            <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 500, color: '#5c2458' }}>
              Zoom :
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🔍 {zoom}%</span>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ 
        marginTop: '24px', 
        textAlign: 'center', 
        padding: '16px',
        color: '#5c2458',
        fontSize: '12px',
        borderTop: '1px solid #f9f1f8'
      }}>
        <NodeIndexOutlined style={{ marginRight: '8px' }} />
        Organigramme généré le {new Date().toLocaleDateString('fr-FR')} • 
        {stats.totalDepartements} département(s) • 
        {stats.totalManagers} manager(s) • 
        {stats.totalEmployes} employé(s) •
        Tri {sortOrder === 'asc' ? 'croissant ↑' : 'décroissant ↓'}
      </div>
    </div>
  );
};

export default OrgChartCompact;