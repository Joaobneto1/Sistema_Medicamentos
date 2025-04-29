import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

// Configuração do Supabase
const supabaseUrl = "https://xastpkkudkrmudgyesen.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc3Rwa2t1ZGtybXVkZ3llc2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzE1NDIsImV4cCI6MjA2MTQ0NzU0Mn0._zQYhQaYZXYK4V3erdiz7wHVW2d8IAttv8oLVqMc8QY"; // Substitua pela sua chave de API
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  // Estado inicial para exibir o horário no cabeçalho
  const [time, setTime] = useState("Carregando...");

  // Estado para armazenar o horário base obtido da API
  const [baseTime, setBaseTime] = useState(null);

  // Estado para armazenar o usuário logado
  const [user, setUser] = useState(null);

  // Estado para os dados de login
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Estado para exibir erros de login
  const [loginError, setLoginError] = useState("");

  // Estado para alternar entre login e cadastro
  const [isSignUp, setIsSignUp] = useState(false);

  // Estado para os dados de cadastro
  const [signUpData, setSignUpData] = useState({ email: "", password: "", nome: "" });

  // Estado para exibir erros de cadastro
  const [signUpError, setSignUpError] = useState("");

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

  // Buscar pacientes do Supabase
  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase.from("pacientes").select(`
        id, 
        nome, 
        idade, 
        quarto, 
        medicamentos (
          id, 
          nome, 
          frequencia, 
          dosagem
        )
      `);

      if (error) {
        console.error("Erro ao buscar pacientes:", error);
      } else {
        setPacientes(data);
      }
    };

    fetchPacientes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Erro ao obter usuário logado:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("pacientes")
      .insert([
        {
          ...formData,
          usuario_id: userData.user.id, // Adiciona o ID do usuário logado
        },
      ])
      .select(); // Garante que os dados inseridos sejam retornados

    if (error) {
      console.error("Erro ao criar paciente:", error);
    } else {
      setPacientes([...pacientes, data[0]]);
      setShowForm(false);
      setFormData({ nome: "", idade: "", quarto: "" });
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      setLoginError("Erro ao logar: " + error.message);
    } else {
      setUser(data.user);
      setLoginError("");
    }
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
    });

    if (error) {
      setSignUpError("Erro ao cadastrar: " + error.message);
    } else {
      // Adiciona o nome do usuário na tabela "usuario"
      const { error: insertError } = await supabase.from("usuario").insert([
        { email: signUpData.email, nome: signUpData.nome },
      ]);

      if (insertError) {
        setSignUpError("Erro ao salvar dados do usuário: " + insertError.message);
      } else {
        setSignUpError("");
        setIsSignUp(false); // Volta para a tela de login após o cadastro
      }
    }
  };

  const renderSignUp = () => (
    <div className="signup-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSignUpSubmit}>
        <label>
          Nome:
          <input
            type="text"
            name="nome"
            value={signUpData.nome}
            onChange={handleSignUpChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={signUpData.email}
            onChange={handleSignUpChange}
            required
          />
        </label>
        <label>
          Senha:
          <input
            type="password"
            name="password"
            value={signUpData.password}
            onChange={handleSignUpChange}
            required
          />
        </label>
        <button type="submit">Cadastrar</button>
      </form>
      {signUpError && <p className="error">{signUpError}</p>}
      <p>
        Já tem uma conta?{" "}
        <button onClick={() => setIsSignUp(false)}>Faça login</button>
      </p>
    </div>
  );

  const renderLogin = () => (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />
        </label>
        <label>
          Senha:
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />
        </label>
        <button type="submit">Entrar</button>
      </form>
      {loginError && <p className="error">{loginError}</p>}
      <p>
        Não tem uma conta?{" "}
        <button onClick={() => setIsSignUp(true)}>Cadastre-se</button>
      </p>
    </div>
  );

  const renderContent = () => {
    if (!user) {
      return isSignUp ? renderSignUp() : renderLogin(); // Alterna entre login e cadastro
    }

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
        <div className="header-left">Sistema de Medicamentos</div> {/* Título do sistema */}
        <div className="header-center">{time}</div> {/* Exibe o horário no centro */}
        <div className="header-right">{user ? `Olá, ${user.email}` : "Não logado"}</div> {/* Exibe o usuário logado ou mensagem de não logado */}
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