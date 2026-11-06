
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";

import { Bell, LogOut } from "lucide-react";
import FilmList from "./pages/FilmList.js";
import FilmForm from "./pages/FilmForm.js";
import FilmDetail from "./pages/FilmDetail.js";
import Login from "./pages/Login.js";
import Admin from "./pages/Admin.js";
import Inscription from "./pages/Inscription.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const genres = [
  "Drame",
  "Comédie",
  "Action",
  "Romance",
  "Thriller",
  "Science-fiction"
];

export default function App() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [verification, setVerification] = useState(true);
  const [demandesNotif, setDemandesNotif] = useState([]);
  const [menuNotifications, setMenuNotifications] = useState(false);
  const [ouvrirDemandes, setOuvrirDemandes] = useState(0);
  const notifications = demandesNotif.length;
  const genreActif =
      new URLSearchParams(location.search).get("genre") || "";

    
  const navigate = useNavigate();

  const [deconnexionEnCours, setDeconnexionEnCours] =
    useState(false);

async function deconnecter() {
  setDeconnexionEnCours(true);

  try {
    const response = await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Déconnexion impossible.");
    }

    // Effacer l'utilisateur connecté
    setUser(null);

    // Retourner vers Login
    navigate("/connexion", { replace: true });

  } catch (error) {
    alert(error.message);
  } finally {
    setDeconnexionEnCours(false);
  }
}

  // Vérifier la session JWT
  useEffect(() => {
    let actif = true;

    setVerification(true);

    fetch(`${API}/auth/me`, {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Non connecté");
        }
        return res.json();
      })
      .then((data) => {
        if (actif) setUser(data.user);
      })
      .catch(() => {
        if (actif) setUser(null);
      })
      .finally(() => {
        if (actif) setVerification(false);
      });

    return () => {
      actif = false;
    };
  }, [location.pathname]);

  


useEffect(() => {
  if (user?.role !== "admin") {
    setDemandesNotif([]);
    setMenuNotifications(false);
    return;
  }

  let actif = true;

  async function chargerNotifications() {
    try {
      const response = await fetch(
        `${API}/admin/demandes`,
        {
          credentials: "include",
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error("Erreur de chargement");
      }

      const data = await response.json();

      if (actif) {
        setDemandesNotif(data);
      }

    } catch (error) {
      console.error(
        "Erreur notifications :",
        error
      );
    }
  }

  chargerNotifications();

  // Actualiser toutes les 15 secondes
  const interval = setInterval(
    chargerNotifications,
    15000
  );

  return () => {
    actif = false;
    clearInterval(interval);
  };

}, [user?.role]);



  return (
    <div className="app-shell">

      <header className="site-header">
        <div className="header-inner">

          <Link to="/" className="brand">
            <span className="brand-mark">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="9" width="16" height="11" rx="2" />
                <path d="M4 9 3 5l16-3 2 5-17 3" />
                <path d="M7 4l3 5M13 3l3 5" />
              </svg>
            </span>

            <span className="brand-name">
              cinéma<span>thèque.</span>
            </span>
          </Link>

          
      
<div className="header-actions">

  {/* Visiteur non connecté */}
  {!user &&
    location.pathname !== "/connexion" &&
    location.pathname !== "/inscription" && (
      <Link to="/connexion" className="nav-login">
        Connexion
      </Link>
    )}

  
{/* Notifications : Admin uniquement */}
{user?.role === "admin" &&
  location.pathname === "/admin" && (
    <div className="notification-wrapper">

      <button
        type="button"
        className="admin-notification"
        aria-label={`${notifications} demandes en attente`}
        aria-expanded={menuNotifications}
        onClick={() =>
          setMenuNotifications(!menuNotifications)
        }
      >
        <Bell size={22} />

        {notifications > 0 && (
          <span className="notification-count">
            {notifications}
          </span>
        )}
      </button>

      {menuNotifications && (
        <div className="notification-dropdown">

          <div className="notification-header">
            <h3>Notifications</h3>

            <button
              type="button"
              onClick={() => setMenuNotifications(false)}
              aria-label="Fermer les notifications"
            >
              ✕
            </button>
          </div>

          <p className="notification-subtitle">
            {notifications} demande(s) en attente
          </p>

          {demandesNotif.length === 0 ? (
            <p className="notification-empty">
              Aucune nouvelle demande.
            </p>
          ) : (
            <div className="notification-list">
              {demandesNotif.map((demande) => (
                <div
                  className="notification-item"
                  key={demande._id}
                >
                  <div className="notification-avatar">
                    {demande.nom?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{demande.nom}</strong>
                    <p>{demande.email}</p>
                    <small>
                      Nouvelle demande d'inscription
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          <button
            type="button"
            className="notification-manage"
            onClick={() => {
              setMenuNotifications(false);
              setOuvrirDemandes((n) => n + 1);
            }}
          >
            Gérer les demandes
          </button>


        </div>
      )}
    </div>
  )}

  {/* Ajouter un film : User uniquement */}
  {user?.role === "user" &&
    location.pathname !== "/connexion" &&
    location.pathname !== "/inscription" && (
      <Link
        to="/ajouter"
        className="btn btn-accent header-cta"
      >
        + Ajouter un film
      </Link>
    )}

  {/* Déconnexion : Admin et User */}
  {user &&
    location.pathname !== "/connexion" &&
    location.pathname !== "/inscription" && (
      <button
        type="button"
        className="logout-button"
        onClick={deconnecter}
        disabled={deconnexionEnCours}
      >
        <LogOut size={17} />

        {deconnexionEnCours
          ? "Déconnexion..."
          : "Déconnexion"}
      </button>
    )}

</div>



        </div>
      </header>

      {location.pathname === "/" && (
        <nav className="genres-nav">
          <div className="genres-inner">

            <Link
              to="/"
              className={
                genreActif === ""
                  ? "genre-tab active"
                  : "genre-tab"
              }
            >
              Tous les films
            </Link>

            {genres.map((genre) => (
              <Link
                key={genre}
                to={"/?genre=" + encodeURIComponent(genre)}
                className={
                  genreActif === genre
                    ? "genre-tab active"
                    : "genre-tab"
                }
              >
                {genre}
              </Link>
            ))}

          </div>
        </nav>
      )}

      <main className="main-content">

        <Routes>

          
      <Route
        path="/"
        element={
          verification ? (
            <p>Chargement...</p>
          ) : !user ? (
            <Navigate to="/connexion" replace />
          ) : user.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <FilmList />
          )
        }
      />


          <Route
            path="/ajouter"
            element={<FilmForm />}
          />

          <Route
            path="/connexion"
            element={<Login onLogin={setUser} />}
          />

          <Route
            path="/inscription"
            element={<Inscription />}
          />

          {/* Nouvelle page Admin protégée */}
          <Route
            path="/admin"
            element={
              verification ? (
                <p>Vérification de la session...</p>
              ) : user?.role === "admin" ? (
                <Admin demandeNavigation={ouvrirDemandes} />
              ) : (
                <Navigate
                  to={user ? "/" : "/connexion"}
                  replace
                />
              )
            }
          />

          <Route
            path="/films/:id"
            element={<FilmDetail />}
          />

          <Route
            path="/films/:id/modifier"
            element={<FilmForm />}
          />

          <Route
            path="*"
            element={<p>Page introuvable.</p>}
          />

        </Routes>

      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">
            ✦ cinémathèque.
          </span>
          <span>
            Votre cinémathèque, votre histoire.
          </span>
        </div>
      </footer>

    </div>
  );
}
