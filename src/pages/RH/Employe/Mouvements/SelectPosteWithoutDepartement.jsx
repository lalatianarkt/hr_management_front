// SelectPosteWithoutDepartement.jsx
import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const SelectPosteWithoutDepartement = ({ departementId, value, onChange }) => {
    const [postes, setPostes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPostes = async () => {
        if (!departementId) {
            setPostes([]);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:8080/api/postes/dep/${departementId}`);
            setPostes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des postes:", error);
            setPostes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostes();
    }, [departementId]); // ⬅ recharge lorsque idDep change

    return (
        <Select
            placeholder={departementId ? "Sélectionnez un poste" : "Sélectionnez d'abord un département"}
            disabled={!departementId}
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
        >
            {postes.map(poste => (
                <Option key={poste.id} value={poste.id}>
                    {poste.nom}
                </Option>
            ))}
        </Select>
    );
};

export default SelectPosteWithoutDepartement;
