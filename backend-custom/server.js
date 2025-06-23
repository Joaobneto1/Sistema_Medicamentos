require('dotenv').config();
// --- LOG PARA DEBUGAR A URL DO BANCO ---
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL);
// -----------------------------------------
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma
  .$connect()
  .then(() => console.log('✅ Conexão com o banco OK'))
  .catch(err => console.error('❌ Falha ao conectar no banco:', err.message));

const client = require('prom-client');

const app = express();

// Middleware base
app.use(cors());
app.use(express.json());

// Importa rotas públicas (antes do JWT)
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Métricas Prometheus
client.collectDefaultMetrics();
const httpRequestCounter = new client.Counter({
  name: 'app_requests_total',
  help: 'Total de requisições recebidas'
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

//
// Middleware de autenticação JWT do Supabase
//
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.warn("⚠️ Token ausente na requisição:", req.method, req.url);
    return res.status(401).json({ error: 'Token ausente' });
  }

  try {
    console.log("🔐 Tentando decodificar token...");
    try {
      req.user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
      console.log("✅ Token válido (modo padrão), sub:", req.user?.sub);
      return next();
    } catch (e) {
      const jwtSecret = Buffer.from(process.env.SUPABASE_JWT_SECRET, 'base64');
      req.user = jwt.verify(token, jwtSecret);
      console.log("✅ Token válido (modo base64), sub:", req.user?.sub);
      return next();
    }
  } catch (err) {
    console.error("🛑 Erro JWT:", err.message);
    return res.status(403).json({ error: 'Token inválido', details: err.message });
  }
});

//
// Rotas protegidas (necessitam JWT)
//
const pacientesRoutes = require('./routes/pacientes');
app.use('/pacientes', pacientesRoutes);

const medicamentosRoutes = require('./routes/medicamentos');
app.use('/medicamentos', medicamentosRoutes);

const estoqueRoutes = require('./routes/estoque');
app.use('/estoque', estoqueRoutes);

const historicoRoutes = require('./routes/historico');
app.use('/historico', historicoRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

//
// Rota de teste pública (para verificar funcionamento básico)
app.get('/teste', async (req, res) => {
  console.log("🚀 Rota pública /teste acessada");
  res.json({ status: 'ok', mensagem: 'API está viva 🚀' });
});

//
// Inicialização do servidor
//
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
