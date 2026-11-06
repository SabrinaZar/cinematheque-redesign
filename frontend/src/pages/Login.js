
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur de connexion."
        );
      }

      // Informer App.js de la connexion
      if (onLogin) {
        onLogin(data.user);
      }

      // Redirection selon le rôle
      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

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
          VOTRE ESPACE CINÉMA
        </div>

        <h1>
          Votre univers cinéma.
          <br />
          <em>À portée de main.</em>
        </h1>

        <p>
          Retrouvez vos films préférés, vos notes
          et toutes les histoires qu'il vous reste
          à découvrir.
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

        <h2>Ravi de vous revoir.</h2>

        <p className="auth-description">
          Connectez-vous pour retrouver votre collection.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">

          <label htmlFor="email">
            Adresse email
          </label>

          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">
            Mot de passe
          </label>

          <div className="auth-password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Masquer" : "Voir"}
            </button>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
            <span>→</span>
          </button>

          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}
        </form>

        
        <div className="auth-bottom">
          <p>Vous n'avez pas encore de compte ?</p>

          <Link to="/inscription">
            Créer un compte →
          </Link>
        </div>

      </div>

    </section>
  );
}
