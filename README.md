# SynapseScape — Idea Fusion Engine

## Setup
```
npm install
npm run dev
```
Open http://localhost:5173

## Get a free Groq API key
1. https://console.groq.com/keys — sign up free, create a key (`gsk_...`)
2. In the app, click the gear icon (top right) and paste it in
   - Stored only in your browser's localStorage, never sent anywhere but Groq

## Features
- **Fuse**: type two concepts → AI generates a hybrid project idea scored on feasibility/impact/novelty
- **AI suggest concepts**: tap the button below the inputs to get 8 AI-picked diverse concepts as clickable chips (smarter if you've already typed one word — it'll suggest partners that pair well)
- **Remix**: on any generated idea card, click either word in the pair label (with the refresh icon) — AI swaps that one concept for something new while keeping the other fixed, generating a fresh idea instantly. Lets you branch and explore instead of starting over.
- **Swipe**: drag the card right to save, left to discard (or tap the buttons)
- **Vault**: searchable saved ideas, expand for details, copy to clipboard, delete
- **Synapse Map**: click "Map" in the nav — visual node graph showing how your saved ideas branch via remix. Original fusions have a violet border; remixes connect to their parent with an arrow. Click any node to reload that idea.

## Stack
React + Vite, Framer Motion, Groq API (llama-3.3-70b-versatile), localStorage (no backend needed for MVP)

## Next steps
- Swap localStorage for a backend (Node/Express + MongoDB) for cross-device sync
- Pitch deck export, prototype mockup generation, collaboration mode
