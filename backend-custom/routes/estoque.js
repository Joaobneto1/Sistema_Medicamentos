const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = router;
