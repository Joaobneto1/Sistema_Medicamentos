import React from "react";

function PacienteCard({ paciente }) {
    return (
        <div className="paciente-card">
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
    );
}

export default PacienteCard;