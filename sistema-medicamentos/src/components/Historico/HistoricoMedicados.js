import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import "./HistoricoMedicados.css";

const HistoricoMedicados = () => {
    const [historico, setHistorico] = useState({});
    const [pacientes, setPacientes] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [filtros, setFiltros] = useState({
        paciente: "",
        dia: "",
        horarioInicio: "",
        horarioFim: "",
        medicamento: "",
    });

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const { data } = await api.get("/pacientes");
                setPacientes(data);
            } catch (error) {
                console.error("Erro ao buscar pacientes:", error);
            }
        };

        fetchPacientes();
    }, []);

    useEffect(() => {
        const fetchMedicamentos = async () => {
            try {
                const { data } = await api.get("/medicamentos");
                setMedicamentos(data);
            } catch (error) {
                console.error("Erro ao buscar medicamentos:", error);
            }
        };

        fetchMedicamentos();
    }, []);

    const fetchHistorico = useCallback(async () => {
        try {
            const params = {};
            if (filtros.paciente) params.paciente = filtros.paciente;
            if (filtros.dia) params.dia = filtros.dia;
            if (filtros.horarioInicio) params.horarioInicio = filtros.horarioInicio;
            if (filtros.horarioFim) params.horarioFim = filtros.horarioFim;
            if (filtros.medicamento) params.medicamento = filtros.medicamento;

            const { data } = await api.get("/historico", { params });

            const agrupadoPorDia = data.reduce((acc, item) => {
                const dataFormatada = new Date(item.updated_at).toLocaleDateString();
                if (!acc[dataFormatada]) {
                    acc[dataFormatada] = [];
                }
                acc[dataFormatada].push(item);
                return acc;
            }, {});

            setHistorico(agrupadoPorDia);
        } catch (error) {
            console.error("Erro ao buscar histórico de pacientes medicados:", error);
        }
    }, [filtros]);

    useEffect(() => {
        fetchHistorico();
    }, [fetchHistorico]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="historico-container">
            <h1>Histórico de Pacientes Medicados</h1>

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

            {Object.keys(historico).length > 0 ? (
                Object.keys(historico).map((dia) => (
                    <div key={dia} className="historico-dia">
                        <h2>{dia}</h2>
                        <ul>
                            {historico[dia].map((item) => (
                                <li key={`${item.paciente_id}-${item.medicamento_id}-${item.updated_at}`} className="historico-item">
                                    <p><strong>Paciente:</strong> {item.paciente?.nome || "Desconhecido"}</p>
                                    <p><strong>Medicamento:</strong> {item.medicamento?.nome || "Desconhecido"}</p>
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
