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

// Importa rotas organizadas
const pacientesRoutes = require('./routes/pacientes');
const adminRoutes = require('./routes/admin');

app.use('/pacientes', pacientesRoutes);
app.use('/admin', adminRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend custom rodando na porta ${PORT}`);
});