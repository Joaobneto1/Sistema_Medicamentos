import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("supabaseToken");
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