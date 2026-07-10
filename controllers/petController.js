import Pet from "../models/Pet.js";
import Match from "../models/Match.js";

// ==========================================
// CREAR PERFIL DE MASCOTA
// ==========================================
export const createPet = async (req, res) => {
  try {
    const { name, type, breed, age, description, lookingFor, lat, lng } =
      req.body;

    const photos = req.files ? req.files.map((file) => file.path) : [];

    const pet = new Pet({
      owner: req.user._id,
      name,
      type,
      breed,
      age,
      description,
      lookingFor,
      photos,
      location: {
        type: "Point",
        coordinates: [lng ? parseFloat(lng) : 0, lat ? parseFloat(lat) : 0],
      },
    });

    const createdPet = await pet.save();
    res.status(201).json(createdPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la mascota" });
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
    res.status(500).json({ error: "Error al obtener tus mascotas" });
  }
};

// ==========================================
// OBTENER MASCOTAS PARA LA PAGINA DE EXPLORA
// ==========================================
export const getPetsForFeed = async (req, res) => {
  try {
    const { petId, search, type, lookingFor, minAge, maxAge } = req.query;

    let query = { owner: { $ne: req.user._id } };

    // no repartir mascostas
    if (petId) {
      const currentPet = await Pet.findById(petId);
      if (!currentPet) {
        return res
          .status(404)
          .json({ error: "Mascota exploradora no encontrada" });
      }
      query.type = currentPet.type;

      const swipedPetIds = await Match.distinct("toPet", { fromPet: petId });

      if (swipedPetIds.length > 0) {
        query._id = { $nin: swipedPetIds };
      }
    }

    // 2. Aplicar los filtros manuales del Frontend (Buscador, Edad, Intención)
    if (search) {
      delete query.type;
      query.breed = { $regex: search, $options: "i" }; 
    }

    if (type) {
      query.type = type; 
    }

    if (lookingFor) {
      query.lookingFor = lookingFor;
    }

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    const pets = await Pet.find(query).populate("owner", "name");
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener mascotas" });
  }
};

export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: "Mascota no encontrada" });
    }
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para modificar esta mascota" });
    }
    const { name, type, breed, age, description, lookingFor, lat, lng } =
      req.body;
    const photos =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.path)
        : pet.photos;

    pet.name = name || pet.name;
    pet.type = type || pet.type;
    pet.breed = breed || pet.breed;
    pet.age = age !== undefined ? age : pet.age;
    pet.description = description || pet.description;
    pet.lookingFor = lookingFor || pet.lookingFor;
    pet.photos = photos;

    if (lat !== undefined && lng !== undefined) {
      pet.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la mascota" });
  }
};
