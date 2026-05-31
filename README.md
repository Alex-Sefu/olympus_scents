# Olympus Scents Frontend

A React + TypeScript + Vite ecommerce storefront for the `catalog_parfumuri` project.

## Overview

This app is a perfume catalog and shopping experience built with:

- React 19 + TypeScript
- Vite for fast local development and production build
- Supabase for authentication, database, and storage
- React Router DOM for page routing
- Context API for auth, cart, wishlist, and AI assistant state
- Tailwind-style custom CSS for styling and responsive layout

### Main features

- Browse perfume catalog with filtering, sorting, and pagination
- Perfume detail pages
- Authenticated cart, checkout, and order history
- Editor dashboard with create/read/update/delete perfume management
- Wishlist support for authenticated users
- Supabase-backed uploads and order storage

## Repository layout

```
.smo-frontend/
├── public/                # static public assets
├── src/
│   ├── components/        # reusable UI components
│   ├── context/           # React context providers
│   ├── hooks/             # custom hooks (auth, theme, etc.)
│   ├── lib/               # shared utilities and Supabase client
│   ├── pages/             # route pages
│   └── types.ts           # shared TypeScript interfaces
├── .env.example           # env variable template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json            # Vercel deploy config
└── .vercelignore          # files excluded from Vercel uploads
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in `smo-frontend/` from `.env.example`

```bash
copy .env.example .env
```

3. Fill in your Supabase credentials in `smo-frontend/.env`

```env
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

> The `.env` file is intentionally excluded from git by `.gitignore`.

## Local development

Run the development server:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Build for production

```bash
npm run build
```

This compiles TypeScript, builds the app, and outputs files to `dist/`.

## Deployment

This project includes Vercel configuration for static deployment.

- `vercel.json` configures the build and SPA rewrite
- `.vercelignore` excludes local and generated files

If you deploy on Vercel, make sure to add the same env vars to your Vercel project settings.

## Environment variables

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Notes

- All Supabase secret values must remain local in `.env` and should not be committed.
- The app expects Supabase tables and storage buckets for perfumes, users, cart items, wishlist items, orders, and profiles.
- For production, review Supabase Row Level Security (RLS) policies and API security.

## Useful commands

- `npm run dev` — start local development
- `npm run build` — production build
- `npm run preview` — preview built production site locally
- `npm run lint` — run ESLint checks
