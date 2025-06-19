const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função utilitária para buscar o role do usuário autenticado
async function getUserRole(user_id) {
    const perfil = await prisma.perfis.findUnique({ where: { user_id } });
    return perfil?.role || 'usuario';
}

// GET /admin/relatorio - rota protegida para admin
router.get('/relatorio', async (req, res) => {
    const role = await getUserRole(req.user.sub);
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Acesso restrito' });
    }
    res.json({ relatorio: 'Teste para rota apenas admin' });
});

module.exports = router;
