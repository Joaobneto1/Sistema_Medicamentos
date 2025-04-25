import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState("Paciente");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    quarto: "",
  });
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Buscar pacientes do backend
    axios.get("http://localhost:5000/pacientes").then((response) => {
      setPacientes(response.data);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/pacientes", formData)
      .then((response) => {
        setPacientes([...pacientes, response.data]);
        setShowForm(false);
        setFormData({ nome: "", idade: "", quarto: "" });
      })
      .catch((error) => {
        console.error("Erro ao criar paciente:", error);
      });
  };

  const renderContent = () => {
    if (activeTab === "Paciente") {
      return (
        <div className="paciente-container">
          <div className="paciente-header">
            <h2>Informações do Paciente</h2>
            <button className="create-button" onClick={() => setShowForm(true)}>
              Criar Paciente
            </button>
          </div>
          <div className="paciente-grid">
            {pacientes.map((paciente) => (
              <div key={paciente.id} className="paciente-card">
                <p><strong>Nome:</strong> {paciente.nome}</p>
                <p><strong>Idade:</strong> {paciente.idade}</p>
                <p><strong>Quarto:</strong> {paciente.quarto}</p>
                <p><strong>Medicamentos:</strong></p>
                <ul>
                  {paciente.medicamentos && paciente.medicamentos.length > 0 ? (
                    paciente.medicamentos.map((medicamento) => (
                      <li key={medicamento.id}>
                        {medicamento.nome} - {medicamento.dosagem} ({medicamento.frequencia})
                      </li>
                    ))
                  ) : (
                    <li>Nenhum medicamento cadastrado</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
          {showForm && (
            <form className="paciente-form" onSubmit={handleFormSubmit}>
              <h3>Criar Paciente</h3>
              <label>
                Nome:
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Idade:
                <input
                  type="number"
                  name="idade"
                  value={formData.idade}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Quarto:
                <input
                  type="text"
                  name="quarto"
                  value={formData.quarto}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  Salvar
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      );
    }
    return <h1>Bem-vindo ao Sistema de Medicamentos</h1>;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">Sistema de Medicamentos</div>
        <div className="header-right">{time}</div>
      </header>
      <nav className="navbar">
        <button className="nav-button" onClick={() => setActiveTab("Paciente")}>
          Paciente
        </button>
        <button className="nav-button" onClick={() => setActiveTab("Medicamentos")}>
          Medicamentos
        </button>
      </nav>
      <main className="content">{renderContent()}</main>
    </div>
  );
}

export default App;