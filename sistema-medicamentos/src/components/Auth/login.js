import React from "react";

function Login({ loginData, handleLoginChange, handleLoginSubmit, loginError, setIsSignUp }) {
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
                        style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
                    >
                        Cadastre-se
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;