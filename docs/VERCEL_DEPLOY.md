# Vercel deployment (Phase 4)

## Pre-deploy checklist

1. Push code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables in the Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy.

## Supabase CORS (before or after first deploy)

- Supabase → Project Settings → API
- Add your Vercel app URL to allowed request origins when you have it, e.g. `https://your-app.vercel.app`

## After deploy

- Pushes to the connected branch (e.g. `main`) trigger new deployments.
- `VITE_*` variables are inlined at build time on Vercel; they are not secret server-only keys—the **anon** key is intended for the client with Row Level Security in Supabase.
