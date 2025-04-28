import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Estado inicial para exibir o horário no cabeçalho
  const [time, setTime] = useState("Carregando...");

  // Estado para armazenar o horário base obtido da API
  const [baseTime, setBaseTime] = useState(null);

  // Hook para buscar o horário inicial da API
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const apiKey = "GHQ1EHZZA0FT";
        const response = await fetch(
          `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=America/Sao_Paulo`
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar o horário: ${response.status}`);
        }

        const data = await response.json();
        console.log("Resposta da API TimeZoneDB:", data); // Log para verificar a resposta

        if (data && data.formatted) {
          const apiTime = new Date(data.formatted); // Converte o horário da API para um objeto Date
          setBaseTime(apiTime); // Armazena o horário base no estado
          setTime(apiTime.toLocaleTimeString()); // Atualiza o estado com o horário formatado
        } else {
          throw new Error("Resposta inválida da API");
        }
      } catch (error) {
        console.error("Erro ao buscar o horário:", error);
        setTime("Erro ao carregar horário");
      }
    };

    fetchTime(); // Chama a função para buscar o horário ao montar o componente
  }, []); // Executa apenas uma vez ao montar o componente

  // Hook para atualizar o horário em tempo real
  useEffect(() => {
    if (baseTime) {
      // Configura um intervalo que incrementa o horário a cada segundo
      const interval = setInterval(() => {
        setBaseTime((prevTime) => {
          const updatedTime = new Date(prevTime.getTime() + 1000); // Incrementa 1 segundo no horário base
          setTime(updatedTime.toLocaleTimeString()); // Atualiza o estado com o horário formatado
          return updatedTime; // Retorna o horário atualizado para o estado baseTime
        });
      }, 1000); // Executa a cada 1000ms (1 segundo)

      return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }
  }, [baseTime]); // Executa sempre que baseTime for atualizado

  const [activeTab, setActiveTab] = useState("Paciente");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    quarto: "",
  });
  const [pacientes, setPacientes] = useState([]);

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
                <p>
                  <strong>Nome:</strong> {paciente.nome}
                </p>
                <p>
                  <strong>Idade:</strong> {paciente.idade}
                </p>
                <p>
                  <strong>Quarto:</strong> {paciente.quarto}
                </p>
                <p>
                  <strong>Medicamentos:</strong>
                </p>
                <ul>
                  {paciente.medicamentos && paciente.medicamentos.length > 0 ? (
                    paciente.medicamentos.map((medicamento) => (
                      <li key={medicamento.id}>
                        {medicamento.nome} - {medicamento.dosagem} (
                        {medicamento.frequencia})
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
        <div className="header-right">{time}</div> {/* Exibe o horário atualizado em tempo real */}
      </header>
      <nav className="navbar">
        <button className="nav-button" onClick={() => setActiveTab("Paciente")}>
          Paciente
        </button>
        <button
          className="nav-button"
          onClick={() => setActiveTab("Medicamentos")}
        >
          Medicamentos
        </button>
      </nav>
      <main className="content">{renderContent()}</main>
    </div>
  );
}

export default App;