require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Exemplo de rota protegida
app.get('/pacientes', async (req, res) => {
  try {
    const pacientes = await prisma.pacientes.findMany();
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

// Outras rotas customizadas...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend custom rodando na porta ${PORT}`);
});
