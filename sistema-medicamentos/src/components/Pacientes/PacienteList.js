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
                    paciente_medicamentos(
                        medicamento_id, 
                        medicamento:medicamento_id(nome), 
                        horario_dose, 
                        intervalo_horas, 
                        medicado,
                        uso_cronico,
                        dias_tratamento
                    )
                `);

            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                const horaAtual = new Date();
                const margemMinutos = 15; // Margem de 15 minutos para considerar horários próximos

                const pacientesParaMedicar = [];
                const pacientesMedicados = [];
                const pacientesNaoMedicados = [];

                data.forEach((paciente) => {
                    const medicamentosParaMedicar = [];
                    const medicamentosMedicados = [];
                    const medicamentosNaoMedicados = [];

                    paciente.paciente_medicamentos.forEach((medicamento) => {
                        const [horas, minutos] = medicamento.horario_dose.split(":").map(Number);
                        const horarioDose = new Date(horaAtual);
                        horarioDose.setHours(horas, minutos, 0, 0);

                        // Ajuste para garantir precisão no cálculo da diferença
                        const diferencaMinutos = Math.floor((horarioDose - horaAtual) / (1000 * 60));

                        if (medicamento.medicado) {
                            medicamentosMedicados.push(medicamento);
                        } else if (diferencaMinutos >= 0 && diferencaMinutos <= margemMinutos) {
                            medicamentosParaMedicar.push(medicamento);
                        } else if (diferencaMinutos < 0) {
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

    const getCardClass = (status) => {
        if (status === "atrasado") return "paciente-card atrasado";
        if (status === "medicado") return "paciente-card medicado";
        if (status === "proximo") return "paciente-card proximo";
        return "paciente-card";
    };

    return (
        <div className="paciente-manager-container">
            <h1>Pacientes a Serem Medicados</h1>
            <div className="paciente-list">
                {pacientes.length > 0 ? (
                    pacientes.map((paciente) => (
                        <div key={paciente.id} className="paciente-card proximo">
                            <p><strong>Nome:</strong> {paciente.nome}</p>
                            <p><strong>Idade:</strong> {paciente.idade}</p>
                            <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
                            <p><strong>Medicamentos:</strong></p>
                            <ul>
                                {paciente.paciente_medicamentos.map((item, index) => (
                                    <li key={index}>
                                        <strong>{item.medicamento.nome}</strong>
                                        <br />
                                        Horário: {item.horario_dose}
                                        <br />
                                        Intervalo: {item.intervalo_horas} horas
                                        <br />
                                        Uso crônico: {item.uso_cronico ? "Sim" : "Não"}
                                        <br />
                                        {item.uso_cronico && item.dias_tratamento && (
                                            <>
                                                Dias de tratamento: {item.dias_tratamento}
                                                <br />
                                                Dias da semana: {calcularDiasSemana(item.dias_tratamento).join(", ")}
                                                <br />
                                            </>
                                        )}
                                        <button
                                            onClick={() =>
                                                marcarComoMedicado(paciente.id, item.medicamento_id)
                                            }
                                        >
                                            Marcar como Medicado
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Nenhum paciente precisa ser medicado no momento.</p>
                )}
            </div>

            <h1>Pacientes Já Medicados</h1>
            <div className="paciente-list">
                {pacientesJaMedicados.length > 0 ? (
                    pacientesJaMedicados.map((paciente) => (
                        <div key={paciente.id} className="paciente-card medicado">
                            <p><strong>Nome:</strong> {paciente.nome}</p>
                            <p><strong>Idade:</strong> {paciente.idade}</p>
                            <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
                            <p><strong>Medicamentos Tomados:</strong></p>
                            <ul>
                                {paciente.paciente_medicamentos.map((item, index) => (
                                    <li key={index}>
                                        <strong>{item.medicamento.nome}</strong>
                                        <br />
                                        Horário: {item.horario_dose}
                                        <br />
                                        Intervalo: {item.intervalo_horas} horas
                                        <br />
                                        Uso crônico: {item.uso_cronico ? "Sim" : "Não"}
                                        <br />
                                        {item.uso_cronico && item.dias_tratamento && (
                                            <>
                                                Dias de tratamento: {item.dias_tratamento}
                                                <br />
                                                Dias da semana: {calcularDiasSemana(item.dias_tratamento).join(", ")}
                                                <br />
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Nenhum paciente foi medicado recentemente.</p>
                )}
            </div>

            <h1>Pacientes Atrasados</h1>
            <div className="paciente-list">
                {pacientesAtrasados.length > 0 ? (
                    pacientesAtrasados.map((paciente) => (
                        <div key={paciente.id} className="paciente-card atrasado">
                            <p><strong>Nome:</strong> {paciente.nome}</p>
                            <p><strong>Idade:</strong> {paciente.idade}</p>
                            <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento}</p>
                            <p><strong>Medicamentos Atrasados:</strong></p>
                            <ul>
                                {paciente.paciente_medicamentos.map((item, index) => (
                                    <li key={index}>
                                        <strong>{item.medicamento.nome}</strong>
                                        <br />
                                        Horário: {item.horario_dose}
                                        <br />
                                        Intervalo: {item.intervalo_horas} horas
                                        <br />
                                        Uso crônico: {item.uso_cronico ? "Sim" : "Não"}
                                        <br />
                                        {item.uso_cronico && item.dias_tratamento && (
                                            <>
                                                Dias de tratamento: {item.dias_tratamento}
                                                <br />
                                                Dias da semana: {calcularDiasSemana(item.dias_tratamento).join(", ")}
                                                <br />
                                            </>
                                        )}
                                        <button
                                            onClick={() =>
                                                marcarComoMedicado(paciente.id, item.medicamento_id, true)
                                            }
                                        >
                                            Marcar como Medicado
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Nenhum paciente está atrasado no momento.</p>
                )}
            </div>
        </div>
    );
};

export default PacienteList;
