import Match from '../models/Match.js';
import Pet from '../models/Pet.js';

// ==========================================
// DAR LIKE O DISLIKE A UNA MASCOTA
// ==========================================
export const swipePet = async (req, res) => {
    const { fromPetId, toPetId, action } = req.body; 
    try {
        if (!['like', 'dislike'].includes(action)) {
            return res.status(400).json({ error: 'Acción inválida. Debe ser like o dislike' });
        }

        // guardar la peticion
        let newMatch = await Match.create({
            fromPet: fromPetId,
            toPet: toPetId,     
            status: action
        });

        // logica del Match
        let isMatch = false;
        if (action === 'like') {
            // buscamos si tenemos un like
            const reverseLike = await Match.findOne({
                fromPet: toPetId,
                toPet: fromPetId,
                status: 'like'
            });

            // si tenemos mach
            if (reverseLike) {
                isMatch = true;
                
                // actualizar el match de cada perfil
                newMatch.status = 'match';
                await newMatch.save();

                reverseLike.status = 'match';
                await reverseLike.save();
                
                // agregar otras funcionalidades como notificaciones  a tiempo real , etc
            }
        }

        //animacion 
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
        const matches = await Match.find({
            fromPet: petId,
            status: 'match'
        }).populate('toPet'); 

        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tus matches' });
    }
};
