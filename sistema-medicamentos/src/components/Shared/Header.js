import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HorarioAtual from "../Horario/horarioAtual";
import "./Header.css";

const Header = ({ user, handleLogout, hasAlert }) => {
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        if (hasAlert) {
            document.title = "🔴 Sistema de Medicamentos - ALERTA";
        } else {
            document.title = "Sistema de Medicamentos";
        }
    }, [hasAlert]);

    const toggleMenu = () => {
        setMenuAberto(!menuAberto);
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-left">
                    <HorarioAtual />
                    <button className="menu-toggle" onClick={toggleMenu}>☰</button>
                </div>

                <nav className={menuAberto ? "menu-mobile-active" : ""}>
                    <ul>
                        <li><Link to="/pacientes" onClick={() => setMenuAberto(false)}>Home</Link></li>
                        <li><Link to="/gerenciar-pacientes" onClick={() => setMenuAberto(false)}>Pacientes</Link></li>
                        <li><Link to="/estoque" onClick={() => setMenuAberto(false)}>Estoque</Link></li>
                        <li><Link to="/historico" onClick={() => setMenuAberto(false)}>Histórico</Link></li>
                    </ul>
                </nav>

                {user && (
                    <div className="header-user-area">
                        <div className="header-user-info">
                            <span className="header-username">
                                {user.user_metadata?.display_name || user.nome || user.name || "Usuário"}
                            </span>
                            <button className="header-logout-btn" onClick={handleLogout}>
                                Sair
                            </button>
                        </div>
                        
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
