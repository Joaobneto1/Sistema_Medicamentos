import React, { useState } from 'react';
import supabase from '../../services/supabaseClient';
import styles from './MedicamentoCard.module.css';

const MedicamentoCard = () => {
    const [novoMedicamento, setNovoMedicamento] = useState({ nome: '', dosagem: '', descricao: '' });
    const [showModal, setShowModal] = useState(false);

    const handleAdd = async () => {
        const { error } = await supabase.from('medicamentos').insert([novoMedicamento]);
        if (error) {
            console.error('Erro ao adicionar medicamento:', error);
        } else {
            alert('Medicamento adicionado com sucesso!');
            setNovoMedicamento({ nome: '', dosagem: '', descricao: '' });
            setShowModal(false);
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.openModalButton} onClick={() => setShowModal(true)}>
                Adicionar Medicamento
            </button>
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Adicionar Medicamento</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
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
                            <button type="submit" className={styles.submitButton}>Salvar</button>
                            <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicamentoCard;
