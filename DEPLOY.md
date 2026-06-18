# Deploying SynapseScape (no API key for users)

Your Groq key now lives only on the server. Users never see or enter a key.

## 1. Push to GitHub
```
git init
git add .
git commit -m "synapsescape"
```
Create a repo on GitHub, then push.

## 2. Import into Vercel
- vercel.com → New Project → import your GitHub repo
- Framework preset: Vite (auto-detected)
- Don't deploy yet — add env vars first (next step)

## 3. Add your Groq key as an environment variable
In Vercel project settings → Environment Variables:
- Name: `GROQ_API_KEY`
- Value: your key from console.groq.com/keys
- Apply to: Production, Preview, Development

## 4. (Optional but recommended) Add rate limiting via Upstash
Without this, the daily-limit-per-visitor feature is silently disabled (everyone shares the key with no cap).

- In Vercel dashboard → Storage tab → Create Database → choose Upstash Redis (free tier)
- Once created, Vercel auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` into your project's env vars — nothing to copy manually
- Redeploy after adding it

## 5. Deploy
Click Deploy. You'll get a live URL like `synapsescape.vercel.app`.

## How the limit works
Each visitor (by IP) gets 8 free fusions/Gauntlet runs/keyword-suggestions per day combined, resetting at midnight UTC. Change `DAILY_LIMIT` in `/api/_rateLimit.js` and `/api/fuse.js` if you want a different number.

## Local development
`npm run dev` works for the frontend, but the `/api/*` routes need Vercel's dev server to run:
```
npm i -g vercel
vercel dev
```
This runs both frontend and API routes together on localhost, using a `.env.local` file with the same `GROQ_API_KEY` variable.
