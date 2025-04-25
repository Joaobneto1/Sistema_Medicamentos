const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db"); // Importar o pool do db.js

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para listar pacientes com seus medicamentos
app.get("/pacientes", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id AS paciente_id, 
                p.nome AS paciente_nome, 
                p.idade AS paciente_idade, 
                p.quarto AS paciente_quarto, 
                m.id AS medicamento_id, 
                m.nome AS medicamento_nome, 
                m.frequencia AS medicamento_frequencia, 
                m.dosagem AS medicamento_dosagem, 
                m.horarios AS medicamento_horarios, 
                m.instrucoes AS medicamento_instrucoes
            FROM pacientes p
            LEFT JOIN medicamentos m ON p.id = m.paciente_id
        `);

        const pacientesMap = {};

        // Organizar os dados em um formato adequado
        result.rows.forEach((row) => {
            if (!pacientesMap[row.paciente_id]) {
                pacientesMap[row.paciente_id] = {
                    id: row.paciente_id,
                    nome: row.paciente_nome,
                    idade: row.paciente_idade,
                    quarto: row.paciente_quarto,
                    medicamentos: [],
                };
            }

            if (row.medicamento_id) {
                pacientesMap[row.paciente_id].medicamentos.push({
                    id: row.medicamento_id,
                    nome: row.medicamento_nome,
                    frequencia: row.medicamento_frequencia,
                    dosagem: row.medicamento_dosagem,
                    horarios: row.medicamento_horarios,
                    instrucoes: row.medicamento_instrucoes,
                });
            }
        });

        res.json(Object.values(pacientesMap));
    } catch (err) {
        console.error("Erro ao buscar pacientes com medicamentos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota para criar paciente
app.post("/pacientes", async (req, res) => {
    const { nome, idade, quarto } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO pacientes (nome, idade, quarto) VALUES ($1, $2, $3) RETURNING *",
            [nome, idade, quarto]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para listar medicamentos de um paciente
app.get("/pacientes/:id/medicamentos", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM medicamentos WHERE paciente_id = $1",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para criar medicamento
app.post("/medicamentos", async (req, res) => {
    const { nome, frequencia, dosagem, horarios, instrucoes, paciente_id } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO medicamentos (nome, frequencia, dosagem, horarios, instrucoes, paciente_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [nome, frequencia, dosagem, horarios, instrucoes, paciente_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});