import React, { useState, useEffect } from "react";
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
                const margemMinutos = 15;

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

        fetchPacientes();

        // Atualiza a lista a cada 5 minutos
        const interval = setInterval(fetchPacientes, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const marcarComoMedicado = async (pacienteId, medicamentoId, isAtrasado = false) => {
        console.log(`Marcando como medicado: Paciente ID ${pacienteId}, Medicamento ID ${medicamentoId}`);

        // Atualiza o status do medicamento para "medicado" e define o updated_at manualmente
        const { error: updateError } = await supabase
            .from("paciente_medicamentos")
            .update({
                medicado: true,
                updated_at: new Date().toISOString(), // Define o valor de updated_at manualmente
            })
            .match({ paciente_id: pacienteId, medicamento_id: medicamentoId });

        if (updateError) {
            console.error("Erro ao registrar medicação:", updateError);
            return;
        }

        console.log("Medicação registrada com sucesso!");

        // Busca o valor atual do estoque na tabela estoque_medicamentos
        const { data: estoqueData, error: fetchError } = await supabase
            .from("estoque_medicamentos")
            .select("quantidade")
            .eq("medicamento_id", medicamentoId)
            .single();

        if (fetchError) {
            console.error("Erro ao buscar o estoque do medicamento:", fetchError);
            return;
        }

        const estoqueAtual = estoqueData.quantidade;

        // Verifica se há estoque disponível
        if (estoqueAtual <= 0) {
            console.error("Estoque insuficiente para o medicamento.");
            return;
        }

        // Atualiza o estoque do medicamento na tabela estoque_medicamentos
        const { error: estoqueError } = await supabase
            .from("estoque_medicamentos")
            .update({ quantidade: estoqueAtual - 1 })
            .match({ medicamento_id: medicamentoId });

        if (estoqueError) {
            console.error("Erro ao atualizar o estoque do medicamento:", estoqueError);
            return;
        }

        console.log("Estoque do medicamento atualizado com sucesso!");

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
