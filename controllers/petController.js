import Pet from '../models/Pet.js';

// ==========================================
// CREAR PERFIL DE MASCOTA
// ==========================================
export const createPet = async (req, res) => {
    try {
        const { name, type, breed, age, description, lookingFor } = req.body;

        const photos = req.files ? req.files.map(file => file.path) : [];

        const pet = new Pet({
            owner: req.user._id, 
            name,
            type,
            breed,
            age,
            description,
            lookingFor,
            photos
        });

        const createdPet = await pet.save();
        res.status(201).json(createdPet);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la mascota' });
    }
};

// ==========================================
// OBTENER MIS MASCOTAS
// ==========================================
export const getMyPets = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user._id });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tus mascotas' });
    }
};

// ==========================================
// OBTENER MASCOTAS PARA LA PAGINA DE EXPLORA 
// ==========================================
export const getPetsForFeed = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: { $ne: req.user._id } }).populate('owner', 'name');
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener mascotas' });
    }
};
