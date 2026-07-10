import Match from "../models/Match.js";
import Pet from "../models/Pet.js";

// ==========================================
// DAR LIKE O DISLIKE A UNA MASCOTA
// ==========================================
export const swipePet = async (req, res) => {
  const { fromPetId, toPetId, action } = req.body;
  try {
    if (!["like", "dislike"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Acción inválida. Debe ser like o dislike" });
    }

    // Validación de monetización (10 swipes gratis por día)
    const currentUser = req.user; 
    const now = new Date();

    // Resetear contador si es un nuevo día
    if (
      currentUser.lastSwipeDate &&
      currentUser.lastSwipeDate.toDateString() !== now.toDateString()
    ) {
      currentUser.swipesToday = 0;
      currentUser.lastSwipeDate = now;
    }

    if (!currentUser.isPremium && currentUser.swipesToday >= 10) {
      return res.status(403).json({
        error: "Has alcanzado el límite diario de 10 swipes gratuitos.",
        requiresUpgrade: true,
      });
    }

    // guardar la peticion
    let newMatch = await Match.create({
      fromPet: fromPetId,
      toPet: toPetId,
      status: action,
    });

    // logica del Match
    let isMatch = false;
    if (action === "like") {
   
      const reverseLike = await Match.findOne({
        fromPet: toPetId,
        toPet: fromPetId,
        status: "like",
      });


      if (reverseLike) {
        isMatch = true;

     
        newMatch.status = "match";
        await newMatch.save();

        reverseLike.status = "match";
        await reverseLike.save();

        // agregar otras funcionalidades como notificaciones  a tiempo real , etc
      }
    }

    // contador de swipe
    currentUser.swipesToday += 1;
    currentUser.lastSwipeDate = new Date();
    await currentUser.save();

    res.status(201).json({
      message: `Deslizaste a la ${action}`,
      isMatch,
      matchData: newMatch,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Ya deslizaste sobre esta mascota antes" });
    }
    res.status(500).json({ error: "Error al procesar el deslizamiento" });
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
      status: "match",
    }).populate("toPet");

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tus matches" });
  }
};
