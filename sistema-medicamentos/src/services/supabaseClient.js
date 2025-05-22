import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = "https://xastpkkudkrmudgyesen.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc3Rwa2t1ZGtybXVkZ3llc2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzE1NDIsImV4cCI6MjA2MTQ0NzU0Mn0._zQYhQaYZXYK4V3erdiz7wHVW2d8IAttv8oLVqMc8QY"; // Substitua pela sua chave de API

const supabase = createClient(supabaseUrl, supabaseKey);

// Certifique-se de que as credenciais do Supabase estão configuradas corretamente.

export default supabase;