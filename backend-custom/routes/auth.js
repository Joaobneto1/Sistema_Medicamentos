const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error("Erro de login Supabase:", error.message);
        return res.status(401).json({ error: error.message });
    }
    res.json(data);
});

// POST /auth/signup
router.post('/signup', async (req, res) => {
    const { email, password, nome } = req.body;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: nome }
        }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

module.exports = router;
