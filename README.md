# HEvent BackOffice

Back-office (SPA React) de l'application HEvent, réservé aux administrateurs.
Il communique avec l'API REST `HEvent-api`.

## Lancer le projet

1. Démarrer l'API et la base de données (dossier `HEvent-api`) :
   ```
   docker compose up -d
   ```
2. Démarrer le back-office :
   ```
   npm install
   npm run dev
   ```
3. Ouvrir http://localhost:5173/ et se connecter avec un compte `ADMIN` : `admin@mail.com` / `password` (voir [login.txt](login.txt)).

L'URL de l'API se configure via `VITE_API_URL` (voir `.env.example`).

## Fonctionnalités

| Vue | Contenu |
|---|---|
| Connexion | Email + mot de passe, « se souvenir de moi », accès réservé au rôle `ADMIN` |
| Utilisateurs | Liste (recherche + pagination), filtre par rôle avec compteurs, changement de rôle, activation / désactivation, suppression, modification complète, ajout d'un organisateur |
| Événements | Liste (recherche + pagination), filtre par organisateur, modification d'un événement et de ses types de tickets |
| Catégories | Liste (recherche + pagination) avec le nombre d'événements, ajout, modification du libellé, suppression |
| Rôles | Liste (recherche + pagination) avec le nombre d'utilisateurs, ajout, modification du libellé, suppression |

## Structure

```
src/
├── main.jsx            point d'entrée
├── app/                composant racine (Router + AuthProvider)
├── routes/             URLs, routes (lazy loading), protection des pages
├── layouts/            menu latéral commun aux pages connectées
├── pages/              une page = un dossier (composant + CSS module)
├── components/         composants réutilisables (DataList, DataTable, SearchInput, Pagination, ...)
├── hooks/              hooks custom (useFetch, usePagedList, useDebouncedValue, useAuth, useConfirm, useAdminLayout)
├── context/            contexte d'authentification
├── api/                appels à l'API, un fichier par ressource ; client.js gère token + exponential retry
├── utils/              fonctions utilitaires (erreurs API, formats, rôles, token)
└── styles/             CSS global + styles partagés
```

### Choix techniques

- **Recherche et pagination côté serveur** (`src/hooks/usePagedList.js`) : chaque liste envoie
  `?search=&page=&limit=` à l'API, qui applique la limite en SQL (`LIMIT`/`OFFSET`) et renvoie le total dans le
  header `X-Total-Count`. La recherche attend 300 ms après la dernière frappe (`useDebouncedValue`) avant d'appeler l'API.

- **Exponential retry** (`src/api/client.js`) : les requêtes GET qui échouent pour une erreur réseau, 5xx ou 429
  sont relancées 3 fois avec un délai doublé à chaque essai (500 ms, 1 s, 2 s).
- **Gestion des codes HTTP** (`src/utils/apiError.js`, `ErrorMessage`) : une erreur 4xx affiche ce qu'il faut corriger ;
  une erreur 5xx / réseau propose « Réessayer » ; une 401 déconnecte l'utilisateur.
- **Communication entre composants** : props (parent -> enfant), callbacks (enfant -> parent),
  contexte React pour l'utilisateur connecté, `Outlet context` pour recharger les compteurs du menu.
- **Lazy loading** des pages avec `React.lazy` + `Suspense`.
