# AGENTS.md

## Project
This is a small MVP web app called Reddit Creature.

It turns a Reddit username into a fantasy creature card.

## Goal
Build the app incrementally from a polished frontend prototype to a functional MVP.

Current stage:
- Next.js app is running
- Tailwind is set up
- A working 3D card exists
- Card visual effects exist
- Username input exists
- Data is still mock or local, not real Reddit API yet

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- React

## Product direction
- Keep the app playful, premium, and collectible-card-like
- Prioritize a polished UI and smooth interactions
- Keep the architecture minimal until real API integration is needed

## Rules
- Do not add unnecessary abstractions
- Prefer small, reviewable changes
- Reuse existing components where possible
- Do not add database, auth, leaderboards, or background jobs unless explicitly requested
- Do not add shadcn components unless needed
- Keep file structure simple
- Preserve the current visual design language
- Do not replace working components unless there is a clear benefit
- Favor deterministic local logic before introducing external APIs
- When editing styles, keep the current premium dark fantasy aesthetic

## Coding rules
- Use TypeScript
- Keep components small and focused
- Use named helper functions when logic gets repeated
- Avoid overengineering
- Keep props typed explicitly
- Prefer straightforward React patterns over clever abstractions

## Workflow rules
- Before making changes, inspect the relevant files
- After changes, explain what changed and why
- Keep edits scoped to the requested task
- If a task is too large, do the smallest useful version first
- Do not make unrelated refactors

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Near-term roadmap
1. Refactor homepage into smaller components
2. Replace hardcoded mock profiles with deterministic generation for any username
3. Improve card metadata like power, element, and rarity accenting
4. Add loading and empty states
5. Add a real Reddit data integration path
6. Add AI-generated text and image generation later