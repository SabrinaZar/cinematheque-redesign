import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clapperboard, Image as ImageIcon, Save, Star } from "lucide-react";
import { createFilm, getFilm, updateFilm } from "../api.js";
import { STATUTS } from "../components/FilmCard.js";

const VIDE = {
  titre: "", realisateur: "", annee: "", genre: "", affiche: "",
  statut: "a_voir", note: "", avis: "", plateforme: "",
};

export default function FilmForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...VIDE });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [chargement, setChargement] = useState(Boolean(id));

  useEffect(() => {
    let active = true;
    setErreur("");
    if (!id) { setForm({ ...VIDE }); setChargement(false); return; }
    setChargement(true);
    getFilm(id).then(({ data }) => {
      if (active) setForm({ ...VIDE, ...Object.fromEntries(Object.entries(data).map(([k,v]) => [k, v ?? ""])) });
    }).catch(() => { if (active) setErreur("Ce film est introuvable."); })
      .finally(() => { if (active) setChargement(false); });
    return () => { active = false; };
  }, [id]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    setErreur("");
    if (!form.titre.trim()) return setErreur("Le titre du film est obligatoire.");
    if (form.note !== "" && (!Number.isFinite(Number(form.note)) || Number(form.note) < 0 || Number(form.note) > 10)) return setErreur("La note doit être comprise entre 0 et 10.");
    if (form.avis.length > 500) return setErreur("Votre avis ne peut pas dépasser 500 caractères.");
    if (form.affiche.trim()) {
      const isDemoPoster = import.meta.env.VITE_DEMO_MODE === "true" && form.affiche.startsWith("/posters/");
      const isHttpUrl = /^https?:\/\//i.test(form.affiche.trim());
      if (!isDemoPoster && !isHttpUrl) return setErreur("L'affiche doit contenir une URL commençant par http:// ou https://.");
      if (isHttpUrl) { try { new URL(form.affiche.trim()); } catch { return setErreur("L'URL de l'affiche n'est pas valide."); } }
    }
    if (form.annee !== "" && !Number.isInteger(Number(form.annee))) return setErreur("Saisissez une année valide.");

    // Champs facultatifs retirés à la création, mais explicitement vidés à la modification.
    // Cela permet de supprimer une ancienne affiche, note ou plateforme en mode édition.
    const data = id
      ? { ...form, titre: form.titre.trim(), annee: form.annee === "" ? null : Number(form.annee), note: form.note === "" ? null : Number(form.note) }
      : Object.fromEntries(Object.entries({ ...form, titre: form.titre.trim(), annee: form.annee === "" ? "" : Number(form.annee), note: form.note === "" ? "" : Number(form.note) }).filter(([, value]) => value !== ""));
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;

    setEnvoi(true);
   try {
  if (id) {
    await updateFilm(id, data);
  } else {
    await createFilm(data);
  }

  navigate("/");
} catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'enregistrement du film.");
    } finally { setEnvoi(false); }
  };

  if (chargement) return <div className="page-narrow"><p className="loading-text">Chargement du formulaire...</p></div>;

  return (
    <div className="form-page">
      <Link to={id ? `/films/${id}` : "/"} className="back-link"><ArrowLeft size={16}/> {id ? "Retour à la fiche du film" : "Retour à ma collection"}</Link>
      <div className="form-page-heading">
        <div><div className="eyebrow">VOTRE UNIVERS CINÉMA <span className="heading-slash">/ VOS FILMS</span></div><h1>{id ? "Modifier" : "Ajouter"} <em>un film.</em></h1><p>{id ? "Actualisez les informations et vos impressions sur ce film." : "Une nouvelle histoire à conserver dans votre collection."}</p></div>
        <div className="form-heading-mark"><Clapperboard size={42} strokeWidth={1}/></div>
      </div>
      <form className="film-form" onSubmit={handleSubmit}>
        {erreur && <p className="error-message" role="alert">{erreur}</p>}
        <div className="form-section">
          <div className="form-section-heading"><span className="section-number">01</span><div><h2>Informations du film</h2><p>Les détails qui donnent vie à votre collection.</p></div></div>
          <div className="form-fields">
            <label className="form-field form-field-full"><span>Titre du film <b>*</b></span><input name="titre" value={form.titre} onChange={handleChange} maxLength={200} placeholder="Ex. : Inception" required /></label>
            <label className="form-field"><span>Réalisateur</span><input name="realisateur" value={form.realisateur} onChange={handleChange} placeholder="Ex. : Christopher Nolan" /></label>
            <label className="form-field"><span>Année de sortie</span><input type="number" name="annee" value={form.annee} onChange={handleChange} placeholder="Ex. : 2010" min="1888" max="2200" /></label>
            <label className="form-field"><span>Genre</span><input name="genre" value={form.genre} onChange={handleChange} placeholder="Ex. : Science-fiction" /></label>
            <label className="form-field"><span>Plateforme</span><input name="plateforme" value={form.plateforme} onChange={handleChange} placeholder="Netflix, cinéma, DVD..." /></label>
            <label className="form-field form-field-full"><span>URL de l'affiche</span><div className="input-with-leading"><ImageIcon size={17}/><input type="text" inputMode="url" name="affiche" value={form.affiche} onChange={handleChange} placeholder="https://exemple.com/affiche.jpg" /></div></label>
          </div>
        </div>
        <div className="form-separator"/>
        <div className="form-section">
          <div className="form-section-heading"><span className="section-number">02</span><div><h2>Votre expérience</h2><p>Une note, un statut, un souvenir.</p></div></div>
          <div className="form-fields">
            <label className="form-field"><span>Statut</span><select name="statut" value={form.statut} onChange={handleChange}>{Object.entries(STATUTS).map(([valeur, label]) => <option key={valeur} value={valeur}>{label}</option>)}</select></label>
            <label className="form-field"><span>Ma note <span className="field-hint">(sur 10)</span></span><div className="input-with-leading"><Star size={17}/><input type="number" name="note" min="0" max="10" step="0.5" value={form.note} onChange={handleChange} placeholder="Ex. : 8.5" /></div></label>
            <label className="form-field form-field-full"><span>Mon avis <span className="field-hint">(facultatif)</span></span><textarea name="avis" rows="5" maxLength="500" value={form.avis} onChange={handleChange} placeholder="Ce que vous avez ressenti en regardant ce film..." /><small className="char-count">{form.avis.length} / 500 caractères</small></label>
          </div>
        </div>
        <div className="form-footer"><span>* Champ obligatoire</span><div className="form-footer-buttons"><button type="button" className="btn btn-quiet" onClick={() => navigate(id ? `/films/${id}` : "/")}>Annuler</button><button type="submit" className="btn btn-accent" disabled={envoi}><Save size={16}/>{envoi ? "Enregistrement..." : id ? "Enregistrer les modifications" : "Ajouter à ma collection"}<ArrowRight size={16}/></button></div></div>
      </form>
    </div>
  );
}
