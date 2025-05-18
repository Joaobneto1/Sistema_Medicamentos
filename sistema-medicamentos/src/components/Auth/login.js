import React, { useState } from "react";
import supabase from "../../services/supabaseClient";
// Importa o CSS correto para garantir o estilo
import "./Auth.css";

function Login({ setUser, setIsSignUp }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      setLoginError("Erro ao fazer login. Verifique suas credenciais.");
    } else {
      setUser(data.user);
      setLoginError("");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Bem-vindo</h1>
        <p>Faça login para acessar o sistema</p>
        <form onSubmit={handleLoginSubmit}>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              placeholder="Digite seu email"
              required
            />
          </label>
          <label>
            Senha:
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Digite sua senha"
              required
            />
          </label>
          <button type="submit">Entrar</button>
        </form>
        {loginError && <p className="error">{loginError}</p>}
        <p>
          Não tem uma conta?{" "}
          <button
            onClick={() => setIsSignUp(true)}
            className="link"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;