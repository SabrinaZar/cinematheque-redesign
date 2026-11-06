
import { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ShareCollection() {
  const [estUser, setEstUser] = useState(false);
  const [lien, setLien] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Vérifier que le compte connecté est un User
  useEffect(() => {
    fetch(`${API}/auth/me`, {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Non connecté");
        return res.json();
      })
      .then((data) => {
        setEstUser(data.user.role === "user");
      })
      .catch(() => setEstUser(false));
  }, []);

  // Générer un lien
  async function creerLien() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/partage/creer`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur de partage");
      }

      const nouveauLien =
        `${window.location.origin}/partage/${data.token}`;

      setLien(nouveauLien);
      setMessage("Votre lien est prêt !");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Copier le lien
  async function copierLien() {
    try {
      await navigator.clipboard.writeText(lien);
      setMessage("Lien copié !");
    } catch {
      setMessage("Sélectionnez le lien et copiez-le manuellement.");
    }
  }

  // Désactiver le partage
  async function desactiverPartage() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API}/partage/desactiver`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!res.ok) {
        throw new Error("Impossible de désactiver le partage.");
      }

      setLien("");
      setMessage("Le partage est désactivé.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // L'Admin ne voit pas ce composant
  if (!estUser) return null;

  return (
    <section className="share-collection">
      <div className="share-heading">
        <span>✦ PARTAGE DE COLLECTION</span>
        <h2>Partagez votre cinémathèque.</h2>
        <p>
          Invitez vos amis à découvrir vos films préférés.
          Ils pourront consulter votre collection sans
          modifier son contenu.
        </p>
      </div>

      <div className="share-actions">
        <button
          type="button"
          className="btn btn-accent"
          onClick={creerLien}
          disabled={loading}
        >
          🔗 Générer mon lien
        </button>

        <button
          type="button"
          className="btn"
          onClick={desactiverPartage}
          disabled={loading}
        >
          Désactiver le partage
        </button>
      </div>

      {lien && (
        <div className="share-result">
          <input
            type="text"
            value={lien}
            readOnly
            aria-label="Lien de partage"
            onFocus={(e) => e.target.select()}
          />

          <button
            type="button"
            className="btn btn-accent"
            onClick={copierLien}
          >
            Copier
          </button>
        </div>
      )}

      {message && (
        <p className="share-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
