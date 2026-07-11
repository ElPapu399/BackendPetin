import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Match from '../models/Match.js';

// ==========================================
// OBTENER ESTADÍSTICAS DEL DASHBOARD
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
        res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
    }
};

// ==========================================
// OBTENER TODOS LOS USUARIOS Y SUS MASCOTAS
// ==========================================
export const getAllPetsAndUsers = async (req, res) => {
    try {
        const pets = await Pet.find().populate('owner', 'name email');
        
        const formattedPets = pets.map(pet => ({
            id: pet._id,
            name: pet.name || 'Sin nombre',
            species: pet.type,
            breed: pet.breed,
            age: pet.age,
            owner: pet.owner ? pet.owner.name : 'Desconocido',
            photo: pet.photos && pet.photos.length > 0 ? pet.photos[0] : null
        }));

        res.json(formattedPets);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener mascotas' });
    }
};

// ==========================================
// OBTENER ÚLTIMOS MATCHES
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
            action: m.action === 'like' ? '❤️ Like' : (m.action === 'dislike' ? '❌ Dislike' : m.action),
            timestamp: m.createdAt
        }));

        res.json(formattedMatches);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener matches recientes' });
    }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      data: users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo usuarios.",
    });
  }
};