# Zakat Sénégal – Plateforme de gestion de la Zakat

Application web responsive et **PWA installable** : calcul, collecte, suivi et distribution de la Zakat, conforme au cahier des charges.

| Couche | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| PWA | Web App Manifest, Service Worker prudent (aucun cache de `/api`) |
| Backend | Node.js, Express (ES modules), Zod (validation) |
| Base de données | MongoDB (Mongoose) |
| Sécurité | JWT, bcrypt, Helmet, CORS, rate limiting, audit logs, webhooks signés HMAC |

## Structure

```
zakat-senegal/
├── backend/
│   ├── server.js                 # démarrage (connexion DB + écoute)
│   ├── .env.example
│   ├── uploads/                  # justificatifs (stockage privé, jamais servi en statique)
│   └── src/
│       ├── app.js                # middlewares globaux + routes
│       ├── config/               # env, db, constantes (rôles, statuts, régions…)
│       ├── models/               # users, transactions, receipts, aidRequests, reviews,
│       │                         # distributionPlans, distributions, settings, auditLogs…
│       ├── controllers/          # logique des routes
│       ├── routes/               # définition de l'API REST
│       ├── middlewares/          # auth/rôles, validation, upload, erreurs, rate limit
│       ├── services/             # calcul Zakat, paiement, notifications, stats, paramètres
│       ├── validators/           # schémas Zod
│       └── utils/                # audit, pagination, références, seed
├── frontend/
│   ├── public/                   # manifest, sw.js, offline.html, icônes
│   └── src/
│       ├── components/  layouts/  pages/ (+ pages/admin)  context/  hooks/  services/  utils/  styles/
├── docker-compose.yml            # MongoDB local
└── package.json                  # scripts racine (dev, seed, build)
```

## Démarrage rapide

Prérequis : Node.js 18+ et MongoDB (local ou Atlas).

```bash
# 1. Base de données locale (optionnel si vous avez déjà MongoDB / Atlas)
docker compose up -d

# 2. Installer les dépendances (racine + backend + frontend)
npm run install:all

# 3. Configurer le backend
cd backend && cp .env.example .env     # puis adapter MONGO_URI, JWT_SECRET…
cd ..

# 4. Créer le super-administrateur et les paramètres initiaux
npm run seed
# (optionnel) données de démonstration : npm run seed:demo

# 5. Lancer API (http://localhost:5000) + site (http://localhost:5173)
npm run dev
```

Compte créé par le seed : `admin@zakat-senegal.sn` / `ChangeMe#2026` (**à changer immédiatement**, voir `.env`).
Avec `seed:demo` : `agent@demo.sn`, `distribution@demo.sn`, `admin2@demo.sn`, `moussa@demo.sn` (mot de passe `Demo#2026pass`).

En développement, le frontend appelle `/api` et Vite redirige vers le backend (proxy). En production, définir `VITE_API_URL` (frontend) et `CLIENT_URL` (backend, CORS).

## Rôles et permissions (contrôlés côté serveur)

| Rôle | Accès |
|---|---|
| Visiteur | pages publiques, calculateur, rapports |
| `user` | don, historique, reçus, demande d'aide et suivi |
| `agent` | file des dossiers, justificatifs, décisions (motif + note interne) |
| `distribution_manager` | paiements (lecture), plans, distributions, remises |
| `admin` | tout ce qui précède + utilisateurs, paramètres, export CSV |
| `super_admin` | + journal d'audit, gestion des comptes administrateurs |

Un utilisateur ne peut jamais s'attribuer un rôle : l'inscription crée toujours `user`, et le rôle est relu en base à chaque requête.

## Paiements

- `PAYMENT_MODE=sandbox` (défaut) : **simulation locale** d'un prestataire. L'écran « Simuler un paiement » génère un webhook signé traité exactement comme en production. Interdit en production (le serveur refuse de démarrer).
- `PAYMENT_MODE=live` : brancher l'API officielle de chaque prestataire (Wave, Orange Money, carte) dans `backend/src/services/payment.service.js` (objet `liveProviders`) **après accord formel**. Les routes renvoient 501 tant que ce n'est pas fait.
- Un paiement n'est confirmé que par `POST /api/payments/webhook` : signature HMAC-SHA256 vérifiée sur le corps brut (en-tête `x-signature`), idempotence par `eventId`, jamais de rétrogradation d'un paiement confirmé.
- Aucune donnée de carte n'est stockée.

## API REST (principales routes)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` · `/login` · `/forgot-password` · `/reset-password` | Authentification |
| GET/PATCH | `/api/auth/me` | Profil |
| GET | `/api/settings/zakat` | Paramètres publics du calculateur |
| PUT | `/api/settings/zakat` | Nouvelle version des paramètres (admin) |
| POST | `/api/zakat/calculate` | Calcul estimatif |
| POST | `/api/payments/initialize` · `/webhook` | Paiement |
| GET | `/api/transactions/me` · `/:reference` · `/:reference/receipt` | Dons et reçus |
| POST | `/api/aid-requests` | Demande d'aide (multipart, PDF/JPG/PNG ≤ 5 Mo) |
| GET | `/api/aid-requests/me` | Mes demandes |
| PATCH | `/api/aid-requests/:id/resubmit` | Compléter un dossier |
| GET | `/api/reports/public` | Statistiques publiques agrégées |
| GET/PATCH | `/api/admin/aid-requests[/:id[/status]]` | Vérification des dossiers |
| GET/POST/PATCH | `/api/admin/distributions…` | Distributions, double validation, remise, annulation |
| GET | `/api/admin/dashboard` · `/transactions` · `/users` · `/audit-logs` | Back-office |

## Points d'attention du cahier des charges respectés

- Seuil (nisab), taux, catégories et déductions **configurables et versionnés**, jamais figés dans le code. Les valeurs initiales sont des **exemples à faire valider** (bandeau d'avertissement tant que non validé).
- Séparation comptable Zakat / Sadaqa / Autre (collecte, solde, distribution).
- Double validation au-delà d'un seuil, par une autre personne que le créateur.
- Motif communiqué au demandeur sans exposer les notes internes ; détection de doublons à titre d'aide uniquement.
- Justificatifs stockés hors base, hors dossier public, téléchargeables seulement par le propriétaire et le personnel.
- PWA : aucun cache de l'API ni des données privées ; bannière hors ligne ; aucun paiement possible hors ligne.
- Journal d'audit des opérations sensibles ; mots de passe hashés (bcrypt) ; limitation des tentatives de connexion.

## Avant un lancement réel

1. Faire valider les règles de calcul et les catégories par un comité religieux compétent, puis les saisir dans **Paramètres**.
2. Choisir l'organisation responsable de la collecte et obtenir les accords des prestataires de paiement et les avis juridiques/fiscaux locaux.
3. Brancher un vrai service e-mail/SMS dans `services/notification.service.js`.
4. Production : secrets forts, HTTPS, `NODE_ENV=production`, `PAYMENT_MODE=live`, sauvegardes MongoDB testées, stockage objet privé pour `uploads/` si plusieurs serveurs.
5. Remplacer le décor du bandeau d'accueil par des photos libres de droits/autorisées.

Ce projet ne constitue pas un avis juridique ou religieux.
