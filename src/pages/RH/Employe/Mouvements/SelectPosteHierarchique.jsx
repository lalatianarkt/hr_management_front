import React, { useEffect, useState } from "react";
import { Select, Spin } from "antd";

const { Option } = Select;

export default function SelectPosteHierarchique({ departementId, niveauId, onChange }) {
    const [postes, setPostes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!niveauId) {
            setPostes([]);
            return;
        }

        const fetchPostes = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/postes/niveau/${niveauId}`);
                const data = await response.json();
                console.log("data maraina : ", data);

                // FILTRAGE PAR DEPARTEMENT
                const filtered = departementId
                    ? data.filter(p => p.departement && p.departement.id === departementId)
                    : data;

                setPostes(filtered);

            } catch (error) {
                console.error("Erreur lors du chargement des postes :", error);
            }
            setLoading(false);
        };

        fetchPostes();
    }, [niveauId, departementId]); // important d'écouter departementId

    return (
        <Select
            placeholder="Sélectionner un poste"
            loading={loading}
            onChange={onChange}
            allowClear
            style={{ width: "100%" }}
        >
            {loading ? (
                <Option disabled>
                    <Spin size="small" />
                </Option>
            ) : (
                postes.map((poste) => (
                    <Option key={poste.id} value={poste.id}>
                        {poste.nom}
                    </Option>
                ))
            )}
        </Select>
    );
}

