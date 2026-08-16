# Maison Noor — Architecture système (full-custom)

Ce document décrit la plateforme e-commerce complète bâtie autour du front
luxe existant. Socle **full-custom** : Next.js + PostgreSQL/Prisma + Auth.js +
Stripe. Aucune dépendance à une plateforme e-commerce SaaS.

## Stack
| Couche | Choix | Rôle |
|---|---|---|
| Front | Next.js 14 (App Router), TS, Tailwind, Framer Motion, Lenis | Expérience luxe, SSR/SEO, perf |
| Base de données | **PostgreSQL** (Neon / Supabase / Vercel Postgres) via **Prisma** | Produits, stock, commandes, clients |
| Auth | **Auth.js (NextAuth)** — Google OAuth + lien e-mail | « Continuer avec Google », comptes |
| Paiement | **Stripe** (carte, Apple/Google Pay) + BLIK/Przelewy24 (Stripe PL ou Autopay) | Encaissement réel + webhooks |
| Région | Edge geo headers (`x-vercel-ip-country`) | Détection pays → devise |
| Hébergement | Vercel | Build, edge, cron |

## Ce qui est DÉJÀ en ligne (sans aucune clé)
- **Détection région + multi-devise** : `/api/geo` lit le pays via l'IP, le
  store propose la devise locale (PLN/EUR/GBP/USD) avec un prompt discret et un
  sélecteur de devise. Conversion d'affichage centralisée (`money()`).
- **Console admin** `/admin` : KPIs, revenu, commandes, produits, clients
  (données de démonstration tant que la base n'est pas branchée).
- **UI de compte** `/konto` : « Continuer avec Google » + lien e-mail (prête).

## Ce qui s'active quand le client fournit les services
Le client crée 3 choses et colle les clés dans Vercel (voir `.env.example`) :

1. **PostgreSQL** (Neon/Supabase gratuit) → `DATABASE_URL`
   ```bash
   npm i -D prisma && npm i @prisma/client @auth/prisma-adapter
   npx prisma migrate deploy      # applique prisma/schema.prisma
   npx prisma db seed             # importe le catalogue (app/lib/products.ts)
   ```
2. **Google OAuth** (console.cloud.google.com) → `GOOGLE_CLIENT_ID/SECRET` +
   `AUTH_SECRET`. Redirect URI : `<site>/api/auth/callback/google`.
   → « Continuer avec Google » devient fonctionnel, comptes + historique.
3. **Stripe** → `STRIPE_SECRET_KEY`, clé publique, `STRIPE_WEBHOOK_SECRET`.
   → checkout réel (carte/Apple/Google Pay ; BLIK & Przelewy24 via Stripe PL).

## Modèle de données
Voir `prisma/schema.prisma` : `User/Account/Session` (Auth.js), `Product/Variant`,
`Order/OrderItem`, `Address`, `Role` (CUSTOMER/STAFF/ADMIN), `OrderStatus`.
Les prix sont stockés en **minor units** (grosz), base **PLN** ; les autres
devises sont dérivées à l'affichage (brancher un flux FX type BCE en prod).

## Routes à câbler (prochaine itération)
- `app/api/auth/[...nextauth]/route.ts` + `auth.ts` (providers Google + Email,
  Prisma adapter, rôle ADMIN via `ADMIN_EMAILS`).
- `app/api/checkout/route.ts` → crée un PaymentIntent Stripe + Order PENDING.
- `app/api/webhooks/stripe/route.ts` → passe l'Order à PAID, décrémente le stock,
  envoie l'e-mail de confirmation.
- `/admin` protégé par `middleware.ts` (rôle ADMIN) + lecture Prisma réelle.
- `/konto` → `signIn('google')` + historique de commandes (`Order` par `userId`).

## Sécurité & conformité
- RODO/GDPR : consentement, export/suppression de compte (`/konto`).
- PCI : aucune donnée carte ne transite par notre serveur (Stripe Elements).
- Rôles : `ADMIN_EMAILS` promeut au premier login ; middleware sur `/admin`.

## Roadmap système
1. **Auth live** (Google + e-mail) + page compte (commandes, adresses, favoris).
2. **Checkout Stripe réel** + webhooks + e-mails transactionnels (Resend).
3. **Admin connecté à la base** (CRUD produits/stock, gestion commandes, remboursements).
4. **Abonnements / rituels** (Ramadan, Eid, corporate récurrent) via Stripe Billing.
5. **Analytics** (GA4 + events e-commerce) et A/B testing.
