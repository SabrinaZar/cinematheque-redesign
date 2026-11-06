import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clapperboard, Film, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { getFilms } from "../api.js";
import FilmCard, { STATUTS } from "../components/FilmCard.js";
import ShareCollection from "../components/ShareCollection.js";
import { useSearchParams } from "react-router-dom";

const FILTERS = [{ key: "", label: "Tous les films" }, ...Object.entries(STATUTS).map(([key, label]) => ({ key, label }))];

export default function FilmList() {
  const [films, setFilms] = useState([]);
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get("genre") || "";
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [heroFilms, setHeroFilms] = useState([]); 
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setErreur("");
      try {
        const params = {};
        if (q.trim()) params.q = q.trim();
        if (statut) params.statut = statut;
        if (genre.trim()) params.genre = genre.trim();
        const { data } = await getFilms(params);
        if (active) setFilms(data.films);
      } catch {
        if (active) setErreur("Impossible de charger les films. Vérifiez que le serveur est démarré.");
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [q, statut, genre]);

  const isFiltered = Boolean(q || statut || genre);
  const noted = useMemo(() => films.filter(f => f.note != null && f.note !== "").length, [films]);
  const reset = () => {
  setQ("");
  setStatut("");
  setSearchParams({});
};


const heroPositions = [
  "hero-poster-left",
  "hero-poster-main",
  "hero-poster-right"
];

useEffect(() => {
  let actif = true;

  // Charger les films du Hero sans filtre de genre
  async function chargerHero() {
    try {
      const response = await getFilms();

      const tousLesFilms = Array.isArray(response.data)
        ? response.data
        : response.data.films || [];

      if (actif) {
        setHeroFilms(tousLesFilms.slice(0, 3));
      }
    } catch (error) {
      console.error("Erreur chargement Hero :", error);
    }
  }

  chargerHero();

  return () => {
    actif = false;
  };
}, []);


  return (
    <>
      
<section className="hero">

  {/* TEXTE À GAUCHE */}
  <div className="hero-copy">

    <div className="eyebrow">
      <span className="eyebrow-line" />
      VOTRE UNIVERS CINÉMA
      <Sparkles size={14} />
    </div>

    <h1>
      Chaque film
      <br />
      mérite <em>sa place.</em>
    </h1>

    <p>
      Un endroit pour les films qui vous ont marqué,
      ceux que vous aimez, et toutes les histoires
      qu'il vous reste à découvrir.
    </p>

    <div className="hero-actions">
      <a href="#collection" className="btn btn-accent">
        Explorer ma collection
        <ArrowRight size={17} />
      </a>

      <Link to="/ajouter" className="btn btn-quiet">
        <Plus size={17} />
        Ajouter un film
      </Link>
    </div>

    <div className="hero-proof">
      <span className="proof-icon">
        <Film size={16} />
      </span>
      <span>Votre cinémathèque, votre histoire.</span>
    </div>

  </div>

  {/* AFFICHES À DROITE */}
  <div className="hero-art" aria-hidden="true">

    <div className="hero-halo" />
    <div className="hero-arc" />

    {heroFilms.map((film, index) => (
      <div
        key={film._id}
        className={
          "hero-poster " + heroPositions[index]
        }
      >
        {film.affiche ? (
          <img src={film.affiche} alt="" />
        ) : (
          <div className="hero-film-placeholder">
            <span>{film.titre}</span>
          </div>
        )}
      </div>
    ))}

    <div className="art-tag">
      <span className="art-tag-dot" />
      THE ART OF WATCHING
    </div>

    <div className="art-cross art-cross-a">+</div>
    <div className="art-cross art-cross-b">+</div>

  </div>

</section>

      <section className="collection-section" id="collection">
        <div className="section-heading">
          <div>
            <div className="eyebrow section-kicker">VOTRE SÉLECTION</div>
            <h2>Ma collection<span className="heading-dot">.</span></h2>
            <p>Retrouvez toutes vos découvertes au même endroit.</p>
          </div>
          <div className="collection-counter"><span>{loading ? "—" : films.length.toString().padStart(2, "0")}</span><small>{films.length === 1 ? "FILM TROUVÉ" : "FILMS TROUVÉS"}</small></div>
        </div>
        <ShareCollection />
        <div className="filter-panel">
          <div className="filter-topline">
            <div className="field-with-icon search-field"><Search size={19}/><input type="search" placeholder="Rechercher un film par son titre..." aria-label="Rechercher un film" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div className="field-with-icon genre-field"><SlidersHorizontal size={17}/><input type="text" placeholder="Genre : Drame, Comédie..." aria-label="Filtrer par genre" value={genre} onChange={(e) =>
                setSearchParams(
                  e.target.value ? { genre: e.target.value } : {},
                  { replace: true }
                )
              } 
            /></div>
          </div>
          <div className="filter-bottomline">
            <div className="filter-chips" role="group" aria-label="Filtrer par statut">
              {FILTERS.map(f => <button type="button" key={f.key} className={`chip ${statut === f.key ? "chip-active" : ""}`} aria-pressed={statut === f.key} onClick={() => setStatut(f.key)}>{f.label}</button>)}
            </div>
            {isFiltered && <button type="button" className="reset-button" onClick={reset}><X size={14}/> Effacer les filtres</button>}
          </div>
        </div>

        {erreur && <div className="error-message" role="alert">{erreur}</div>}
        {loading ? (
          <div className="movie-grid" aria-label="Chargement des films">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div/><span/><span/></div>)}</div>
        ) : !erreur && films.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><Clapperboard size={29}/></div><h3>{isFiltered ? "Aucun film trouvé" : "Votre collection commence ici"}</h3><p>{isFiltered ? "Essayez une autre recherche ou supprimez les filtres." : "Ajoutez votre premier film et commencez votre histoire."}</p>{isFiltered ? <button className="btn btn-quiet" onClick={reset}>Effacer les filtres <X size={15}/></button> : <Link to="/ajouter" className="btn btn-accent"><Plus size={17}/> Ajouter mon premier film</Link>}</div>
        ) : !erreur && (
          <>
            <div className="results-line"><span>{films.length} {films.length === 1 ? "film" : "films"} dans cette sélection</span><span>{noted} {noted === 1 ? "film noté" : "films notés"}</span></div>
            <div className="movie-grid">{films.map(film => <FilmCard key={film._id} film={film} />)}</div>
          </>
        )}
      </section>
    </>
  );
}
