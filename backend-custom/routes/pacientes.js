const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função utilitária para buscar o role do usuário autenticado
async function getUserRole(user_id) {
    const perfil = await prisma.perfis.findUnique({ where: { user_id } });
    return perfil?.role || 'usuario';
}

// GET /pacientes - lista pacientes do usuário autenticado
router.get('/', async (req, res) => {
    try {
        const pacientes = await prisma.pacientes.findMany({
            where: { user_id: req.user.sub },
        });
        res.json(pacientes);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
});

// POST /pacientes - cria paciente e associa medicamentos
router.post('/', async (req, res) => {
    try {
        const { nome, idade, data_nascimento, quarto, foto_url, medicamentos } = req.body;
        const user_id = req.user.sub;

        // Converte data_nascimento para Date (YYYY-MM-DD)
        let dataNascimentoDate = null;
        if (data_nascimento) {
            if (typeof data_nascimento === "string" && data_nascimento.includes("/")) {
                const [dia, mes, ano] = data_nascimento.split("/").map(s => s.trim());
                dataNascimentoDate = new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
            } else {
                dataNascimentoDate = new Date(data_nascimento);
            }
            if (isNaN(dataNascimentoDate.getTime())) {
                return res.status(400).json({ error: "Data de nascimento inválida" });
            }
        }

        const fotoUrlFinal = typeof foto_url === "string" && foto_url.trim() !== "" ? foto_url : null;

        // Cria paciente primeiro
        const paciente = await prisma.pacientes.create({
            data: { nome, idade, data_nascimento: dataNascimentoDate, quarto, foto_url: fotoUrlFinal, user_id }
        });

        // Associa medicamentos, se houver
        if (Array.isArray(medicamentos) && medicamentos.length > 0) {
            await Promise.all(medicamentos.map(assoc => {
                // Converte "HH:mm" para objeto Date com data fixa 1970-01-01
                let horarioDoseDate = null;
                if (assoc.horario_dose && typeof assoc.horario_dose === "string") {
                    const [h, m] = assoc.horario_dose.split(":");
                    horarioDoseDate = new Date(Date.UTC(1970, 0, 1, parseInt(h, 10), parseInt(m, 10)));
                }
                return prisma.paciente_medicamentos.create({
                    data: {
                        paciente_id: paciente.id,
                        medicamento_id: assoc.medicamento_id,
                        horario_dose: horarioDoseDate,
                        intervalo_horas: assoc.intervalo_horas,
                        uso_cronico: assoc.uso_cronico,
                        dias_tratamento: assoc.dias_tratamento,
                    }
                });
            }));
        }

        res.status(201).json(paciente);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar paciente" });
    }
});

// GET /pacientes/:id - busca paciente e associações
router.get('/:id', async (req, res) => {
    try {
        const paciente = await prisma.pacientes.findUnique({
            where: { id: req.params.id },
            include: {
                paciente_medicamentos: true,
            },
        });
        if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

        // Busca medicamentos detalhados
        const medicamentos = await prisma.paciente_medicamentos.findMany({
            where: { paciente_id: req.params.id },
        });

        res.json({
            ...paciente,
            medicamentos,
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
});

// PUT /pacientes/:id - atualiza paciente e associações
router.put('/:id', async (req, res) => {
    try {
        const { nome, idade, data_nascimento, quarto, foto_url, medicamentos } = req.body;
        const paciente = await prisma.pacientes.update({
            where: { id: req.params.id },
            data: { nome, idade, data_nascimento, quarto, foto_url },
        });

        // Remove associações antigas
        await prisma.paciente_medicamentos.deleteMany({
            where: { paciente_id: req.params.id },
        });

        // Adiciona novas associações
        if (Array.isArray(medicamentos) && medicamentos.length > 0) {
            await Promise.all(medicamentos.map(assoc => {
                // Converte "20:30" para "1970-01-01T20:30:00.000Z"
                let horarioDoseISO = null;
                if (assoc.horario_dose && typeof assoc.horario_dose === "string") {
                    const [h, m] = assoc.horario_dose.split(":");
                    // Use uma data fixa, pois só o horário importa
                    horarioDoseISO = new Date(Date.UTC(2025, 6, 19, parseInt(h, 10), parseInt(m, 10))).toISOString();
                }
                return prisma.paciente_medicamentos.create({
                    data: {
                        paciente_id: req.params.id,
                        medicamento_id: assoc.medicamento_id,
                        horario_dose: horarioDoseISO,
                        intervalo_horas: assoc.intervalo_horas,
                        uso_cronico: assoc.uso_cronico,
                        dias_tratamento: assoc.dias_tratamento,
                    }
                });
            }));
        }

        res.json(paciente);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
});

// DELETE /pacientes/:id - deleta paciente se for do usuário ou admin
router.delete('/:id', async (req, res) => {
    try {
        const paciente = await prisma.pacientes.findUnique({ where: { id: req.params.id } });
        if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

        const role = await getUserRole(req.user.sub);

        if (paciente.user_id !== req.user.sub && role !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão' });
        }
        await prisma.pacientes.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar paciente' });
    }
});

// GET /pacientes/listagem-completa - lista pacientes com medicamentos associados
router.get('/listagem-completa', async (req, res) => {
    try {
        const pacientes = await prisma.pacientes.findMany({
            where: { user_id: req.user.sub },
            include: {
                paciente_medicamentos: {
                    include: { medicamento: true }
                }
            }
        });
        res.json(pacientes);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
});

// POST /pacientes/marcar-medicado - marca medicamento como medicado e atualiza estoque
router.post('/marcar-medicado', async (req, res) => {
    try {
        const { pacienteId, medicamentoId } = req.body;
        // Atualiza paciente_medicamentos
        await prisma.paciente_medicamentos.updateMany({
            where: { paciente_id: pacienteId, medicamento_id: medicamentoId },
            data: {
                medicado: true,
                updated_at: new Date()
            }
        });
        // Atualiza estoque
        await prisma.estoque_medicamentos.updateMany({
            where: { medicamento_id: medicamentoId },
            data: {
                quantidade: { decrement: 1 }
            }
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao registrar medicação' });
    }
});

module.exports = router;