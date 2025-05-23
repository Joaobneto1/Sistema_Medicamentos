import React from "react";
import { Link } from "react-router-dom";
import HorarioAtual from "../Horario/horarioAtual";
import "./Header.css";

const Header = ({ user, handleLogout }) => {
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
                            {user.user_metadata?.name || user.email || "Usuário"}
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
