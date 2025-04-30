import React from "react";

function Login({ loginData, handleLoginChange, handleLoginSubmit, loginError, setIsSignUp }) {
    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
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
                        required
                    />
                </label>
                <button type="submit">Entrar</button>
            </form>
            {loginError && <p className="error">{loginError}</p>}
            <p>
                Não tem uma conta?{" "}
                <button onClick={() => setIsSignUp(true)}>Cadastre-se</button>
            </p>
        </div>
    );
}

export default Login;