import React from "react";
// Importando o componente PacienteCard para exibir informações de cada paciente
import PacienteCard from "./pacienteCard";
// Importando o componente PacienteForm para criar ou editar pacientes
import PacienteForm from "./pacienteForm";

// Componente funcional PacienteList que gerencia a lista de pacientes e o formulário
function PacienteList({
    pacientes, // Lista de pacientes a ser exibida
    showForm, // Estado que controla a exibição do formulário
    formData, // Dados do formulário
    handleInputChange, // Função para manipular mudanças nos campos do formulário
    handleFormSubmit, // Função para manipular o envio do formulário
    setShowForm, // Função para alterar o estado de exibição do formulário
}) {
    return (
        <div className="paciente-container">
            {/* Cabeçalho da lista de pacientes */}
            <div className="paciente-header">
                <h2>Informações do Paciente</h2>
                {/* Botão para abrir o formulário de criação de paciente */}
                <button className="create-button" onClick={() => setShowForm(true)}>
                    Criar Paciente
                </button>
            </div>
            
            {/* Grade para exibir os cartões de pacientes */}
            <div className="paciente-grid">
                {pacientes.map((paciente) => (
                    // Renderiza um PacienteCard para cada paciente na lista
                    <PacienteCard key={paciente.id} paciente={paciente} />
                ))}
            </div>
            
            {/* Exibe o formulário de paciente se showForm for verdadeiro */}
            {showForm && (
                <PacienteForm
                    formData={formData} // Dados do formulário
                    handleInputChange={handleInputChange} // Função para manipular mudanças nos campos
                    handleFormSubmit={handleFormSubmit} // Função para manipular o envio do formulário
                    setShowForm={setShowForm} // Função para fechar o formulário
                />
            )}
        </div>
    );
}

// Exportando o componente para ser utilizado em outras partes do sistema
export default PacienteList;