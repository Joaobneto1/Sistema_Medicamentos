import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const EditarPaciente = () => {
    const { id } = useParams(); // Obter o ID do paciente da URL
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState({ nome: "", idade: "", data_nascimento: "", quarto: "", foto_url: "" });
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
                    quarto,
                    foto_url,
                    paciente_medicamentos(
                        medicamento_id, 
                        horario_dose,
                        intervalo_horas,
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
                    quarto: data.quarto || "",
                    foto_url: data.foto_url || ""
                });

                if (data.paciente_medicamentos.length > 0) {
                    setAssociacoes(data.paciente_medicamentos.map((item) => ({
                        medicamento_id: item.medicamento_id,
                        horario_dose: item.horario_dose,
                        intervalo_horas: item.intervalo_horas || 1,
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

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPaciente((prev) => ({ ...prev, foto_url: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleEditPaciente = async (e) => {
        e.preventDefault();
        if (!paciente.nome || paciente.idade <= 0 || !paciente.data_nascimento || !paciente.quarto) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        // Atualiza dados do paciente
        const { error: pacienteError } = await supabase
            .from("pacientes")
            .update({
                nome: paciente.nome,
                idade: paciente.idade,
                data_nascimento: paciente.data_nascimento,
                quarto: paciente.quarto,
                foto_url: paciente.foto_url || null
            })
            .eq("id", id);

        if (pacienteError) {
            console.error("Erro ao editar paciente:", pacienteError);
            return;
        }

        // Busca associações atuais do banco
        const { data: assocAtuais, error: assocFetchError } = await supabase
            .from("paciente_medicamentos")
            .select("medicamento_id")
            .eq("paciente_id", id);

        if (assocFetchError) {
            console.error("Erro ao buscar associações atuais:", assocFetchError);
            return;
        }

        // Lista de medicamento_ids atualmente no formulário
        const idsNoForm = associacoes
            .filter(a => a.medicamento_id)
            .map(a => String(a.medicamento_id));

        // Lista de medicamento_ids atualmente no banco
        const idsNoBanco = (assocAtuais || []).map(a => String(a.medicamento_id));

        // Descobre quais ids foram removidos no formulário
        const idsRemovidos = idsNoBanco.filter(idBanco => !idsNoForm.includes(idBanco));

        // Remove do banco os medicamentos removidos no formulário
        if (idsRemovidos.length > 0) {
            const { error: delError } = await supabase
                .from("paciente_medicamentos")
                .delete()
                .eq("paciente_id", id)
                .in("medicamento_id", idsRemovidos);
            if (delError) {
                console.error("Erro ao remover medicamentos:", delError);
                return;
            }
        }

        // Upsert dos medicamentos presentes no formulário
        const associacoesValidas = associacoes.filter(
            (associacao) =>
                associacao.medicamento_id &&
                associacao.horario_dose &&
                associacao.intervalo_horas > 0
        );

        if (associacoesValidas.length > 0) {
            const { error: associarError } = await supabase
                .from("paciente_medicamentos")
                .upsert(
                    associacoesValidas.map((associacao) => {
                        let dias_tratamento = associacao.uso_cronico ? 365 : associacao.dias_tratamento || 1;
                        let uso_cronico = !!associacao.uso_cronico || dias_tratamento >= 365;
                        return {
                            paciente_id: id,
                            medicamento_id: associacao.medicamento_id,
                            horario_dose: associacao.horario_dose,
                            intervalo_horas: Number(associacao.intervalo_horas) || 1,
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
        setAssociacoes([...associacoes, { medicamento_id: "", horario_dose: "", intervalo_horas: "", uso_cronico: false, dias_tratamento: "" }]);
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
                <input
                    type="text"
                    placeholder="Quarto"
                    value={paciente.quarto}
                    onChange={(e) => setPaciente({ ...paciente, quarto: e.target.value })}
                    required
                />
                {/* Campo para upload de foto do paciente */}
                <div className="foto-paciente-upload">
                    <label htmlFor="fotoPaciente">Foto do Paciente:</label>
                    <input
                        type="file"
                        id="fotoPaciente"
                        name="fotoPaciente"
                        accept="image/*"
                        onChange={handleFotoChange}
                    />
                    {/* Exibe a foto atual se existir */}
                    {paciente.foto_url && (
                        <div style={{ marginTop: 8 }}>
                            <img src={paciente.foto_url} alt="Foto do Paciente" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }} />
                        </div>
                    )}
                </div>
                <h2>Medicamentos Associados</h2>
                {(associacoes.length === 0) && (
                    <div className="associacao-container">
                        <button
                            type="button"
                            onClick={handleAddAssociacao}
                            className="edit-add-button"
                        >
                            Adicionar Medicamento
                        </button>
                    </div>
                )}
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
                        <div className="edit-actions-row">
                            <div className="edit-actions-col">
                                <button
                                    type="button"
                                    onClick={handleAddAssociacao}
                                    className="edit-add-button"
                                >
                                    Adicionar Medicamento
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAssociacao(index)}
                                    className="edit-remove-button"
                                >
                                    Remover
                                </button>
                            </div>
                            <div className="edit-form-actions-col">
                                <button type="button" onClick={calcularHorarios}>
                                    Calcular Horários
                                </button>
                                <button type="button" onClick={() => navigate("/pacientes")}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Botão Salvar único no final do formulário */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <button type="submit" className="save-button">Salvar</button>
                </div>
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
