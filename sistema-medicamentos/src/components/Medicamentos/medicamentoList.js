import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import styles from './MedicamentoCard.module.css'; // Reutilizando o estilo do MedicamentoCard

const MedicamentoList = () => {
    const [medicamentos, setMedicamentos] = useState([]);
    const [novoMedicamento, setNovoMedicamento] = useState({ nome: '', dosagem: '', descricao: '' });

    useEffect(() => {
        const fetchMedicamentos = async () => {
            const { data, error } = await supabase.from('medicamentos').select('*');
            if (error) {
                console.error('Erro ao buscar medicamentos:', error);
            } else {
                setMedicamentos(data);
            }
        };

        fetchMedicamentos();
    }, []);

    const handleDelete = async (id) => {
        const { error } = await supabase.from('medicamentos').delete().eq('id', id);
        if (error) {
            console.error('Erro ao deletar medicamento:', error);
        } else {
            setMedicamentos(medicamentos.filter(med => med.id !== id));
        }
    };

    const handleEdit = async (id) => {
        const medicamento = medicamentos.find(med => med.id === id);
        const novoNome = prompt('Editar nome:', medicamento.nome);
        const novaDosagem = prompt('Editar dosagem:', medicamento.dosagem);
        const novaDescricao = prompt('Editar descrição:', medicamento.descricao);

        if (novoNome && novaDosagem && novaDescricao) {
            const { error } = await supabase
                .from('medicamentos')
                .update({ nome: novoNome, dosagem: novaDosagem, descricao: novaDescricao })
                .eq('id', id);

            if (error) {
                console.error('Erro ao editar medicamento:', error);
            } else {
                setMedicamentos(medicamentos.map(med => med.id === id ? { ...med, nome: novoNome, dosagem: novaDosagem, descricao: novaDescricao } : med));
            }
        }
    };

    const handleAdd = async () => {
        const { data, error } = await supabase.from('medicamentos').insert([novoMedicamento]);
        if (error) {
            console.error('Erro ao adicionar medicamento:', error);
        } else {
            setMedicamentos([...medicamentos, ...data]);
            setNovoMedicamento({ nome: '', dosagem: '', descricao: '' });
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Lista de Medicamentos</h1>
            <ul className={styles.list}>
                {medicamentos.map(med => (
                    <li key={med.id} className={styles.listItem}>
                        <strong>Nome:</strong> {med.nome} <br />
                        <strong>Dosagem:</strong> {med.dosagem} <br />
                        <strong>Descrição:</strong> {med.descricao} <br />
                        <button className={`${styles.button} ${styles.buttonEdit}`} onClick={() => handleEdit(med.id)}>Editar</button>
                        <button className={`${styles.button} ${styles.buttonDelete}`} onClick={() => handleDelete(med.id)}>Deletar</button>
                    </li>
                ))}
            </ul>
            <h2>Adicionar Medicamento</h2>
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Nome"
                    value={novoMedicamento.nome}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, nome: e.target.value })}
                    required
                />
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Dosagem"
                    value={novoMedicamento.dosagem}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dosagem: e.target.value })}
                    required
                />
                <textarea
                    className={styles.textarea}
                    placeholder="Descrição"
                    value={novoMedicamento.descricao}
                    onChange={(e) => setNovoMedicamento({ ...novoMedicamento, descricao: e.target.value })}
                    required
                />
                <button type="submit" className={styles.submitButton}>Adicionar</button>
            </form>
        </div>
    );
};

export default MedicamentoList;
