TavoloAI - Next.js + TypeScript scaffold

Quick start:
1. Install Node.js 18+ (LTS)
2. npm install
3. npm run dev
4. Open http://localhost:3000

Notes:
- This project uses the App Router (app/) and TypeScript.
- Tailwind CSS is configured; run the dev server after installing deps.

## Supabase database & auth

1. Create a Supabase project and grab the Postgres connection string from the dashboard.
2. Copy `.env.example` to `.env.local` and update:
   - `SUPABASE_DB_URL` – full Postgres string (**URL-encode** symbols such as `&` if needed).
   - `NEXT_PUBLIC_SUPABASE_URL` – project REST URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public anon key (used by Supabase Auth).
   - `SUPABASE_SERVICE_ROLE_KEY` – service role key (used only on backend for `/api/register` to crear usuarios confirmados automáticamente). **Nunca expongas esta key en el cliente ni la subas a control de versiones públicos.**
3. Install deps and run `npm run dev`.
   - Server code imports `lib/db.ts` for raw SQL (`supabasePool` / `query` helper).
   - Client/server components can import `supabase` from `lib/supabaseClient` to use Supabase Auth (email/password, OAuth) as wired in `components/auth/AuthModal.tsx`.
    
