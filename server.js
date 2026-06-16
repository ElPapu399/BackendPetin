import express from 'express';
import cors from 'cors';

import petRoutes from './routes/pets.js';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('¡Hola desde el servidor de Petin!');
});

app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);


app.listen(port, () => {
    console.log(`Servidor funcionando http://localhost:${port}`);
});