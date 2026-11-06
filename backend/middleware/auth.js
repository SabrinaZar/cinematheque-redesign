
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Vérifier si l'utilisateur est connecté
async function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Veuillez vous connecter."
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    const user = await User.findById(decoded.sub);

    
if (!user) {
  return res.status(401).json({
    message: "Utilisateur introuvable."
  });
}

// Vérifier si le compte a été accepté par l'Admin
if (user.statutCompte !== "accepte") {
  return res.status(403).json({
    message: user.statutCompte === "en_attente"
      ? "Votre compte attend la validation de l'administrateur."
      : "Votre compte a été refusé ou désactivé."
  });
}

// Autoriser l'accès
req.user = user;
next();

  } catch (error) {
    return res.status(401).json({
      message: "Session invalide ou expirée."
    });
  }
}

// Vérifier si l'utilisateur est administrateur
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès réservé aux administrateurs."
    });
  }

  next();
}

function autoriserRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Connexion requise"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission"
      });
    }

    next();
  };
}


module.exports = {
  requireAuth,
  requireAdmin,
  autoriserRoles
};