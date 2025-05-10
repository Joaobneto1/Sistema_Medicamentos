import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const AdicionarPaciente = () => {
    const [novoPaciente, setNovoPaciente] = useState({ nome: "", idade: 0, data_nascimento: "" });
    const [medicamentos, setMedicamentos] = useState([]);
    const [medicamentoSelecionado, setMedicamentoSelecionado] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMedicamentos = async () => {
            const { data, error } = await supabase.from("medicamentos").select("*");
            if (error) {
                console.error("Erro ao buscar medicamentos:", error);
            } else {
                setMedicamentos(data);
            }
        };

        fetchMedicamentos();
    }, []);

    const handleAddPaciente = async (e) => {
        e.preventDefault();
        if (!novoPaciente.nome || novoPaciente.idade <= 0 || !novoPaciente.data_nascimento) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const { data: pacienteData, error: pacienteError } = await supabase
            .from("pacientes")
            .insert([novoPaciente])
            .select();

        if (pacienteError) {
            console.error("Erro ao adicionar paciente:", pacienteError);
            return;
        }

        if (medicamentoSelecionado) {
            const { error: associarError } = await supabase
                .from("paciente_medicamentos")
                .insert([{ paciente_id: pacienteData[0].id, medicamento_id: medicamentoSelecionado }]);

            if (associarError) {
                console.error("Erro ao associar medicamento ao paciente:", associarError);
                return;
            }
        }

        alert("Paciente adicionado com sucesso!");
        navigate("/pacientes");
    };

    return (
        <div className="paciente-manager-container">
            <header className="header">
                <h1>Adicionar Paciente</h1>
            </header>
            <form onSubmit={handleAddPaciente}>
                <input
                    type="text"
                    placeholder="Nome"
                    value={novoPaciente.nome}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Idade"
                    value={novoPaciente.idade}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, idade: parseInt(e.target.value, 10) })}
                    required
                />
                <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={novoPaciente.data_nascimento}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, data_nascimento: e.target.value })}
                    required
                />
                <select
                    value={medicamentoSelecionado}
                    onChange={(e) => setMedicamentoSelecionado(e.target.value)}
                >
                    <option value="">Selecione um medicamento (opcional)</option>
                    {medicamentos.map((medicamento) => (
                        <option key={medicamento.id} value={medicamento.id}>
                            {medicamento.nome}
                        </option>
                    ))}
                </select>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => navigate("/pacientes")}>Cancelar</button>
            </form>
        </div>
    );
};

export default AdicionarPaciente;
