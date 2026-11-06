
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, UsersRound, Clapperboard } from "lucide-react";
import AdminCharts from "../components/AdminCharts.js";
const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Admin({ demandeNavigation }) {
  const [demandes, setDemandes] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [films, setFilms] = useState([]);
  const [onglet, setOnglet] = useState("attente");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [statistiques, setStatistiques] = useState(null);
  const [menuAdmin, setMenuAdmin] = useState("statistiques");
  useEffect(() => {
    let actif = true;

    async function chargerDonnees() {
      try {
        // Récupérer les utilisateurs et tous les films
        const [resDemandes, resUtilisateurs, resFilms] =
          await Promise.all([
            fetch(`${API}/admin/demandes`, {
              credentials: "include"
            }),
            fetch(`${API}/admin/utilisateurs`, {
              credentials: "include"
            }),
            fetch(`${API}/films`, {
              credentials: "include"
            })
          ]);

        if (
          !resDemandes.ok ||
          !resUtilisateurs.ok ||
          !resFilms.ok
        ) {
          throw new Error(
            "Impossible de charger le tableau de bord."
          );
        }

        const [dataDemandes, dataUtilisateurs, dataFilms] =
          await Promise.all([
            resDemandes.json(),
            resUtilisateurs.json(),
            resFilms.json()
          ]);

        if (actif) {
          setDemandes(dataDemandes);
          setUtilisateurs(dataUtilisateurs);
          setFilms(dataFilms.films || []);
        }

      } catch (error) {
        if (actif) setErreur(error.message);
      } finally {
        if (actif) setChargement(false);
      }
    }

    chargerDonnees();

    return () => {
      actif = false;
    };
  }, []);

  // Accepter ou refuser un utilisateur
  async function traiterDemande(id, statutCompte) {
    setActionEnCours(id);
    setErreur("");
    setMessage("");
  await chargerStatistiques();
    try {
      const res = await fetch(
        `${API}/admin/demandes/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ statutCompte })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Action impossible.");
      }

      setDemandes((liste) =>
        liste.filter((user) => user._id !== id)
      );

      if (statutCompte === "accepte") {
        setUtilisateurs((liste) => [data.user, ...liste]);
      }

      setMessage(data.message);

    } catch (error) {
      setErreur(error.message);
    } finally {
      setActionEnCours(null);
    }
  }

  // Rechercher les utilisateurs
  const listeUtilisateurs =
    onglet === "attente" ? demandes : utilisateurs;

  const utilisateursFiltres = listeUtilisateurs.filter(
    (user) =>
      `${user.nom} ${user.email}`
        .toLowerCase()
        .includes(recherche.toLowerCase().trim())
  );

  // Rechercher les films par titre ou propriétaire
  const filmsFiltres = films.filter((film) => {
    const texte = [
      film.titre,
      film.genre,
      film.user?.nom,
      film.user?.email
    ].join(" ").toLowerCase();

    return texte.includes(recherche.toLowerCase().trim());
  });

  // Regrouper les films par propriétaire
  const collections = {};

  filmsFiltres.forEach((film) => {
    const proprietaire = film.user;

    const id = proprietaire?._id || "anciens";

    if (!collections[id]) {
      collections[id] = {
        nom: proprietaire?.nom || "Films sans propriétaire",
        email: proprietaire?.email || "",
        films: []
      };
    }

    collections[id].films.push(film);
  });
  
    async function chargerStatistiques() {
      try {
        const response = await fetch(
          `${API}/admin/statistiques`,
          {
            credentials: "include"
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger les statistiques.");
        }

        const data = await response.json();
        setStatistiques(data);

      } catch (error) {
        console.error(error.message);
      }
    }

    useEffect(() => {
      chargerStatistiques();
    }, []);

    
async function supprimerFilm(id, titre) {
  const confirmation = window.confirm(
    `Voulez-vous vraiment supprimer le film "${titre}" ?`
  );

  if (!confirmation) return;

  setActionEnCours(id);
  setErreur("");
  setMessage("");

  try {
    const response = await fetch(`${API}/films/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Impossible de supprimer le film."
      );
    }

    // Retirer le film de l'interface
    setFilms((liste) =>
      liste.filter((film) => film._id !== id)
    );

    setMessage("Film supprimé avec succès.");

    // Actualiser les compteurs
    await chargerStatistiques();

  } catch (error) {
    setErreur(error.message);
  } finally {
    setActionEnCours(null);
  }
}


useEffect(() => {
  if (demandeNavigation === 0) return;

  // Sélectionner les demandes en attente
  setOnglet("attente");
  setRecherche("");
  setMenuAdmin("utilisateurs");

  // Descendre vers la gestion des utilisateurs
  document
    .getElementById("gestion-demandes")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

}, [demandeNavigation]);


