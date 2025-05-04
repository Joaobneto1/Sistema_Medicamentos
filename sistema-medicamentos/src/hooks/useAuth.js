import { useState, useEffect } from "react";

const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        return storedUser ? true : false;
    });

    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });

    useEffect(() => {
        // Atualiza o localStorage sempre que o estado de login ou usuário mudar
        if (isLoggedIn && user) {
            const { email } = user;
            localStorage.setItem("user", JSON.stringify({ email }));
        } else {
            localStorage.removeItem("user");
        }
    }, [isLoggedIn, user]);

    // Limpa o estado de autenticação ao recarregar a página
    useEffect(() => {
        const handlePageReload = () => {
            setIsLoggedIn(false);
            setUser(null);
            localStorage.removeItem("user");
        };

        // Executa a limpeza ao carregar a página
        handlePageReload();
    }, []);

    const handleLoginSubmit = (data) => {
        const loginSuccessful = data && data.email;
        if (loginSuccessful) {
            setUser(data);
            setIsLoggedIn(true);
            const { email } = data;
            localStorage.setItem("user", JSON.stringify({ email }));
        } else {
            console.error("Erro no login: Dados inválidos");
        }
        return loginSuccessful;
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("user");
    };

    return {
        isLoggedIn,
        user,
        handleLoginSubmit,
        handleLogout,
    };
};

export default useAuth;