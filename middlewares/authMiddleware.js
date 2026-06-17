import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Verificamos si el frontend nos está enviando el token 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next(); 
        } catch (error) {
            console.error("Error al verificar el token:", error);

            res.status(401).json({ error: 'No autorizado, token fallido o expirado' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'No autorizado, no enviaste un token de seguridad' });
    }
};
