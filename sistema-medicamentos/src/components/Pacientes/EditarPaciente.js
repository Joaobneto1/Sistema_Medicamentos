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
    const [horariosCalculados, setHorariosCalculados] = useState({}); // Armazena os horários calculados

    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    function calcularDiasSemana(dias) {
        const hoje = new Date();
        let resultado = [];
        for (let i = 0; i < dias; i++) {
            const dia = new Date(hoje);
            dia.setDate(hoje.getDate() + i);
            resultado.push(diasSemana[dia.getDay()]);
        }
        return resultado;
    }

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
                        horario_dose,
                        uso_cronico,
                        dias_tratamento
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
                        intervalo_horas: item.intervalo_horas || 0,
                        uso_cronico: item.uso_cronico || false,
                        dias_tratamento: item.dias_tratamento || 1,
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

    const calcularHorarios = () => {
        const novosHorarios = {};
        associacoes.forEach((associacao) => {
            const intervaloHoras = parseInt(associacao.intervalo_horas, 10);

            // Verifique se o intervalo de horas é um número válido
            if (associacao.horario_dose && !isNaN(intervaloHoras) && intervaloHoras > 0) {
                const horarios = [];
                let horarioAtual = associacao.horario_dose;

                for (let i = 0; i < 24; i += intervaloHoras) {
                    horarios.push(horarioAtual);
                    const [horas, minutos] = horarioAtual.split(":").map(Number);
                    const novaHora = (horas + intervaloHoras) % 24;
                    horarioAtual = `${novaHora.toString().padStart(2, "0")}:${minutos
                        .toString()
                        .padStart(2, "0")}`;
                }

                novosHorarios[associacao.medicamento_id] = horarios;
            }
        });

        setHorariosCalculados(novosHorarios);
    };

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
            (associacao) => associacao.medicamento_id && associacao.horario_dose && associacao.intervalo_horas > 0
        );

        if (associacoesValidas.length > 0) {
            const { error: associarError } = await supabase
                .from("paciente_medicamentos")
                .upsert(
                    associacoesValidas.map((associacao) => {
                        // Se crônico marcado, força 365 dias. Se não, define uso_cronico conforme dias_tratamento.
                        let dias_tratamento = associacao.uso_cronico ? 365 : associacao.dias_tratamento;
                        let uso_cronico = associacao.uso_cronico || dias_tratamento >= 365;
                        return {
                            paciente_id: id,
                            medicamento_id: associacao.medicamento_id,
                            horario_dose: associacao.horario_dose,
                            intervalo_horas: associacao.intervalo_horas,
                            uso_cronico,
                            dias_tratamento,
                        };
                    }),
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
        setAssociacoes([...associacoes, { medicamento_id: "", horario_dose: "", intervalo_horas: 0, uso_cronico: false, dias_tratamento: 1 }]);
    };

    const handleRemoveAssociacao = (index) => {
        setAssociacoes(associacoes.filter((_, i) => i !== index));
    };

    const handleChangeAssociacao = (index, field, value) => {
        const updatedAssociacoes = [...associacoes];

        // Certifique-se de que o valor de intervalo_horas seja um número ou vazio
        if (field === "intervalo_horas") {
            updatedAssociacoes[index][field] = value === "" ? "" : parseInt(value, 10) || 0;
        } else {
            updatedAssociacoes[index][field] = value;
        }

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
                        <input
                            type="number"
                            placeholder="Intervalo (horas)"
                            value={associacao.intervalo_horas}
                            onChange={(e) =>
                                handleChangeAssociacao(index, "intervalo_horas", parseInt(e.target.value, 10))
                            }
                            required
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <input
                                type="checkbox"
                                checked={!!associacao.uso_cronico}
                                onChange={(e) =>
                                    handleChangeAssociacao(index, "uso_cronico", e.target.checked)
                                }
                            />
                            Crônico
                        </label>
                        {/* Dias de tratamento agora sempre visível */}
                        <input
                            type="number"
                            min={1}
                            placeholder="Dias de Tratamento"
                            value={associacao.dias_tratamento}
                            onChange={(e) =>
                                handleChangeAssociacao(index, "dias_tratamento", parseInt(e.target.value, 10) || 1)
                            }
                            required
                        />
                        <div>
                            Dias da semana: {calcularDiasSemana(associacao.dias_tratamento).join(", ")}
                        </div>
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
                <button type="button" onClick={calcularHorarios} className="calculate-button">
                    Calcular Horários
                </button>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => navigate("/pacientes")}>
                    Cancelar
                </button>
            </form>
            <h2>Horários Calculados</h2>
            <div className="horarios-calculados">
                {Object.entries(horariosCalculados).map(([medicamentoId, horarios]) => (
                    <div key={medicamentoId}>
                        <h3>
                            Medicamento:{" "}
                            {medicamentos.find((med) => med.id === medicamentoId)?.nome || "Desconhecido"}
                        </h3>
                        <ul>
                            {horarios.map((horario, index) => (
                                <li key={index}>{horario}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditarPaciente;
