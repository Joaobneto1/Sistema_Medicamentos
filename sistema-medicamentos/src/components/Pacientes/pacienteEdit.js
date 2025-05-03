import React from "react";
import "./pacienteForm.css"; // Reutilizando o mesmo CSS do formulário de criação

function PacienteEdit({ formData, handleInputChange, handleEditSubmit, setShowEditForm }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleEditSubmit(e); // Chama a função de edição passada como prop
        setShowEditForm(false); // Fecha o formulário após salvar
        window.location.reload(); // Recarrega a página para refletir as alterações
    };

    return (
        <>
            {/* Overlay modal para fechar o formulário ao clicar fora */}
            <div className="modal-overlay" onClick={() => setShowEditForm(false)}></div>
            
            {/* Formulário para edição de um paciente existente */}
            <form className="paciente-form" onSubmit={handleSubmit}>
                <h3>Editar Paciente</h3>
                
                {/* Campo de entrada para o nome do paciente */}
                <label>
                    Nome:
                    <input
                        type="text"
                        name="nome"
                        value={formData.nome} // Valor controlado pelo estado formData
                        onChange={handleInputChange} // Função para atualizar o estado ao digitar
                        required // Campo obrigatório
                    />
                </label>
                
                {/* Campo de entrada para a idade do paciente */}
                <label>
                    Idade:
                    <input
                        type="number"
                        name="idade"
                        value={formData.idade} // Valor controlado pelo estado formData
                        onChange={handleInputChange} // Função para atualizar o estado ao digitar
                        required // Campo obrigatório
                    />
                </label>
                
                {/* Campo de entrada para o número do quarto do paciente */}
                <label>
                    Quarto:
                    <input
                        type="text"
                        name="quarto"
                        value={formData.quarto} // Valor controlado pelo estado formData
                        onChange={handleInputChange} // Função para atualizar o estado ao digitar
                        required // Campo obrigatório
                    />
                </label>
                
                {/* Botões para salvar ou cancelar o formulário */}
                <div className="form-buttons">
                    <button type="submit" className="submit-button">
                        Salvar
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setShowEditForm(false)} // Fecha o formulário ao clicar
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </>
    );
}

export default PacienteEdit;
