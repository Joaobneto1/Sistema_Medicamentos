import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const EditarPaciente = () => {
    const { id } = useParams(); // Obter o ID do paciente da URL
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState({ nome: "", idade: 0, data_nascimento: "" });
    const [medicamentos, setMedicamentos] = useState([]);
    const [associacoes, setAssociacoes] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    useEffect(() => {
        const fetchPaciente = async () => {
            const { data, error } = await supabase
                .from("pacientes")
                .select(`
                    id, 
                    nome, 
                    idade, 
                    data_nascimento, 
                    paciente_medicamentos(
                        medicamento_id, 
                        horario_dose
                    )
                `)
                .eq("id", id)
                .single();

            if (error) {
                console.error("Erro ao buscar paciente:", error);
            } else {
                setPaciente({
                    nome: data.nome,
                    idade: data.idade,
                    data_nascimento: data.data_nascimento,
                });

                if (data.paciente_medicamentos.length > 0) {
                    setAssociacoes(data.paciente_medicamentos.map((item) => ({
                        medicamento_id: item.medicamento_id,
                        horario_dose: item.horario_dose,
                    })));
                }
            }
        };

        const fetchMedicamentos = async () => {
            const { data, error } = await supabase.from("medicamentos").select("*");
            if (error) {
                console.error("Erro ao buscar medicamentos:", error);
            } else {
                setMedicamentos(data);
            }
        };

        fetchPaciente();
        fetchMedicamentos();
    }, [id]);

    const handleEditPaciente = async (e) => {
        e.preventDefault();
        if (!paciente.nome || paciente.idade <= 0 || !paciente.data_nascimento) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const { error: pacienteError } = await supabase
            .from("pacientes")
            .update({
                nome: paciente.nome,
                idade: paciente.idade,
                data_nascimento: paciente.data_nascimento,
            })
            .eq("id", id);

        if (pacienteError) {
            console.error("Erro ao editar paciente:", pacienteError);
            return;
        }

        const associacoesValidas = associacoes.filter(
            (associacao) => associacao.medicamento_id && associacao.horario_dose
        );

        if (associacoesValidas.length > 0) {
            const { error: associarError } = await supabase
                .from("paciente_medicamentos")
                .upsert(
                    associacoesValidas.map((associacao) => ({
                        paciente_id: id,
                        medicamento_id: associacao.medicamento_id,
                        horario_dose: associacao.horario_dose,
                    })),
                    { onConflict: ["paciente_id", "medicamento_id"] }
                );

            if (associarError) {
                console.error("Erro ao atualizar medicamentos associados:", associarError);
                return;
            }
        }

        setFeedbackMessage("Paciente atualizado com sucesso!");
        setTimeout(() => {
            setFeedbackMessage("");
            navigate("/pacientes");
        }, 1000); // Limpa a mensagem após 1 segundo e redireciona
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
            <h1>Editar Paciente</h1>
            {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
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
                <h2>Medicamentos Associados</h2>
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

export default EditarPaciente;
