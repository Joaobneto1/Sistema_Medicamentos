import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
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
        // Busca paciente e associações via backend
        const fetchPaciente = async () => {
            try {
                const { data } = await api.get(`/pacientes/${id}`);
                setPaciente({
                    nome: data.nome,
                    idade: data.idade,
                    data_nascimento: data.data_nascimento,
                    quarto: data.quarto || "",
                    foto_url: data.foto_url || ""
                });
                setAssociacoes(data.medicamentos || []);
            } catch (error) {
                console.error("Erro ao buscar paciente:", error);
            }
        };

        // Busca medicamentos via backend
        const fetchMedicamentos = async () => {
            try {
                const { data } = await api.get("/medicamentos");
                setMedicamentos(data);
            } catch (error) {
                console.error("Erro ao buscar medicamentos:", error);
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

    const handleFotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const filePath = `pacientes/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
            .from('fotos-pacientes')
            .upload(filePath, file);

        if (error) {
            alert("Erro ao fazer upload da foto.");
            return;
        }

        const { publicURL } = supabase
            .storage
            .from('fotos-pacientes')
            .getPublicUrl(filePath);

        setPaciente((prev) => ({ ...prev, foto_url: publicURL }));
    };

    const handleEditPaciente = async (e) => {
        e.preventDefault();
        if (!paciente.nome || paciente.idade <= 0 || !paciente.data_nascimento || !paciente.quarto) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        try {
            // Atualiza paciente e associações via backend
            await api.put(`/pacientes/${id}`, {
                ...paciente,
                medicamentos: associacoes.filter(
                    (a) => a.medicamento_id && a.horario_dose && a.intervalo_horas > 0 && a.dias_tratamento > 0
                ),
            });
            setFeedbackMessage("Paciente atualizado com sucesso!");
            setTimeout(() => {
                setFeedbackMessage("");
                navigate("/pacientes");
            }, 1000);
        } catch (error) {
            console.error("Erro ao editar paciente:", error);
        }
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
