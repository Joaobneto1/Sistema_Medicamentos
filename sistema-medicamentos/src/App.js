import "./App.css";
import React, { useState, useEffect } from "react";
import HorarioAtual from "./components/Horario/horarioAtual";
import Login from "./components/Auth/login";
import PacienteList from "./components/Pacientes/pacientList";
import SignUp from "./components/Auth/signUp";
import useAppLogic from "./hooks/appLogic";

function App() {
  // Utilizando o hooks para gerenciar os estados e funções
  const {
    user,
    loginData,
    loginError,
    isSignUp,
    signUpData,
    signUpError,
    activeTab,
    showForm,
    formData,
    pacientes,
    handleInputChange,
    handleFormSubmit,
    handleLoginChange,
    handleLoginSubmit,
    handleSignUpChange,
    handleSignUpSubmit,
    setIsSignUp,
    setActiveTab,
    setShowForm,
  } = useAppLogic();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Inicializa o estado com base no localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return storedUser ? true : false;
  });

  const restoredUser = useState(() => {
    // Restaura o usuário do localStorage
    return JSON.parse(localStorage.getItem("user")) || null;
  })[0]; // Removido `setRestoredUser`

  useEffect(() => {
    // Restaura o estado de login e usuário ao carregar o aplicativo
    if (!user && restoredUser) {
      setIsLoggedIn(true);
    }
  }, [user, restoredUser]);

  useEffect(() => {
    // Atualiza o localStorage sempre que o estado de login ou usuário mudar
    if (isLoggedIn && user) {
      // Salva apenas os dados necessários do usuário
      const { email } = user; // Salva apenas o email ou outros dados simples
      localStorage.setItem("user", JSON.stringify({ email }));
    } else {
      localStorage.removeItem("user");
    }
  }, [isLoggedIn, user]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("user");
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return isSignUp ? (
        <SignUp
          signUpData={signUpData}
          handleSignUpChange={handleSignUpChange}
          handleSignUpSubmit={handleSignUpSubmit}
          signUpError={signUpError}
          setIsSignUp={setIsSignUp}
        />
      ) : (
        <Login
          loginData={loginData}
          handleLoginChange={handleLoginChange}
          handleLoginSubmit={(data) => {
            const loginSuccessful = handleLoginSubmit(data);
            if (loginSuccessful) {
              setIsLoggedIn(true);
              // Salva apenas os dados necessários no localStorage
              const { email } = data; // Salva apenas o email ou outros dados simples
              localStorage.setItem("user", JSON.stringify({ email }));
            }
          }}
          loginError={loginError}
          setIsSignUp={setIsSignUp}
        />
      );
    }

    if (activeTab === "Paciente") {
      return (
        <PacienteList
          pacientes={pacientes}
          showForm={showForm}
          formData={formData}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          setShowForm={setShowForm}
        />
      );
    }
    return <h1>Bem-vindo ao Sistema de Medicamentos</h1>;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">Sistema de Medicamentos</div> {/* Título do sistema */}
        <div className="header-center">
          <HorarioAtual /> {/* Exibe o horário atualizado no centro */}
        </div>
        <div className="header-right">
          {isLoggedIn && user ? (
            <>
              {`Olá, ${user.email}`} {/* Exibe o usuário logado */}
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            "Não logado"
          )}
        </div>
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