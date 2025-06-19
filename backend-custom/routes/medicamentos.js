const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /medicamentos - lista todos os medicamentos
router.get('/', async (req, res) => {
    try {
        const medicamentos = await prisma.medicamentos.findMany();
        res.json(medicamentos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar medicamentos' });
    }
});

// POST /medicamentos - cadastra novo medicamento
router.post('/', async (req, res) => {
    try {
        const { nome, dosagem, descricao, horarios, estoque, frequencia } = req.body;
        const medicamento = await prisma.medicamentos.create({
            data: {
                nome,
                descricao,
                dose_mg: dosagem,
            }
        });
        // Se quiser criar o estoque inicial:
        if (estoque !== undefined) {
            await prisma.estoque_medicamentos.create({
                data: {
                    medicamento_id: medicamento.id,
                    quantidade: estoque
                }
            });
        }
        res.status(201).json(medicamento);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar medicamento' });
    }
});

// DELETE /medicamentos/:id - deleta medicamento
router.delete('/:id', async (req, res) => {
    try {
        await prisma.medicamentos.delete({
            where: { id: req.params.id }
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar medicamento' });
    }
});

module.exports = router;
