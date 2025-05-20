import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const AdicionarPaciente = () => {
    const [novoPaciente, setNovoPaciente] = useState({ nome: "", idade: "", data_nascimento: "", quarto: "" });
    const [medicamentos, setMedicamentos] = useState([]);
    const [associacoes, setAssociacoes] = useState([
        { medicamento_id: "", horario_dose: "", intervalo_horas: "", uso_cronico: false, dias_tratamento: "" }
    ]);
    const navigate = useNavigate();

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
        if (!novoPaciente.nome || novoPaciente.idade <= 0 || !novoPaciente.data_nascimento || !novoPaciente.quarto) {
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
            (associacao) => associacao.medicamento_id && associacao.horario_dose && associacao.intervalo_horas > 0
        );

        if (associacoesValidas.length > 0) {
            await supabase
                .from("paciente_medicamentos")
                .upsert(
                    associacoesValidas.map((associacao) => {
                        let dias_tratamento = associacao.uso_cronico ? 365 : associacao.dias_tratamento;
                        let uso_cronico = associacao.uso_cronico || dias_tratamento >= 365;
                        return {
                            paciente_id: pacienteId,
                            medicamento_id: associacao.medicamento_id,
                            horario_dose: associacao.horario_dose,
                            intervalo_horas: associacao.intervalo_horas,
                            uso_cronico,
                            dias_tratamento,
                        };
                    }),
                    { onConflict: ["paciente_id", "medicamento_id"] }
                );
        }

        alert("Paciente adicionado com sucesso!");
        navigate("/pacientes");
    };

    const handleAddAssociacao = () => {
        setAssociacoes([
            ...associacoes,
            { medicamento_id: "", horario_dose: "", intervalo_horas: "", uso_cronico: false, dias_tratamento: "" }
        ]);
    };

    const handleRemoveAssociacao = (index) => {
        setAssociacoes(associacoes.filter((_, i) => i !== index));
    };

    const handleChangeAssociacao = (index, field, value) => {
        const updatedAssociacoes = [...associacoes];
        if (field === "intervalo_horas") {
            updatedAssociacoes[index][field] = value === "" ? "" : parseInt(value, 10) || 0;
        } else {
            updatedAssociacoes[index][field] = value;
        }
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
                <input
                    type="text"
                    placeholder="Quarto"
                    value={novoPaciente.quarto}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, quarto: e.target.value })}
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
                        {/* Dias de tratamento sempre visível */}
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
                        <div className="associacao-actions-row">
                            <div className="associacao-actions-col">
                                <button
                                    type="button"
                                    onClick={handleAddAssociacao}
                                    className="add-button"
                                >
                                    Adicionar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAssociacao(index)}
                                    className="remove-button"
                                >
                                    Remover
                                </button>
                            </div>
                            <div className="form-actions-col">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => navigate("/pacientes")}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </form>
        </div>
    );
};

export default AdicionarPaciente;
