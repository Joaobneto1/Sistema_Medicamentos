const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function registrarLog(user_id, acao, detalhes = {}) {
    try {
        await prisma.logs_auditoria.create({
            data: {
                user_id,
                acao,
                detalhes,
            }
        });
    } catch (err) {
        console.error("Erro ao registrar log:", err);
    }
}

module.exports = registrarLog;