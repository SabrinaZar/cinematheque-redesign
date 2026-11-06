const mongoose = require("mongoose");
const Film = require("../models/Film");

// Add a new film
exports.createFilm = async (req, res) => {
    try {
        
        const film = await Film.create({
        ...req.body,
        user: req.user._id
        });


        res.status(201).json({
            message: "Film ajouté avec succès",
            film
        });
    } catch (error) {
        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Erreur lors de l'ajout du film"
        });
    }
};

// Get all films with optional filters
exports.getFilms = async (req, res) => {
    try {
        const { statut, genre, q } = req.query;
        
        
        const filter = req.user.role === "admin"
        ? {}
        : { user: req.user._id };



        if (statut) {
            filter.statut = statut;
        }

        if (genre) {
            filter.genre = {
                $regex: genre,
                $options: "i"
            };
        }

        if (q) {
            filter.titre = {
                $regex: q,
                $options: "i"
            };
        }

        
        const films = await Film.find(filter)
        .populate("user", "nom email")
        .sort({ createdAt: -1 });


       
        res.set("Cache-Control", "private, no-store");

        res.status(200).json({
        count: films.length,
        films
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la récupération des films"
        });
    }
};

// Get one film by ID
exports.getFilmById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID du film invalide"
            });
        }

        
        const filtre = req.user.role === "admin"
        ? { _id: id }
        : { _id: id, user: req.user._id };

        const film = await Film.findOne(filtre);


        if (!film) {
            return res.status(404).json({
                message: "Film introuvable"
            });
        }

        res.status(200).json(film);
    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la récupération du film"
        });
    }
};

// Update a film

exports.updateFilm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID du film invalide"
      });
    }

    // Admin : tous les films
    // User : uniquement ses films
    const filtre = req.user.role === "admin"
      ? { _id: id }
      : { _id: id, user: req.user._id };

    // Champs autorisés à être modifiés
    const champs = [
      "titre",
      "realisateur",
      "annee",
      "genre",
      "affiche",
      "statut",
      "note",
      "avis"
    ];

    const modifications = {};

    champs.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        modifications[champ] = req.body[champ];
      }
    });

    if (Object.keys(modifications).length === 0) {
      return res.status(400).json({
        message: "Aucune modification valide."
      });
    }

    const film = await Film.findOneAndUpdate(
      filtre,
      { $set: modifications },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!film) {
      return res.status(404).json({
        message: "Film introuvable ou accès interdit."
      });
    }

    res.json({
      message: "Film modifié avec succès",
      film
    });

  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Erreur lors de la modification du film"
    });
  }
};


// Delete a film

exports.deleteFilm = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier l'identifiant du film
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "ID du film invalide"
      });
    }

    // Admin : tous les films
    // User : uniquement ses propres films
    const filtre = req.user.role === "admin"
      ? { _id: id }
      : { _id: id, user: req.user._id };

    // Supprimer seulement si l'utilisateur a le droit
    const film = await Film.findOneAndDelete(filtre);

    if (!film) {
      return res.status(404).json({
        message: "Film introuvable ou accès interdit."
      });
    }

    res.status(200).json({
      message: "Film supprimé avec succès"
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du film"
    });
  }
};
