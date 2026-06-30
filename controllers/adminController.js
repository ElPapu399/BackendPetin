import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Match from '../models/Match.js';

// ==========================================
// OBTENER ESTADISTICAS DEL DASHBOARD
// Solo para administradores
// ==========================================
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPets = await Pet.countDocuments();
        const totalMatches = await Match.countDocuments();

        res.json({
            users: totalUsers,
            pets: totalPets,
            matches: totalMatches,
            status: "GENIAL"
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadisticas del dashboard' });
    }
};

// ==========================================
// OBTENER TODOS LOS USUARIOS Y SUS MASCOTAS
// ==========================================
export const getAllPetsAndUsers = async (req, res) => {
    try {
        const { search, type, owner, status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (type) query.type = type;
        if (owner) query.owner = owner;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { breed: new RegExp(search, 'i') }
            ];
        }

        const pageValue = Number(page);
        const limitValue = Number(limit);
        const pageNumber = pageValue > 0 ? pageValue : 1;
        const limitNumber = limitValue > 0 ? Math.min(limitValue, 50) : 20;

        const pets = await Pet.find(query)
            .populate('owner', 'name email')
            .sort('-createdAt')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Pet.countDocuments(query);

        const formattedPets = pets.map(pet => ({
            id: pet._id,
            name: pet.name || 'Sin nombre',
            species: pet.type,
            breed: pet.breed,
            age: pet.age,
            sex: pet.sex,
            status: pet.status,
            owner: pet.owner ? pet.owner.name : 'Desconocido',
            ownerEmail: pet.owner ? pet.owner.email : '',
            photo: pet.photos && pet.photos.length > 0 ? pet.photos[0] : null
        }));

        res.set('X-Total-Count', total);
        res.set('X-Page', pageNumber);
        res.set('X-Total-Pages', Math.ceil(total / limitNumber));
        res.json(formattedPets);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener mascotas' });
    }
};

// ==========================================
// OBTENER ULTIMOS MATCHES
// ==========================================
export const getRecentMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('fromPet', 'name')
            .populate('toPet', 'name');

        const formattedMatches = matches.map(m => ({
            id: m._id,
            petName: m.toPet ? m.toPet.name : 'Mascota eliminada',
            action: m.status === 'like' ? 'Like' : (m.status === 'dislike' ? 'Dislike' : m.status),
            timestamp: m.createdAt
        }));

        res.json(formattedMatches);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener matches recientes' });
    }
};

// ==========================================
// LISTAR USUARIOS
// ==========================================
export const getUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const pageValue = Number(page);
        const limitValue = Number(limit);
        const pageNumber = pageValue > 0 ? pageValue : 1;
        const limitNumber = limitValue > 0 ? Math.min(limitValue, 50) : 20;

        const users = await User.find(query)
            .select('-password -otpCode -otpExpires')
            .sort('-createdAt')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await User.countDocuments(query);

        res.json({
            data: users,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// ==========================================
// VER DETALLE DE USUARIO
// ==========================================
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -otpCode -otpExpires');

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

// ==========================================
// ACTUALIZAR USUARIO
// ==========================================
export const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rol invalido' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({ error: 'El correo ya esta en uso' });
            }
        }

        user.name = name !== undefined ? name : user.name;
        user.email = email !== undefined ? email : user.email;
        user.role = role !== undefined ? role : user.role;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            authProvider: updatedUser.authProvider
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// ==========================================
// ELIMINAR USUARIO
// ==========================================
export const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario administrador' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const pets = await Pet.find({ owner: user._id }).select('_id');
        const petIds = pets.map(pet => pet._id);

        // Al borrar un usuario tambien quitamos sus mascotas y matches relacionados.
        await Match.deleteMany({
            $or: [
                { fromPet: { $in: petIds } },
                { toPet: { $in: petIds } }
            ]
        });
        await Pet.deleteMany({ owner: user._id });
        await user.deleteOne();

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};
