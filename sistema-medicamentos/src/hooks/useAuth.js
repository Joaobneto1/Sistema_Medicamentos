import { useState, useEffect } from "react";

const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Inicializa o estado com base no localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        return storedUser ? true : false;
    });

    const [user, setUser] = useState(() => {
        // Restaura o usuário do localStorage
        return JSON.parse(localStorage.getItem("user")) || null;
    });

    useEffect(() => {
        // Atualiza o localStorage sempre que o estado de login ou usuário mudar
        if (isLoggedIn && user) {
            const { email } = user; // Salva apenas o email ou outros dados simples
            localStorage.setItem("user", JSON.stringify({ email }));
        } else {
            localStorage.removeItem("user");
        }
    }, [isLoggedIn, user]);

    const handleLoginSubmit = (data) => {
        const loginSuccessful = data && data.email; // Simula sucesso no login
        if (loginSuccessful) {
            setUser(data); // Atualiza o estado do usuário
            setIsLoggedIn(true); // Define o estado de login como verdadeiro
            const { email } = data; // Salva apenas o email no localStorage
            localStorage.setItem("user", JSON.stringify({ email }));
        } else {
            console.error("Erro no login: Dados inválidos");
        }
        return loginSuccessful;
    };

    const handleLogout = () => {
        setIsLoggedIn(false); // Define o estado de login como falso
        setUser(null); // Limpa o estado do usuário
        localStorage.removeItem("user"); // Remove o usuário do localStorage
    };

    return {
        isLoggedIn,
        user,
        handleLoginSubmit,
        handleLogout,
    };
};

export default useAuth;