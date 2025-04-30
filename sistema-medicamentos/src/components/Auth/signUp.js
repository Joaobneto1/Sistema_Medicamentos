import React from "react";

function SignUp({
    signUpData,
    handleSignUpChange,
    handleSignUpSubmit,
    signUpError,
    setIsSignUp,
}) {
    return (
        <div className="signup-container">
            <h2>Cadastro</h2>
            <form onSubmit={handleSignUpSubmit}>
                <label>
                    Nome:
                    <input
                        type="text"
                        name="nome"
                        value={signUpData.nome}
                        onChange={handleSignUpChange}
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
                        required
                    />
                </label>
                <button type="submit">Cadastrar</button>
            </form>
            {signUpError && <p className="error">{signUpError}</p>}
            <p>
                Já tem uma conta?{" "}
                <button onClick={() => setIsSignUp(false)}>Faça login</button>
            </p>
        </div>
    );
}

export default SignUp;