import "./App.css";
import React from "react";
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

  const renderContent = () => {
    if (!user) {
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
          handleLoginSubmit={handleLoginSubmit}
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
          {user ? `Olá, ${user.email}` : "Não logado"} {/* Exibe o usuário logado ou mensagem de não logado */}
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