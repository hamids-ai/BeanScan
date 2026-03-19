# BeanScan — Coding Standards

## Naming Conventions

- Components: `PascalCase` — `CoffeeThumbnail`, `BrewLogScreen`
- Functions/variables/hooks: `camelCase` — `useUser`, `mapRow`, `handleDelete`
- Constants (validation lists, config): `UPPER_SNAKE_CASE` — `VALID_ROAST_LEVELS`
- CSS classes: kebab-case — `detail-section-auto`
- DB columns/tables: `snake_case` — convert to camelCase at the DB boundary via `mapRow()`, never use snake_case inside JSX

## Module Structure

- `screens/` — one `XxxScreen.jsx` + co-located `XxxScreen.css` per route
- `components/` — reusable components + co-located CSS
- `context/` — all auth/user state (`UserContext.jsx`)
- `lib/api.js` — all edge function calls; never call `fetch` directly from screens
- `lib/supabase.js` — single Supabase client; never instantiate elsewhere
- `styles/design-tokens.css` — all color/spacing tokens; use `var(--token)`, never hardcode values
- `supabase/functions/<name>/index.ts` — one Deno function per directory; helpers defined in the same file

## Off-Limits

- No TypeScript in frontend — plain JS/JSX only; TS is for edge functions only
- No class components — hooks only
- No new state management libraries — `UserContext` + `useState`/`useEffect` only
- No service layer — screens query Supabase directly; edge functions only for Claude API or server-side secrets
- No new edge functions for simple CRUD — reads and deletes go direct from frontend
- No prop drilling beyond two levels — use context
- No shared `mapRow` — define locally per screen unless used in 3+ places
- No new abstractions for single-use logic
