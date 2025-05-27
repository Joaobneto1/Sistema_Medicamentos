import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import HorarioAtual from "../Horario/horarioAtual";
import "./Header.css";

const Header = ({ user, handleLogout, hasAlert }) => {
    useEffect(() => {
        if (hasAlert) {
            document.title = "🔴 Sistema de Medicamentos - ALERTA";
        } else {
            document.title = "Sistema de Medicamentos";
        }
    }, [hasAlert]);

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-left">
                    <HorarioAtual /> {/* Exibe o horário atual no canto esquerdo */}
                </div>
                <nav>
                    <ul>
                        <li><Link to="/pacientes">Home</Link></li>
                        <li><Link to="/gerenciar-pacientes">Pacientes</Link></li>
                        <li><Link to="/estoque">Estoque</Link></li>
                        <li><Link to="/historico">Histórico</Link></li> {/* Novo link para o histórico */}
                    </ul>
                </nav>
                {user && (
                    <div className="header-user-info">
                        <span className="header-username">
                            {user.user_metadata?.display_name || user.nome || user.name || "Usuário"}
                        </span>
                        <button className="header-logout-btn" onClick={handleLogout}>
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
