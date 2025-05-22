import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import './estoqueMedicamentos.css';

const EstoqueMedicamentos = () => {
    const [medicamentos, setMedicamentos] = useState([]);

    const fetchMedicamentos = async () => {
        const { data, error } = await supabase.from('medicamentos').select('id, nome, estoque');
        if (error) {
            console.error('Erro ao buscar medicamentos:', error);
        } else {
            setMedicamentos(data);
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
