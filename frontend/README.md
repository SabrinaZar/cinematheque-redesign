# Ma cinémathèque — redesign cinématique

Un nouveau frontend React / Vite, responsive, sombre et cinématographique, compatible avec le cahier des charges et l'API REST d'origine.

## Démarrage rapide

1. Installez Node.js 18+.
2. Dans ce dossier : `npm install`
3. Copiez `.env.example` en `.env`
4. Lancez `npm run dev` puis ouvrez l'URL indiquée (souvent `http://localhost:5173`).

## Deux façons de l'essayer

### A. Démo sans backend (pour voir le design tout de suite)

Mettez `VITE_DEMO_MODE=true` dans `.env`, puis lancez `npm run dev`. Les 6 films de démonstration sont **fictifs** et stockés dans le `localStorage` du navigateur. Ajouter, modifier, supprimer, rechercher et filtrer fonctionnent dans la démo. Il ne s'agit **pas** de données MongoDB. Vous pouvez effacer ces données dans le stockage local du navigateur (clé `cinematheque-demo-films-v1`).

### B. Vraie API existante

Mettez `VITE_DEMO_MODE=false` et `VITE_API_URL=http://localhost:5000` (ou l'URL réelle de votre serveur) dans `.env`. Démarrez votre backend Node.js/MongoDB séparément. Les appels restent :

- `GET /films` (avec `q`, `statut`, `genre`)
- `GET /films/:id`
- `POST /films`
- `PUT /films/:id`
- `DELETE /films/:id`

**Important :** si votre backend est sur un autre port, il doit autoriser les requêtes CORS depuis le port du frontend.

## Organisation

- `src/App.js` : navigation, routes et pied de page.
- `src/pages/FilmList.js` : accueil, recherche, statuts, genre et cartes.
- `src/pages/FilmDetail.js` : fiche d'un film, modifier et supprimer.
- `src/pages/FilmForm.js` : ajout et modification, validation côté client.
- `src/components/FilmCard.js` : carte de film et libellés de statuts.
- `src/api.js` : client axios et sélecteur optionnel de démo.
- `src/demoApi.js` : mode démo autonome, données non réelles.
- `src/styles.css` : tout le nouveau design responsive.
- `public/posters/` : 6 affiches SVG **illustratives et fictives**, créées pour la maquette.

## Remarques de compatibilité

- Le frontend attend des documents Film avec `_id`, `titre`, `realisateur`, `annee`, `genre`, `affiche`, `statut`, `note`, `avis` et éventuellement `plateforme`.
- Les champs optionnels sont envoyés vides / `null` lors d'une modification pour permettre l'effacement. Vérifier que votre modèle Mongoose accepte ces valeurs pour `note` et `annee` (sinon adapter le payload au contrat exact du backend).
- La validation côté serveur reste nécessaire : le frontend ne la remplace pas.
- Les affiches illustrant la bannière sont décoratives : la liste des films, elle, est issue de l'API en mode réel.
