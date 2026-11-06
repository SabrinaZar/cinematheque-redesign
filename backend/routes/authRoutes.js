
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { envoyerEmailVerification } =
  require("../services/emailService");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Créer un cookie JWT
function creerSession(res, user) {
  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });
}

// INSCRIPTION
router.post("/register", async (req, res) => {
  try {
    const nom = String(req.body.nom || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!nom || !/^\S+@\S+\.\S+$/.test(email) ||
        typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Nom, email valide et mot de passe de 8 caractères minimum requis."
      });
    }

    const existe = await User.findOne({ email });

    if (existe) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé."
      });
    }

    const hash = await bcrypt.hash(password, 12);

    
// Générer un jeton de vérification aléatoire
const token = crypto.randomBytes(32).toString("hex");

// Enregistrer son empreinte dans MongoDB
const tokenHash = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

// Le lien expire après 24 heures
const expiration = new Date(
  Date.now() + 24 * 60 * 60 * 1000
);

// Créer le compte utilisateur
const user = await User.create({
  nom,
  email,
  password: hash,
  role: "user",
  statutCompte: "en_attente",
  emailVerifie: false,
  emailVerificationTokenHash: tokenHash,
  emailVerificationExpire: expiration
});

// Construire le lien de vérification
const lien =
  `http://localhost:5000/auth/verify-email?token=${token}`;

let emailEnvoye = false;

    try {
      await envoyerEmailVerification(user, lien);
      emailEnvoye = true;
    } catch (error) {
      console.error(
        "Erreur d'envoi de vérification :",
        error.message
      );
    }

    // Réponse après inscription
    res.status(201).json({
      message: emailEnvoye
        ? "Inscription réussie ! Vérifiez votre boîte email."
        : "Compte créé, mais l'email de vérification n'a pas pu être envoyé.",
      emailEnvoye
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      message: error.code === 11000
        ? "Cet email est déjà utilisé."
        : "Erreur lors de l'inscription."
    });
  }
});

 // VÉRIFICATION DE L'ADRESSE EMAIL
 router.get("/verify-email", async (req, res) => {
   try {
     const token = req.query.token;

     // Vérifier que le lien contient un jeton valide
     if (
       typeof token !== "string" ||
       !/^[a-f0-9]{64}$/.test(token)
     ) {
       return res.status(400).json({
         message: "Lien de vérification invalide."
       });
     }

     // Calculer l'empreinte du jeton
     const tokenHash = crypto
       .createHash("sha256")
       .update(token)
       .digest("hex");

     // Trouver le compte et confirmer son email
     const user = await User.findOneAndUpdate(
       {
         emailVerificationTokenHash: tokenHash,
         emailVerificationExpire: { $gt: new Date() },
         emailVerifie: false
       },
       {
         $set: { emailVerifie: true },
         $unset: {
           emailVerificationTokenHash: "",
           emailVerificationExpire: ""
         }
       },
       { returnDocument: "after" }
     );

     if (!user) {
       return res.status(400).json({
         message: "Lien invalide, expiré ou déjà utilisé."
       });
     }

     res.json({
       message:
         "Email vérifié avec succès ! Votre compte attend maintenant la validation de l'administrateur."
     });

   } catch (error) {
     console.error("Erreur vérification email :", error.message);

     res.status(500).json({
       message: "Erreur lors de la vérification de l'email."
     });
   }
 });

// CONNEXION
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (typeof password !== "string") {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect."
      });
    }

    const user = await User.findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect."
      });
    }

    const correct = await bcrypt.compare(password, user.password);

    if (!correct) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect."
      });
    }

    // Vérification de l'acceptation par l'Admin
    if (user.statutCompte !== "accepte") {
      return res.status(403).json({
        message: "Votre compte n'est pas encore accepté."
      });
    }

    creerSession(res, user);

    res.json({
      message: "Connexion réussie.",
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la connexion."
    });
  }
});

// UTILISATEUR CONNECTÉ
router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      nom: req.user.nom,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// DÉCONNEXION
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  res.json({ message: "Déconnexion réussie." });
});

module.exports = router;
