import React, { useState, useEffect } from "react"; // Importa React e hooks useState e useEffect
import "./App.css"; // Importa o arquivo de estilos

function App() {
  const [time, setTime] = useState(""); // Estado para armazenar o horário atual

  useEffect(() => {
    // Hook para atualizar o horário a cada segundo
    const interval = setInterval(() => {
      const now = new Date(); // Obtém a data e hora atuais
      setTime(now.toLocaleTimeString()); // Atualiza o estado com o horário formatado
    }, 1000);
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []);

  return (
    <div className="app">
      {/* Cabeçalho */}
      <header className="header">
        <div className="header-left">Sistema de Medicamentos</div> {/* Título do sistema */}
        <div className="header-right">{time}</div> {/* Exibe o horário atual */}
      </header>

      {/* Barra de Navegação */}
      <nav className="navbar">
        <button className="nav-button">Paciente</button> {/* Botão para seção de Paciente */}
        <button className="nav-button">Medicamentos</button> {/* Botão para seção de Medicamentos */}
        <button className="nav-button">Alarmes dos Medicamentos</button> {/* Botão para seção de Alarmes */}
        <button className="nav-button">Histórico</button> {/* Botão para seção de Histórico */}
      </nav>

      {/* Conteúdo Principal */}
      <main className="content">
        <h1>Bem-vindo ao Sistema de Medicamentos</h1> {/* Mensagem de boas-vindas */}
      </main>
    </div>
  );
}

export default App; // Exporta o componente App como padrão