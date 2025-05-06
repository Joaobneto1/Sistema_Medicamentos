import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import styles from './MedicamentoCard.module.css';

const MedicamentoCard = () => {
    const [novoMedicamento, setNovoMedicamento] = useState({
        nome: '',
        dosagem: '',
        descricao: '',
        horarios: '',
        paciente_id: '',
        estoque: 0,
        frequencia: 0,
    });
    const [pacientes, setPacientes] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchPacientes = async () => {
            const { data, error } = await supabase.from('pacientes').select('*');
            if (error) {
                console.error('Erro ao buscar pacientes:', error);
            } else {
                setPacientes(data);
            }
        };

        fetchPacientes();
    }, []);

    const handleAdd = async () => {
        if (!novoMedicamento.nome || !novoMedicamento.dosagem || !novoMedicamento.descricao ||
            !novoMedicamento.horarios || !novoMedicamento.paciente_id || novoMedicamento.estoque <= 0 ||
            novoMedicamento.frequencia <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const { data, error } = await supabase.from('medicamentos').insert([novoMedicamento]);
        if (error) {
        } else {
            alert('Medicamento adicionado com sucesso!');
            setNovoMedicamento({ nome: '', dosagem: '', descricao: '', horarios: '', paciente_id: '', estoque: 0, frequencia: 0 });
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
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAdd();
                        }}>
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
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Horário"
                                value={novoMedicamento.horarios}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, horarios: e.target.value })}
                                required
                            />
                            <select
                                className={styles.input}
                                value={novoMedicamento.paciente_id}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, paciente_id: parseInt(e.target.value, 10) })}
                                required
                            >
                                <option value="">Selecione um paciente</option>
                                {pacientes.map((paciente) => (
                                    <option key={paciente.id} value={paciente.id}>
                                        {paciente.nome}
                                    </option>
                                ))}
                            </select>

                            <label className={styles.label} htmlFor="estoque">Estoque:</label>
                            <input
                                id="estoque"
                                type="number"
                                className={styles.input}
                                placeholder="Digite a quantidade em estoque"
                                value={novoMedicamento.estoque}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, estoque: parseInt(e.target.value, 10) })}
                                required
                            />

                            <label className={styles.label} htmlFor="frequencia">Frequência:</label>
                            <input
                                id="frequencia"
                                type="number"
                                className={styles.input}
                                placeholder="Digite a frequência de uso"
                                value={novoMedicamento.frequencia}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, frequencia: parseInt(e.target.value, 10) })}
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
