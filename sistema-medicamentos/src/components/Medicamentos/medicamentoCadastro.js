import React, { useState } from 'react';
import supabase from '../../services/supabaseClient';
import './medicamentoCadastro.css';

const MedicamentoCadastro = () => {
    const [novoMedicamento, setNovoMedicamento] = useState({
        nome: '',
        dosagem: '',
        descricao: '',
        horarios: '',
        estoque: 0,
        frequencia: 0,
    });

    const handleAdd = async () => {
        const { error } = await supabase.from('medicamentos').insert([novoMedicamento]);
        if (error) {
            console.error('Erro ao adicionar medicamento:', error);
        } else {
            alert('Medicamento cadastrado com sucesso!');
            setNovoMedicamento({ nome: '', dosagem: '', descricao: '', horarios: '', estoque: 0, frequencia: 0 });
        }
    };

    return (
        <div className="container">
            <h1 className="title">Cadastro de Medicamentos</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Nome"
                    value={novoMedicamento.nome}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, nome: e.target.value })}
                    required
                />
                <input
                    type="text"
                    className="input"
                    placeholder="Dosagem"
                    value={novoMedicamento.dosagem}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dosagem: e.target.value })}
                    required
                />
                <textarea
                    className="textarea"
                    placeholder="Descrição"
                    value={novoMedicamento.descricao}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, descricao: e.target.value })}
                    required
                />
                <input
                    type="text"
                    className="input"
                    placeholder="Horários"
                    value={novoMedicamento.horarios}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, horarios: e.target.value })}
                    required
                />
                <label className="label">Estoque</label>
                <input
                    type="number"
                    className="input"
                    placeholder="Estoque"
                    value={novoMedicamento.estoque}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, estoque: parseInt(e.target.value, 10) })}
                    required
                />
                <label className="label">Frequência</label>
                <input
                    type="number"
                    className="input"
                    placeholder="Frequência"
                    value={novoMedicamento.frequencia}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, frequencia: parseFloat(e.target.value) })}
                    required
                />
                <button type="submit" className="submitButton">Cadastrar</button>
            </form>
        </div>
    );
};

export default MedicamentoCadastro;
