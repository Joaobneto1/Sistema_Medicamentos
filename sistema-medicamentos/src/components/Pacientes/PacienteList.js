import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const PacienteList = () => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            const { data, error } = await supabase
                .from("pacientes")
                .select(`
                    id, 
                    nome, 
                    idade, 
                    data_nascimento, 
                    paciente_medicamentos(
                        medicamento:medicamento_id(nome), 
                        horario_dose
                    )
                `);
            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                setPacientes(data);
            }
        };

        fetchPacientes();
    }, []);

    return (
        <div className="paciente-manager-container">
            <h1>Lista de Pacientes</h1>
            <div className="paciente-list">
                {pacientes.map((paciente) => (
                    <div key={paciente.id} className="paciente-card">
                        <p><strong>Nome:</strong> {paciente.nome}</p>
                        <p><strong>Idade:</strong> {paciente.idade}</p>
                        <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
                        <p><strong>Medicamentos:</strong></p>
                        <ul>
                            {paciente.paciente_medicamentos.length > 0 ? (
                                paciente.paciente_medicamentos.map((item, index) => (
                                    <li key={index}>
                                        {item.medicamento.nome} - Horário: {item.horario_dose}
                                    </li>
                                ))
                            ) : (
                                <li>Nenhum medicamento vinculado</li>
                            )}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PacienteList;
