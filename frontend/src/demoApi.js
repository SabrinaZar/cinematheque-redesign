// Données FICTIVES pour une présentation du design sans serveur.
// Activation facultative avec VITE_DEMO_MODE=true dans .env.
const STORAGE_KEY = "cinematheque-demo-films-v1";
const seed = [
  { _id: "demo-1", titre: "L'Heure bleue", realisateur: "Camille Laurent", annee: 2025, genre: "Drame", affiche: "/posters/heure-bleue.svg", statut: "vu", note: 9, avis: "Une atmosphère magnifique. Chaque plan ressemble à un tableau.", plateforme: "Cinéma" },
  { _id: "demo-2", titre: "Éclipse", realisateur: "Nora Bellamy", annee: 2024, genre: "Science-fiction", affiche: "/posters/eclipse.svg", statut: "a_voir", note: null, avis: "", plateforme: "" },
  { _id: "demo-3", titre: "Dernier été", realisateur: "Léa Moreau", annee: 2023, genre: "Romance", affiche: "/posters/dernier-ete.svg", statut: "vu", note: 8.5, avis: "Une histoire sensible et lumineuse.", plateforme: "Netflix" },
  { _id: "demo-4", titre: "Nocturne", realisateur: "Adam Denis", annee: 2025, genre: "Thriller", affiche: "/posters/nocturne.svg", statut: "a_revoir", note: 9.5, avis: "Un suspense saisissant.", plateforme: "Cinéma" },
  { _id: "demo-5", titre: "Mirage", realisateur: "Sofia Ray", annee: 2022, genre: "Aventure", affiche: "/posters/mirage.svg", statut: "a_voir", note: null, avis: "", plateforme: "" },
  { _id: "demo-6", titre: "Chapitre IX", realisateur: "Victor Armand", annee: 2024, genre: "Mystère", affiche: "/posters/chapitre-9.svg", statut: "vu", note: 7.5, avis: "Original et captivant.", plateforme: "Prime Video" },
];

function read() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); return [...seed]; }
  try { return JSON.parse(saved); } catch { return [...seed]; }
}
function write(films) { localStorage.setItem(STORAGE_KEY, JSON.stringify(films)); }
function response(data) { return Promise.resolve({ data }); }
function missing() { return Promise.reject({ response: { data: { message: "Film introuvable." } } }); }

export const demoApi = {
  getFilms: ({ q = "", statut = "", genre = "" } = {}) => response(read().filter(f =>
    (!q || f.titre.toLowerCase().includes(q.toLowerCase())) &&
    (!statut || f.statut === statut) &&
    (!genre || (f.genre || "").toLowerCase().includes(genre.toLowerCase()))
  )),
  getFilm: (id) => { const f = read().find(f => f._id === id); return f ? response(f) : missing(); },
  createFilm: (data) => { const f = { ...data, _id: `demo-${Date.now()}`, note: data.note === undefined ? null : Number(data.note) }; write([f, ...read()]); return response(f); },
  updateFilm: (id, data) => { const films = read(); const index = films.findIndex(f => f._id === id); if (index < 0) return missing(); films[index] = { ...films[index], ...data, _id: id, note: data.note === undefined ? null : Number(data.note) }; write(films); return response(films[index]); },
  deleteFilm: (id) => { write(read().filter(f => f._id !== id)); return response({ message: "Supprimé." }); },
};
