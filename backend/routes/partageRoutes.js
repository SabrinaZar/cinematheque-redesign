
const express = require("express");
const crypto = require("crypto");

const User = require("../models/User");
const Film = require("../models/Film");

const {
  requireAuth,
  autoriserRoles
} = require("../middleware/auth");

const router = express.Router();

// 1. Générer un lien de partage
router.post(
  "/creer",
  requireAuth,
  autoriserRoles("user"),
  async (req, res) => {
    try {
      // Créer un jeton aléatoire sécurisé
      const token = crypto.randomBytes(32).toString("hex");

      // Enregistrer uniquement son empreinte
      const hash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await User.findByIdAndUpdate(req.user._id, {
        partageTokenHash: hash
      });

      res.status(201).json({
        message: "Lien de partage créé.",
        token
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la création du lien."
      });
    }
  }
);

// 2. Désactiver le partage
router.delete(
  "/desactiver",
  requireAuth,
  autoriserRoles("user"),
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        partageTokenHash: null
      });

      res.json({
        message: "Le partage a été désactivé."
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la désactivation."
      });
    }
  }
);

// 3. Consulter une collection sans connexion
router.get("/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Vérifier le format du lien
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(404).json({
        message: "Lien invalide."
      });
    }

    const hash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Retrouver le propriétaire de la collection
    const proprietaire = await User.findOne({
      partageTokenHash: hash,
      role: "user",
      statutCompte: "accepte"
    }).select("nom");

    if (!proprietaire) {
      return res.status(404).json({
        message: "Lien invalide ou partage désactivé."
      });
    }

    // Récupérer uniquement les films du propriétaire
    const films = await Film.find({
      user: proprietaire._id
    })
      .select("titre realisateur annee genre affiche statut note avis")
      .sort({ createdAt: -1 });

    res.set("Cache-Control", "no-store");

    res.json({
      proprietaire: proprietaire.nom,
      films
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement de la collection."
    });
  }
});

module.exports = router;
