import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51MockKeyParaDefensaAcademicaSolamente",
  {
    apiVersion: "2023-10-16",
  },
);

// ==========================================
// CREAR SESIÓN DE PAGO (CHECKOUT)
// ==========================================
export const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/pago-exitoso?session_id=mock_session_12345`,
      isMock: true,
    });
  } catch (error) {
    console.error("Error al crear sesión de pago:", error);
    res.status(500).json({ error: "Error al inicializar la pasarela de pago" });
  }
};

// ==========================================
// VERIFICAR Y APLICAR SUBSCRIPCIÓN
// ==========================================
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const user = req.user;

    user.isPremium = true;
    // 30 días 
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30);
    user.premiumExpiresAt = expireDate;

    await user.save();

    res.json({
      message: "¡Pago exitoso! Ahora eres Petin Gold.",
      isPremium: true,
    });
  } catch (error) {
    console.error("Error al verificar pago:", error);
    res.status(500).json({ error: "Error al verificar la transacción" });
  }
};
