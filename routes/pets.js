import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'data', 'pets.json');
        const data = await fs.readFile(filePath, 'utf8');
        const pets = JSON.parse(data);
        res.json(pets.pets);
    } catch (error) {
        console.error('Error al leer las mascotas:', error);
        res.status(500).json({ error: 'No se cargaron las mascotas' });
    }
});

export default router;