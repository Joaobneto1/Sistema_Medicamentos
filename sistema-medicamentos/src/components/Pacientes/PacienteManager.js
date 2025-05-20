import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const PacienteManager = () => {
    const [pacientes, setPacientes] = useState([]);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [busca, setBusca] = useState(""); // Adicione este estado
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPacientes = async () => {
            const { data, error } = await supabase.from("pacientes").select("*");
            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                setPacientes(data);
            }
        };

        fetchPacientes();
    }, []);

    const handleDeletePaciente = async (id) => {
        const { error } = await supabase.from("pacientes").delete().eq("id", id);
        if (error) {
            console.error("Erro ao deletar paciente:", error);
        } else {
            setPacientes(pacientes.filter((paciente) => paciente.id !== id));
            setPacienteSelecionado(null);
        }
    };

    return (
        <div className="paciente-manager-container">
            <h1>Gerenciar Pacientes</h1>
            <button
                className="btn-add"
                onClick={() => navigate("/adicionar-paciente")}
            >
                Adicionar Paciente
            </button>
            <input
                type="text"
                placeholder="Buscar paciente pelo nome"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                style={{ margin: "20px 0", padding: "10px", width: "100%", maxWidth: "400px", borderRadius: "30px", border: "1.5px solid #cce5ff" }}
            />
            <div className="paciente-list">
                {pacientes
                    .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
                    .map((paciente) => (
                        <div
                            key={paciente.id}
                            className="paciente-card"
                            onClick={() => setPacienteSelecionado(paciente)}
                        >
                            <p><strong>Nome:</strong> {paciente.nome}</p>
                            <p><strong>Idade:</strong> {paciente.idade}</p>
                            <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
                        </div>
                    ))}
            </div>

            {pacienteSelecionado && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Gerenciar Paciente</h2>
                        <p><strong>Nome:</strong> {pacienteSelecionado.nome}</p>
                        <p><strong>Idade:</strong> {pacienteSelecionado.idade}</p>
                        <p><strong>Data de Nascimento:</strong> {pacienteSelecionado.data_nascimento}</p>
                        <div className="button-group">
                            <button
                                className="edit-button"
                                onClick={() => navigate(`/editar-paciente/${pacienteSelecionado.id}`)} // Redireciona para a rota de edição
                            >
                                Editar
                            </button>
                            <button
                                className="delete-button"
                                onClick={() => handleDeletePaciente(pacienteSelecionado.id)}
                            >
                                Deletar
                            </button>
                        </div>
                        <button
                            className="cancel-button"
                            onClick={() => setPacienteSelecionado(null)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PacienteManager;
