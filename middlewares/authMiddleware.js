import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // verificamos el token del frontend
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

// ==========================================
// ADMINISTRADOR
// ==========================================
export const adminProtect = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // continua con exito gogo
    } else {
        res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
    }
};
