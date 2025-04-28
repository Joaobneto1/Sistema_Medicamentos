require("dotenv").config(); // Carregar variáveis de ambiente do .env
const { Pool } = require("pg");

// Configuração do banco de dados PostgreSQL usando variáveis de ambiente
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Exportar o pool para ser usado em outros arquivos
module.exports = pool;