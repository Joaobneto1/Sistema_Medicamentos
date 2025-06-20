import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

/* const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]; */
/* function calcularDiasSemana(dias) {
    const hoje = new Date();
    let resultado = [];
    for (let i = 0; i < dias; i++) {
        const dia = new Date(hoje);
        dia.setDate(hoje.getDate() + i);
        resultado.push(diasSemana[dia.getDay()]);
    }
    return resultado;
} */

const PacienteList = () => {
    const [pacientes, setPacientes] = useState([]);
    const [pacientesJaMedicados, setPacientesJaMedicados] = useState([]);
    const [pacientesAtrasados, setPacientesAtrasados] = useState([]);
    const [alertasEstoque, setAlertasEstoque] = useState([]);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertaVisivel, setAlertaVisivel] = useState(false);
    const [alertaMensagem, setAlertaMensagem] = useState("");
    const [historicoAlertas, setHistoricoAlertas] = useState([]);
    const alertaTimeout = useRef(null);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                // Busca pacientes e medicamentos associados direto do Supabase
                const { data, error } = await supabase
                    .from("pacientes")
                    .select(`
                        *,
                        paciente_medicamentos (
                            *,
                            medicamento:medicamento_id (
                                id, nome, descricao, dose_mg
                            )
                        )
                    `)
                    .order("nome", { ascending: true });

                if (error) {
                    console.error("Erro ao buscar pacientes do Supabase:", error);
                    return;
                }
                // (Manter o processamento local para separar pacientes por status)
                const horaAtual = new Date();
                const margemMinutos = 5;

                const pacientesParaMedicar = [];
                const pacientesMedicados = [];
                const pacientesNaoMedicados = [];

                data.forEach((paciente) => {
                    // Corrige: se não houver medicamentos, não processa
                    if (!paciente.paciente_medicamentos || paciente.paciente_medicamentos.length === 0) {
                        return;
                    }

                    const medicamentosParaMedicar = [];
                    const medicamentosMedicados = [];
                    const medicamentosNaoMedicados = [];

                    paciente.paciente_medicamentos.forEach((medicamento) => {
                        // Corrige: ignora medicamentos sem horário de dose
                        if (!medicamento.horario_dose) return;

                        const [horas, minutos] = medicamento.horario_dose.split(":").map(Number);
                        const horarioDose = new Date(horaAtual);
                        horarioDose.setHours(horas, minutos, 0, 0);

                        let podeMedicar = false;
                        let estaAtrasado = false;
                        let jaMedicado = false;

                        if (medicamento.medicado && medicamento.updated_at && medicamento.intervalo_horas) {
                            const ultimaMed = new Date(medicamento.updated_at);
                            const proximaDose = new Date(ultimaMed.getTime() + medicamento.intervalo_horas * 60 * 60 * 1000);

                            if (horaAtual >= proximaDose) {
                                if (horaAtual > horarioDose) {
                                    estaAtrasado = true;
                                } else if (Math.floor((horarioDose - horaAtual) / (1000 * 60)) >= 0 && Math.floor((horarioDose - horaAtual) / (1000 * 60)) <= margemMinutos) {
                                    podeMedicar = true;
                                }
                                jaMedicado = false;
                            } else {
                                jaMedicado = true;
                            }
                        } else if (!medicamento.medicado) {
                            const diferencaMinutos = Math.floor((horarioDose - horaAtual) / (1000 * 60));
                            if (diferencaMinutos >= 0 && diferencaMinutos <= margemMinutos) {
                                podeMedicar = true;
                            } else if (diferencaMinutos < 0) {
                                estaAtrasado = true;
                            }
                        }

                        if (medicamento.medicado && medicamento.updated_at && medicamento.intervalo_horas) {
                            const ultimaMed = new Date(medicamento.updated_at);
                            const proximaDose = new Date(ultimaMed.getTime() + medicamento.intervalo_horas * 60 * 60 * 1000);
                            if (horarioDose > horaAtual && horaAtual >= proximaDose) {
                                podeMedicar = true;
                                jaMedicado = false;
                            }
                        }

                        if (podeMedicar) {
                            medicamentosParaMedicar.push(medicamento);
                        } else if (jaMedicado) {
                            medicamentosMedicados.push(medicamento);
                        } else if (estaAtrasado) {
                            medicamentosNaoMedicados.push(medicamento);
                        }
                    });

                    // Corrige: só adiciona se houver medicamentos para cada categoria
                    if (medicamentosParaMedicar.length > 0) {
                        pacientesParaMedicar.push({
                            ...paciente,
                            paciente_medicamentos: medicamentosParaMedicar,
                        });
                    }

                    if (medicamentosMedicados.length > 0) {
                        pacientesMedicados.push({
                            ...paciente,
                            paciente_medicamentos: medicamentosMedicados,
                        });
                    }

                    if (medicamentosNaoMedicados.length > 0) {
                        pacientesNaoMedicados.push({
                            ...paciente,
                            paciente_medicamentos: medicamentosNaoMedicados,
                        });
                    }
                });

                setPacientes(pacientesParaMedicar);
                setPacientesJaMedicados(pacientesMedicados);
                setPacientesAtrasados(pacientesNaoMedicados);
            } catch (error) {
                console.error("Erro ao buscar pacientes:", error);
            }
        };

        const fetchAlertasEstoque = async () => {
            try {
                // Busca alertas de estoque via backend
                const { data } = await api.get("/estoque/alertas");
                setAlertasEstoque(data || []);
                // Mostra alerta para cada medicamento novo em alerta
                data.forEach(item => {
                    const mensagem = `Atenção: Estoque baixo para ${item.medicamento.nome} (apenas ${item.quantidade} unidade${item.quantidade === 1 ? "" : "s"})`;
                    // Evita alertas duplicados no histórico
                    setHistoricoAlertas(prev => {
                        if (!prev.some(h => h.medicamentoNome === item.medicamento.nome)) {
                            return [...prev, { medicamentoNome: item.medicamento.nome, quantidade: item.quantidade, id: Date.now() + Math.random() }];
                        }
                        return prev;
                    });
                    // Mostra alerta visual se não estiver visível
                    setAlertaMensagem(mensagem);
                    setAlertaVisivel(true);
                    if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
                    alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 5000);
                });
            } catch (error) {
                setAlertasEstoque([]);
            }
        };

        fetchPacientes();
        fetchAlertasEstoque();

        // Atualiza a lista a cada 5 minutos
        const interval = setInterval(() => {
            fetchPacientes();
            fetchAlertasEstoque();
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
        };
    }, []);

    // Função para remover alerta do histórico
    const removerAlertaHistorico = (id) => {
        setHistoricoAlertas(prev => prev.filter(a => a.id !== id));
    };

    const marcarComoMedicado = async (pacienteId, medicamentoId, isAtrasado = false) => {
        try {
            // Chama o backend para marcar como medicado e atualizar estoque
            await api.post("/pacientes/marcar-medicado", {
                pacienteId,
                medicamentoId,
                isAtrasado
            });
            // Atualize o estado local conforme necessário (pode refazer fetchPacientes)
            if (isAtrasado) {
                // Atualiza a lista de pacientes atrasados
                setPacientesAtrasados((prevAtrasados) =>
                    prevAtrasados
                        .map((paciente) => {
                            if (paciente.id === pacienteId) {
                                const medicamentosAtualizados = paciente.paciente_medicamentos.filter(
                                    (med) => med.medicamento_id !== medicamentoId
                                );
                                return { ...paciente, paciente_medicamentos: medicamentosAtualizados };
                            }
                            return paciente;
                        })
                        .filter((paciente) => paciente.paciente_medicamentos.length > 0) // Remove pacientes sem medicamentos atrasados
                );
            } else {
                // Atualiza a lista de pacientes a serem medicados
                setPacientes((prevPacientes) =>
                    prevPacientes
                        .map((paciente) => {
                            if (paciente.id === pacienteId) {
                                const medicamentosAtualizados = paciente.paciente_medicamentos.filter(
                                    (med) => med.medicamento_id !== medicamentoId
                                );
                                return { ...paciente, paciente_medicamentos: medicamentosAtualizados };
                            }
                            return paciente;
                        })
                        .filter((paciente) => paciente.paciente_medicamentos.length > 0) // Remove pacientes sem medicamentos pendentes
                );
            }

            // Adiciona o paciente à lista de pacientes já medicados
            setPacientesJaMedicados((prevMedicados) => {
                const pacienteAtualizado = isAtrasado
                    ? pacientesAtrasados.find((paciente) => paciente.id === pacienteId)
                    : pacientes.find((paciente) => paciente.id === pacienteId);

                const medicamentoMovido = pacienteAtualizado.paciente_medicamentos.find(
                    (med) => med.medicamento_id === medicamentoId
                );

                if (pacienteAtualizado) {
                    const novoPaciente = {
                        ...pacienteAtualizado,
                        paciente_medicamentos: [medicamentoMovido],
                    };

                    return [...prevMedicados, novoPaciente];
                }

                return prevMedicados;
            });
        } catch (error) {
            setAlertaMensagem("Erro ao registrar medicação.");
            setAlertaVisivel(true);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
            alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 4000);
        }
    };

    const getCardStyle = (status) => {
        if (status === "atrasado") {
            return { border: "2px solid #ff6b6b", background: "#ffeaea" };
        }
        if (status === "medicado") {
            return { border: "2px solid #bdbdbd", background: "#f5f5f5" };
        }
        // padrão (disponível)
        return { border: "2px solid #1ccfc9", background: "#fff" };
    };

    return (
        <div className="paciente-manager-container">
            {/* Alerta visual flutuante */}
            {alertaVisivel && (
                <div className="alerta-flutuante">
                    {alertaMensagem}
                </div>
            )}

            {/* Sino de alerta de estoque */}
            <div className="sino-alerta-estoque">
                <button
                    className="sino-alerta-estoque"
                    onClick={() => setShowAlertModal(true)}
                    title="Alertas de Estoque"
                >
                    <span
                        className="icone-sino"
                        style={{ color: alertasEstoque.length > 0 ? "#ff9800" : "#888" }}
                    >
                        &#128276;
                    </span>
                    {alertasEstoque.length > 0 && (
                        <span className="badge-alerta">
                            {alertasEstoque.length}
                        </span>
                    )}
                </button>
            </div>
            {/* Modal de alertas/histórico */}
            {showAlertModal && (
                <div
                    className="modal-alerta-estoque-bg"
                    onClick={() => setShowAlertModal(false)}
                >
                    <div
                        className="modal-alerta-estoque-content"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2>Histórico de Alertas de Estoque Baixo</h2>
                        {historicoAlertas.length === 0 ? (
                            <p>Nenhum alerta no histórico.</p>
                        ) : (
                            <ul>
                                {historicoAlertas.map((item) => (
                                    <li key={item.id}>
                                        <span style={{ flex: 1 }}>
                                            <strong>{item.medicamentoNome}</strong> - Estoque: {item.quantidade}
                                        </span>
                                        <button
                                            className="btn-remover-alerta"
                                            title="Marcar como lido"
                                            onClick={() => removerAlertaHistorico(item.id)}
                                        >
                                            &#10006;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button
                            className="btn-fechar-alerta"
                            onClick={() => setShowAlertModal(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
            <div className="pacientes-dashboard-row">
                {/* Pacientes Disponíveis */}
                <div className="pacientes-dashboard-col">
                    <h2 style={{ textAlign: "center", margin: "24px 0 16px 0", fontWeight: 500, color: "#444" }}>
                        Pacientes disponíveis:
                    </h2>
                    <div className="paciente-list-cards">
                        {pacientes.length > 0 ? (
                            pacientes.map((paciente) => (
                                <div key={paciente.id} className="paciente-card-modern" style={getCardStyle("proximo")}>
                                    <div className="paciente-card-header">
                                        <div>
                                            <span className="paciente-card-title">{paciente.nome}</span>
                                            <div className="paciente-card-subtitle">
                                                Quarto {paciente.quarto} &nbsp;|&nbsp; Idade: {paciente.idade}
                                            </div>
                                            <div className="paciente-card-subtitle">
                                                Nascimento: {paciente.data_nascimento}
                                            </div>
                                        </div>
                                        {paciente.foto_url && (
                                            <img
                                                src={paciente.foto_url}
                                                alt="Foto do paciente"
                                                className="paciente-card-foto"
                                            />
                                        )}
                                    </div>
                                    <div className="paciente-card-body">
                                        <ul className="paciente-card-meds">
                                            {paciente.paciente_medicamentos.map((item, index) => (
                                                <li key={index}>
                                                    <span className="paciente-card-med-nome">{item.medicamento.nome}</span>
                                                    <div className="paciente-card-med-info">
                                                        Horário: {item.horario_dose} &nbsp;|&nbsp; Intervalo: {item.intervalo_horas}h
                                                    </div>
                                                    <div className="paciente-card-med-info">
                                                        Uso crônico: {item.uso_cronico ? "Sim" : "Não"}
                                                        {item.dias_tratamento && (
                                                            <> &nbsp;|&nbsp; Dias: {item.dias_tratamento}</>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="paciente-card-btn"
                                                        onClick={() =>
                                                            marcarComoMedicado(paciente.id, item.medicamento_id)
                                                        }
                                                    >
                                                        Medicado
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: "center" }}>Nenhum paciente precisa ser medicado no momento.</p>
                        )}
                    </div>
                </div>
                {/* Pacientes Atrasados */}
                <div className="pacientes-dashboard-col">
                    <h1 style={{ color: "#2196f3", textAlign: "center", margin: "32px 0 16px 0" }}>Pacientes Atrasados</h1>
                    <div className="paciente-list-cards">
                        {pacientesAtrasados.length > 0 ? (
                            pacientesAtrasados.map((paciente) => (
                                <div key={paciente.id} className="paciente-card-modern" style={getCardStyle("atrasado")}>
                                    <div className="paciente-card-header">
                                        <div>
                                            <span className="paciente-card-title">{paciente.nome}</span>
                                            <div className="paciente-card-subtitle">
                                                Quarto {paciente.quarto} &nbsp;|&nbsp; Idade: {paciente.idade}
                                            </div>
                                            <div className="paciente-card-subtitle">
                                                Nascimento: {paciente.data_nascimento}
                                            </div>
                                        </div>
                                        {paciente.foto_url && (
                                            <img
                                                src={paciente.foto_url}
                                                alt="Foto do paciente"
                                                className="paciente-card-foto"
                                            />
                                        )}
                                    </div>
                                    <div className="paciente-card-body">
                                        <ul className="paciente-card-meds">
                                            {paciente.paciente_medicamentos.map((item, index) => (
                                                <li key={index}>
                                                    <span className="paciente-card-med-nome">{item.medicamento.nome}</span>
                                                    <div className="paciente-card-med-info">
                                                        Horário: {item.horario_dose} &nbsp;|&nbsp; Intervalo: {item.intervalo_horas}h
                                                    </div>
                                                    <div className="paciente-card-med-info">
                                                        Uso crônico: {item.uso_cronico ? "Sim" : "Não"}
                                                        {item.dias_tratamento && (
                                                            <> &nbsp;|&nbsp; Dias: {item.dias_tratamento}</>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="paciente-card-btn"
                                                        onClick={() =>
                                                            marcarComoMedicado(paciente.id, item.medicamento_id, true)
                                                        }
                                                    >
                                                        Medicado
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: "center" }}>Nenhum paciente está atrasado no momento.</p>
                        )}
                    </div>
                </div>
                {/* Pacientes Já Medicados */}
                <div className="pacientes-dashboard-col">
                    <h1 style={{ color: "#666", textAlign: "center", margin: "32px 0 16px 0" }}>Pacientes Já Medicados</h1>
                    <div className="paciente-list-cards paciente-list-cards-wrap">
                        {pacientesJaMedicados.length > 0 ? (
                            pacientesJaMedicados.slice(-6).reverse().map((paciente) => (
                                <div key={paciente.id} className="paciente-card-modern" style={getCardStyle("medicado")}>
                                    <div className="paciente-card-header">
                                        <div>
                                            <span className="paciente-card-title">{paciente.nome}</span>
                                            <div className="paciente-card-subtitle">
                                                Quarto {paciente.quarto} &nbsp;|&nbsp; Idade: {paciente.idade}
                                            </div>
                                            <div className="paciente-card-subtitle">
                                                Nascimento: {paciente.data_nascimento}
                                            </div>
                                        </div>
                                        {paciente.foto_url && (
                                            <img
                                                src={paciente.foto_url}
                                                alt="Foto do paciente"
                                                className="paciente-card-foto"
                                            />
                                        )}
                                    </div>
                                    <div className="paciente-card-body">
                                        <ul className="paciente-card-meds">
                                            {paciente.paciente_medicamentos.map((item, index) => (
                                                <li key={index}>
                                                    <span className="paciente-card-med-nome">{item.medicamento.nome}</span>
                                                    <div className="paciente-card-med-info">
                                                        Horário: {item.horario_dose} &nbsp;|&nbsp; Intervalo: {item.intervalo_horas}h
                                                    </div>
                                                    <div className="paciente-card-med-info">
                                                        Uso crônico: {item.uso_cronico ? "Sim" : "Não"}
                                                        {item.dias_tratamento && (
                                                            <> &nbsp;|&nbsp; Dias: {item.dias_tratamento}</>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: "center" }}>Nenhum paciente foi medicado recentemente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PacienteList;