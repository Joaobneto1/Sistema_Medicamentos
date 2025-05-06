import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import styles from './medicamentoList.module.css';

const MedicamentoList = () => {
    const [medicamentos, setMedicamentos] = useState([]);
    const [pacientes, setPacientes] = useState([]); // Estado para armazenar os pacientes
    const [showForm, setShowForm] = useState(false);
    const [novoMedicamento, setNovoMedicamento] = useState({
        nome: '',
        dosagem: '',
        descricao: '',
        horarios: '',
        paciente_id: '',
        estoque: 0,
        frequencia: 0,
    });

    // Função para buscar medicamentos
    const fetchMedicamentos = async () => {
        const { data, error } = await supabase.from('medicamentos').select('*');
        if (error) {
            console.error('Erro ao buscar medicamentos:', error);
        } else {
            setMedicamentos(data);
        }
    };

    // Função para buscar pacientes
    const fetchPacientes = async () => {
        const { data, error } = await supabase.from('pacientes').select('*');
        if (error) {
            console.error('Erro ao buscar pacientes:', error);
        } else {
            setPacientes(data); // Atualiza o estado com os pacientes
        }
    };

    useEffect(() => {
        fetchMedicamentos();
        fetchPacientes(); // Busca os pacientes ao carregar o componente
    }, []);

    const handleAdd = async () => {
        const { error } = await supabase.from('medicamentos').insert([novoMedicamento]);
        if (error) {
            console.error('Erro ao adicionar medicamento:', error);
        } else {
            fetchMedicamentos(); // Atualiza a lista de medicamentos
            setNovoMedicamento({ nome: '', dosagem: '', descricao: '', horarios: '', paciente_id: '', estoque: 0, frequencia: 0 });
            setShowForm(false); // Fecha o modal após adicionar
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Lista de Medicamentos</h1>
            <button className={styles.addButton} onClick={() => setShowForm(true)}>
                Adicionar Medicamento
            </button>
            <ul className={styles.list}>
                {medicamentos.map((med) => {
                    // Busca o nome do paciente correspondente ao paciente_id
                    const paciente = pacientes.find((p) => p.id === med.paciente_id);

                    return (
                        <li key={med.id} className={styles.listItem}>
                            <strong>Nome:</strong> {med.nome} <br />
                            <strong>Dosagem:</strong> {med.dosagem} <br />
                            <strong>Descrição:</strong> {med.descricao} <br />
                            <strong>Horários:</strong> {med.horarios} <br />
                            <strong>Paciente:</strong> {paciente ? paciente.nome : 'Paciente não encontrado'} <br />
                            <strong>Estoque:</strong> {med.estoque} <br />
                            <strong>Frequência:</strong> {med.frequencia} <br />
                        </li>
                    );
                })}
            </ul>

            {/* Modal para o formulário */}
            {showForm && (
                <div className={styles.modalOverlay}>
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
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Horários"
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
                            <label className={styles.label}>Estoque</label>
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="Estoque"
                                value={novoMedicamento.estoque}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, estoque: parseInt(e.target.value, 10) })}
                                required
                            />
                            <label className={styles.label}>Frequência</label>
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="Frequência"
                                value={novoMedicamento.frequencia}
                                onChange={(e) => setNovoMedicamento({ ...novoMedicamento, frequencia: parseFloat(e.target.value) })}
                                required
                            />
                            <div className={styles.modalButtons}>
                                <button type="submit" className={styles.submitButton}>Salvar</button>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicamentoList;
