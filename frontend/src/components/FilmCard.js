import { Link } from "react-router-dom";
import { ArrowUpRight, Film, Star } from "lucide-react";

export const STATUTS = {
  a_voir: "À voir",
  vu: "Vu",
  a_revoir: "À revoir",
};

export default function FilmCard({ film }) {
  const hasRating = film.note !== null && film.note !== undefined && film.note !== "";
  return (
    <article className="movie-card">
      <Link className="poster-link" to={`/films/${film._id}`} aria-label={`Voir le détail de ${film.titre}`}>
        <div className="poster-surface">
          {film.affiche ? (
            <img className="poster-image" src={film.affiche} alt={`Affiche de ${film.titre}`} loading="lazy" />
          ) : (
            <div className="poster-fallback"><Film size={48} strokeWidth={1.2}/><span>{film.titre}</span></div>
          )}
          <span className={`status-pill ${film.statut || "a_voir"}`}>{STATUTS[film.statut] || "À voir"}</span>
          <span className="poster-hover" aria-hidden="true">Découvrir <ArrowUpRight size={18}/></span>
        </div>
      </Link>
      <div className="movie-meta">
        <div className="movie-label-line">
          <span className="movie-year">{film.annee || "FILM"}</span>
          {hasRating && <span className="movie-rating"><Star size={13} fill="currentColor" /> {film.note}<span>/10</span></span>}
        </div>
        <Link to={`/films/${film._id}`} className="movie-title">{film.titre}</Link>
        <p className="movie-genre">{film.genre || film.realisateur || "À découvrir"}</p>
      </div>
    </article>
  );
}
