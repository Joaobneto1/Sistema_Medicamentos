import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
    return (
        <header className="app-header">
            <nav>
                <ul>
                    <li><Link to="/pacientes">Visualizar Pacientes</Link></li>
                    <li><Link to="/gerenciar-pacientes">Gerenciar Pacientes</Link></li>
                    <li><Link to="/adicionar-paciente">Adicionar Paciente</Link></li>
                    <li><Link to="/estoque">Estoque</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
