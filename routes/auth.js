import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersPath = path.join(__dirname, '..', 'data', 'users.json');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Correo y contraseña son necesarios" });
    }

    try {
        const data = await fs.readFile(usersPath, 'utf8').catch(() => '[]');
        const users = JSON.parse(data);

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        const newUser = { email, password, name, role: 'user', createdAt: new Date().toISOString() };
        users.push(newUser);

        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        res.status(201).json({ message: "Se ha registrado con éxito el usuario" });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@gmail.com" && password === "admin123") {
        return res.json({
            token: `admin-token-${Date.now()}`,
            user: {
                email: "admin@gmail.com",
                name: "Administrador",
                role: "admin",
            },
        });
    }

    try {
        const data = await fs.readFile(usersPath, 'utf8').catch(() => '[]');
        const users = JSON.parse(data);

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            return res.json({
                token: `user-token-${Date.now()}`,
                user: { email: user.email, name: user.name, role: user.role }
            });
        }

        res.status(401).json({ error: "Datos incorrectos" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor al intentar iniciar sesión" });
    }
});

export default router;