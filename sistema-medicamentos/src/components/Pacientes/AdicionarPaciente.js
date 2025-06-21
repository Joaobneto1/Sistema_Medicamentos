import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Novo client axios
import supabase from "../../services/supabaseClient";
import "./PacienteManager.css";

const AdicionarPaciente = () => {
    const [novoPaciente, setNovoPaciente] = useState({ nome: "", idade: "", data_nascimento: "", quarto: "", foto_url: "" });
    const [medicamentos, setMedicamentos] = useState([]);
    const [associacoes, setAssociacoes] = useState([
        { medicamento_id: "", horario_dose: "", intervalo_horas: "", uso_cronico: false, dias_tratamento: "" }
    ]);
    const [uploadingFoto, setUploadingFoto] = useState(false);
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
        // Busca medicamentos via backend
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

    const handleAddPaciente = async (e) => {
        e.preventDefault();
        if (!novoPaciente.nome || novoPaciente.idade <= 0 || !novoPaciente.data_nascimento || !novoPaciente.quarto) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        // Converte data_nascimento para YYYY-MM-DD se vier em formato brasileiro
        let dataNascimento = novoPaciente.data_nascimento;
        if (dataNascimento && dataNascimento.includes("/")) {
            const [dia, mes, ano] = dataNascimento.split("/").map(s => s.trim());
            dataNascimento = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
        }

        try {
            // Envia paciente e associações para o backend
            console.log("Associacoes enviadas:", associacoes);
            await api.post("/pacientes", {
                ...novoPaciente,
                data_nascimento: dataNascimento,
                medicamentos: associacoes.filter(
                    (associacao) => associacao.medicamento_id && associacao.horario_dose && associacao.intervalo_horas > 0
                ),
            });
            alert("Paciente adicionado com sucesso!");
            navigate("/pacientes");
        } catch (error) {
            console.error("Erro ao adicionar paciente:", error);
            alert("Erro ao adicionar paciente. Verifique os dados e tente novamente.");
        }
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

    // Mantém o upload da foto no Supabase Storage
    const handleFotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingFoto(true);
        const filePath = `pacientes/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('fotos-pacientes')
            .upload(filePath, file);

        console.log("Resposta do upload Supabase:", { data, error });

        if (error) {
            console.error("Erro detalhado do Supabase Storage:", error);
            alert("Erro ao fazer upload da foto.");
            setUploadingFoto(false);
            return;
        }

        // Corrigido: pega a URL pública corretamente
        const { data: publicUrlData } = supabase
            .storage
            .from('fotos-pacientes')
            .getPublicUrl(filePath);

        const publicURL = publicUrlData?.publicUrl;
        console.log("URL pública gerada:", publicURL, "filePath:", filePath);

        setNovoPaciente((prev) => ({ ...prev, foto_url: publicURL }));
        setUploadingFoto(false);
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
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    disabled={uploadingFoto}
                />
                {uploadingFoto && <span>Enviando foto...</span>}
                {novoPaciente.foto_url && (
                    <img src={novoPaciente.foto_url} alt="Foto do paciente" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                )}
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
                                <button type="button" onClick={() => navigate("/pacientes")}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Botão Salvar único no final do formulário */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <button
                        type="submit"
                        className="save-button"
                        disabled={uploadingFoto}
                    >
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdicionarPaciente;
