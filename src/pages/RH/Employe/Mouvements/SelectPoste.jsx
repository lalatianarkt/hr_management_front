// SelectPoste.jsx
import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const SelectPoste = ({ departementId, value, onChange }) => {
    const [postes, setPostes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPostesByDepartement = async (departementId) => {
        if (!departementId) {
            setPostes([]);
            return;
        }

        setLoading(true);
        try { 
            const response = await axios.get(`http://localhost:8080/api/departements/${departementId}/postes`);
            setPostes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des postes:", error);
            setPostes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostesByDepartement(departementId);
    }, [departementId]);

    const handleChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <Select
            placeholder={departementId ? "Sélectionnez un poste" : "Choisissez d'abord un département"}
            loading={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
            }
            allowClear
            disabled={!departementId}
            value={value}
            onChange={handleChange}
        >
            {postes.map(poste => (
                <Option key={poste.id} value={poste.id}>
                    {poste.nom}
                </Option>
            ))}
        </Select>
    );
};

export default SelectPoste;
