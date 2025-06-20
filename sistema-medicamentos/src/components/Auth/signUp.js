import React, { useState } from "react";
import { signUpRest } from "../../services/api";
import supabase from "../../services/supabaseClient";
// Importa o CSS correto para garantir o estilo
import "./Auth.css";

function SignUp({ setIsSignUp }) {
  const [signUpData, setSignUpData] = useState({ email: "", password: "", nome: "" });
  const [signUpError, setSignUpError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await signUpRest(signUpData.email, signUpData.password, signUpData.nome);
      if (data.session?.access_token) {
        localStorage.setItem("supabaseToken", data.session.access_token);
        // Atualiza a sessão do supabase client para uploads funcionarem
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setSuccessMessage("Conta criada com sucesso! Verifique seu email para confirmar.");
        setSignUpError("");
      } else {
        setSignUpError("Erro ao criar conta. Tente novamente.");
      }
    } catch (error) {
      setSignUpError("Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Cadastre-se</h1>
        <p>Crie sua conta para acessar o sistema</p>
        <form onSubmit={handleSignUpSubmit}>
          <label>
            Nome:
            <input
              type="text"
              name="nome"
              value={signUpData.nome}
              onChange={handleSignUpChange}
              placeholder="Digite seu nome completo"
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={signUpData.email}
              onChange={handleSignUpChange}
              placeholder="Digite seu email"
              required
            />
          </label>
          <label>
            Senha:
            <input
              type="password"
              name="password"
              value={signUpData.password}
              onChange={handleSignUpChange}
              placeholder="Digite sua senha"
              required
            />
          </label>
          <button type="submit">Cadastrar</button>
        </form>
        {signUpError && <p className="error">{signUpError}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        <p>
          Já tem uma conta?{" "}
          <button
            onClick={() => setIsSignUp(false)}
            className="link"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignUp;