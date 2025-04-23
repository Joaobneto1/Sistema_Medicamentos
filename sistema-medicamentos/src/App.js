import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">Sistema de Medicamentos</div>
        <div className="header-right">{time}</div>
      </header>

      {/* Barra de Navegação */}
      <nav className="navbar">
        <button className="nav-button">Paciente</button>
        <button className="nav-button">Medicamentos</button>
        <button className="nav-button">Alarmes dos Medicamentos</button>
        <button className="nav-button">Histórico</button>
      </nav>

      {/* Conteúdo Principal */}
      <main className="content">
        <h1>Bem-vindo ao Sistema de Medicamentos</h1>
      </main>
    </div>
  );
}

export default App;