# DevTrack AI

Personal daily routine, focus, habits, goals, analytics, and AI productivity coach built with Next.js 15, TypeScript, Tailwind CSS, MongoDB, JWT cookies, Gemini, Nodemailer, and Recharts.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/dashboard`.

The UI ships with demo data so the product is usable immediately. Add `MONGODB_URI` and `JWT_SECRET` to enable persistent auth and database APIs.

## Folder structure

```text
src/app              App Router pages, layouts, and API route handlers
src/components       App shell, feature modules, charts, providers, UI primitives
src/lib              Auth, db, server actions, AI, email, validators, utilities
src/models           Complete Mongoose schemas for all collections
src/types            Shared TypeScript domain types
src/data             Local demo data for first-run UX
public               PWA manifest, service worker, icon
```

## Collections

`users`, `tasks`, `goals`, `habits`, `activitylogs`, `timesessions`, `routines`, and `analytics` are represented in `src/models`.

## Deployment

1. Create a MongoDB Atlas database and set `MONGODB_URI`.
2. Set a strong `JWT_SECRET`.
3. Add `GEMINI_API_KEY` for live AI coaching.
4. Add SMTP variables for reminder emails and daily summaries.
5. Deploy to Vercel and copy the same env vars into the Vercel project.
6. Set `NEXT_PUBLIC_APP_URL` to the production URL.

## Production notes

- Authentication uses bcrypt password hashing, JWT signing, and HTTP-only cookies.
- Route handlers are colocated under `src/app/api`.
- Server actions are in `src/lib/actions.ts`.
- PWA support is in `public/manifest.webmanifest`, `public/sw.js`, and `PwaRegister`.
- The app intentionally supports a single personal account and does not include teams, OAuth, Stripe, or subscription logic.
