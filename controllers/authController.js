import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

// Inicializar el cliente de Google para verificar tokens
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// CONTROLADOR DE REGISTRO
// Aquí recibimos los datos del formulario y creamos un nuevo usuario en la BD
// ==========================================
export const registerUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Validación básica comprobamos que las contraseñas sean iguales
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        // Buscamos en la base de datos si ya hay alguien con ese correo
        const userExists = await User.findOne({ email });

        if (userExists) {
            // Si existe, cortamos el proceso y enviamos un error 400
            return res.status(400).json({ error: 'El usuario ya existe con este correo' });
        }

        // Si todo está bien, procedemos a crear el usuario
        const user = await User.create({
            name,
            email,
            password,
            authProvider: 'local'
        });

        // Si el usuario se guardó con éxito devolvemos sus datos junto con un token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ error: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
    }
};

// ==========================================
// CONTROLADOR DE LOGIN
// Verifica las credenciales y devuelve un token si son correctas
// ==========================================
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscamos al usuario por su correo
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};


export const googleLogin = async (req, res) => {
    const { idToken } = req.body; // el token del frotend

    try {
    
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {

            user = await User.create({
                name,
                email,
                authProvider: 'google',
            });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Error al verificar token de Google:", error);
        res.status(401).json({ error: 'Token de Google inválido o expirado' });
    }
};

// ==========================================
// OBTENER PERFil la ruta protegida
// Devuelve los datos del usuario que hace la petición
// ==========================================
export const getUserProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id).select('-password'); 
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};
