import Match from '../models/Match.js';
import Pet from '../models/Pet.js';

// ==========================================
// DAR LIKE O DISLIKE A UNA MASCOTA
// ==========================================
export const swipePet = async (req, res) => {
    const { fromPetId, toPetId, action } = req.body;

    try {
        if (!['like', 'dislike'].includes(action)) {
            return res.status(400).json({ error: 'Accion invalida. Debe ser like o dislike' });
        }

        if (!fromPetId || !toPetId) {
            return res.status(400).json({ error: 'Debes enviar la mascota origen y destino' });
        }

        if (fromPetId === toPetId) {
            return res.status(400).json({ error: 'Una mascota no puede interactuar consigo misma' });
        }

        const fromPet = await Pet.findById(fromPetId);
        const toPet = await Pet.findById(toPetId);

        if (!fromPet || !toPet) {
            return res.status(404).json({ error: 'Una de las mascotas no existe' });
        }

        // El usuario solo puede hacer swipe con una mascota que le pertenece.
        if (fromPet.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para usar esta mascota' });
        }

        // Guardar la accion del usuario.
        let newMatch = await Match.create({
            fromPet: fromPetId,
            toPet: toPetId,
            status: action
        });

        // Si ambos dieron like, se convierte en match.
        let isMatch = false;
        if (action === 'like') {
            const reverseLike = await Match.findOne({
                fromPet: toPetId,
                toPet: fromPetId,
                status: 'like'
            });

            if (reverseLike) {
                isMatch = true;

                newMatch.status = 'match';
                await newMatch.save();

                reverseLike.status = 'match';
                await reverseLike.save();
            }
        }

        res.status(201).json({
            message: `Deslizaste a la ${action}`,
            isMatch,
            matchData: newMatch
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Ya deslizaste sobre esta mascota antes' });
        }

        res.status(500).json({ error: 'Error al procesar el deslizamiento' });
    }
};

// ==========================================
// OBTENER TODOS MIS MATCHES
// ==========================================
export const getMyMatches = async (req, res) => {
    const { petId } = req.params;

    try {
        const pet = await Pet.findById(petId);

        if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        if (pet.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para ver estos matches' });
        }

        const matches = await Match.find({
            fromPet: petId,
            status: 'match'
        }).populate('toPet');

        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tus matches' });
    }
};
