
import { useState } from "react";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nom,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'inscription.");
      }

      setSucces(true);
      setMessage(data.message);
      setPassword("");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">

      <div className="auth-intro">
        <div className="eyebrow">
          <span className="eyebrow-line"></span>
          REJOIGNEZ CINÉMATHÈQUE
        </div>

        <h1>
          Vos films.
          <br />
          <em>Votre histoire.</em>
        </h1>

        <p>
          Créez votre propre collection,
          retrouvez vos films préférés
          et partagez votre passion du cinéma.
        </p>

        <div className="auth-collage">
          <div className="auth-poster auth-poster-one">
            <span>01</span>
            <strong>DÉCOUVRIR</strong>
          </div>

          <div className="auth-poster auth-poster-two">
            <span>02</span>
            <strong>REGARDER</strong>
          </div>

          <div className="auth-poster auth-poster-three">
            <span>03</span>
            <strong>PARTAGER</strong>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-mark">✦</div>

        <p className="auth-kicker">
          BIENVENUE SUR CINÉTHÈQUE
        </p>

        <h2>Créez votre compte.</h2>

        <p className="auth-description">
          Commencez votre aventure cinéma.
        </p>

        {succes ? (
          <div>
            <p className="auth-message" role="status">
              {message}
            </p>

            <p>
              Vous pourrez vous connecter après
              l'acceptation de votre compte par
              l'administrateur.
            </p>

            <Link to="/connexion" className="auth-submit">
              Aller à la connexion →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">

            <label htmlFor="nom">Nom complet</label>
            <input
              id="nom"
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />

            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Inscription..." : "Créer mon compte"}
              <span>→</span>
            </button>

            {message && (
              <p className="auth-message" role="alert">
                {message}
              </p>
            )}
          </form>
        )}

        <div className="auth-bottom">
          <p>Vous avez déjà un compte ?</p>
          <Link to="/connexion">Se connecter →</Link>
        </div>
      </div>

    </section>
  );
}
