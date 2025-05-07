import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import HorarioAtual from "./components/Horario/horarioAtual";
import Login from "./components/Auth/login";
import PacienteList from "./components/Pacientes/pacientList";
import SignUp from "./components/Auth/signUp";
import useAppLogic from "./hooks/appLogic";
import useAuth from "./hooks/useAuth";
import MedicamentoCadastro from "./components/Medicamentos/medicamentoCadastro";
import EstoqueMedicamentos from "./components/Medicamentos/estoqueMedicamentos";
import routes from "./routesConfig"; // Importar as rotas configuradas

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

  return (
    <Router>
      <div className="app">
        <header className="header">
s          <div className="header-left">
            <Link to={routes.login} className="nav-link">
              Login
            </Link>
          </div>
          <div className="header-center">
            <HorarioAtual />
          </div>
          <div className="header-right">
            {isLoggedIn && user ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>{`Olá, ${user.email}`}</span>
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
          <Link to={routes.home} className="nav-link">
            Home
          </Link>
          <Link to={routes.pacientes} className="nav-link">
            Pacientes
          </Link>
          <Link to={routes.cadastroMedicamentos} className="nav-link">
            Cadastro de Medicamentos
          </Link>
          <Link to={routes.estoqueMedicamentos} className="nav-link">
            Estoque de Medicamentos
          </Link>
        </nav>
        <main className="content">
          <Routes>
            <Route
              path={routes.home}
              element={<h1>Bem-vindo ao Sistema de Medicamentos</h1>}
            />
            <Route
              path={routes.login}
              element={
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
              }
            />
            <Route
              path={routes.signUp}
              element={
                <SignUp
                  signUpData={signUpData}
                  handleSignUpChange={handleSignUpChange}
                  handleSignUpSubmit={handleSignUpSubmit}
                  signUpError={signUpError}
                  setIsSignUp={setIsSignUp}
                />
              }
            />
            <Route
              path={routes.pacientes}
              element={
                <PacienteList
                  pacientes={pacientes}
                  showForm={showForm}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleFormSubmit={handleFormSubmit}
                  setShowForm={setShowForm}
                />
              }
            />
            <Route
              path={routes.cadastroMedicamentos}
              element={<MedicamentoCadastro />}
            />
            <Route
              path={routes.estoqueMedicamentos}
              element={<EstoqueMedicamentos />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;