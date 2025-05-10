import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const EditarPaciente = () => {
    const { id } = useParams(); // Obter o ID do paciente da URL
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState({ nome: "", idade: 0, data_nascimento: "" });

    useEffect(() => {
        const fetchPaciente = async () => {
            const { data, error } = await supabase
                .from("pacientes")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Erro ao buscar paciente:", error);
            } else {
                setPaciente(data);
            }
        };

        fetchPaciente();
    }, [id]);

    const handleEditPaciente = async (e) => {
        e.preventDefault();
        if (!paciente.nome || paciente.idade <= 0 || !paciente.data_nascimento) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const { error } = await supabase
            .from("pacientes")
            .update(paciente)
            .eq("id", id);

        if (error) {
            console.error("Erro ao editar paciente:", error);
        } else {
            alert("Paciente atualizado com sucesso!");
            navigate("/pacientes");
        }
    };

    return (
        <div className="paciente-manager-container">
            <h1>Editar Paciente</h1>
            <form onSubmit={handleEditPaciente}>
                <input
                    type="text"
                    placeholder="Nome"
                    value={paciente.nome}
                    onChange={(e) => setPaciente({ ...paciente, nome: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Idade"
                    value={paciente.idade}
                    onChange={(e) => setPaciente({ ...paciente, idade: parseInt(e.target.value, 10) })}
                    required
                />
                <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={paciente.data_nascimento}
                    onChange={(e) => setPaciente({ ...paciente, data_nascimento: e.target.value })}
                    required
                />
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => navigate("/pacientes")}>Cancelar</button>
            </form>
        </div>
    );
};

export default EditarPaciente;
