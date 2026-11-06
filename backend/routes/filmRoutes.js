
const express = require("express");
const router = express.Router();

const {
  createFilm,
  getFilms,
  getFilmById,
  updateFilm,
  deleteFilm
} = require("../controllers/FilmController");

const {
  requireAuth,
  autoriserRoles
} = require("../middleware/auth");

// Toutes les routes nécessitent une connexion
router.use(requireAuth);

// Ajouter un film
router.post(
  "/",
  autoriserRoles("admin", "user"),
  createFilm
);

// Consulter les films
router.get(
  "/",
  autoriserRoles("admin", "user"),
  getFilms
);

// Consulter un film
router.get(
  "/:id",
  autoriserRoles("admin", "user"),
  getFilmById
);

// Modifier un film
router.put(
  "/:id",
  autoriserRoles("admin", "user"),
  updateFilm
);

// Supprimer un film
router.delete(
  "/:id",
  autoriserRoles("admin", "user"),
  deleteFilm
);

module.exports = router;
