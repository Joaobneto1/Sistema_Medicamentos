import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./estoqueMedicamentos.css";

const EstoqueMedicamentos = () => {
    const [estoque, setEstoque] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [novoMedicamento, setNovoMedicamento] = useState({
        nome: "",
        descricao: "",
        dose: ""
    });
    const [novoEstoque, setNovoEstoque] = useState({
        medicamento_id: "",
        quantidade: "",
        atualizado_em: ""
    });
    const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
    const [showEstoqueModal, setShowEstoqueModal] = useState(false);
    const [busca, setBusca] = useState("");
    const [editarEstoque, setEditarEstoque] = useState(null); // Estado para edição do estoque
    const [medicamentoParaExcluir, setMedicamentoParaExcluir] = useState(null); // Estado para o modal de confirmação
    const [feedbackMessage, setFeedbackMessage] = useState(""); // Estado para mensagens de feedback

    useEffect(() => {
        const fetchEstoque = async () => {
            try {
                const { data } = await api.get("/estoque");
                setEstoque(data);
            } catch (error) {
                console.error("Erro ao buscar estoque:", error);
            }
        };

        const fetchMedicamentos = async () => {
            try {
                const { data } = await api.get("/medicamentos");
                setMedicamentos(data);
            } catch (error) {
                console.error("Erro ao buscar medicamentos:", error);
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

        try {
            await api.post("/medicamentos", {
                nome: novoMedicamento.nome,
                descricao: novoMedicamento.descricao,
                dose_mg: novoMedicamento.dose
            });
            alert("Medicamento adicionado com sucesso!");
            setShowMedicamentoModal(false);
            setNovoMedicamento({ nome: "", descricao: "", dose: 0 });
            const { data: updatedMedicamentos } = await api.get("/medicamentos");
            setMedicamentos(updatedMedicamentos);
        } catch (error) {
            console.error("Erro ao adicionar medicamento:", error);
            alert("Erro ao adicionar medicamento.");
        }
    };

    const handleAddEstoque = async (e) => {
        e.preventDefault();
        if (!novoEstoque.medicamento_id || novoEstoque.quantidade <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        try {
            await api.post("/estoque", {
                medicamento_id: novoEstoque.medicamento_id,
                quantidade: novoEstoque.quantidade,
                atualizado_em: novoEstoque.atualizado_em
            });
            alert("Estoque adicionado com sucesso!");
            setShowEstoqueModal(false);
            setNovoEstoque({ medicamento_id: "", quantidade: 0, atualizado_em: "" });
            const { data: estoqueData } = await api.get("/estoque");
            setEstoque(estoqueData);
        } catch (error) {
            console.error("Erro ao adicionar ao estoque:", error);
            alert("Erro ao adicionar ao estoque.");
        }
    };

    const handleEditEstoque = async (e) => {
        e.preventDefault();
        if (!editarEstoque || editarEstoque.quantidade <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        try {
            await api.put(`/estoque/${editarEstoque.id}`, {
                quantidade: editarEstoque.quantidade,
                atualizado_em: new Date().toISOString()
            });
            alert("Estoque atualizado com sucesso!");
            setEditarEstoque(null);
            const { data: estoqueData } = await api.get("/estoque");
            setEstoque(estoqueData);
        } catch (error) {
            console.error("Erro ao editar estoque:", error);
            alert("Erro ao editar estoque.");
        }
    };

    const handleDelete = async () => {
        if (!medicamentoParaExcluir) return;

        console.log("ID do medicamento para excluir:", medicamentoParaExcluir.id);

        try {
            await api.delete(`/medicamentos/${medicamentoParaExcluir.id}`);
            setMedicamentos(medicamentos.filter((medicamento) => medicamento.id !== medicamentoParaExcluir.id));
            setEstoque(estoque.filter((item) => item.medicamento_id !== medicamentoParaExcluir.id));
            setFeedbackMessage(`Medicamento "${medicamentoParaExcluir.nome}" deletado com sucesso!`);
        } catch (error) {
            console.error("Erro ao deletar medicamento:", error);
            setFeedbackMessage("Erro ao deletar medicamento.");
        }
        setMedicamentoParaExcluir(null);

        setTimeout(() => setFeedbackMessage(""), 3000);
    };

    // Filtrar medicamentos no estoque com base na barra de pesquisa
    const estoqueFiltrado = estoque.filter((item) =>
        item.medicamento.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="estoque-container">
            <h1 className="estoque-title">Estoque de Medicamentos</h1>

            {/* Exibir mensagem de feedback */}
            {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}

            <div className="top-bar">
                <input
                    type="text"
                    className="barra-pesquisa"
                    placeholder="Buscar medicamento no estoque pelo nome"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <div className="botoes-container">
                    <button className="btn-add" onClick={() => setShowMedicamentoModal(true)}>Adicionar Medicamento</button>
                    <button className="btn-add" onClick={() => setShowEstoqueModal(true)}>Adicionar Estoque</button>
                </div>
            </div>
            <div className="estoque-list">
                {estoqueFiltrado.map((item) => (
                    <div key={item.id} className="estoque-card">
                        <p><strong>Nome:</strong> {item.medicamento.nome}</p>
                        <p><strong>Descrição:</strong> {item.medicamento.descricao}</p>
                        <p><strong>Dose (mg):</strong> {item.medicamento.dose_mg}</p>
                        <p><strong>Quantidade:</strong> {item.quantidade}</p>
                        <p><strong>Última atualização:</strong> {new Date(item.atualizado_em).toLocaleString()}</p>
                        <div className="button-group">
                            <button className="edit-button" onClick={() => setEditarEstoque(item)}>Editar</button>
                            <button
                                className="delete-button"
                                onClick={() => setMedicamentoParaExcluir({ id: item.medicamento_id, nome: item.medicamento.nome })}
                            >
                                Deletar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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
                            <div className="modal-actions">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => setShowMedicamentoModal(false)}>Cancelar</button>
                            </div>
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
                            <div className="modal-actions">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => setShowEstoqueModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editarEstoque && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar Estoque</h2>
                        <form onSubmit={handleEditEstoque}>
                            <p><strong>Medicamento:</strong> {editarEstoque.medicamento.nome}</p>
                            <input
                                type="number"
                                placeholder="Quantidade"
                                value={editarEstoque.quantidade}
                                onChange={(e) => setEditarEstoque({ ...editarEstoque, quantidade: parseInt(e.target.value, 10) })}
                                required
                            />
                            <div className="modal-actions">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => setEditarEstoque(null)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmação */}
            {medicamentoParaExcluir && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmação</h2>
                        <p>Tem certeza que deseja excluir o medicamento "{medicamentoParaExcluir.nome}"?</p>
                        <div className="button-group">
                            <button className="delete-button" onClick={handleDelete}>Sim, excluir</button>
                            <button className="cancel-button" onClick={() => setMedicamentoParaExcluir(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EstoqueMedicamentos;