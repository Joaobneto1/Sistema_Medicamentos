import axios from "axios";

const api = axios.create({
    baseURL: 'https://sistema-medicamentos.onrender.com',
});

// Intercepta todas as requisições e insere o token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("supabaseToken"); // ou "authToken", veja o nome que o backend salva
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginRest = (email, password) =>
    api.post('/auth/login', { email, password });

export const signUpRest = (email, password, nome) =>
    api.post('/auth/signup', { email, password, nome });

export default api;