function naviguerAdmin(destination) {
  setMenuAdmin(destination);
  setRecherche("");

  if (destination === "utilisateurs") {
    setOnglet("attente");
  }

  if (destination === "films") {
    setOnglet("films");
  }

  const section =
    destination === "statistiques"
      ? "stats-admin"
      : "gestion-demandes";

  requestAnimationFrame(() => {
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}


  return (
    <section className="admin-dashboard">
      
<aside className="admin-sidebar">

  <div className="admin-sidebar-title">
    <span>✦</span> ADMIN PANEL
  </div>

  <nav className="admin-sidebar-nav">

    <button
      type="button"
      className={
        menuAdmin === "statistiques"
          ? "admin-side-link active"
          : "admin-side-link"
      }
      onClick={() => naviguerAdmin("statistiques")}
    >
      <BarChart3 size={19} />
      Statistiques
    </button>

    <button
      type="button"
      className={
        menuAdmin === "utilisateurs"
          ? "admin-side-link active"
          : "admin-side-link"
      }
      onClick={() => naviguerAdmin("utilisateurs")}
    >
      <UsersRound size={19} />
      Utilisateurs
    </button>

    <button
      type="button"
      className={
        menuAdmin === "films"
          ? "admin-side-link active"
          : "admin-side-link"
      }
      onClick={() => naviguerAdmin("films")}
    >
      <Clapperboard size={19} />
      Films
    </button>

  </nav>

</aside>

<main className="admin-main">

      <div className="admin-heading">
        <p className="admin-eyebrow">
          ✦ ESPACE ADMINISTRATEUR
        </p>

        <h1>Tableau de bord<span>.</span></h1>

      </div>
      {/* Graphiques du tableau de bord */}
      <AdminCharts statistiques={statistiques} />

      <div className="admin-panel" id="gestion-demandes">

        <div className="admin-panel-header">
          <h2>Gestion de la cinémathèque</h2>
          <p>
            Utilisateurs, inscriptions et collections.
          </p>
        </div>

        {/* Navigation entre les rubriques */}
        <div className="admin-toolbar">
          <div className="admin-tabs">

            <button
              className={onglet === "attente" ? "selected" : ""}
              onClick={() => {
                setOnglet("attente");
                setRecherche("");
              }}
            >
              En attente ({demandes.length})
            </button>

            <button
              className={onglet === "acceptes" ? "selected" : ""}
              onClick={() => {
                setOnglet("acceptes");
                setRecherche("");
              }}
            >
              Acceptés ({utilisateurs.length})
            </button>

            <button
              className={onglet === "films" ? "selected" : ""}
              onClick={() => {
                setOnglet("films");
                setRecherche("");
              }}
            >
              Films des utilisateurs ({films.length})
            </button>

          </div>

          <input
            className="admin-search"
            type="search"
            placeholder={
              onglet === "films"
                ? "Film ou propriétaire..."
                : "Rechercher un utilisateur..."
            }
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        {erreur && (
          <p className="admin-alert admin-error">
            {erreur}
          </p>
        )}

        {message && (
          <p className="admin-alert admin-success">
            {message}
          </p>
        )}

        {chargement ? (
          <p className="admin-empty">Chargement...</p>

        ) : onglet === "films" ? (

          /* COLLECTIONS DES UTILISATEURS */
          <div className="admin-collections">

            {Object.keys(collections).length === 0 ? (
              <p className="admin-empty">
                Aucun film trouvé.
              </p>
            ) : (
              Object.entries(collections).map(
                ([id, collection]) => (
                  <div className="admin-collection" key={id}>

                    <div className="admin-collection-heading">
                      <div>
                        <h3>🎬 {collection.nom}</h3>
                        <p>{collection.email}</p>
                      </div>

                      <span className="admin-status accepted">
                        {collection.films.length} film(s)
                      </span>
                    </div>

                    <div className="admin-films-grid">
                      {collection.films.map((film) => (
                        <div
                          className="admin-film-card"
                          key={film._id}
                        >
                          <div className="admin-film-poster">
                            {film.affiche ? (
                              <img
                                src={film.affiche}
                                alt={film.titre}
                              />
                            ) : (
                              <span>🎬</span>
                            )}
                          </div>

                          
                      <div className="admin-film-info">
                        <h4>{film.titre}</h4>

                        <p>{film.genre || "Genre non précisé"}</p>

                        <small>{film.annee || "Année inconnue"}</small>

                        <div className="admin-film-buttons">

                          {/* Consulter le film */}
                          <Link
                            to={`/films/${film._id}`}
                            className="admin-film-btn voir"
                          >
                            Voir
                          </Link>

                          {/* Modifier le film */}
                          <Link
                            to={`/films/${film._id}/modifier`}
                            className="admin-film-btn modifier"
                          >
                            Modifier
                          </Link>

                          {/* Supprimer le film */}
                          <button
                            type="button"
                            className="admin-film-btn supprimer"
                            disabled={actionEnCours !== null}
                            onClick={() =>
                              supprimerFilm(film._id, film.titre)
                            }
                          >
                            Supprimer
                          </button>

                        </div>
                      </div>

                        </div>
                      ))}
                    </div>

                  </div>
                )
              )
            )}

          </div>

        ) : (

          /* GESTION DES UTILISATEURS */
          utilisateursFiltres.length === 0 ? (
            <p className="admin-empty">
              Aucun utilisateur trouvé.
            </p>
          ) : (
            <div className="admin-users-list">
              {utilisateursFiltres.map((user) => (
                <div
                  className="admin-user-row"
                  key={user._id}
                >
                  <div className="admin-person">
                    <div className="admin-avatar">
                      {user.nom?.charAt(0).toUpperCase()}
                    </div>

                    <div className="admin-person-details">
                      <h3>{user.nom}</h3>
                      <p>{user.email}</p>
                      <small>
                        Inscrit le{" "}
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString("fr-FR")}
                      </small>
                    </div>
                  </div>

                  <div className="admin-user-actions">

                    <span
                      className={
                        onglet === "attente"
                          ? "admin-status pending"
                          : "admin-status accepted"
                      }
                    >
                      {onglet === "attente"
                        ? "En attente"
                        : "Accepté"}
                    </span>

                    {onglet === "attente" && (
                      <div className="admin-buttons">

                        <button
                          className="admin-accept"
                          disabled={actionEnCours !== null}
                          onClick={() =>
                            traiterDemande(
                              user._id,
                              "accepte"
                            )
                          }
                        >
                          Accepter
                        </button>

                        <button
                          className="admin-reject"
                          disabled={actionEnCours !== null}
                          onClick={() =>
                            traiterDemande(
                              user._id,
                              "refuse"
                            )
                          }
                        >
                          Refuser
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      </main>
    </section>
  );
}
