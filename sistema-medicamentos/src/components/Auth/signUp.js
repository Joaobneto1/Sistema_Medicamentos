import React, { useState } from "react";
import supabase from "../../services/supabaseClient";

function SignUp({ setIsSignUp }) {
  const [signUpData, setSignUpData] = useState({ email: "", password: "" });
  const [signUpError, setSignUpError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`, // Redireciona para a tela inicial após confirmação
      },
    });

    if (error) {
      setSignUpError("Erro ao criar conta. Tente novamente.");
    } else {
      setSuccessMessage("Conta criada com sucesso! Verifique seu email para confirmar.");
      setSignUpError("");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Cadastre-se</h1>
        <p>Crie sua conta para acessar o sistema</p>
        <form onSubmit={handleSignUpSubmit}>
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
            style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignUp;