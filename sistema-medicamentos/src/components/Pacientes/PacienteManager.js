import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const PacienteManager = () => {
    const [pacientes, setPacientes] = useState([]);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [busca, setBusca] = useState("");
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
            <div className="paciente-list-cards paciente-list-cards-wrap">
                {pacientes
                    .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
                    .map((paciente) => (
                        <div
                            key={paciente.id}
                            className="paciente-card-modern"
                            style={{ cursor: "pointer" }}
                            onClick={() => setPacienteSelecionado(paciente)}
                        >
                            <div className="paciente-card-header">
                                <div>
                                    <span className="paciente-card-title">{paciente.nome}</span>
                                    <div className="paciente-card-subtitle">
                                        Idade: {paciente.idade}
                                    </div>
                                    <div className="paciente-card-subtitle">
                                        Data de Nascimento: {paciente.data_nascimento}
                                    </div>
                                    <div className="paciente-card-subtitle">
                                        quarto: {paciente.quarto}
                                    </div>
                                </div>
                                {paciente.foto_url && (
                                    <img
                                        src={paciente.foto_url}
                                        alt="Foto do paciente"
                                        className="paciente-card-foto"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
            </div>

            {pacienteSelecionado && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Gerenciar Paciente</h2>
                        <div className="paciente-card-header" style={{ marginBottom: 16 }}>
                            <div>
                                <span className="paciente-card-title">{pacienteSelecionado.nome}</span>
                                <div className="paciente-card-subtitle">
                                    Idade: {pacienteSelecionado.idade}
                                </div>
                                <div className="paciente-card-subtitle">
                                    Data de Nascimento: {pacienteSelecionado.data_nascimento}
                                </div>
                            </div>
                            {pacienteSelecionado.foto_url && (
                                <img
                                    src={pacienteSelecionado.foto_url}
                                    alt="Foto do paciente"
                                    className="paciente-card-foto"
                                />
                            )}
                        </div>
                        <div className="button-group">
                            <button
                                className="edit-button"
                                onClick={() => navigate(`/editar-paciente/${pacienteSelecionado.id}`)}
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
