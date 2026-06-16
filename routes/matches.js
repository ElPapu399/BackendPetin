import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const matchesPath = path.join(__dirname, '..', 'data', 'matches.json');

const router = express.Router();

router.post('/', async (req, res) => {
    const { petId, petName, action } = req.body;
    
    if (!petId || !action) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    try {
        const data = await fs.readFile(matchesPath, 'utf8').catch(() => '[]');
        const matches = JSON.parse(data);

        const newMatch = { petId, petName, action, timestamp: new Date().toISOString() };
        matches.push(newMatch);

        await fs.writeFile(matchesPath, JSON.stringify(matches, null, 2));
        
        res.json({ message: "Match guardado con éxito", match: newMatch });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar el match" });
    }
});

export default router;