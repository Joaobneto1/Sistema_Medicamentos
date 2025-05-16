import React from "react";
import { Link } from "react-router-dom";
import HorarioAtual from "../Horario/horarioAtual";
import "./Header.css";

const Header = () => {
    return (
        <header className="app-header">
            <div className="header-left">
                <HorarioAtual /> {/* Exibe o horário atual no canto esquerdo */}
            </div>
            <nav>
                <ul>
                    <li><Link to="/pacientes">Visualizar Pacientes</Link></li>
                    <li><Link to="/gerenciar-pacientes">Gerenciar Pacientes</Link></li>
                    <li><Link to="/estoque">Estoque</Link></li>
                    <li><Link to="/historico">Histórico de Medicados</Link></li> {/* Novo link para o histórico */}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
