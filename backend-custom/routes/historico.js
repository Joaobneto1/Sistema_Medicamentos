const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /historico - retorna histórico de pacientes medicados com filtros
router.get('/', async (req, res) => {
    try {
        const { paciente, dia, horarioInicio, horarioFim, medicamento } = req.query;
        let where = { medicado: true };

        if (paciente) where.paciente_id = paciente;
        if (medicamento) where.medicamento_id = medicamento;
        if (dia) {
            const diaInicio = new Date(dia);
            const diaFim = new Date(dia);
            diaFim.setDate(diaFim.getDate() + 1);
            where.updated_at = { gte: diaInicio, lt: diaFim };
        }
        if (horarioInicio && horarioFim) {
            where.horario_dose = { gte: horarioInicio, lte: horarioFim };
        }

        const historico = await prisma.paciente_medicamentos.findMany({
            where,
            include: {
                paciente: { select: { nome: true } },
                medicamento: { select: { nome: true } }
            },
            orderBy: { updated_at: 'desc' }
        });

        res.json(historico);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar histórico de pacientes medicados' });
    }
});

module.exports = router;
