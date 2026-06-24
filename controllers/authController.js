import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import sendEmail from '../utils/sendEmail.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
//  REGISTRO
// un nuevo usuario en la BD
// ==========================================
export const registerUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ error: 'El usuario ya existe con este correo' });
        }

        const user = await User.create({
            name,
            email,
            password,
            authProvider: 'local'
        });

        //  generar un OTP
        if (user) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date();
            otpExpires.setMinutes(otpExpires.getMinutes() + 10);

            user.otpCode = otpCode;
            user.otpExpires = otpExpires;
            await user.save();

            // enviamos el correo OTP
            const message = `¡Bienvenido a Petin, ${user.name}!\nTu código para verificar tu nueva cuenta es: ${otpCode}\nEste código expirará en 10 minutos.`;
            await sendEmail({
                email: user.email,
                subject: 'Petin - Verifica tu cuenta nueva',
                message: message
            });

            res.status(201).json({
                message: 'Usuario creado. Código OTP enviado al correo.',
                requireOtp: true,
                email: user.email
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
//  LOGIN 
// ==========================================
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
       
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
            const otpExpires = new Date();
            otpExpires.setMinutes(otpExpires.getMinutes() + 10);

  
            user.otpCode = otpCode;
            user.otpExpires = otpExpires;
            await user.save();

            const message = `Tu código de verificación de 2 pasos para Petin es: ${otpCode}\nEste código expirará en 10 minutos.`;
            await sendEmail({
                email: user.email,
                subject: 'Petin - Código de Seguridad (OTP)',
                message: message
            });

            res.json({
                message: 'Código OTP enviado al correo',
                requireOtp: true,
                email: user.email
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};

// ==========================================
//  VERIFICACIÓN OTP 
// generar el token JWT
// ==========================================
export const verifyOTP = async (req, res) => {
    const { email, otpCode } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.otpCode !== otpCode) {
            return res.status(401).json({ error: 'Código OTP incorrecto' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(401).json({ error: 'El código OTP ha expirado' });
        }

        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ error: 'Error verificando el código OTP' });
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
// OBTENER PERFIl 
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
