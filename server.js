import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';
import { cleanText } from './utils/textFilter.js';
import helmet from 'helmet';
import compression from 'compression';

import petRoutes from './routes/pets.js';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';

dotenv.config(); 
connectDB(); 

const app = express();
const port = process.env.PORT || 3005;

// Middlewares de Seguridad y Optimización (Grado Producción)
app.use(helmet());      // Oculta vulnerabilidades en las cabeceras HTTP
app.use(compression()); // Comprime los datos enviados al cliente usando GZIP

//expreess
const httpServer = createServer(app);

// Configuramos Socket.io envolviendo nuestro servidor HTTP
const io = new Server(httpServer, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

app.use(cors()); 
app.use(express.json()); // formato JSON

app.get('/', (req, res) => {
    res.send('¡Hola desde el servidor de Petin!');
});

app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// ==========================================
// CONFIGURACIÓN DE SOCKET.IO 
// ==========================================
io.on('connection', (socket) => {
    console.log(`Un usuario se ha conectado al chat: ${socket.id}`);

    // Cuando un usuario entra a la pantalla de un chat específico
    socket.on('join_chat', (roomId) => {
        socket.join(roomId);
        console.log(`Usuario entró a la sala: ${roomId}`);
    });

    // envio de mensaje
    socket.on('send_message', async (data) => {
        const { roomId, senderId, text } = data;

        try {
            // Aplicar el filtro de palabras
            const safeText = cleanText(text);

            if (safeText !== text) {
                console.log(`[Seguridad] Se bloqueó lenguaje inapropiado del usuario ${senderId}`);
            }

            //guardar el mensaje limpio
            const newMessage = await Message.create({
                roomId,
                sender: senderId,
                text: safeText
            });

            io.to(roomId).emit('receive_message', newMessage);
        } catch (error) {
            console.error('Error al guardar mensaje en la BD', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});

httpServer.listen(port, () => {
    console.log(`Servidor y WebSockets funcionando en http://localhost:${port}`);
});