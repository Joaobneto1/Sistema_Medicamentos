require('dotenv').config();
// — Debug da URL do banco —
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL);

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const client = require('prom-client');

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());

//
// 1) Rotas PÚBLICAS (antes de qualquer JWT)
//

// Rota de sanity check da API
app.get('/teste', (_req, res) => {
  console.log('🚀 Rota pública /teste acessada');
  return res.json({ status: 'ok', mensagem: 'API está viva 🚀' });
});

// Rota de health-check do Banco
app.get('/health-db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ HEALTH-DB: OK');
    return res.status(200).send('DB OK');
  } catch (err) {
    console.error('❌ HEALTH-DB ERROR:', err.message);
    return res.status(500).send('DB ERROR');
  }
});

//
// 2) Teste de conexão inicial com o banco
//
prisma
  .$connect()
  .then(() => console.log('✅ Conexão com o banco OK'))
  .catch(err => console.error('❌ Falha ao conectar no banco:', err.message));

//
// 3) Rotas de autenticação (públicas)
//
app.use('/auth', require('./routes/auth'));

//
// 4) Métricas Prometheus
//
client.collectDefaultMetrics();
const httpRequestCounter = new client.Counter({
  name: 'app_requests_total',
  help: 'Total de requisições recebidas'
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  return res.send(await client.register.metrics());
});
app.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

//
// 5) Middleware de autenticação JWT (a partir daqui, tudo PROTEGIDO)
//
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn('⚠️ Token ausente na requisição:', req.method, req.url);
    return res.status(401).json({ error: 'Token ausente' });
  }
  try {
    req.user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    console.log('✅ Token válido, sub:', req.user.sub);
    return next();
  } catch (err) {
    console.error('🛑 Erro JWT:', err.message);
    return res.status(403).json({ error: 'Token inválido', details: err.message });
  }
});

//
// 6) Rotas PROTEGIDAS
//
app.use('/pacientes', require('./routes/pacientes'));
app.use('/medicamentos', require('./routes/medicamentos'));
app.use('/estoque', require('./routes/estoque'));
app.use('/historico', require('./routes/historico'));
app.use('/admin', require('./routes/admin'));

//
// 7) Start do servidor
//
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
