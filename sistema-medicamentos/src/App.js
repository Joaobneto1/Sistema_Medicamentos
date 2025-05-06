import "./App.css";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import HorarioAtual from "./components/Horario/horarioAtual";
import Login from "./components/Auth/login";
import PacienteList from "./components/Pacientes/pacientList";
import SignUp from "./components/Auth/signUp";
import useAppLogic from "./hooks/appLogic";
import useAuth from "./hooks/useAuth"; // Importa o hook de autenticação
import MedicamentoList from "./components/Medicamentos/medicamentoList"; // Importação do componente de lista de medicamentos

function App() {
  const { isLoggedIn, user, handleLoginSubmit, handleLogout } = useAuth();

  const {
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
    handleSignUpChange,
    handleSignUpSubmit,
    setIsSignUp,
    setActiveTab,
    setShowForm,
  } = useAppLogic();

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
          handleLoginSubmit={(e) => {
            e.preventDefault();
            const loginSuccessful = handleLoginSubmit(loginData);
            if (!loginSuccessful) {
              console.error("Falha no login");
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

    if (activeTab === "Medicamentos") {
      return <MedicamentoList />; // Renderiza o componente de lista de medicamentos
    }

    return <h1>Bem-vindo ao Sistema de Medicamentos</h1>;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left"></div> {/* Título do sistema */}
        <div className="header-center">
          <HorarioAtual /> {/* Exibe o horário atualizado no centro */}
        </div>
        <div className="header-right">
          {isLoggedIn && user ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>{`Olá, ${user.email}`}</span> {/* Exibe o usuário logado */}
              <button onClick={handleLogout} className="logout-button">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
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