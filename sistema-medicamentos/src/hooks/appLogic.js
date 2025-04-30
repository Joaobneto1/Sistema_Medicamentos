import { useState, useEffect } from "react";
import supabase from "../services/supabaseClient";

const useAppLogic = () => {
    const [user, setUser] = useState(null);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [signUpData, setSignUpData] = useState({ email: "", password: "", nome: "" });
    const [signUpError, setSignUpError] = useState("");
    const [activeTab, setActiveTab] = useState("Paciente");
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ nome: "", idade: "", quarto: "" });
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            const { data, error } = await supabase.from("pacientes").select(`
        id, 
        nome, 
        idade, 
        quarto, 
        medicamentos (
          id, 
          nome, 
          frequencia, 
          dosagem
        )
      `);

            if (error) {
                console.error("Erro ao buscar pacientes:", error);
            } else {
                setPacientes(data);
            }
        };

        fetchPacientes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            console.error("Erro ao obter usuário logado:", userError);
            return;
        }

        const { data, error } = await supabase
            .from("pacientes")
            .insert([
                {
                    ...formData,
                    usuario_id: userData.user.id,
                },
            ])
            .select();

        if (error) {
            console.error("Erro ao criar paciente:", error);
        } else {
            setPacientes([...pacientes, data[0]]);
            setShowForm(false);
            setFormData({ nome: "", idade: "", quarto: "" });
        }
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password,
        });

        if (error) {
            setLoginError("Erro ao logar: " + error.message);
        } else {
            setUser(data.user);
            setLoginError("");
        }
    };

    const handleSignUpChange = (e) => {
        const { name, value } = e.target;
        setSignUpData({ ...signUpData, [name]: value });
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email: signUpData.email,
            password: signUpData.password,
        });

        if (error) {
            setSignUpError("Erro ao cadastrar: " + error.message);
        } else {
            const { error: insertError } = await supabase.from("usuario").insert([
                { email: signUpData.email, nome: signUpData.nome },
            ]);

            if (insertError) {
                setSignUpError("Erro ao salvar dados do usuário: " + insertError.message);
            } else {
                setSignUpError("");
                setIsSignUp(false);
            }
        }
    };

    return {
        user,
        setUser,
        loginData,
        setLoginData,
        loginError,
        setLoginError,
        isSignUp,
        setIsSignUp,
        signUpData,
        setSignUpData,
        signUpError,
        setSignUpError,
        activeTab,
        setActiveTab,
        showForm,
        setShowForm,
        formData,
        setFormData,
        pacientes,
        handleInputChange,
        handleFormSubmit,
        handleLoginChange,
        handleLoginSubmit,
        handleSignUpChange,
        handleSignUpSubmit,
    };
};

export default useAppLogic;