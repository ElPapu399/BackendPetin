import Pet from '../models/Pet.js';

// ==========================================
// CREAR PERFIL DE MASCOTA
// ==========================================
export const createPet = async (req, res) => {
    try {
        const { name, type, breed, age, sex, description, lookingFor } = req.body;

        if (!name || !type || !breed || age === undefined) {
            return res.status(400).json({ error: 'Nombre, tipo, raza y edad son obligatorios' });
        }

        if (Number(age) < 0) {
            return res.status(400).json({ error: 'La edad no puede ser negativa' });
        }

        const photos = req.files ? req.files.map(file => file.path) : [];

        const pet = new Pet({
            owner: req.user._id, 
            name,
            type,
            breed,
            age: Number(age),
            sex,
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
        const {
            search,
            type,
            breed,
            lookingFor,
            minAge,
            maxAge,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;

        // Filtros simples para la pantalla Explorar.
        const query = {
            owner: { $ne: req.user._id },
            status: 'activo'
        };

        if (search) query.name = new RegExp(search, 'i');
        if (type) query.type = type;
        if (breed) query.breed = new RegExp(breed, 'i');
        if (lookingFor) query.lookingFor = lookingFor;

        if (minAge || maxAge) {
            query.age = {};
            if (minAge) query.age.$gte = Number(minAge);
            if (maxAge) query.age.$lte = Number(maxAge);
        }

        const pageValue = Number(page);
        const limitValue = Number(limit);
        const pageNumber = pageValue > 0 ? pageValue : 1;
        const limitNumber = limitValue > 0 ? Math.min(limitValue, 50) : 20;

        const pets = await Pet.find(query)
            .populate('owner', 'name')
            .sort(sort)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Pet.countDocuments(query);

        res.set('X-Total-Count', total);
        res.set('X-Page', pageNumber);
        res.set('X-Total-Pages', Math.ceil(total / limitNumber));
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener mascotas' });
    }
};

// ==========================================
// OBTENER DETALLE DE UNA MASCOTA
// ==========================================
export const getPetById = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id).populate('owner', 'name email');

        if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la mascota' });
    }
};

export const updatePet = async(req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if(!pet) {
            return res.status(404).json({error: 'Mascota no encontrada'});
        }
        if(pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({error: 'No tienes permiso para modificar esta mascota'});
        }
        const { name, type, breed, age, sex, description, lookingFor, status } = req.body;
        const photos = req.files && req.files.length > 0
            ? req.files.map(file => file.path)
            : pet.photos;
        
        if (age !== undefined && Number(age) < 0) {
            return res.status(400).json({ error: 'La edad no puede ser negativa' });
        }

        pet.name = name !== undefined ? name : pet.name;
        pet.type = type !== undefined ? type : pet.type;
        pet.breed = breed !== undefined ? breed : pet.breed;
        pet.age = age !== undefined ? Number(age) : pet.age;
        pet.sex = sex !== undefined ? sex : pet.sex;
        pet.description = description !== undefined ? description : pet.description;
        pet.lookingFor = lookingFor !== undefined ? lookingFor : pet.lookingFor;
        pet.status = status !== undefined ? status : pet.status;
        pet.photos = photos;

        const updatedPet = await pet.save();
        res.json(updatedPet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la mascota' });
    }
};

// ==========================================
// ELIMINAR MASCOTA
// ==========================================
export const deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta mascota' });
        }

        await pet.deleteOne();

        res.json({ message: 'Mascota eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la mascota' });
    }
};

// ==========================================
// AGREGAR FOTOS A UNA MASCOTA
// ==========================================
export const addPetPhotos = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta mascota' });
        }

        const newPhotos = req.files ? req.files.map(file => file.path) : [];
        pet.photos = [...pet.photos, ...newPhotos].slice(0, 6);

        const updatedPet = await pet.save();
        res.json(updatedPet);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar fotos' });
    }
};

// ==========================================
// QUITAR UNA FOTO DE UNA MASCOTA
// ==========================================
export const removePetPhoto = async (req, res) => {
    try {
        const { photoUrl } = req.body;
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta mascota' });
        }

        pet.photos = pet.photos.filter(photo => photo !== photoUrl);

        const updatedPet = await pet.save();
        res.json(updatedPet);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la foto' });
    }
};
