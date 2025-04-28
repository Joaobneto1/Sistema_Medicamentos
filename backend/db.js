const postgres = require("postgres");

// Carregar variáveis de ambiente do .env
const connectionString = process.env.DATABASE_URL;

// Criar a conexão com o Supabase
const pool = postgres(connectionString);

// Exportar a conexão para ser usada em outros arquivos
module.exports = pool;