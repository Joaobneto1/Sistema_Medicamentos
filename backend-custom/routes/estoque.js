const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        const { medicamento_id, quantidade, atualizado_em } = req.body;
        const estoque = await prisma.estoque_medicamentos.create({
            data: {
                medicamento_id,
                quantidade,
                atualizado_em: atualizado_em ? new Date(atualizado_em) : new Date()
            }
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
        res.json(estoque);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
});

module.exports = router;
