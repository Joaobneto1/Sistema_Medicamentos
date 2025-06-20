import React, { useState } from "react";
import { loginRest } from "../../services/api";
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
    try {
      const { data } = await loginRest(loginData.email, loginData.password);
      if (data.session?.access_token) {
        localStorage.setItem("supabaseToken", data.session.access_token);
        setUser(data.user);
        console.log("Access token:", data.session.access_token); // Mantido para debug
        // Atualiza a sessão do supabase client para uploads funcionarem
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setLoginError("");
      } else {
        setLoginError("Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch (error) {
      setLoginError("Erro ao fazer login. Verifique suas credenciais.");
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