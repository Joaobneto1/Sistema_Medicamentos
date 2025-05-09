import React, { useState, useEffect } from "react";
import supabase from "../../services/supabaseClient";

const EstoqueMedicamentos = () => {
    const [estoque, setEstoque] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [novoEstoque, setNovoEstoque] = useState({
        medicamento_id: "",
        quantidade: 0
    });
    const [atualizarEstoque, setAtualizarEstoque] = useState({
        estoque_id: "",
        quantidade: 0
    });

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

    const adicionarAoEstoque = async () => {
        if (!novoEstoque.medicamento_id || novoEstoque.quantidade <= 0) return;

        const { data, error } = await supabase
            .from("estoque_medicamentos")
            .insert([novoEstoque]);

        if (error) {
            console.error("Erro ao adicionar ao estoque:", error);
        } else if (data && Array.isArray(data)) {
            setEstoque([...estoque, ...data]);
            setNovoEstoque({ medicamento_id: "", quantidade: 0 });
        } else {
            console.error("Erro inesperado: retorno inválido do Supabase.");
        }
    };

    const atualizarQuantidadeEstoque = async () => {
        if (!atualizarEstoque.estoque_id || atualizarEstoque.quantidade < 0) return;

        const { data, error } = await supabase
            .from("estoque_medicamentos")
            .update({ quantidade: atualizarEstoque.quantidade })
            .eq("id", atualizarEstoque.estoque_id);

        if (error) {
            console.error("Erro ao atualizar quantidade no estoque:", error);
        } else {
            setEstoque(
                estoque.map((item) =>
                    item.id === atualizarEstoque.estoque_id
                        ? { ...item, quantidade: atualizarEstoque.quantidade }
                        : item
                )
            );
            setAtualizarEstoque({ estoque_id: "", quantidade: 0 });
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
            <div className="adicionar-estoque">
                <h2>Adicionar Medicamento ao Estoque</h2>
                <select
                    value={novoEstoque.medicamento_id}
                    onChange={(e) => setNovoEstoque({ ...novoEstoque, medicamento_id: e.target.value })}
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
                    value={novoEstoque.quantidade}
                    onChange={(e) => setNovoEstoque({ ...novoEstoque, quantidade: parseInt(e.target.value) })}
                    placeholder="Quantidade"
                />
                <button onClick={adicionarAoEstoque}>Adicionar ao Estoque</button>
            </div>
            <div className="atualizar-estoque">
                <h2>Atualizar Quantidade no Estoque</h2>
                <select
                    value={atualizarEstoque.estoque_id}
                    onChange={(e) => setAtualizarEstoque({ ...atualizarEstoque, estoque_id: e.target.value })}
                >
                    <option value="">Selecione um item do estoque</option>
                    {estoque.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.medicamento.nome}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    value={atualizarEstoque.quantidade}
                    onChange={(e) => setAtualizarEstoque({ ...atualizarEstoque, quantidade: parseInt(e.target.value) })}
                    placeholder="Nova Quantidade"
                />
                <button onClick={atualizarQuantidadeEstoque}>Atualizar Estoque</button>
            </div>
        </div>
    );
};

export default EstoqueMedicamentos;
