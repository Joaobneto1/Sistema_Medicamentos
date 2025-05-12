import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const PacienteList = () => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            console.log("Buscando pacientes e medicamentos...");
            const { data, error } = await supabase
                .from("pacientes")
                .select(`
                    id, 
                    nome, 
                    idade, 
                    data_nascimento, 
                    paciente_medicamentos(
                        medicamento:medicamento_id(nome), 
                        horario_dose, 
                        intervalo_horas, 
                        proximo_medicamento
                    )
                `); // Removido o filtro de proximo_medicamento

            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                console.log("Pacientes retornados:", data); // Log para verificar os dados retornados
                setPacientes(data || []); // Garante que `pacientes` seja um array mesmo se `data` for null
            }
        };

        fetchPacientes();

        // Atualiza a lista a cada 15 minutos
        const interval = setInterval(fetchPacientes, 15 * 60 * 1000);

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, []);

    return (
        <div className="paciente-manager-container">
            <h1>Pacientes e Medicamentos Vinculados</h1>
            <div className="paciente-list">
                {pacientes.length > 0 ? (
                    pacientes.map((paciente) => (
                        <div key={paciente.id} className="paciente-card">
                            <p><strong>Nome:</strong> {paciente.nome}</p>
                            <p><strong>Idade:</strong> {paciente.idade}</p>
                            <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
                            <p><strong>Medicamentos:</strong></p>
                            <ul>
                                {paciente.paciente_medicamentos && paciente.paciente_medicamentos.length > 0 ? (
                                    paciente.paciente_medicamentos.map((item, index) => (
                                        <li key={index} style={{ color: item.proximo_medicamento ? "green" : "black" }}>
                                            <strong>{item.medicamento.nome}</strong>
                                            <br />
                                            Horário: {item.horario_dose}
                                            <br />
                                            Intervalo: {item.intervalo_horas} horas
                                            <br />
                                            Próximo Medicamento: {item.proximo_medicamento ? "Sim" : "Não"}
                                        </li>
                                    ))
                                ) : (
                                    <li>Nenhum medicamento vinculado</li>
                                )}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Nenhum paciente encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default PacienteList;
