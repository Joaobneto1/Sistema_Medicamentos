import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";

const EstoqueMedicamentos = () => {
    const [estoque, setEstoque] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [novoMedicamento, setNovoMedicamento] = useState({
        nome: "",
        descricao: "",
        dose: 0
    });
    const [novoEstoque, setNovoEstoque] = useState({
        medicamento_id: "",
        quantidade: 0,
        atualizado_em: ""
    });
    const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
    const [showEstoqueModal, setShowEstoqueModal] = useState(false);

    useEffect(() => {
        const fetchEstoque = async () => {
            const { data, error } = await supabase
                .from("estoque_medicamentos")
                .select("id, quantidade, atualizado_em, medicamento:medicamento_id(nome, descricao, dose_mg)");
            if (error) {
                console.error("Erro ao buscar estoque:", error);
            } else {
                setEstoque(data);
            }
        };

        const fetchMedicamentos = async () => {
            const { data, error } = await supabase.from("medicamentos").select("id, nome");
            if (error) {
                console.error("Erro ao buscar medicamentos:", error);
            } else {
                setMedicamentos(data);
            }
        };

        fetchEstoque();
        fetchMedicamentos();
    }, []);

    const handleAddMedicamento = async (e) => {
        e.preventDefault();
        if (!novoMedicamento.nome || !novoMedicamento.descricao || novoMedicamento.dose <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const { error } = await supabase
            .from("medicamentos")
            .insert([{ 
                nome: novoMedicamento.nome, 
                descricao: novoMedicamento.descricao, 
                dose_mg: novoMedicamento.dose 
            }]);

        if (error) {
            console.error("Erro ao adicionar medicamento:", error);
            alert("Erro ao adicionar medicamento.");
        } else {
            alert("Medicamento adicionado com sucesso!");
            setShowMedicamentoModal(false);
            setNovoMedicamento({ nome: "", descricao: "", dose: 0 });
            const { data: updatedMedicamentos } = await supabase.from("medicamentos").select("id, nome");
            setMedicamentos(updatedMedicamentos);
        }
    };

    const handleAddEstoque = async (e) => {
        e.preventDefault();
        if (!novoEstoque.medicamento_id || novoEstoque.quantidade <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const { error } = await supabase
            .from("estoque_medicamentos")
            .insert([{ 
                medicamento_id: novoEstoque.medicamento_id, 
                quantidade: novoEstoque.quantidade, 
                atualizado_em: novoEstoque.atualizado_em 
            }]);

        if (error) {
            console.error("Erro ao adicionar ao estoque:", error);
            alert("Erro ao adicionar ao estoque.");
        } else {
            alert("Estoque adicionado com sucesso!");
            setShowEstoqueModal(false);
            setNovoEstoque({ medicamento_id: "", quantidade: 0, atualizado_em: "" });
            const { data: estoqueData } = await supabase
                .from("estoque_medicamentos")
                .select("id, quantidade, atualizado_em, medicamento:medicamento_id(nome, descricao, dose_mg)");
            setEstoque(estoqueData);
        }
    };

    return (
        <div className="estoque-container">
            <h1 className="estoque-title">Estoque de Medicamentos</h1>
            <div className="estoque-list">
                {estoque.map((item) => (
                    <div key={item.id} className="estoque-card">
                        <p><strong>Nome:</strong> {item.medicamento.nome}</p>
                        <p><strong>Descrição:</strong> {item.medicamento.descricao}</p>
                        <p><strong>Dose (mg):</strong> {item.medicamento.dose_mg}</p>
                        <p><strong>Quantidade:</strong> {item.quantidade}</p>
                        <p><strong>Última atualização:</strong> {new Date(item.atualizado_em).toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => setShowMedicamentoModal(true)}>Adicionar Medicamento</button>
            <button onClick={() => setShowEstoqueModal(true)}>Adicionar Estoque</button>

            {showMedicamentoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Adicionar Medicamento</h2>
                        <form onSubmit={handleAddMedicamento}>
                            <input
                                type="text"
                                placeholder="Nome"
                                value={novoMedicamento.nome}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, nome: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Descrição"
                                value={novoMedicamento.descricao}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, descricao: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Dose (mg)"
                                value={novoMedicamento.dose}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dose: parseInt(e.target.value, 10) })}
                                required
                            />
                            <button type="submit">Salvar</button>
                            <button type="button" onClick={() => setShowMedicamentoModal(false)}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

            {showEstoqueModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Adicionar Estoque</h2>
                        <form onSubmit={handleAddEstoque}>
                            <select
                                value={novoEstoque.medicamento_id}
                                onChange={(e) => setNovoEstoque({ ...novoEstoque, medicamento_id: e.target.value })}
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
                                type="number"
                                placeholder="Quantidade"
                                value={novoEstoque.quantidade}
                                onChange={(e) => setNovoEstoque({ ...novoEstoque, quantidade: parseInt(e.target.value, 10) })}
                                required
                            />
                            <input
                                type="datetime-local"
                                placeholder="Última Atualização"
                                value={novoEstoque.atualizado_em}
                                onChange={(e) => setNovoEstoque({ ...novoEstoque, atualizado_em: e.target.value })}
                                required
                            />
                            <button type="submit">Salvar</button>
                            <button type="button" onClick={() => setShowEstoqueModal(false)}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EstoqueMedicamentos;
