import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const AdicionarPaciente = () => {
    const [novoPaciente, setNovoPaciente] = useState({ nome: "", idade: 0, data_nascimento: "" });
    const [medicamentos, setMedicamentos] = useState([]);
    const [associacoes, setAssociacoes] = useState([{ medicamento_id: "", horario_dose: "" }]);
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

        // Insere o paciente na tabela "pacientes"
        const { data: pacienteData, error: pacienteError } = await supabase
            .from("pacientes")
            .insert([novoPaciente])
            .select();

        if (pacienteError) {
            console.error("Erro ao adicionar paciente:", pacienteError);
            alert("Erro ao adicionar paciente. Verifique os dados e tente novamente.");
            return;
        }

        // Obtém o ID do paciente recém-criado
        const pacienteId = pacienteData[0].id;

        // Insere os medicamentos associados ao paciente
        const associacoesValidas = associacoes.filter(
            (associacao) => associacao.medicamento_id && associacao.horario_dose
        );

        const { error: associarError } = await supabase
            .from("paciente_medicamentos")
            .insert(
                associacoesValidas.map((associacao) => ({
                    paciente_id: pacienteId,
                    medicamento_id: associacao.medicamento_id,
                    horario_dose: associacao.horario_dose,
                    intervalo_horas: associacao.intervalo_horas,
                }))
            );

        if (associarError) {
            console.error("Erro ao associar medicamentos ao paciente:", associarError);
            alert("Erro ao associar medicamentos ao paciente.");
            return;
        }

        alert("Paciente adicionado com sucesso!");
        navigate("/pacientes");
    };

    const handleAddAssociacao = () => {
        setAssociacoes([...associacoes, { medicamento_id: "", horario_dose: "" }]);
    };

    const handleRemoveAssociacao = (index) => {
        setAssociacoes(associacoes.filter((_, i) => i !== index));
    };

    const handleChangeAssociacao = (index, field, value) => {
        const updatedAssociacoes = [...associacoes];
        updatedAssociacoes[index][field] = value;
        setAssociacoes(updatedAssociacoes);
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
                <h2>Associar Medicamentos</h2>
                {associacoes.map((associacao, index) => (
                    <div key={index} className="associacao-container">
                        <select
                            value={associacao.medicamento_id}
                            onChange={(e) =>
                                handleChangeAssociacao(index, "medicamento_id", e.target.value)
                            }
                            required
                        >
                            <option value="">Selecione um medicamento</option>
                            {medicamentos.map((medicamento) => (
                                <option key={medicamento.id} value={medicamento.id}>
                                    {medicamento.nome}
                                </option>
                            ))}
                        </select>
                        <input
                            type="time"
                            value={associacao.horario_dose}
                            onChange={(e) =>
                                handleChangeAssociacao(index, "horario_dose", e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveAssociacao(index)}
                            className="remove-button"
                        >
                            Remover
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddAssociacao} className="add-button">
                    Adicionar Medicamento
                </button>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => navigate("/pacientes")}>
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default AdicionarPaciente;
