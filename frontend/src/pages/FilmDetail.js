import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clapperboard, Edit3, Film, Star, Trash2 } from "lucide-react";
import { deleteFilm, getFilm } from "../api.js";
import { STATUTS } from "../components/FilmCard.js";

export default function FilmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [erreur, setErreur] = useState("");
  const [suppression, setSuppression] = useState(false);

  useEffect(() => {
    let active = true;
    setFilm(null);
    setErreur("");
    getFilm(id).then(({ data }) => { if (active) setFilm(data); }).catch(err => {
      if (active) setErreur(err.response?.data?.message || "Erreur de chargement du film.");
    });
    return () => { active = false; };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer « ${film.titre} » de votre collection ?`)) return;
    setSuppression(true);
    try { await deleteFilm(id); navigate("/"); }
    catch { setErreur("La suppression a échoué. Réessayez."); setSuppression(false); }
  };

  if (erreur && !film) return <div className="page-narrow"><Link to="/" className="back-link"><ArrowLeft size={16}/> Ma collection</Link><p className="error-message" role="alert">{erreur}</p></div>;
  if (!film) return <div className="page-narrow"><div className="loading-text">Chargement du film...</div></div>;

  const rating = film.note != null && film.note !== "";
  return (
    <div className="detail-page">
      <Link to="/" className="back-link"><ArrowLeft size={16}/> Retour à ma collection</Link>
      <div className="detail-layout">
        <aside className="detail-media">
          {film.affiche ? <img src={film.affiche} className="detail-poster" alt={`Affiche de ${film.titre}`} /> : <div className="detail-poster poster-fallback"><Film size={75}/><span>{film.titre}</span></div>}
        </aside>
        <div className="detail-content">
          <span className="eyebrow">FICHE FILM <span className="eyebrow-number">/ VOTRE COLLECTION</span></span>
          <h1>{film.titre}</h1>
          <div className="detail-subline">{[film.annee, film.genre, film.realisateur].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}</div>
          <div className="detail-status-row"><span className={`status-pill status-pill-static ${film.statut || "a_voir"}`}>{STATUTS[film.statut] || "À voir"}</span>{rating && <span className="detail-rating"><Star size={20} fill="currentColor" /> <strong>{film.note}</strong><span>/10</span></span>}</div>
          <div className="detail-divider"/>
          {film.plateforme && <div className="detail-info-block"><small>OÙ LE REGARDER</small><p>{film.plateforme}</p></div>}
          <div className="detail-info-block"><small>VOTRE AVIS</small>{film.avis ? <p className="review-text">“{film.avis}”</p> : <p className="no-review">Aucun avis pour le moment. Une belle histoire à écrire.</p>}</div>
          <div className="detail-actions">
            <Link to={`/films/${film._id}/modifier`} className="btn btn-accent"><Edit3 size={16}/> Modifier ce film</Link>
            <button type="button" onClick={handleDelete} disabled={suppression} className="btn btn-outline-danger"><Trash2 size={16}/> {suppression ? "Suppression..." : "Supprimer"}</button>
          </div>
          {erreur && <p className="error-message" role="alert">{erreur}</p>}
        </div>
      </div>
      <div className="detail-footnote"><Clapperboard size={17}/> LES MEILLEURS FILMS MÉRITENT DE RESTER.</div>
    </div>
  );
}
