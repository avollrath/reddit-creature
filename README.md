# RTC - Reddit Trading Card

RTC - Reddit Trading Card turns a Reddit username into a collectible fantasy creature card.

It mixes:
- real public Reddit profile data
- deterministic local creature generation
- AI-assisted artwork and flavor text
- a premium animated trading-card presentation

The result is a playful MVP that feels part card game, part profile toy, and part shareable internet artifact.

## What It Does

Enter a Reddit username and the app will:
- fetch public Reddit profile data from `https://www.reddit.com/user/{username}/about.json`
- derive creature rarity, power, class, traits, and card flavor from that profile
- generate creature art and card copy
- render the result as an animated collectible card
- provide a shareable `/u/[username]` route with download and social preview support

If Reddit data or AI generation is unavailable, the app falls back to a deterministic local generator so the experience still works.

## Features

- App Router Next.js frontend
- Dedicated result pages at `/u/[username]`
- Public Reddit profile grounding without OAuth
- Deterministic fallback generation for any username
- AI-generated artwork with local fallback art
- AI-generated card title and lore with caching
- Download as PNG
- Share link UI
- Dynamic metadata and Open Graph image route
- 3D tilt card interaction, shine, glow, and rarity effects

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Pollinations for image/text generation
- Public Reddit `about.json` as the MVP profile source

## Running Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Environment Variables

Optional but useful:

```env
POLLINATIONS_API_KEY=your_key_here
POLLINATIONS_TEXT_MODEL=gemini-fast
REDDIT_PUBLIC_USER_AGENT=RedditCreatureMVP/0.1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:
- `POLLINATIONS_API_KEY` enables AI artwork and AI card-copy generation.
- Without it, the app still works using local fallback artwork/text behavior.
- Reddit grounding currently uses the public `about.json` endpoint and does not require auth.

## Project Structure

High-level areas:

- `app/`
  - routes, metadata, OG image route, result page
- `components/`
  - homepage UI, share/download UI, 3D card, card effects
- `lib/creatures/`
  - creature types, resolver, local generator
- `lib/reddit/`
  - Reddit fetch + normalization layer
- `lib/artwork/`
  - artwork prompt building, provider, cache, resolver
- `public/creatures/`
  - local fallback artwork pool

## Current Product Direction

This project is intentionally staged as an MVP:
- keep the UI polished and collectible
- keep the architecture simple
- prefer deterministic local fallbacks before deeper platform integration
- leave room for later official Reddit OAuth/API integration

## Roadmap

Possible next steps:
- replace public Reddit fetching with official OAuth-based Reddit access
- improve art direction consistency and card rarity distinction
- add richer Reddit-derived grounding from posts/comments
- add stronger animation/reveal states and collectible systems

## Status

This is an active experimental project, not a finished production app yet.

The current focus is:
- making the card feel premium
- grounding generation in real Reddit profile signals
- keeping the experience fun, fast, and shareable
