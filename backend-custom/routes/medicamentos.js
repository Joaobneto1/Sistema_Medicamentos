const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();
const registrarLog = require('../logs');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Função utilitária para buscar o nome do usuário autenticado via Supabase.
async function getUserName(user_id) {
    const { data, error } = await supabase.rpc('get_display_name_by_id', { uid: user_id });
    if (error) {
        console.error('Erro ao buscar nome do usuário:', error);
        return '';
    }
    return data || '';
}

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

        // Log de cadastro de medicamento
        const userName = await getUserName(req.user.sub);
        await registrarLog(req.user.sub, 'cadastrar_medicamento', {
            id: medicamento.id,
            nome: medicamento.nome,
            usuario_nome: userName,
        });

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

        // Log de deleção de medicamento
        const userName = await getUserName(req.user.sub);
        await registrarLog(req.user.sub, 'deletar_medicamento', {
            id: req.params.id,
            usuario_nome: userName,
        });

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar medicamento' });
    }
});

module.exports = router;
