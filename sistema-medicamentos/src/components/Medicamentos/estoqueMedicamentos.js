import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './estoqueMedicamentos.css';

const EstoqueMedicamentos = () => {
    const [medicamentos, setMedicamentos] = useState([]);

    const fetchMedicamentos = async () => {
        try {
            const { data } = await api.get('/medicamentos');
            setMedicamentos(data);
        } catch (error) {
            console.error('Erro ao buscar medicamentos:', error);
        }
    };

    useEffect(() => {
        fetchMedicamentos();
    }, []);

    return (
        <div className="container">
            <h1 className="title">Estoque de Medicamentos</h1>
            <ul className="list">
                {medicamentos.map((med) => (
                    <li key={med.id} className="listItem">
                        <strong>Nome:</strong> {med.nome} <br />
                        <strong>Estoque:</strong> {med.estoque} <br />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EstoqueMedicamentos;
