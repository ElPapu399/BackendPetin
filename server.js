import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';

import petRoutes from './routes/pets.js';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';

dotenv.config(); 
connectDB(); //nos conecta a la base desatos

const app = express();
const port = process.env.PORT || 3005;

//expreess
const httpServer = createServer(app);

// Configuramos Socket.io envolviendo nuestro servidor HTTP
// CORS es necesario para que el Frontend (React) en otro puerto pueda comunicarse con este backend
const io = new Server(httpServer, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

app.use(cors()); 
app.use(express.json()); // Nos permite entender el body de las peticiones que vengan en formato JSON

app.get('/', (req, res) => {
    res.send('¡Hola desde el servidor de Petin!');
});

app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

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
            //guardar el mensaje
            const newMessage = await Message.create({
                roomId,
                sender: senderId,
                text
            });

            // 2. reeniviamos
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