import "./App.css";
import Header from "./components/Shared/Header";
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EstoqueMedicamentos from "./components/Estoque/estoqueMedicamentos";
import PacienteManager from "./components/Pacientes/PacienteManager";
import PacienteList from "./components/Pacientes/PacienteList";
import AdicionarPaciente from "./components/Pacientes/AdicionarPaciente";
import EditarPaciente from "./components/Pacientes/EditarPaciente"; // Importar o componente de edição

const App = () => {
  const [activeTab, setActiveTab] = useState("pacientes");

  return (
    <Router>
      <Header /> {/* Apenas o header estilizado será mantido */}
      <div>
        <Routes>
          <Route path="/pacientes" element={<PacienteList />} />
          <Route path="/gerenciar-pacientes" element={<PacienteManager />} />
          <Route path="/adicionar-paciente" element={<AdicionarPaciente />} />
          <Route path="/editar-paciente/:id" element={<EditarPaciente />} /> {/* Rota para editar */}
          <Route path="/estoque" element={<EstoqueMedicamentos />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;