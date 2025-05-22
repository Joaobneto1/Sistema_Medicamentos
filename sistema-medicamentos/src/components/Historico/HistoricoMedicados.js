import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";
import "./HistoricoMedicados.css";

const HistoricoMedicados = () => {
    const [historico, setHistorico] = useState({});
    const [pacientes, setPacientes] = useState([]); // Lista de pacientes existentes
    const [medicamentos, setMedicamentos] = useState([]); // Lista de medicamentos existentes
    const [filtros, setFiltros] = useState({
        paciente: "",
        dia: "",
        horarioInicio: "",
        horarioFim: "",
        medicamento: "",
    });

    // Buscar pacientes existentes
    useEffect(() => {
        const fetchPacientes = async () => {
            const { data, error } = await supabase
                .from("pacientes")
                .select("id, nome");

            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                setPacientes(data);
            }
        };

        fetchPacientes();
    }, []);

    // Buscar medicamentos existentes
    useEffect(() => {
        const fetchMedicamentos = async () => {
            const { data, error } = await supabase
                .from("medicamentos")
                .select("id, nome");

            if (error) {
                console.error("Erro ao buscar medicamentos:", error);
            } else {
                setMedicamentos(data);
            }
        };

        fetchMedicamentos();
    }, []);

    const fetchHistorico = async () => {
        let query = supabase
            .from("paciente_medicamentos")
            .select(`
                paciente_id,
                medicamento_id,
                horario_dose,
                updated_at,
                pacientes (nome),
                medicamentos (nome)
            `)
            .eq("medicado", true)
            .order("updated_at", { ascending: false });

        // Aplicar filtros
        if (filtros.paciente) {
            query = query.eq("paciente_id", filtros.paciente);
        }
        if (filtros.dia) {
            const diaInicio = new Date(filtros.dia).toISOString();
            const diaFim = new Date(filtros.dia);
            diaFim.setDate(diaFim.getDate() + 1);
            query = query.gte("updated_at", diaInicio).lt("updated_at", diaFim.toISOString());
        }
        if (filtros.horarioInicio && filtros.horarioFim) {
            query = query.gte("horario_dose", filtros.horarioInicio).lte("horario_dose", filtros.horarioFim);
        }
        if (filtros.medicamento) {
            query = query.eq("medicamento_id", filtros.medicamento);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro ao buscar histórico de pacientes medicados:", error);
        } else {
            // Agrupar os dados por dia
            const agrupadoPorDia = data.reduce((acc, item) => {
                const dataFormatada = new Date(item.updated_at).toLocaleDateString();
                if (!acc[dataFormatada]) {
                    acc[dataFormatada] = [];
                }
                acc[dataFormatada].push(item);
                return acc;
            }, {});

            setHistorico(agrupadoPorDia);
        }
    };

    useEffect(() => {
        fetchHistorico();
    }, [filtros]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="historico-container">
            <h1>Histórico de Pacientes Medicados</h1>

            {/* Filtros */}
            <div className="filtros-container">
                <select
                    name="paciente"
                    value={filtros.paciente}
                    onChange={handleFiltroChange}
                    style={{ borderRadius: "30px", border: '1px solid #cce5ff', backgroundColor: 'white' }}
                >
                    <option value="">Selecione um paciente</option>
                    {pacientes.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                            {paciente.nome}
                        </option>
                    ))}
                </select>
                <select
                    name="medicamento"
                    value={filtros.medicamento}
                    onChange={handleFiltroChange}
                    style={{ borderRadius: "30px", border: '1px solid #cce5ff', backgroundColor: 'white' }}
                >
                    <option value="">Selecione um medicamento</option>
                    {medicamentos.map((medicamento) => (
                        <option key={medicamento.id} value={medicamento.id}>
                            {medicamento.nome}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    name="dia"
                    placeholder="Filtrar por dia"
                    value={filtros.dia}
                    onChange={handleFiltroChange}
                />
                <input
                    type="time"
                    name="horarioInicio"
                    placeholder="Horário início"
                    value={filtros.horarioInicio}
                    onChange={handleFiltroChange}
                />
                <input
                    type="time"
                    name="horarioFim"
                    placeholder="Horário fim"
                    value={filtros.horarioFim}
                    onChange={handleFiltroChange}
                />
                <button onClick={fetchHistorico}>Aplicar Filtros</button>
            </div>

            {/* Histórico */}
            {Object.keys(historico).length > 0 ? (
                Object.keys(historico).map((dia) => (
                    <div key={dia} className="historico-dia">
                        <h2>{dia}</h2>
                        <ul>
                            {historico[dia].map((item, index) => (
                                <li key={`${item.paciente_id}-${item.medicamento_id}`} className="historico-item">
                                    <p><strong>Paciente:</strong> {item.pacientes?.nome || "Desconhecido"}</p>
                                    <p><strong>Medicamento:</strong> {item.medicamentos?.nome || "Desconhecido"}</p>
                                    <p><strong>Horário da Dose:</strong> {item.horario_dose}</p>
                                    <p><strong>Data de Administração:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>Nenhum histórico de pacientes medicados encontrado.</p>
            )}
        </div>
    );
};

export default HistoricoMedicados;
