import React, { useState } from "react";
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
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: signUpData.nome }
      },
    });

    if (error) {
      setSignUpError("Erro ao criar conta. Tente novamente.");
    } else {
      setSuccessMessage("Conta criada com sucesso! Verifique seu email para confirmar.");
      setSignUpError("");
      // Salva o access_token no localStorage se disponível
      if (data.session?.access_token) {
        localStorage.setItem("supabaseToken", data.session.access_token);
      }
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