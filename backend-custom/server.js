require('dotenv').config();
// --- DEBUG URL DO BANCO ---
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL);
// ----------------------------

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const client = require('prom-client');

const app = express();

app.use(cors());
app.use(express.json());

// 1) Rota pública de health-check da API (não requer token nem DB)
app.get('/teste', (req, res) => {
  console.log('🚀 Rota pública /teste acessada');
  return res.json({ status: 'ok', mensagem: 'API está viva 🚀' });
});

// 2) Rota pública de health-check do DB (não requer token)
app.get('/health-db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ HEALTH-DB: OK');
    return res.status(200).send('DB OK');
  } catch (err) {
    console.error('❌ HEALTH-DB ERROR:', err.message);
    return res.status(500).send('DB ERROR');
  }
});

// 3) Teste de conexão inicial com o banco
prisma
  .$connect()
  .then(() => console.log('✅ Conexão com o banco OK'))
  .catch(err => console.error('❌ Falha ao conectar no banco:', err.message));

// 4) Rotas públicas de autenticação
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// 5) Métricas Prometheus
client.collectDefaultMetrics();
const httpRequestCounter = new client.Counter({
  name: 'app_requests_total',
  help: 'Total de requisições recebidas'
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  return res.send(await client.register.metrics());
});
app.use((req, res, next) => { httpRequestCounter.inc(); next(); });

// 6) Middleware JWT (protege tudo o que vem depois)
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn('⚠️ Token ausente na requisição:', req.method, req.url);
    return res.status(401).json({ error: 'Token ausente' });
  }
  try {
    console.log('🔐 Tentando decodificar token...');
    try {
      req.user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
      console.log('✅ Token válido, sub:', req.user.sub);
    } catch {
      const jwtSecret = Buffer.from(process.env.SUPABASE_JWT_SECRET, 'base64');
      req.user = jwt.verify(token, jwtSecret);
      console.log('✅ Token válido (base64), sub:', req.user.sub);
    }
    next();
  } catch (err) {
    console.error('🛑 Erro JWT:', err.message);
    return res.status(403).json({ error: 'Token inválido', details: err.message });
  }
});

// 7) Rotas protegidas
app.use('/pacientes', require('./routes/pacientes'));
app.use('/medicamentos', require('./routes/medicamentos'));
app.use('/estoque', require('./routes/estoque'));
app.use('/historico', require('./routes/historico'));
app.use('/admin', require('./routes/admin'));

// 8) Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
