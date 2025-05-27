import React, { useState, useEffect, useRef } from "react";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

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
                        medicamento:medicamento_id(nome), 
                        horario_dose, 
                        intervalo_horas, 
                        medicado,
                        uso_cronico,
                        dias_tratamento,
                        updated_at
                    )
                `);

            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                const horaAtual = new Date();
                const margemMinutos = 5;

                const pacientesParaMedicar = [];
                const pacientesMedicados = [];
                const pacientesNaoMedicados = [];

                data.forEach((paciente) => {
                    const medicamentosParaMedicar = [];
                    const medicamentosMedicados = [];
                    const medicamentosNaoMedicados = [];

                    paciente.paciente_medicamentos.forEach((medicamento) => {
                        // Parse do horário da dose
                        const [horas, minutos] = medicamento.horario_dose.split(":").map(Number);
                        const horarioDose = new Date(horaAtual);
                        horarioDose.setHours(horas, minutos, 0, 0);

                        let podeMedicar = false;
                        let estaAtrasado = false;
                        let jaMedicado = false;

                        // Se já foi medicado, verificar se já passou o intervalo
                        if (medicamento.medicado && medicamento.updated_at && medicamento.intervalo_horas) {
                            const ultimaMed = new Date(medicamento.updated_at);
                            const proximaDose = new Date(ultimaMed.getTime() + medicamento.intervalo_horas * 60 * 60 * 1000);

                            if (horaAtual >= proximaDose) {
                                // Após o intervalo, pode medicar novamente
                                // Se já passou do horário da dose, está atrasado
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
                            // Nunca foi medicado, considerar horário da dose
                            const diferencaMinutos = Math.floor((horarioDose - horaAtual) / (1000 * 60));
                            if (diferencaMinutos >= 0 && diferencaMinutos <= margemMinutos) {
                                podeMedicar = true;
                            } else if (diferencaMinutos < 0) {
                                estaAtrasado = true;
                            }
                        }

                        // --- NOVO: sempre permitir que doses futuras do mesmo medicamento apareçam ---
                        if (medicamento.medicado && medicamento.updated_at && medicamento.intervalo_horas) {
                            const ultimaMed = new Date(medicamento.updated_at);
                            const proximaDose = new Date(ultimaMed.getTime() + medicamento.intervalo_horas * 60 * 60 * 1000);
                            if (horarioDose > horaAtual && horaAtual >= proximaDose) {
                                podeMedicar = true;
                                jaMedicado = false;
                            }
                        }
                        // --- FIM NOVO ---

                        if (podeMedicar) {
                            medicamentosParaMedicar.push(medicamento);
                        } else if (jaMedicado) {
                            medicamentosMedicados.push(medicamento);
                        } else if (estaAtrasado) {
                            medicamentosNaoMedicados.push(medicamento);
                        }
                    });

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
            }
        };

        const fetchAlertasEstoque = async () => {
            const { data, error } = await supabase
                .from("estoque_medicamentos")
                .select("quantidade, medicamento:medicamento_id(nome)")
                .lte("quantidade", 5);

            if (!error && data && data.length > 0) {
                setAlertasEstoque(data);

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
            } else {
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
        // Busca o valor atual do estoque na tabela estoque_medicamentos
        const { data: estoqueData, error: fetchError } = await supabase
            .from("estoque_medicamentos")
            .select("quantidade")
            .eq("medicamento_id", medicamentoId)
            .single();

        if (fetchError) {
            setAlertaMensagem("Erro ao buscar o estoque do medicamento.");
            setAlertaVisivel(true);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
            alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 4000);
            return;
        }

        const estoqueAtual = estoqueData.quantidade;

        // Se não há estoque, alerta e bloqueia
        if (estoqueAtual <= 0) {
            setAlertaMensagem("Não é possível medicar: medicamento sem estoque!");
            setAlertaVisivel(true);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
            alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 4000);
            return;
        }

        // Se é o último, alerta visual
        if (estoqueAtual === 1) {
            setAlertaMensagem("Atenção: esse é o último medicamento em estoque!");
            setAlertaVisivel(true);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
            alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 4000);
        }

        // Atualiza o status do medicamento para "medicado" e define o updated_at manualmente
        const { error: updateError } = await supabase
            .from("paciente_medicamentos")
            .update({
                medicado: true,
                updated_at: new Date().toISOString(),
            })
            .match({ paciente_id: pacienteId, medicamento_id: medicamentoId });

        if (updateError) {
            setAlertaMensagem("Erro ao registrar medicação.");
            setAlertaVisivel(true);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
            alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 4000);
            return;
        }

        // Atualiza o estoque do medicamento na tabela estoque_medicamentos
        const { error: estoqueError } = await supabase
            .from("estoque_medicamentos")
            .update({ quantidade: estoqueAtual - 1 })
            .match({ medicamento_id: medicamentoId });

        if (estoqueError) {
            setAlertaMensagem("Erro ao atualizar o estoque do medicamento.");
            setAlertaVisivel(true);
            if (alertaTimeout.current) clearTimeout(alertaTimeout.current);
            alertaTimeout.current = setTimeout(() => setAlertaVisivel(false), 4000);
            return;
        }

        // Atualiza o estado local
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
                <div
                    style={{
                        position: "fixed",
                        top: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#ff9800",
                        color: "#fff",
                        padding: "12px 32px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 3000,
                        fontWeight: 600,
                        fontSize: 16,
                        opacity: alertaVisivel ? 1 : 0,
                        transition: "opacity 1s"
                    }}
                >
                    {alertaMensagem}
                </div>
            )}

            {/* Sino de alerta de estoque */}
            <div style={{ position: "fixed", top: 20, right: 30, zIndex: 1000 }}>
                <button
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        position: "relative"
                    }}
                    onClick={() => setShowAlertModal(true)}
                    title="Alertas de Estoque"
                >
                    {/* Ícone de sino */}
                    <span style={{ fontSize: 32, color: alertasEstoque.length > 0 ? "#ff9800" : "#888" }}>
                        &#128276;
                    </span>
                    {alertasEstoque.length > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                background: "#ff9800",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            {alertasEstoque.length}
                        </span>
                    )}
                </button>
            </div>
            {/* Modal de alertas/histórico */}
            {showAlertModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.3)",
                        zIndex: 2000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onClick={() => setShowAlertModal(false)}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 8,
                            padding: 24,
                            minWidth: 320,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            position: "relative"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0 }}>Histórico de Alertas de Estoque Baixo</h2>
                        {historicoAlertas.length === 0 ? (
                            <p>Nenhum alerta no histórico.</p>
                        ) : (
                            <ul style={{ padding: 0, listStyle: "none" }}>
                                {historicoAlertas.map((item) => (
                                    <li key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                        <span style={{ flex: 1 }}>
                                            <strong>{item.medicamentoNome}</strong> - Estoque: {item.quantidade}
                                        </span>
                                        <button
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#ff6b6b",
                                                fontSize: 18,
                                                cursor: "pointer",
                                                marginLeft: 8
                                            }}
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
                            style={{
                                marginTop: 16,
                                background: "#2196f3",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "8px 16px",
                                cursor: "pointer"
                            }}
                            onClick={() => setShowAlertModal(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
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
    );
};

export default PacienteList;
