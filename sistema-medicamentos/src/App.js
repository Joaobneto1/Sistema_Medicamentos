import React, { useState, useEffect } from "react"; 
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
        // Faz uma requisição para a API pública de horário
        const response = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo");
        if (!response.ok) {
          throw new Error(`Erro ao buscar o horário: ${response.status}`); // Lança erro se a resposta não for bem-sucedida
        }
        const data = await response.json();
        if (data && data.dateTime) {
          const apiTime = new Date(data.dateTime); // Converte o horário da API para um objeto Date
          setBaseTime(apiTime); // Armazena o horário base no estado
          setTime(apiTime.toLocaleTimeString()); // Atualiza o estado com o horário formatado
        } else {
          throw new Error("Resposta inválida da API"); // Lança erro se a resposta não for válida
        }
      } catch (error) {
        console.error("Erro ao buscar o horário:", error); // Loga o erro no console
        setTime("Erro ao carregar horário"); // Exibe mensagem de erro no site
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

  return (
    <div className="app">
      {/* Cabeçalho */}
      <header className="header">
        <div className="header-left">Sistema de Medicamentos</div> {/* Título do sistema */}
        <div className="header-right">{time}</div> {/* Exibe o horário atualizado em tempo real */}
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

export default App;