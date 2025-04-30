import React from "react";
import PacienteCard from "./pacienteCard";
import PacienteForm from "./pacienteForm";

function PacienteList({
    pacientes,
    showForm,
    formData,
    handleInputChange,
    handleFormSubmit,
    setShowForm,
}) {
    return (
        <div className="paciente-container">
            <div className="paciente-header">
                <h2>Informações do Paciente</h2>
                <button className="create-button" onClick={() => setShowForm(true)}>
                    Criar Paciente
                </button>
            </div>
            <div className="paciente-grid">
                {pacientes.map((paciente) => (
                    <PacienteCard key={paciente.id} paciente={paciente} />
                ))}
            </div>
            {showForm && (
                <PacienteForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleFormSubmit={handleFormSubmit}
                    setShowForm={setShowForm}
                />
            )}
        </div>
    );
}

export default PacienteList;