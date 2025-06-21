const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();
const registrarLog = require('../logs');
const { sendTelegramAlert } = require('../utils/telegram');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Função utilitária para buscar o nome do usuário autenticado via Supabase
async function getUserName(user_id) {
    const { data, error } = await supabase.rpc('get_display_name_by_id', { uid: user_id });
    if (error) {
        console.error('Erro ao buscar nome do usuário:', error);
        return '';
    }
    return data || '';
}

// GET /estoque - lista o estoque de medicamentos
router.get('/', async (req, res) => {
    try {
        const estoque = await prisma.estoque_medicamentos.findMany({
            include: {
                medicamento: true
            }
        });
        res.json(estoque);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
});

// POST /estoque - adiciona novo estoque
router.post('/', async (req, res) => {
    try {
        const { medicamento_id, quantidade, atualizado_em, dose_mg } = req.body;
        const estoque = await prisma.estoque_medicamentos.create({
            data: {
                medicamento_id,
                quantidade,
                dose_mg,
                atualizado_em: atualizado_em ? new Date(atualizado_em) : new Date()
            }
        });

        // Busca o medicamento relacionado para pegar nome
        const medicamento = await prisma.medicamentos.findUnique({
            where: { id: medicamento_id }
        });

        // Alerta Telegram de estoque baixo (<= 5)
        if (quantidade <= 5) {
            await sendTelegramAlert(`*🚨 Estoque baixo*: *${medicamento.nome}* está com apenas ${quantidade} unidade${quantidade === 1 ? '' : 's'}.`);
        }

        // Log de adição de estoque
        const userName = await getUserName(req.user.sub);
        await registrarLog(req.user.sub, 'adicionar_estoque', {
            medicamento_id,
            quantidade,
            estoque_id: estoque.id,
            usuario_nome: userName,
        });

        res.status(201).json(estoque);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar ao estoque' });
    }
});

// GET /estoque/alertas - retorna medicamentos com estoque baixo
router.get('/alertas', async (req, res) => {
    try {
        const alertas = await prisma.estoque_medicamentos.findMany({
            where: { quantidade: { lte: 5 } },
            include: { medicamento: true }
        });
        res.json(alertas);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar alertas de estoque' });
    }
});

// PUT /estoque/:id - atualiza quantidade e data do estoque
router.put('/:id', async (req, res) => {
    try {
        const { quantidade, atualizado_em } = req.body;
        const estoque = await prisma.estoque_medicamentos.update({
            where: { id: req.params.id },
            data: {
                quantidade,
                atualizado_em: atualizado_em ? new Date(atualizado_em) : new Date()
            }
        });

        // Busca o medicamento relacionado para pegar nome
        const medicamento = await prisma.medicamentos.findUnique({
            where: { id: estoque.medicamento_id }
        });

        // Alerta Telegram de estoque baixo (<= 5)
        if (estoque.quantidade <= 5) {
            await sendTelegramAlert(`*🚨Estoque baixo*: *${medicamento.nome}* está com apenas ${estoque.quantidade} unidade${estoque.quantidade === 1 ? '' : 's'}.`);
        }

        // Log de atualização de estoque
        const userName = await getUserName(req.user.sub);
        await registrarLog(req.user.sub, 'atualizar_estoque', {
            estoque_id: req.params.id,
            quantidade,
            usuario_nome: userName,
        });

        res.json(estoque);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
});

module.exports = router;