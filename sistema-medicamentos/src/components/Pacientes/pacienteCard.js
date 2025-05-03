import React, { useState } from "react";
import supabase from "../../services/supabaseClient";
import PacienteEdit from "./pacienteEdit";
import "./pacienteCard.css"; // Importa o arquivo CSS para estilização

function PacienteCard({ paciente, handleEdit, handleDelete }) {
    const [showDetails, setShowDetails] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [formData, setFormData] = useState({ ...paciente });
    const [successMessage, setSuccessMessage] = useState("");

    const handleCardClick = () => {
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from("pacientes")
                .update({
                    nome: formData.nome,
                    idade: formData.idade,
                    quarto: formData.quarto,
                })
                .eq("id", paciente.id);

            if (error) {
                console.error("Erro ao editar paciente:", error);
                return;
            }

            setSuccessMessage("Paciente editado com sucesso!");
            setTimeout(() => setSuccessMessage(""), 3000);
            handleEdit(data[0]);
            setShowEditForm(false);
        } catch (err) {
            console.error("Erro inesperado:", err);
        }
    };

    const handleDeletePaciente = async () => {
        try {
            const { error } = await supabase
                .from("pacientes")
                .delete()
                .eq("id", paciente.id);

            if (error) {
                console.error("Erro ao excluir paciente:", error);
                return;
            }

            setSuccessMessage("Paciente excluído com sucesso!");
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDetails(false);
            handleDelete(paciente.id); // Atualiza a lista no componente pai
        } catch (err) {
            console.error("Erro inesperado:", err);
        }
    };

    return (
        <>
            {/* Cartão do paciente com informações básicas */}
            <div className="paciente-card" onClick={handleCardClick}>
                <p>
                    <strong>Nome:</strong> {paciente.nome}
                </p>
                <p>
                    <strong>Idade:</strong> {paciente.idade}
                </p>
                <p>
                    <strong>Quarto:</strong> {paciente.quarto}
                </p>
                <p>
                    <strong>Medicamentos:</strong>
                </p>
                <ul>
                    {/* Lista de medicamentos do paciente */}
                    {paciente.medicamentos && paciente.medicamentos.length > 0 ? (
                        paciente.medicamentos.map((medicamento) => (
                            <li key={medicamento.id}>
                                {medicamento.nome} - {medicamento.dosagem} ({medicamento.frequencia})
                            </li>
                        ))
                    ) : (
                        <li>Nenhum medicamento cadastrado</li>
                    )}
                </ul>
            </div>

            {/* Modal com detalhes completos do paciente */}
            {showDetails && (
                <div className="paciente-details-overlay">
                    <div className="paciente-details">
                        <h2>Detalhes do Paciente</h2>
                        {/* Botão para fechar o modal */}
                        <button className="close-button" onClick={handleCloseDetails}>
                            Fechar
                        </button>
                        <p><strong>Nome:</strong> {paciente.nome}</p>
                        <p><strong>Idade:</strong> {paciente.idade}</p>
                        <p><strong>Quarto:</strong> {paciente.quarto}</p>
                        <p><strong>Histórico:</strong> {paciente.historico || "Não disponível"}</p>
                        <p><strong>Medicamentos:</strong></p>
                        <ul>
                            {/* Lista de medicamentos detalhada */}
                            {paciente.medicamentos && paciente.medicamentos.length > 0 ? (
                                paciente.medicamentos.map((medicamento) => (
                                    <li key={medicamento.id}>
                                        {medicamento.nome} - {medicamento.dosagem} ({medicamento.frequencia})
                                    </li>
                                ))
                            ) : (
                                <li>Nenhum medicamento cadastrado</li>
                            )}
                        </ul>
                        {/* Botões para editar ou deletar o paciente */}
                        <div className="card-buttons">
                            <button
                                onClick={() => setShowEditForm(true)} // Abre o formulário de edição
                                className="edit-button styled-button"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => {
                                    handleDeletePaciente();
                                    window.location.reload();
                                }}
                                className="delete-button styled-button"
                            >
                                Deletar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulário de edição do paciente */}
            {showEditForm && (
                <PacienteEdit
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleEditSubmit={handleEditSubmit}
                    setShowEditForm={setShowEditForm}
                />
            )}

            {/* Mensagem de sucesso */}
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
        </>
    );
}

// Exportando o componente para ser utilizado em outras partes do sistema
export default PacienteCard;