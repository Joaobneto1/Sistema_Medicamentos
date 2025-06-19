require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticação JWT do Supabase
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    try {
      req.user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
      return next();
    } catch (e) {
      const jwtSecret = Buffer.from(process.env.SUPABASE_JWT_SECRET, 'base64');
      req.user = jwt.verify(token, jwtSecret);
      return next();
    }
  } catch (err) {
    console.error("Erro JWT:", err.message);
    res.status(403).json({ error: 'Token inválido', details: err.message });
  }
});

// Função utilitária para buscar o role do usuário autenticado
async function getUserRole(user_id) {
  const perfil = await prisma.perfis.findUnique({ where: { user_id } });
  return perfil?.role || 'usuario';
}

// GET /pacientes - lista pacientes do usuário autenticado
app.get('/pacientes', async (req, res) => {
  try {
    const pacientes = await prisma.pacientes.findMany({
      where: { user_id: req.user.sub },
    });
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

// POST /pacientes - cria paciente para o usuário autenticado
app.post('/pacientes', async (req, res) => {
  try {
    const paciente = await prisma.pacientes.create({
      data: {
        ...req.body,
        user_id: req.user.sub,
      },
    });
    res.status(201).json(paciente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar paciente' });
  }
});

// PUT /pacientes/:id - atualiza paciente se for do usuário ou admin
app.put('/pacientes/:id', async (req, res) => {
  try {
    const paciente = await prisma.pacientes.findUnique({ where: { id: req.params.id } });
    if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

    const role = await getUserRole(req.user.sub);

    if (paciente.user_id !== req.user.sub && role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const atualizado = await prisma.pacientes.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
});

// DELETE /pacientes/:id - deleta paciente se for do usuário ou admin
app.delete('/pacientes/:id', async (req, res) => {
  try {
    const paciente = await prisma.pacientes.findUnique({ where: { id: req.params.id } });
    if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

    const role = await getUserRole(req.user.sub);

    if (paciente.user_id !== req.user.sub && role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await prisma.pacientes.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar paciente' });
  }
});

// GET /admin/relatorio - rota protegida para admin
app.get('/admin/relatorio', async (req, res) => {
  const role = await getUserRole(req.user.sub);
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito' });
  }
  res.json({ relatorio: 'Teste para rota apenas admin' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend custom rodando na porta ${PORT}`);
});