// SelectNiveauHierarchique.jsx
import React, { useState, useEffect } from 'react';
import { Select, Tag } from 'antd';
import axios from 'axios';

const { Option, OptGroup } = Select;

const SelectNiveauHierarchique = ({ value, onChange, niveauActuelId }) => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNiveaux = async () => {
        setLoading(true);

        try {
            const response = await axios.get('http://localhost:8080/api/niveaux');
            const tousLesNiveaux = Array.isArray(response.data) ? response.data : [];
            
            // Filtrer pour n'afficher que les niveaux supérieurs au niveau actuel
            if (niveauActuelId) {
                const niveauActuel = tousLesNiveaux.find(n => n.id === niveauActuelId);
                if (niveauActuel) {
                    const niveauxSuperieurs = tousLesNiveaux.filter(n => n.rang > niveauActuel.rang);
                    setNiveaux(niveauxSuperieurs);
                } else {
                    setNiveaux(tousLesNiveaux);
                }
            } else {
                setNiveaux(tousLesNiveaux);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des niveaux hiérarchiques:", error);
            setNiveaux([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNiveaux();
    }, [niveauActuelId]); // ⬅ recharge lorsque niveauActuelId change

    // Grouper les niveaux par catégorie
    const getCategorie = (rang) => {
        if (rang <= 3) return "execution";
        if (rang <= 5) return "encadrement";
        return "direction";
    };

    const getCategorieLabel = (categorie) => {
        const labels = {
            "execution": "Niveaux d'exécution",
            "encadrement": "Niveaux d'encadrement",
            "direction": "Niveaux de direction"
        };
        return labels[categorie] || categorie;
    };

    const niveauxParCategorie = niveaux.reduce((acc, niveau) => {
        const categorie = getCategorie(niveau.rang);
        if (!acc[categorie]) acc[categorie] = [];
        acc[categorie].push(niveau);
        return acc;
    }, {});

    return (
        <Select
            placeholder="Sélectionnez un niveau hiérarchique"
            loading={loading}
            showSearch
            allowClear
            value={value}
            onChange={onChange}
            optionFilterProp="children"
            filterOption={(input, option) =>
                (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
            }
            disabled={niveaux.length === 0 && !!niveauActuelId}
        >
            {Object.keys(niveauxParCategorie).length > 0 ? (
                Object.entries(niveauxParCategorie).map(([categorie, niveauxCategorie]) => (
                    <OptGroup key={categorie} label={getCategorieLabel(categorie)}>
                        {niveauxCategorie.map(niveau => (
                            <Option key={niveau.id} value={niveau.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{niveau.nom}</span>
                                    <Tag color="#b053ad">NIV{niveau.rang}</Tag>
                                </div>
                            </Option>
                        ))}
                    </OptGroup>
                ))
            ) : (
                <Option disabled value="no-options">
                    {niveauActuelId ? "Aucun niveau supérieur disponible" : "Aucun niveau disponible"}
                </Option>
            )}
        </Select>
    );
};

export default SelectNiveauHierarchique;
