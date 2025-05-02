import React from "react";
import "./pacienteForm.css"; // Importando o CSS para estilização

function PacienteForm({ formData, handleInputChange, handleFormSubmit, setShowForm }) {
    return (
        <>
            <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
            <form className="paciente-form" onSubmit={handleFormSubmit}>
                <h3>Criar Paciente</h3>
                <label>
                    Nome:
                    <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Idade:
                    <input
                        type="number"
                        name="idade"
                        value={formData.idade}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Quarto:
                    <input
                        type="text"
                        name="quarto"
                        value={formData.quarto}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <div className="form-buttons">
                    <button type="submit" className="submit-button">
                        Salvar
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setShowForm(false)}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </>
    );
}

export default PacienteForm;