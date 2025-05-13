import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

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
                        medicado
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

    const marcarComoMedicado = async (pacienteId, medicamentoId) => {
        console.log(`Marcando como medicado: Paciente ID ${pacienteId}, Medicamento ID ${medicamentoId}`);
        const { error } = await supabase
            .from("paciente_medicamentos")
            .update({ medicado: true })
            .match({ paciente_id: pacienteId, medicamento_id: medicamentoId });

        if (error) {
            console.error("Erro ao registrar medicação:", error);
        } else {
            console.log("Medicação registrada com sucesso!");

            // Atualiza o estado local para mover o paciente para a seção correta
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

            setPacientesJaMedicados((prevMedicados) => {
                const pacienteAtualizado = pacientes.find((paciente) => paciente.id === pacienteId);
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
        }
    };

    return (
        <div className="paciente-manager-container">
            <h1>Pacientes a Serem Medicados</h1>
            <div className="paciente-list">
                {pacientes.length > 0 ? (
                    pacientes.map((paciente) => (
                        <div key={paciente.id} className="paciente-card">
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
                        <div key={paciente.id} className="paciente-card">
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
                        <div key={paciente.id} className="paciente-card">
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
