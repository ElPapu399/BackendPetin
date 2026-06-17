import Message from '../models/Message.js';
import Match from '../models/Match.js';

export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // busca o muestra los mensajes
        const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los mensajes' });
    }
};
