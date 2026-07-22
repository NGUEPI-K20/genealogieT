# Famille Nguepi — Arbre Généalogique

Site vitrine présentant l'arbre généalogique de la famille Nguepi / Douanio, avec interface d'administration sécurisée.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Flow** — arbre interactif
- **Supabase** — base de données PostgreSQL + authentification

## Démarrage en local

### 1. Cloner et installer

```bash
git clone https://github.com/TON_USERNAME/nguepi-genealogie.git
cd nguepi-genealogie
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplis `.env.local` avec tes clés Supabase (disponibles sur [supabase.com/dashboard](https://supabase.com/dashboard)).

### 3. Lancer

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  page.tsx              → Vitrine publique (arbre)
  login/page.tsx        → Connexion admin
  admin/
    layout.tsx          → Guard d'authentification
    page.tsx            → Tableau de bord
    membres/page.tsx    → Liste des membres
    ajouter/page.tsx    → Formulaire ajout/édition
    settings/page.tsx   → Paramètres
components/
  Tree/                 → React Flow + nœuds personnalisés
  PersonPanel/          → Panneau latéral de détail
  Admin/                → Composants admin
lib/
  types.ts              → Types TypeScript partagés
  data.ts               → Données de départ (à migrer vers Supabase)
  supabase/             → Clients Supabase (browser, server, middleware)
```

## Déploiement Vercel

1. Push sur GitHub (repo privé)
2. Importer sur [vercel.com/new](https://vercel.com/new)
3. Ajouter les variables d'environnement dans Vercel Settings
4. Chaque `git push` sur `main` déclenche un déploiement automatique

## Base de données Supabase

Le schéma (tables `persons`/`relations`, RLS, bucket photos) est dans `supabase/schema.sql`.
À exécuter une fois dans l'éditeur SQL du projet Supabase (dashboard → SQL Editor).

## Prochaines étapes

- [x] Migrer vers des requêtes Supabase (déjà branché dans `app/page.tsx`, `lib/actions/persons.ts`)
- [ ] Exécuter `supabase/schema.sql` (tables + RLS + bucket photos)
- [ ] Créer l'utilisateur admin sur Supabase Auth (dashboard → Authentication → Users)
- [ ] Ajouter les premiers membres depuis `/admin/ajouter`, en commençant par Richard Nguepi et Josephine Douanio (génération I)
