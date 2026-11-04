# TP — Tableau de bord du Maître du Jeu

Frontend Next.js App Router (port **3001**) connecté à un backend Express séparé (port **3000**).

## Installation

Dans le dossier cloné :

```bash
npm install
npm run dev
```

Créez un fichier `.env.local` (non versionné) à la racine avec :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ouvrir http://localhost:3001. Le backend doit être démarré et autoriser l'origine `http://localhost:3001` dans sa configuration CORS.

## Routes API attendues

- `POST /api/login` — body `{email, password}`, renvoie `{token}`
- `GET /api/pnj` — renvoie un tableau de personnages `[{id, nom, classe, niveau}]`
- `POST /api/pnj` — protégé par `Authorization: Bearer <token>`, body `{nom, classe, niveau}`, renvoie `{personnage}`

## Fonctionnalités du frontend

Connexion, persistance du JWT après F5, déconnexion, inventaire des PNJ avec chargement et erreurs, ajout sécurisé côté API et message explicite en cas de session invalidée.

## Limites importantes

La sécurité doit être appliquée **par Express**, pas seulement par Next.js. Si GET /api/pnj est encore public, une requête directe reste possible sans authentification. Le token est conservé dans localStorage pour correspondre au cours : il reste exposé aux risques XSS. Pour une application de production, envisager des cookies HttpOnly et les protections CSRF nécessaires.

Ce dépôt ne contient ni la base PostgreSQL, ni le backend Express. Ne jamais publier les fichiers `.env` ou de secrets.

## Test du TP

1. Démarrer Express sur le port 3000 et Next.js sur 3001.
2. Essayer un mauvais mot de passe : une erreur doit apparaître.
3. Se connecter avec un compte existant et afficher les PNJ.
4. Ajouter un PNJ, puis rafraîchir : il doit être toujours dans PostgreSQL.
5. Supprimer ou invalider le token dans les outils de développement puis tenter un POST : le refus doit être géré.
