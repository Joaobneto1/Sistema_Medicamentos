import "./App.css";
import Header from "./components/Shared/Header";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import EstoqueMedicamentos from "./components/Estoque/estoqueMedicamentos";
import PacienteManager from "./components/Pacientes/PacienteManager";
import PacienteList from "./components/Pacientes/PacienteList";
import AdicionarPaciente from "./components/Pacientes/AdicionarPaciente";
import EditarPaciente from "./components/Pacientes/EditarPaciente";
import HistoricoMedicados from "./components/Historico/HistoricoMedicados";
import Login from "./components/Auth/login";
import SignUp from "./components/Auth/signUp";
import supabase from "./services/supabaseClient";

const App = () => {
  const [user, setUser] = useState(null); // Estado para armazenar o usuário logado
  const [isSignUp, setIsSignUp] = useState(false); // Estado para alternar entre login e cadastro

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <Router>
      {user && <Header user={user} handleLogout={handleLogout} />}
      <div>
        <Routes>
          {!user ? (
            <>
              <Route
                path="/"
                element={
                  isSignUp ? (
                    <SignUp setIsSignUp={setIsSignUp} />
                  ) : (
                    <Login setUser={setUser} setIsSignUp={setIsSignUp} />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/pacientes" element={<PacienteList />} />
              <Route path="/gerenciar-pacientes" element={<PacienteManager />} />
              <Route path="/adicionar-paciente" element={<AdicionarPaciente />} />
              <Route path="/editar-paciente/:id" element={<EditarPaciente />} />
              <Route path="/estoque" element={<EstoqueMedicamentos />} />
              <Route path="/historico" element={<HistoricoMedicados />} />
              <Route path="*" element={<Navigate to="/pacientes" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;