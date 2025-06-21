require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const client = require('prom-client');

const app = express();

app.use(cors());
app.use(express.json());

// Importa rotas organizadas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Coletar métricas padrão do Node.js (CPU, heap, event loop, etc)
client.collectDefaultMetrics();

// Contador de requisições (opcional)
const httpRequestCounter = new client.Counter({
  name: 'app_requests_total',
  help: 'Total de requisições recebidas'
});

// Rota de métricas — precisa vir antes do middleware de autenticação
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Opcional: incrementa contador em cada requisição
app.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

// Middleware de autenticação JWT do Supabase (apenas para rotas protegidas)
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

// Rotas protegidas
const pacientesRoutes = require('./routes/pacientes');
app.use('/pacientes', pacientesRoutes);
const medicamentosRoutes = require('./routes/medicamentos');
app.use('/medicamentos', medicamentosRoutes);
const estoqueRoutes = require('./routes/estoque');
app.use('/estoque', estoqueRoutes);
const historicoRoutes = require('./routes/historico');
app.use('/historico', historicoRoutes);

// Adiciona rotas de admin
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend custom rodando na porta ${PORT}`);
});