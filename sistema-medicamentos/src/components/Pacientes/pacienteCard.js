import React, { useState } from "react";

function PacienteCard({ paciente }) {
    const [showDetails, setShowDetails] = useState(false);

    const handleCardClick = () => {
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
    };

    return (
        <>
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

            {showDetails && (
                <div className="paciente-details-overlay">
                    <div className="paciente-details">
                        <h2>Detalhes do Paciente</h2>
                        <button className="close-button" onClick={handleCloseDetails}>Fechar</button>
                        <p><strong>Nome:</strong> {paciente.nome}</p>
                        <p><strong>Idade:</strong> {paciente.idade}</p>
                        <p><strong>Quarto:</strong> {paciente.quarto}</p>
                        <p><strong>Histórico:</strong> {paciente.historico || "Não disponível"}</p>
                        <p><strong>Medicamentos:</strong></p>
                        <ul>
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
                </div>
            )}
        </>
    );
}

export default PacienteCard;