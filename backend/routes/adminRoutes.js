
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Film = require("../models/Film");
const { envoyerEmailAcceptation } = require("../services/emailService");

const {
  requireAuth,
  requireAdmin
} = require("../middleware/auth");

const router = express.Router();

// Accès réservé à l'Admin
router.use(requireAuth, requireAdmin);

// Voir les comptes en attente
router.get("/demandes", async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
      statutCompte: "en_attente"
    }).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du chargement des demandes."
    });
  }
});

// Accepter ou refuser un compte
router.patch("/demandes/:id", async (req, res) => {
  try {
    const { statutCompte } = req.body;

    if (!["accepte", "refuse"].includes(statutCompte)) {
      return res.status(400).json({
        message: "Statut invalide."
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID invalide."
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "user",
        statutCompte: "en_attente"
      },
      { statutCompte },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "Demande introuvable ou déjà traitée."
      });
    }

    
let emailEnvoye = false;

// Envoyer un email uniquement si le compte est accepté
if (statutCompte === "accepte") {
  try {
    await envoyerEmailAcceptation(user);
    emailEnvoye = true;

    console.log("Email d'acceptation envoyé à :", user.email);

  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email :",
      error.message
    );
  }
}

    // Réponse envoyée au frontend
    res.json({
      message: statutCompte === "accepte"
        ? emailEnvoye
          ? "Utilisateur accepté. Email envoyé avec succès."
          : "Utilisateur accepté, mais l'email n'a pas pu être envoyé."
        : "Utilisateur refusé.",
      user,
      emailEnvoye
    });


  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la validation."
    });
  }
});

 // GET /admin/utilisateurs
 // Liste des utilisateurs acceptés
 router.get("/utilisateurs", async (req, res) => {
   try {
     const utilisateurs = await User.find({
       role: "user",
       statutCompte: "accepte"
     })
       .select("nom email role statutCompte createdAt")
       .sort({ createdAt: -1 });

     res.json(utilisateurs);

   } catch (error) {
     res.status(500).json({
       message: "Erreur lors du chargement des utilisateurs."
     });
   }
 });


 // GET /admin/statistiques
 router.get("/statistiques", async (req, res) => {
   try {
     const [
       totalUsers,
       enAttente,
       acceptes,
       refuses,
       totalFilms
     ] = await Promise.all([
       User.countDocuments({ role: "user" }),
       User.countDocuments({ role: "user", statutCompte: "en_attente" }),
       User.countDocuments({ role: "user", statutCompte: "accepte" }),
       User.countDocuments({ role: "user", statutCompte: "refuse" }),
       Film.countDocuments()
     ]);

     res.json({
       totalUsers,
       enAttente,
       acceptes,
       refuses,
       totalFilms
     });

   } catch (error) {
     res.status(500).json({
       message: "Erreur lors du chargement des statistiques."
     });
   }
 });

 // Données pour les graphiques Admin
 router.get("/graphiques", async (req, res) => {
   try {
     // Date de début : les 6 derniers mois
     const debut = new Date();
     debut.setUTCDate(1);
     debut.setUTCHours(0, 0, 0, 0);
     debut.setUTCMonth(debut.getUTCMonth() - 5);

     // Compter les inscriptions par mois
     const inscriptions = await User.aggregate([
       {
         $match: {
           role: "user",
           createdAt: { $gte: debut }
         }
       },
       {
         $group: {
           _id: {
             $dateToString: {
               format: "%Y-%m",
               date: "$createdAt"
             }
           },
           nombre: { $sum: 1 }
         }
       }
     ]);

     // Préparer les 6 mois, même ceux sans inscriptions
     const inscriptionsParMois = [];

     for (let i = 0; i < 6; i++) {
       const date = new Date(Date.UTC(
         debut.getUTCFullYear(),
         debut.getUTCMonth() + i,
         1
       ));

       const cle = date.toISOString().slice(0, 7);
       const resultat = inscriptions.find(
         (item) => item._id === cle
       );

       inscriptionsParMois.push({
         mois: date.toLocaleDateString("fr-FR", {
           month: "short",
           year: "2-digit",
           timeZone: "UTC"
         }),
         nombre: resultat ? resultat.nombre : 0
       });
     }

     // Compter les films par genre
     const filmsParGenre = await Film.aggregate([
       {
         $group: {
           _id: {
             $cond: [
               {
                 $in: [
                   "$genre",
                   ["", null]
                 ]
               },
               "Non précisé",
               "$genre"
             ]
           },
           nombre: { $sum: 1 }
         }
       },
       { $sort: { nombre: -1 } }
     ]);

     res.json({
       inscriptionsParMois,
       filmsParGenre: filmsParGenre.map((item) => ({
         genre: item._id,
         nombre: item.nombre
       }))
     });

   } catch (error) {
     res.status(500).json({
       message: "Erreur lors du chargement des graphiques."
     });
   }
 });

router.get("/graphiques", async (req, res) => {
  try {
    // Inscriptions des 6 derniers mois
    const inscriptionsParMois = [];

    for (let i = 5; i >= 0; i--) {
      const debut = new Date();
      debut.setUTCDate(1);
      debut.setUTCHours(0, 0, 0, 0);
      debut.setUTCMonth(debut.getUTCMonth() - i);

      const fin = new Date(debut);
      fin.setUTCMonth(fin.getUTCMonth() + 1);

      const nombre = await User.countDocuments({
        role: "user",
        createdAt: {
          $gte: debut,
          $lt: fin
        }
      });

      inscriptionsParMois.push({
        mois: debut.toLocaleDateString("fr-FR", {
          month: "short",
          year: "2-digit"
        }),
        nombre
      });
    }

    // Films classés par genre
    const resultat = await Film.aggregate([
      {
        $group: {
          _id: "$genre",
          nombre: { $sum: 1 }
        }
      },
      {
        $sort: { nombre: -1 }
      }
    ]);

    const filmsParGenre = resultat.map((item) => ({
      genre: item._id || "Non précisé",
      nombre: item.nombre
    }));

    res.json({
      inscriptionsParMois,
      filmsParGenre
    });

  } catch (error) {
    console.error("Erreur graphiques :", error);

    res.status(500).json({
      message: "Erreur lors du chargement des graphiques."
    });
  }
});

module.exports = router;
