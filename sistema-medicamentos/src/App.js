import "./App.css";
import HorarioAtual from "./components/Horario/horarioAtual";
import Login from "./components/Auth/login";
import SignUp from "./components/Auth/signUp";
import useAuth from "./hooks/useAuth";
import React, { useState, useEffect } from 'react';
import supabase from './services/supabaseClient';
import EstoqueMedicamentos from "./components/Estoque/estoqueMedicamentos";

const PacienteList = () => {
  const [pacientes, setPacientes] = useState([]);

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

  return (
    <div className="paciente-container">
      <h1 className="paciente-title">Informações do Paciente</h1>
      <div className="paciente-list">
        {pacientes.map((paciente) => (
          <div key={paciente.id} className="paciente-card">
            <p><strong>Nome:</strong> {paciente.nome}</p>
            <p><strong>Idade:</strong> {paciente.idade} anos</p>
            <p><strong>Data de Nascimento:</strong> {paciente.data_nascimento || 'Não informado'}</p>
            <ul>
              <li>Nenhum medicamento cadastrado</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("pacientes");

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab("pacientes")}>Pacientes</button>
        <button onClick={() => setActiveTab("estoque")}>Estoque</button>
      </nav>
      {activeTab === "pacientes" && <PacienteList />}
      {activeTab === "estoque" && <EstoqueMedicamentos />}
    </div>
  );
};

export default App;