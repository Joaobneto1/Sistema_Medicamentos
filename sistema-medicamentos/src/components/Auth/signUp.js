import React from "react";

function SignUp({
    signUpData,
    handleSignUpChange,
    handleSignUpSubmit,
    signUpError,
    setIsSignUp,
}) {
    return (
        <div className="auth-page">
            <div className="auth-box">
                <h1>Cadastro</h1>
                <p>Crie sua conta para acessar o sistema</p>
                <form onSubmit={handleSignUpSubmit}>
                    <label>
                        Nome:
                        <input
                            type="text"
                            name="nome"
                            value={signUpData.nome}
                            onChange={handleSignUpChange}
                            placeholder="Digite seu nome"
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
                <p>
                    Já tem uma conta?{" "}
                    <a onClick={() => setIsSignUp(false)} className="link">
                        Faça login
                    </a>
                </p>
            </div>
        </div>
    );
}

export default SignUp;